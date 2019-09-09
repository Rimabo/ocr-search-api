const mongoose = require('mongoose');
const Request = require('request');
const rp = require('request-promise');
const Document = require('./models/Document');
const Page = require('./models/Page').model;
const Word = require('./models/Word').model;
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

function parseDocumentIntoDb(url, result){
    return new Promise(function(resolve, reject) {
        var pages = [];
        result.forEach(page => {
            var words = [];
            page.lines.forEach(line => {
                line.words.forEach(word => {
                    if(!word.confidence){
                        var db_word = new Word({
                            word: word.text,
                            bounding_box: word.boundingBox
                        });
                        words.push(db_word);
                    }
                })
            });
            var db_page = new Page({
                page_number: page.page,
                orientation: page.clockwiseOrientation,
                width: page.width,
                height: page.height,
                unit: page.unit,
                words: words
            });
            pages.push(db_page);
        });
        var db_document = new Document({
            url: url,
            pages: pages,
        });
        db_document.save()
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject(err);
            })
    });
}

function processDocument(url) {
    console.log('processDocument');
    return new Promise(function(resolve, reject) {
        extractContent(url)
            .then(content => {
                if (content.recognitionResults){
                    parseDocumentIntoDb(url, content.recognitionResults)
                        .then(() => {
                            resolve();
                        })
                        .catch(err => {
                            reject(err);
                        })
                } else {
                    reject('Failed to read document');
                }
            })
            .catch(err => {
                reject(err);
            })
    });
}

function searchTerm(url, term_list){
    return new Promise(function(resolve, reject) {
        Document.findOne({url: url}, function(err, doc) {
            if(err){
                reject(err);
            }
            var response_json = {};
            var matched_pages = [];
            doc.pages.forEach(page => {
                var page_obj = {};
                page_obj['number'] = page.page_number;
                var matched_words = [];
                page.words.forEach(word => {
                    if(word.word == term_list){
                        var values = Object.keys(word.bounding_box).map(function(key) {
                            return word.bounding_box[key].toString();
                        });
                        matched_words.push(values);
                    }
                });
                page_obj['words'] = matched_words;
                matched_pages.push(page_obj);
            });
            response_json['pages'] = matched_pages;
            resolve(response_json);
        });
    });

}

function search(url, term_list) {
    return new Promise(function(resolve, reject) {
        Document.findOne({url: url}, function(err, doc) {
            if(err)
                reject(err);
            if(!doc) {
                console.log('url did not exist in db');
                processDocument(url)
                    .then(() => {
                        console.log('finished processing');
                        searchTerm(url,term_list)
                            .then(response_json => {
                                resolve(response_json);
                            })
                            .catch(err => {
                                reject(err);
                            })
                    })
                    .catch(err => {
                        reject(err);
                    });
            } else {
                console.log('url exists');
                searchTerm(url,term_list)
                    .then(response_json => {
                        resolve(response_json);
                    })
                    .catch(err => {
                        reject(err);
                    })
            }
        });
    });
}


module.exports = {
    search: search
};
