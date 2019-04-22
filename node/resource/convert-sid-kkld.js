// NOTE: This only needs to be re-run if/when WK changes the kanji list. 
// It generates a static JSON resource file called wk-kkld.json that the API uses.
const fs = require('fs');
const request = require('request');
const kanjiUrl = 'https://api.wanikani.com/v2/subjects?types=kanji';
const csv = require('csvtojson');
// NOTE I don't like these paths but unless I wanna make this a module this is how it is
const csvFilepath = './node/resource/kkld_kklc_hen.csv';
const jsonFilepath = './node/resource/wk-kkld.json';
// TODO get token from env-vars


// MAIN ============================================================================================

var wkKanji = {};
getPageOfKanji(kanjiUrl);

// =================================================================================================


function getPageOfKanji(url) {
  request.get(url, {
    'auth': {
      'bearer': '06a889e3-c519-47d2-9bcf-ddb82c96040e'
    }
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

    console.log(bodyObj.pages.next_url);
    if (!!bodyObj.pages.next_url)
      getPageOfKanji(bodyObj.pages.next_url);
    else
      compositeRes();
  });
}

// relate WK kanji id -> kkld index
function compositeRes() {
  let compObj = {};

  getKKLDlist().then( indexes => {
    let noAssoc = [];

    for (var k in wkKanji) {
      if (!indexes[k]) {
        noAssoc.push(k);
        continue;
      }
      let id = wkKanji[k];
      let kkld = indexes[k].kkld;
      compObj["id" + id] = kkld;
    }
    console.log(`Could not associate:` + noAssoc.toString())

    fs.writeFileSync(jsonFilepath, JSON.stringify(compObj, null, '  '));
  })
  .catch( err => console.error(err) );
}

function getKKLDlist () {
  return csv().fromFile(csvFilepath)
    .then(jsonObj => {
      let formattedObj = {};
      jsonObj.forEach(el => {
        formattedObj[el.kanji] = el;
        // delete formattedObj[el.kanji].kanji;
      });

      return formattedObj;
    });
}
