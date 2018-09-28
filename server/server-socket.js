"use strict";

var moment = require('moment');

// process name
process.title = 'taikai-socket';

// port where we'll run the websocket server
var webSocketServerPort = process.env.SOCKET_PORT;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

// list of currently connected clients (users)
var clients = {};

// http server
var server = http.createServer(function(request, response) {
  // irrelevant
});
server.listen(webSocketServerPort, function() {
  console.log("[SOCSRV]", moment().format("YYYY-MM-DD hh:mm:ss"), "Server websocket aktif di port " + webSocketServerPort);
});

// websocket server
var wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket
  // request is just an enhanced HTTP request. For more info
  // http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
  console.log("[SOCSRV]", moment().format("YYYY-MM-DD hh:mm:ss"), 'Koneksi masuk melalui ' + request.origin + '.');

  // accept connection - you should check 'request.origin' to
  // make sure that client is connecting from your website
  // (http://en.wikipedia.org/wiki/Same_origin_policy)
  var connection = request.accept(null, request.origin);
  // we need to know client index to remove them on 'close' event
  var selfIndex = Object.keys(clients).length;
  clients[selfIndex] = connection;

  console.log("[SOCSRV]", moment().format("YYYY-MM-DD hh:mm:ss"), 'Koneksi terjalin dengan ' + connection.remoteAddress + '.');

  // user sent some message
  connection.on('message', function(message) {
    console.log("[SOCSRV]", moment().format("YYYY-MM-DD hh:mm:ss"), 'Mendapat pesan dari ' + connection.remoteAddress + '.');
    message = JSON.parse(message.utf8Data);

    // when a user joins a session
    if(message.type == 'sessionStart') {
      // only allow one server per session
      var multipleServers = false;
      if(message.mode == 'server') {
        for(let i in clients) {
          if(clients.hasOwnProperty(i)) {
            if(clients[i].sessionCode == message.code && clients[i].mode == 'server') {
              multipleServers = true;
              break;
            }
          }
        }
      }
      if(!multipleServers) {
        // set session code
        clients[selfIndex].sessionCode = message.code;
        clients[selfIndex].mode = message.mode;
        console.log("[SOCSRV]", moment().format("YYYY-MM-DD hh:mm:ss"), 'Koneksi dari ' + connection.remoteAddress + ' terdaftar sebagai ' + `${message.mode} di sesi ${message.code}`);
      } else {
        // eject user
        clients[selfIndex].send(JSON.stringify({ action: 'eject' }));
      }
    } else
    // when a server updates the session data
    if(message.type == 'sessionUpdate') {
      var json = JSON.stringify({ action: 'sessionUpdate', session: message.session });
      for(let i in clients) {
        if(clients.hasOwnProperty(i)) {
          // next if either clients doesn't have a session code or mode
          if(typeof clients[i].sessionCode == 'undefined' || typeof clients[selfIndex].sessionCode == 'undefined' ||
            typeof clients[i].mode == 'undefined' || typeof clients[selfIndex].mode == 'undefined') {
            continue;
          }
          // next if the session code isn't the same
          if(clients[i].sessionCode != clients[selfIndex].sessionCode) {
            continue;
          }
          // next if the client isn't a control
          if(clients[i].mode != "control") {
            continue;
          }
          // send message to the client
          clients[i].send(json);
        }
      }
    } else
    // when a control user sends an action
    if(message.type == 'control') {
      // broadcast message to users with same session
      var json = JSON.stringify(message.control);
      for(let i in clients) {
        if(clients.hasOwnProperty(i)) {
          // next if either clients doesn't have a session code or mode
          if(typeof clients[i].sessionCode == 'undefined' || typeof clients[selfIndex].sessionCode == 'undefined' ||
            typeof clients[i].mode == 'undefined' || typeof clients[selfIndex].mode == 'undefined') {
            continue;
          }
          // next if the session code isn't the same
          if(clients[i].sessionCode != clients[selfIndex].sessionCode) {
            continue;
          }
          // next if the client isn't a server
          if(clients[i].mode != "server") {
            continue;
          }
          // send message to the client
          clients[i].send(json);
        }
      }
    } else
    // when a server sends something
    if(message.type == 'serve') {
      // broadcast message to users with same session
      var json = JSON.stringify(message.item);
      for(let i in clients) {
        if(clients.hasOwnProperty(i)) {
          // next if either clients doesn't have a session code or mode
          if(typeof clients[i].sessionCode == 'undefined' || typeof clients[selfIndex].sessionCode == 'undefined' ||
            typeof clients[i].mode == 'undefined' || typeof clients[selfIndex].mode == 'undefined') {
            continue;
          }
          // next if the session code isn't the same
          if(clients[i].sessionCode != clients[selfIndex].sessionCode) {
            continue;
          }
          // next if the client isn't a control
          if(clients[i].mode != "control") {
            continue;
          }
          // send message to the client
          clients[i].send(json);
        }
      }
    } else
    // when a server sends a message
    if(message.type == 'message') {
      // broadcast message to users with same session
      var json = JSON.stringify(message.message);
      for(let i in clients) {
        if(clients.hasOwnProperty(i)) {
          // next if either clients doesn't have a session code or mode
          if(typeof clients[i].sessionCode == 'undefined' || typeof clients[selfIndex].sessionCode == 'undefined' ||
            typeof clients[i].mode == 'undefined' || typeof clients[selfIndex].mode == 'undefined') {
            continue;
          }
          // next if the session code isn't the same
          if(clients[i].sessionCode != clients[selfIndex].sessionCode) {
            continue;
          }
          // next if the client isn't a server
          if(clients[i].mode != "control") {
            continue;
          }
          // send message to the client
          clients[i].send(json);
        }
      }
    }
  });

  // user disconnected
  connection.on('close', function(connection) {
    // remove user from the list of connected clients
    console.log("[SOCSRV]", moment().format("YYYY-MM-DD hh:mm:ss"), "Satu peer tidak lagi terhubung.");
    delete clients[selfIndex]; clients[selfIndex] = {};
  });
});
