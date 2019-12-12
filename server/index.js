const fs = require('fs');

const handler = (req, res) => {
  fs.readFile(`${__dirname}/..${req.url === '/' ? '/index.html' : req.url}`,
    (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end(`Error loading ${req.url}`);
      }

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

app.listen(8080, '172.17.2.156');

sockets(io);
