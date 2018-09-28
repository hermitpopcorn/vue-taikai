"use strict";

// Load environment variables
require('dotenv').config();

const fs = require('fs'), Binary = require('mongodb').Binary, path = require('path'), FileReader = require('filereader'), freader = new FileReader();

function traverse(dir, done) {
  let results = [];

  fs.readdir(dir, (err, list) => {
    if (err) return done(err);

    var pending = list.length;

    if (!pending) return done(null, results);

    list.forEach((file) => {
      file = path.resolve(dir, file);

      fs.stat(file, (err, stat) => {
        // If directory, execute a recursive call
        if (stat && stat.isDirectory()) {
          traverse(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(path.relative('audio', file));

          if (!--pending) done(null, results);
        }
      });
    });
  });
};

traverse("audio", (err, filenames) => {
  if (err) throw err;

  var MongoClient = require('mongodb').MongoClient;
  var url = 'mongodb://' + process.env.DB_URL;
  var dbName = process.env.DB_NAME;

  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    if(err) throw err;
    new Promise(function(resolve, reject) {
      console.log("Menghapus semua pertanyaan lagu yang ada di dalam database...");
      client.db(dbName).collection('questions').deleteMany({ category: "Tebak Lagu", round: 2 }, function(err, result) {
        if(err) throw err;
        console.log("Berhasil menghapus pertanyaan.");
        resolve();
      })
    }).then(function() {
      return new Promise(function(resolve, reject) {
        console.log("Memasukkan pertanyaan...");

        for(let filename of filenames) {
          if(path.extname(filename) !== '.mp3') continue
          let splitFilename = filename.replace('\\', '/').split('_');
          let data = {
            category: "Tebak Lagu",
            round: 2,
            difficulty: splitFilename[1],
            file: filename,
            correctAnswer: splitFilename[2],
            index: parseInt(splitFilename[0])
          };
          client.db(dbName).collection('questions').insertOne(data, function(err, result) {
            if(err) throw err;
          })
        }
        resolve();
      })
    }).then(function() {
      console.log("Berhasil menginput pertanyaan.");
      client.close();
    });
  });
});
