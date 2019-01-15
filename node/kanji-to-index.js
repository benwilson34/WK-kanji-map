const fs = require('fs');
const filepath = __dirname + '/wk-kkld.json';
const wkidToIndex = JSON.parse(fs.readFileSync(filepath)); // unsafe but w/e

const request = require('request');

// module.exports.getSingleIndex = (id) => {
// 	if (!!wkidToIndex["id"+id]) return wkidToIndex["id"+id];
// 	else console.log("Couldn't find an entry for " + id);
// }

// module.exports.getIndices = (ids) => {
// 	// TODO
// }

module.exports.getUserIndices = (req, res) => {
	console.log("Getting user ids...");
	ids = [];
	getPageOfKanji(req, "https://api.wanikani.com/v2/assignments?subject_types=kanji&passed=true", ids, res);
}

function getPageOfKanji(req, url, ids, res) {
	let token = req.headers.authorization
	token = token.substring(7, token.length);
	console.log(token);

  request.get(url, {
    'auth': {
      'bearer': token
    }
  },
  (error, response, body) => {
    if (error) console.log(error);

    let bodyObj = JSON.parse(body);

    // add WK kanji to obj
    bodyObj.data.forEach(el => {
      // kanjiStr += el.data.characters;
      // wkKanji[el.data.characters] = el.id;
      let wkid = "id" + el.data.subject_id;
			ids.push( wkidToIndex[wkid] );
    });

    console.log(bodyObj.pages.next_url);
    if (!!bodyObj.pages.next_url)
      getPageOfKanji(bodyObj.pages.next_url, ids, res);
    else
      // compositeRes(ids, res);
    	res.json(ids);
  });
}

// relate WK kanji id -> kkld index
function compositeRes(ids, res) {
  let compObj = {};

  ids.forEach(id => {
  	compObj[id] = wkidToIndex[id];
  });

  res.json(compObj);
}

module.exports.getAllIndices = (req, res) => {
	let idxs = [];
	for (id in wkidToIndex)
		idxs.push(wkidToIndex[id]);
	
	res.json(idxs);
}