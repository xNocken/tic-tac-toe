/* eslint-disable no-console */
const fs = require('fs');
const mime = require('mime-types');

const handler = (req, res) => {
  console.log(`${req.connection.remoteAddress} requested "${req.url}"`);
  fs.readFile(`${__dirname}/..${req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]}`,
    (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end(`Error loading ${req.url}`);
      }

      res.setHeader('Content-Type', mime.lookup(req.url));
      res.writeHead(200);
      res.end(data);
      return '';
    });
};

const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const sockets = require('./sockets');
const config = require('./config');

config.setSocket('io', io);

app.listen(config.settings.port, config.settings.ip);
sockets(io);

console.log(`listening on ${config.settings.ip}:${config.settings.port}`);
