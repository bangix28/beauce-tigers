const axios = require('axios');
class RouteurApi {
    async authWebServices() {
        let url = process.env.URL_API_LOGIN
        let data = {
            "email": process.env.USERNAME_API_BEAUCE,
            "password": process.env.PASSWORD_API_BEAUCE
        }
        try {
            const response = await axios.post(url, data);
            return response.data;
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    async callApi(token, url) {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.token}`
                }
            };
            return await axios.get(url,config);
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }
}

module.exports = RouteurApi;
