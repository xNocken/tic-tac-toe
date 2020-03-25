const fs = require('fs');
const mime = require('mime-types');
const socketio = require('socket.io');
const dns = require('dns');
const http = require('http');
const https = require('https');
const config = require('./config');

let app;

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

if (config.globalSettings.https) {
  console.log('starting with https');
  // TODO: catch errors
  const options = {
    key: fs.readFileSync(config.globalSettings.key),
    cert: fs.readFileSync(config.globalSettings.cert),
  };

  app = https.createServer(options, handler);
} else {
  console.log('starting with http');
  app = http.createServer(handler);
}

const io = socketio(app);
const sockets = require('./sockets');

config.setSocket('io', io);

dns.lookup(config.globalSettings.ip, {}, (err, ip) => {
  app.listen(config.globalSettings.port, ip);

  sockets(io);

  console.log(`listening on ${ip}:${config.globalSettings.port}`);
});
