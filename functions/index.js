const functions = require('firebase-functions');
const express = require('express');

const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// var request = require('request');
// var options = {
//     url: 'http://paul.ekreative.com/webhook',
//     json: req.body
// }
// request.post(options);


app.post('/webhook', (req, res) => {

     db.collection('webhooks').add({
         hook: req.body
     });
 //EAAGejVkLUmoBAFIj1sHpdE6zUAZA6YSW0irrLwQIZCwHNETzuN3gZBp4mtGXi2S7uxGNPooxSrsaFDVSbNGBamaEkzTbvuaEK7n7L1ctTpEQzcTn9dGK0QWT9RIj9eOio9atW0bUIjBkKpij0UZADBOzXaAVf5gJgEVYZCZABs6G5lmtDgAeGC

    res.status(200).send('EVENT_RECEIVED');
});

app.get('/webhook', (req, res) => {

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === "mit") {
            res.status(200).send(challenge);
        } else {
            res.status(200).send('wrong token');
        }
    }
    res.status(403).send('no arguments');
});

exports.app = functions.https.onRequest(app);
