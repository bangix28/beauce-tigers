const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3001;
const token_strapi = process.env.TOKEN_STRAPI;
const routes_strapi = process.env.ROUTES_STRAPI;
const dotenv = require('dotenv');
const Router = require("./routeur");
const RouteurApi = require("./routeur");
const algoliasearch = require("algoliasearch");
const fs = require('fs');
const https = require('https');

dotenv.config();

app.use(express.json());
app.use(cors());

app.get('/api/riotAccount', async (req, res) => {
    try {
        const token = await new RouteurApi().authWebServices()
        const getRanked = await new RouteurApi().getRanked(token)
        res.status(200).json(getRanked);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
