/**
 * This modules associates the 2037 kanji that are part of WK with a KKLD index. This generates a 
 * resource file, 'wk-kkld.json', which the API handler reads from. 
 * NOTE This is run with 'npm run resource', but only needs to be run if/when WK adds or removes 
 * kanji from their system. 
 * @module /node/resource/convert-sid-kkld
 */
const fs = require('fs');
const request = require('request');
const csv = require('csvtojson');
const kanjiUrl = 'https://api.wanikani.com/v2/subjects?types=kanji';
const csvFilepath = __dirname + '/kkld_kklc_hen.csv';
const jsonFilepath = __dirname + '/wk-kkld.json';
// TODO get token from env-vars


// MAIN ============================================================================================

// start off the retrieval, it'll generate the object from here and save to file
const token = process.env.WK_TOKEN;
if (!token) {
  console.log("Whoops! You need to supply the WK_TOKEN env var. Pass it in with the command.");
  return;
}
getPageOfKanji(kanjiUrl, token);

// =================================================================================================


/**
 * Get all WK kanji in their system using the API. They are returned in pages of 1000 kanji, so 
 * there will be three pages total (so three API calls). When all the kanji have been retrieved, 
 * it calls @see compositeRes. 
 * @param  {string} url     - the WK API URL to call.
 * @param  {string} token   - the WK API v2 token.
 * @param  {object} wkKanji - the object containing the WK kanji retrieved so far. First call is null.
 */
function getPageOfKanji(url, token, wkKanji = null) {
  if (!wkKanji) wkKanji = {};

  request.get(url, {
    'auth': { 'bearer': token }
  },
  (error, response, body) => {
    if (error) console.log(error);

    let bodyObj = JSON.parse(body);
    let kanjiStr = "";

    // add WK kanji to obj
    bodyObj.data.forEach(el => {
      kanjiStr += el.data.characters;
      wkKanji[el.data.characters] = el.id;
    });
    console.log(kanjiStr);

    // if there's another page, recursively call getPageOfKanji. 
    // If not, that's all the kanji, move on to creating the object/file.
    console.log(bodyObj.pages.next_url);
    if (!!bodyObj.pages.next_url)
      getPageOfKanji(bodyObj.pages.next_url, token, wkKanji);
    else
      associateKanjiToIndex(wkKanji);
  });
}

/**
 * Take an object with WK kanji by character and associate KKLD indices with the kanji. Saves the 
 * resultant object to /node/resource/wk-kkld.json
 * @param {object} - the object containing the kanji to associate, with structure resembling:
 *                   { '倹': 2465, '狐': 2466, ... }
 */
function associateKanjiToIndex(wkKanji) {
  getKKLDdict().then( KKLDdict => {
    let assocWkKanjiIds = {};
    let unassocWkKanjiIds = [];

    // structure will resemble: { "id440": "2850", "id441": "1688", "id442": "2858", ... }
    for (var k in wkKanji) {
      let wkid = "id" + wkKanji[k];
      if (!KKLDdict[k]) {
        unassocWkKanjiIds.push(wkid);
        continue;
      }
      assocWkKanjiIds[wkid] = KKLDdict[k];
    }
    console.log(`Could not associate wkIds: ` + unassocWkKanjiIds.toString());

    // save the object to file
    let resourceObj = { assocWkKanjiIds, unassocWkKanjiIds };
    fs.writeFileSync(jsonFilepath, JSON.stringify(resourceObj, null, '  ') + '\n');
    console.log('Done writing resource object to ' + jsonFilepath);
  })
  .catch( err => console.error(err) );
}

/**
 * Get list of indices from CSV file - @see kkld_kklc_hen.csv and csvtojson.
 * @return {Promise<object>} - Resolves with object relating kanji to KKLD index, resembling:
 *                             { '爾' : '3001', '畿': '3002', ... }
 */
function getKKLDdict () {
  return csv().fromFile(csvFilepath)
    .then(jsonObj => {
      let kkldDict = {};
      jsonObj.forEach(el => {
        kkldDict[el.kanji] = el.kkld;
      });
      return kkldDict;
    });
}
