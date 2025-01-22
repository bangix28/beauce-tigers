const fs = require('fs');
const yaml = require('js-yaml');
const axios = require('axios');
const url = require("node:url");



class RouteurApi {
    getAxiosInstance(api_url) {
        let urlApi = process.env.URL_API_BEAUCE
        return axios.create({
            baseURL: urlApi,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token,
            },
        });
    }


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
    async getRanked(token) {
        let urlRanked = process.env.URL_API_BEAUCE + process.env.URL_ENDPOINT_RANKED;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.token}`
            }
        };
        try {
            const response = await axios.get(urlRanked,config);
            return response.data;
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }
}

module.exports = RouteurApi;
