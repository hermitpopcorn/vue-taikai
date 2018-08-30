"use strict";

// setup libraries
const moment = require('moment');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// establish connection with database
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://' + process.env.DB_URL;
var db;
MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
  if(err) throw err;
  db = client.db(process.env.DB_NAME);
});

// serve index file
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'vue/dist/', 'index.html'));
});
// serve public files
app.use('/', express.static(path.join(__dirname, '..', 'vue/dist/')));
// serve modules
app.use('/modules', express.static(path.join(__dirname, '..', 'node_modules/')));

// get port
app.get('/port', function(req, res) {
  res.send({
    socketPort: process.env.SOCKET_PORT
  });
});

// get session
app.get('/session/:sessionCode', function(req, res) {
  db.collection('sessions').findOne({ code: req.params.sessionCode }, function(err, doc) {
    if(err) throw err;
    if(doc) {
      console.log("[APISRV]", moment().format("YYYY-MM-DD hh:mm:ss"), `Sesi ${req.params.sessionCode} dilanjutkan.`);
      res.send(doc);
    } else {
      res.send({});
    }
  });
});

// create new session
app.post('/session', function(req, res) {
  // init data variable
  let sessionData = {
    code: req.body.code,
    teams: [],
    pointIncrement: req.body.pointIncrement,
    readQuestions: []
  };
  // add teams with supplied names and give them all 0 points
  for(let i of req.body.teamNames) {
    sessionData.teams.push({
      name: i,
      points: 0
    })
  }
  // insert into db
  db.collection('sessions').insertOne(sessionData, function(err, result) {
    if(err) throw err;
    console.log("[APISRV]", moment().format("YYYY-MM-DD hh:mm:ss"), `Sesi baru dengan kode ${sessionData.code} dimulai.`);
    // return the inserted session
    res.send(result.ops[0]);
  });
});

// update session
app.put('/session/:sessionCode', function(req, res) {
  let session = req.body.session;
  delete session._id;
  db.collection('sessions').updateOne({ code: req.params.sessionCode }, { '$set': session }, function(err, result) {
    if(err) throw err;
    console.log("[APISRV]", moment().format("YYYY-MM-DD hh:mm:ss"), `Data sesi dengan kode ${req.params.sessionCode} telah diperbarui.`);
    res.send({});
  })
});

var server = app.listen(process.env.API_PORT, function () {
   var host = server.address().address;
   var port = server.address().port;

   console.log("[APISRV]", moment().format("YYYY-MM-DD hh:mm:ss"), `API server berjalan di http://${host}:${port}`);
})
