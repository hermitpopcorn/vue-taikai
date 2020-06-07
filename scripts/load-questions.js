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

    if(parseInt(parsed[index][0]) === 0 || parseInt(parsed[index][0]) === 3) {
      // determine correct option index
      let correctAnswer;
      if(parsed[index][9] === 'A' || parsed[index][9] === 'a') { correctAnswer = 0 }
      if(parsed[index][9] === 'B' || parsed[index][9] === 'b') { correctAnswer = 1 }
      if(parsed[index][9] === 'C' || parsed[index][9] === 'c') { correctAnswer = 2 }
      if(parsed[index][9] === 'D' || parsed[index][9] === 'd') { correctAnswer = 3 }
      item = {
        round: parseInt(parsed[index][0]),
        index: parseInt(parsed[index][1]),
        category: parsed[index][2],
        difficulty: parsed[index][3],
        question: parsed[index][4],
        options: [
          parsed[index][5],
          parsed[index][6],
          parsed[index][7],
          parsed[index][8]
        ],
        correctAnswer: correctAnswer,
        showOptions: parseInt(parsed[index][10]) === 1 ? true : false,
        showQuestion: parseInt(parsed[index][11]) === 1 ? true : false
      };
      data.push(item);
    } else if(parseInt(parsed[index][0]) === 1) {
      let correctAnswer;
      if(parsed[index][9] === 'X' || parsed[index][9] === 'x') { correctAnswer = false }
      if(parsed[index][9] === 'O' || parsed[index][9] === 'o') { correctAnswer = true }
      item = {
        round: parseInt(parsed[index][0]),
        index: parseInt(parsed[index][1]),
        category: parsed[index][2],
        difficulty: parsed[index][3],
        question: parsed[index][4],
        correctAnswer: correctAnswer,
        showQuestion: parseInt(parsed[index][11]) === 1 ? true : false,
        note: parsed[index][12]
      };
      data.push(item);
    }
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
      console.log("Menghapus semua pertanyaan non-tebak lagu yang ada di dalam database...");
      client.db(dbName).collection('questions').deleteMany({ round: { $ne: 2 } }, function(err, result) {
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
