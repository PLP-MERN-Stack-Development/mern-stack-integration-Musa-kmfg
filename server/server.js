require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { initSocket } = require('./socket/io');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

const server = http.createServer(app);
const io = initSocket(server);

// basic route
app.get('/', (req, res) => res.json({ ok: true }));

// connect DB
mongoose.connect(process.env.MONGO_URI).then(()=> {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, ()=> console.log('Server listening on', PORT));
}).catch(err => console.error('Mongo error', err.message));
