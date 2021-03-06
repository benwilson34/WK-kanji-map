/**
 * This is the entry point for the backend of the app, which both handles web API calls and
 * statically serves the built frontend.
 * @module index
 */
const express = require('express');
const port = process.env.PORT || 8081;


// MAIN ============================================================================================

const app = express();
// TODO morgan?

// statically serve frontend
app.use(express.static(__dirname + "/dist"));

// web API endpoints
const kanjiConvert = require('./node/kanji-to-index');
const router = express.Router();
router.get('/api/ids',     kanjiConvert.getUserIndices);
router.get('/api/all-ids', kanjiConvert.getAllIndices);
app.use(router);

// start the server
app.listen(port, () => console.log(`Listening on port ${port}...`));

// =================================================================================================
