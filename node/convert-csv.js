const fs = require('fs');
const csv = require('csvtojson');
const filepath = './kkld_kklc_hen.csv';

csv().fromFile(filepath)
	.then(jsonObj => {
		console.log(JSON.stringify(jsonObj[0]));
		console.log(JSON.stringify(jsonObj[1]));
		console.log(JSON.stringify(jsonObj[2]));

		let formattedObj = {};
		jsonObj.forEach(el => {
			formattedObj[el.kanji] = el;
			// delete formattedObj[el.kanji].kanji;
		});

		fs.writeFileSync("kanji-index.json", JSON.stringify(formattedObj));
	});