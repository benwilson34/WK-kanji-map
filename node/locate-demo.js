// TODO rewrite to match new kanji-index.json structure (minor change)


// const fs = require('fs');
// const filepath = './kanji-index.json';

// const kanji = process.argv[2];
// if (kanji === undefined) {
// 	console.log('You must supply a kanji as an arg.');
// 	return;
// }

// fs.readFile(filepath, (err, data) => {
//   if (err) throw err;

//   let index = JSON.parse(data);
//   let count = 2905;
//   let foundIt = false;
//   for (var i = 0; i < count; i++) {
//   	let searchKanji = index[i];
//   	if (searchKanji.kanji === kanji) {
//   		console.log(`Found the kanji! ${searchKanji.kanji}: index ${searchKanji.kkld}`);
//   		foundIt = true;
//   		break;
//   	}
//   }

//   if (!foundIt) console.log("Couldn't find that kanji.");
// });