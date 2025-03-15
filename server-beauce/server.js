const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3001;
const dotenv = require('dotenv');
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

app.get('/api/riotAccount', async (req, res) => {
    try {
        const token = await new RouteurApi().authWebServices()
        let url = process.env.URL_API_BEAUCE + process.env.URL_ENDPOINT_RANKED;
        const getRanked = await new RouteurApi().callApi(token, url)
        res.status(200).json(getRanked.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/riot-account/account/:id/collection/history', async (req, res) => {
    try {
        let url = process.env.URL_API_BEAUCE + process.env.URL_ENDPOINT_GET_LIST_HISTORY_ACCOUNT + '?page=1';
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
