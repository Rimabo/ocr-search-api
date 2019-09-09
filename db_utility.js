const mongoose = require('mongoose');
const Request = require('request');
const rp = require('request-promise');
const Document = require('./models/Document');
require('dotenv/config');

function extractContent(url) {
    return new Promise(function(resolve, reject) {

        let subscriptionKey = process.env.COMPUTER_VISION_SUBSCRIPTION_KEY;
        let endpoint = process.env.COMPUTER_VISION_ENDPOINT;

        let uriBase = endpoint + "vision/v2.0/read/core/asyncBatchAnalyze";
        let firstRequestOptions = {
            method: 'POST',
            uri: uriBase,
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey
            },
            body: {"url": url},
            json: true,
            resolveWithFullResponse: true
        };
        rp(firstRequestOptions)
            .then(response => {
                setTimeout(() => {
                    var operationLocation = response.headers['operation-location'];
                    var secondRequestOptions = {
                        uri: operationLocation,
                        headers: {
                            'Content-Type': 'application/json',
                            'Ocp-Apim-Subscription-Key': subscriptionKey
                        },
                        json: true
                    };

                    function checkIfJobIsDone() {
                        return new Promise(function (resolve, reject) {
                            rp(secondRequestOptions)
                                .then(response => {
                                    console.log(response.status);
                                    if (response.recognitionResults) {
                                        resolve(response);
                                    } else if (response.status && response.status == 'Failed') {
                                        resolve(response);
                                    } else {
                                        return new Promise(function (_resolve, _reject) {
                                            setTimeout(() => {
                                                resolve(checkIfJobIsDone())
                                            }, 800)
                                        });
                                    }
                                })
                                .catch(err => {
                                    reject(err);
                                })
                        });
                    }
                    checkIfJobIsDone().then(done=> {
                        resolve(done);
                    })
                })
            })
            .catch(err => {
                reject(err);
            })
    });
}

function processDocument(url) {
    extractContent(url)
        .then(result => {
        console.log(result);
        })
        .catch(err => {
            throw(err);
        })

}

function exists(url){
    return !!Document.find({url: url});
}

function search(url, term_list) {
    if (!exists(url))
        console.log('url did not exist in db');
        try{
            processDocument(url);
        } catch (err) {
            throw(err);
        }
}


module.exports = {
    search: search
};
