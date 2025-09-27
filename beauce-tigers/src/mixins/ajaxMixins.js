import axios from 'axios';

export const ajaxMixins = {
    methods: {
        async fetchData(urlToFetch, callback) {
            try {
                const response = await axios.get(urlToFetch);
                callback(response.data);
            } catch (error) {
                console.error(error);
            }
        },
        createUrl(url, regex, id) {
          try {
              return url.replace(regex, id);
          }  catch (error) {
              console.error(error);
          }
        },
    }
};
