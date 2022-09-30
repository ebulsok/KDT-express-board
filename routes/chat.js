// @ts-check
const express = require('express');

const router = express.Router();
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ port: 7777 });

wss.on('connection', (ws) => {
  // ws.send('서버입니다.');

  // ws.on('message', (message) => {
  //   console.log(message.toString());
  // });

  wss.clients.forEach((client) => {
    client.send(
      `새로운 유저가 접속했습니다. 현재 유저 수: ${wss.clients.size}`
    );
  });

  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      client.send(`${message}`);
    });
  });

  ws.on('close', () => {
    wss.clients.forEach((client) => {
      client.send(`유저가 퇴장했습니다. 현재 유저 수: ${wss.clients.size}`);
    });
  });
});

router.get('/', (req, res) => {
  res.render('chat');
});

module.exports = router;
