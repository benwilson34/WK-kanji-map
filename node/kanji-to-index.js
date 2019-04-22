const fs = require('fs');
const filepath = __dirname + '/resource/wk-kkld.json';
const wkidToIndex = JSON.parse(fs.readFileSync(filepath)); // unsafe but w/e

const request = require('request');

const { inspect } = require('util');


module.exports.getUserIndices = (req, res) => {
	console.log("Getting user ids...");
	let ids = [];
	getPageOfKanji(req, "https://api.wanikani.com/v2/assignments?subject_types=kanji&passed=true", ids, res);
}

function getPageOfKanji(req, url, ids, res) {
	let token = req.headers.authorization;
  if (!token) return res.json({ error: "No token supplied." });
	if (token.startsWith('Bearer')) token = token.substring(7, token.length);
	// console.log(token);

  request.get(url, {
    'auth': { 'bearer': token }
  },
  (error, response, body) => {
    // console.log(body);
    body = JSON.parse(body);

    if (error || body.error) {
      if (body.error) error = body.error;
      console.log(error);
      return res.json({ error: error });
    }

    // add WK kanji to obj
    body.data.forEach(el => {
      let wkid = "id" + el.data.subject_id;
			ids.push( wkidToIndex[wkid] );
    });

    if (!!body.pages.next_url) {
      console.log(`Next url: ${body.pages.next_url}`);
      getPageOfKanji(req, body.pages.next_url, ids, res);
    } else {
      console.log(`Done, sending ${ids.length} ids.\n`);
    	res.json(ids);
    }
  });
}

module.exports.getAllIndices = (req, res) => {
	let idxs = [];
	for (id in wkidToIndex)
		idxs.push(wkidToIndex[id]);
	
	res.json(idxs);
}