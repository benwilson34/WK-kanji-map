// NOTE: This only needs to be re-run if/when WK changes the kanji list. 
// It generates a static JSON resource file called wk-kkld.json that the API uses.

const fs = require('fs');
const filepath = './kanji-index.json';

const request = require('request');
var kanjiUrl = 'https://api.wanikani.com/v2/subjects?types=kanji';
var wkKanji = {};

const csv = require('csvtojson');
const filepath = './kkld_kklc_hen.csv';


getPageOfKanji(kanjiUrl);

function getPageOfKanji(url) {
  request.get(url, {
    'auth': {
      'bearer': 'f1513ed8-8f45-4fd6-9d45-1a2486cc65ba'
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

  getKKLDlist().then( () => {
    if (err) throw err;

    let index = JSON.parse(data);

    let noAssoc = [];

    for (var k in wkKanji) {
      if (!index[k]) {
        noAssoc.push(k);
        continue;
      }
      let id = wkKanji[k];
      let kkld = index[k].kkld;
      compObj["id" + id] = kkld;
    }
    console.log(`Could not associate:` + noAssoc.toString())

    fs.writeFileSync("wk-kkld.json", JSON.stringify(compObj));
  })
  .catch( err => console.error(err) );
}

function getKKLDlist () {
  return csv().fromFile(filepath)
    .then(jsonObj => {
      // console.log(JSON.stringify(jsonObj[0]));
      // console.log(JSON.stringify(jsonObj[1]));
      // console.log(JSON.stringify(jsonObj[2]));

      let formattedObj = {};
      jsonObj.forEach(el => {
        formattedObj[el.kanji] = el;
        // delete formattedObj[el.kanji].kanji;
      });

      return formattedObj;
    });
}
