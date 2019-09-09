const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const utility = require('./utility');
const dbUtility = require('./db_utility');
require('dotenv/config');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Routes
app.post('/', async (req, res) => {
    try{
        utility.validateUrl(req.body.url);
        if(req.body.term_list){
            dbUtility.search(req.body.url, req.body.term_list)
                .then(response_json => {
                    res.status(200);
                    res.json({result: response_json});
                })
                .catch(err => {
                    res.status(400);
                    res.json({message: err});
                })
        }
    } catch(err) {
        res.status(400);
        res.json({message: err});
    }

});


// Connect to db
mongoose.connect(process.env.DB_CONNECTION,
    { useNewUrlParser: true },
    () => {console.log('connected to DB!')
});


// Start listening to server
app.listen(3000);

