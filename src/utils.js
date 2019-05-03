module.exports.MAX_KANJI_COUNT = 3002;

module.exports.$ = (id) => {
	return document.getElementById(id);
}

module.exports.getCurrentDateString = () => {
	const today = new Date();
	return today.getFullYear() + "-" + (parseInt(today.getMonth()) + 1) + "-" + today.getDate();
}
