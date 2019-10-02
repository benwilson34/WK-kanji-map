/**
 * This is the module that handles the map API calls which associate user kanji to KKLD indices. 
 * @module node/kanji-to-index
 */
const fs = require('fs');
const request = require('request');
const filepath = __dirname + '/resource/wk-kkld.json';
const kanjiResource = JSON.parse(fs.readFileSync(filepath)); // unsafe but w/e


/**
 * Get all indices based on a user's learned kanji. 
 * @param  {object} req - the Express HTTP request. Must contain auth header with a valid WK API v2
 *                      token.
 * @param  {object} res - the Express HTTP response.
 *                      Sends an array of all the indices corresponding to the user's learned kanji.
 */
module.exports.getUserIndices = (req, res) => {
	console.log("Getting user ids...");
	let token = req.headers.authorization;
  if (!token) return res.json({ error: "No token supplied." });
	if (token.startsWith('Bearer')) token = token.substring(7, token.length);

  const url = "https://api.wanikani.com/v2/assignments?subject_types=kanji&passed=true";
	getPageOfKanji(token, url, res);
}

/**
 * Get a single page of user kanji (1000 at a time). Once all pages have been read, the array of 
 * indices is sent.
 * TODO a Promise would be better.
 * @param  {string} token - a valid WaniKani API v2 token for the target user.
 * @param  {string} url   - the url of the page of kanji to retrieve.
 * @param  {object} res   - the Express HTTP response.
 *                        Sends the obj with user-learned indices.
 */
function getPageOfKanji(token, url, res, userKanjiObj = null) {
  if (!userKanjiObj) userKanjiObj = { assocWkKanjiIdxs: [], unassocWkKanjiIds: [] };
  request.get(url, {
    'auth': { 'bearer': token }
  },
  (error, response, body) => {
    // console.log(body);
    body = JSON.parse(body);

    // catch error
    if (error || body.error) {
      if (body.error) error = body.error;
      console.log(error);
      return res.json({ error: error });
    }

    // add WK kanji to obj
    body.data.forEach(el => {
      let wkid = "id" + el.data.subject_id;
      if (!!kanjiResource.assocWkKanjiIds[wkid])
        userKanjiObj.assocWkKanjiIdxs.push( kanjiResource.assocWkKanjiIds[wkid] );
      else if (kanjiResource.unassocWkKanjiIds.includes(wkid))
        userKanjiObj.unassocWkKanjiIds.push( wkid );
      // TODO else, the kanji is not in the resource file...time to re-gen the resource!
    });

    // if there's another page, recursively call
    // if not, send the obj
    if (!!body.pages.next_url) {
      console.log(`Next url: ${body.pages.next_url}`);
      getPageOfKanji(token, body.pages.next_url, res, userKanjiObj);
    } else {
      console.log(`Done, sending ${userKanjiObj.assocWkKanjiIdxs.length + userKanjiObj.unassocWkKanjiIds.length} ids.\n`);
    	res.json(userKanjiObj);
    }
  });
}

/**
 * Simply returns the entire list of indices (all WK kanji which appear on the map).
 * @param  {object} req - the Express HTTP request.
 * @param  {object} res - the Express HTTP response.
 *                      Sends an array of all the indices.
 */
module.exports.getAllIndices = (req, res) => {
  const assocWkKanjiIds = kanjiResource.assocWkKanjiIds;
	let idxs = [];
	for (id in assocWkKanjiIds)
		idxs.push(assocWkKanjiIds[id]);
	res.json({ assocWkKanjiIdxs: idxs, unassocWkKanjiIds: kanjiResource.unassocWkKanjiIds });
}
