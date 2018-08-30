"use strict";

// Load environment variables
require('dotenv').config();

var fs = require('fs'), csvParse = require('csv-parse');

// Load file
var filename = process.argv[2];
// If file is not specified
if(typeof filename == 'undefined' || filename.length < 1) {
  console.log("Tolong masukkan nama file CSV yang ingin diinput.");
  process.exit(1);
}

// Setup parser
var parser = csvParse({delimiter: ';'}, function(err, parsed) {
  var data = [], item = undefined;
  for(let index in parsed) {
    if(index == 0) continue; // skip the first row as it is just the header
    item = {
      category: parsed[index][0],
      difficulty: parsed[index][1],
      question: parsed[index][2],
      correctAnswer: parsed[index][3],
      wrongAnswers: [
        parsed[index][4],
        parsed[index][5],
        parsed[index][6]
      ]
    };
    data.push(item);
  }
  // Insert data to database
  insertToDatabase(data);
})

// Pipe read file contents into parser
fs.createReadStream(filename).pipe(parser);

function insertToDatabase(data) {
  var MongoClient = require('mongodb').MongoClient;
  var url = 'mongodb://' + process.env.DB_URL;
  var dbName = process.env.DB_NAME;

  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    if(err) throw err;

    new Promise(function(resolve, reject) {
      console.log("Menghapus semua pertanyaan yang ada di dalam database...");
      client.db(dbName).collection('questions').deleteMany(function(err, result) {
        if(err) throw err;
        console.log("Berhasil menghapus pertanyaan.");
        resolve();
      })
    }).then(function() {
      // dammit I hate chaining promises
      return new Promise(function(resolve, reject) {
        console.log("Memasukkan pertanyaan...");
        client.db(dbName).collection('questions').insertMany(data, function(err, result) {
          if(err) throw err;
          console.log("Berhasil menginput pertanyaan.");
          resolve();
        })
      })
    }).then(function() {
      client.close();
    });
  });
}
