const express = require('express');
const cors = require('cors');
const app = express();

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const url = process.env.MONGODB_URI;

const client = new MongoClient(url);
client.connect();

app.use(cors());
app.use(express.json());

var api = require('./load_api');
api.loadApi(app,client);

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`Server running successfully on port ${PORT}`);
});
