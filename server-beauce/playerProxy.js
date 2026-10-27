const express = require('express');
const axios = require('axios');

// Routes des joueurs connectés par Discord (profil, défis de LAN, agent).
// Contrairement aux classements, le BFF n'y injecte JAMAIS le compte API du
// front : il relaie le jeton du joueur, et lui seul. Contrat amont :
// docs/front/connexion-discord.md et docs/front/defis-lan.md d'api-bot.

// Un JWT, rien d'autre : un en-tête bricolé n'est pas relayé à l'API
const BEARER = /^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const LAN_ID = /^\d+$/;
const UPSTREAM_TIMEOUT_MS = 10000;

// Repli quand l'amont ne renvoie pas { code, message } : les 401/403 du
// pare-feu Symfony (Lexik met un code numérique) et les pannes
const FALLBACK_ERRORS = {
    401: { code: 'unauthorized', message: 'Ta session a expiré : reconnecte-toi avec Discord.' },
    403: { code: 'forbidden', message: 'Cette action est réservée aux joueurs connectés avec Discord.' },
    404: { code: 'not_found', message: 'Ressource introuvable.' },
};
const UPSTREAM_ERROR = { code: 'upstream_error', message: 'Le serveur des défis ne répond pas, réessaie dans un instant.' };

const isApiError = (body) =>
    body != null && typeof body.code === 'string' && typeof body.message === 'string';

/** Ne garde que les champs attendus par la route : le reste du corps ne sort pas du BFF */
const pick = (body, fields) =>
    Object.fromEntries(fields.filter((field) => body?.[field] !== undefined).map((field) => [field, body[field]]));

async function forward(req, res, method, path, { body, params } = {}) {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    const authorization = req.get('Authorization');
    if (authorization && BEARER.test(authorization)) {
        headers.Authorization = authorization;
    }

    try {
        const response = await axios({
            method,
            url: process.env.URL_API_PLAYER + path,
            data: body,
            params,
            headers,
            timeout: UPSTREAM_TIMEOUT_MS,
            // Les 4xx métier sont relayés tels quels, on ne les traite pas en exception
            validateStatus: () => true,
        });

        if (response.status < 400) {
            return res.status(response.status).json(response.data);
        }
        if (response.status < 500 && isApiError(response.data)) {
            return res.status(response.status).json({ code: response.data.code, message: response.data.message });
        }
        if (FALLBACK_ERRORS[response.status]) {
            return res.status(response.status).json(FALLBACK_ERRORS[response.status]);
        }

        console.error(`Erreur amont ${response.status} sur ${method} ${path}`);
        return res.status(502).json(UPSTREAM_ERROR);
    } catch (error) {
        console.error(`Error: ${error}`);
        return res.status(502).json(UPSTREAM_ERROR);
    }
}

const playerRouter = express.Router();

// Le lanId est interpolé dans l'URL amont : on refuse tout ce qui n'est pas
// un entier pour bloquer un path traversal (ex: 1%2F..%2F..%2Fautre-route)
playerRouter.param('lanId', (req, res, next, lanId) => {
    if (!LAN_ID.test(lanId)) {
        return res.status(404).json({ code: 'lan_not_found', message: 'LAN introuvable.' });
    }
    next();
});

playerRouter.post('/auth/discord', (req, res) =>
    forward(req, res, 'post', '/auth/discord', { body: pick(req.body, ['code']) }));

playerRouter.get('/me', (req, res) => forward(req, res, 'get', '/me'));

playerRouter.post('/me/riot-accounts', (req, res) =>
    forward(req, res, 'post', '/me/riot-accounts', { body: pick(req.body, ['riotId']) }));

playerRouter.post('/me/agent-devices/approve', (req, res) =>
    forward(req, res, 'post', '/me/agent-devices/approve', { body: pick(req.body, ['userCode']) }));

playerRouter.get('/me/lan-events/current', (req, res) => forward(req, res, 'get', '/me/lan-events/current'));

playerRouter.get('/lan-challenges/cards', (req, res) => forward(req, res, 'get', '/lan-challenges/cards'));

playerRouter.get('/lan-events/:lanId/standings', (req, res) =>
    forward(req, res, 'get', `/lan-events/${req.params.lanId}/standings`));

playerRouter.get('/lan-events/:lanId/feed', (req, res) => {
    // Facultatif : absent ou invalide, l'amont applique son défaut (20)
    const limit = /^\d+$/.test(req.query.limit ?? '') ? req.query.limit : undefined;
    return forward(req, res, 'get', `/lan-events/${req.params.lanId}/feed`, { params: { limit } });
});

playerRouter.get('/lan-events/:lanId/me', (req, res) =>
    forward(req, res, 'get', `/lan-events/${req.params.lanId}/me`));

playerRouter.post('/lan-events/:lanId/me/join', (req, res) =>
    forward(req, res, 'post', `/lan-events/${req.params.lanId}/me/join`, { body: {} }));

playerRouter.post('/lan-events/:lanId/me/pick', (req, res) =>
    forward(req, res, 'post', `/lan-events/${req.params.lanId}/me/pick`, { body: pick(req.body, ['slot', 'target']) }));

playerRouter.post('/lan-events/:lanId/me/reroll', (req, res) =>
    forward(req, res, 'post', `/lan-events/${req.params.lanId}/me/reroll`, { body: pick(req.body, ['slot']) }));

module.exports = playerRouter;
