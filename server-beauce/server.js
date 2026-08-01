const dotenv = require('dotenv');
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3001;
const RouteurApi = require("./routeur");
const fs = require('fs');
const https = require('https');
const path = require('path');


const envFiles = {
    dev: '.env.dev',
    local: '.env.local',
};
const env = process.env.NODE_ENV || 'local';
const envFile = envFiles[env];

if (fs.existsSync(envFile)) {
    dotenv.config({ path: path.resolve(__dirname, envFile) });
}

app.use(express.json());
app.use(cors());

// Toutes les routes sont déclarées sans préfixe sur ce router, monté plus bas
// sur API_PREFIX : '/api' par défaut (appel direct du front en local), '' en
// production derrière le reverse proxy qui retire déjà le segment /api
const apiRouter = express.Router();

apiRouter.get('/riot-account', async (req, res) => {
    try {
        const token = await new RouteurApi().authWebServices()
        let url = process.env.URL_API_BEAUCE + process.env.URL_ENDPOINT_RANKED;
        const getRanked = await new RouteurApi().callApi(token, url)

        res.status(200).json(getRanked.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.get('/riot-account/account/:id', async (req, res) => {
    try {
        if (!/^\d+$/.test(req.params.id)) {
            return res.status(404).json({ error: 'Compte introuvable' });
        }

        let url = process.env.URL_API_BEAUCE + process.env.URL_ENDPOINT_GET_ACCOUNT;

        let regex = /\{id}/;
        let newUrl = url.replace(regex, req.params.id);

        const token = await new RouteurApi().authWebServices();
        const getAccount = await new RouteurApi().callApi(token, newUrl);

        res.status(200).json(getAccount.data);
    } catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'Compte introuvable' });
        }
        res.status(500).json({ error: error.message });
    }
})

apiRouter.get('/riot-account/account/:id/collection/history', async (req, res) => {
    try {
        if (!/^\d+$/.test(req.params.id)) {
            return res.status(404).json({ error: 'Compte introuvable' });
        }

        let url = process.env.URL_API_BEAUCE + process.env.URL_ENDPOINT_GET_LIST_HISTORY_ACCOUNT + '?page=1';

        if (/^\d+$/.test(req.query.itemsPerPage ?? '')) {
            url += '&itemsPerPage=' + req.query.itemsPerPage;
        }

        const accountId = req.params.id;

        let regex = /\{id}/;
        let newUrl = url.replace(regex, accountId);

        const token = await new RouteurApi().authWebServices();
        const getHistoryLol = await new RouteurApi().callApi(token, newUrl)

        res.status(200).json(getHistoryLol.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

apiRouter.get('/riot-account/account/:id/collection/elo-daily', async (req, res) => {
    try {
        // L'id est interpolé dans l'URL amont : on refuse tout ce qui n'est pas
        // un entier pour bloquer un path traversal (ex: 1%2F..%2F..%2Fautre-route)
        if (!/^\d+$/.test(req.params.id)) {
            return res.status(404).json({ error: 'Compte introuvable' });
        }

        let url = process.env.URL_API_BEAUCE + process.env.URL_ENDPOINT_GET_ELO_DAILY;

        let regex = /\{id}/;
        let newUrl = url.replace(regex, req.params.id);

        const token = await new RouteurApi().authWebServices();
        const getEloDaily = await new RouteurApi().callApi(token, newUrl);

        res.status(200).json(getEloDaily.data);
    } catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'Compte introuvable' });
        }
        res.status(500).json({ error: error.message });
    }
})

apiRouter.get('/history-account-lol/:id', async (req, res) => {
    try {
        // L'id est interpolé dans l'URL amont : on refuse tout ce qui n'est pas
        // un entier pour bloquer un path traversal (ex: 1%2F..%2F..%2Fautre-route)
        if (!/^\d+$/.test(req.params.id)) {
            return res.status(404).json({ error: 'Match introuvable' });
        }

        let url = process.env.URL_API_BEAUCE + process.env.URL_ENDPOINT_GET_DETAIL_HISTORY;

        let regex = /\{id}/;
        let newUrl = url.replace(regex, req.params.id);

        const token = await new RouteurApi().authWebServices();
        const getDetail = await new RouteurApi().callApi(token, newUrl);

        res.status(200).json(getDetail.data);
    } catch (error) {
        // Seul un vrai 404 amont signifie "match inexistant" ; toute autre
        // erreur (panne, auth, env manquante) reste un 500 réessayable côté front
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'Match introuvable' });
        }
        res.status(500).json({ error: error.message });
    }
})

// ?? et pas || : API_PREFIX= (chaîne vide) est un choix valide qui signifie
// "pas de préfixe" (prod derrière reverse proxy), alors qu'une variable
// absente retombe sur /api (local)
const API_PREFIX = process.env.API_PREFIX ?? '/api';
app.use(API_PREFIX || '/', apiRouter);

if (process.env.NODE_ENV === 'production') {
    const options = {
        key: fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_PRIVATE_CERT_PATH),
        ca: fs.readFileSync(process.env.SSL_PRIVATE_CA_PATH),

};

    https.createServer(options, app).listen(PORT, () => {
        console.log(`Server is running on port ${PORT} with SSL`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} without SSL`);
    });
}
