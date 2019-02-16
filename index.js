const express = require('express');
const app = express();
const port = process.env.PORT || 8081;

// morgan?

// statically serve frontend
app.use(express.static(__dirname + "/dist"));

const kanjiConvert = require('./node/kanji-to-index');
const router = express.Router();
router.get('/api/ids',     kanjiConvert.getUserIndices);
router.get('/api/all-ids', kanjiConvert.getAllIndices);
app.use(router);

// start the server
app.listen(port, () => console.log(`Listening on port ${port}...`));