// Load environment variables
require('dotenv').config()

var fork = require('child_process').fork;
var api = fork('./server/server-api.js');
var socket = fork('./server/server-socket.js');
