"use strict";
const display = require('./display');
const data = require('./data');
const { $, MAX_KANJI_COUNT } = require('./utils');
const tokenRegex = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/gi;

var dispModeRadios;


// setup -- have to wait for onload because the queries won't work unless the elements exist
window.onload = () => {
	console.log('Setting up...');

	// event listeners
	$('api-submit-button').addEventListener("click", onSubmitButtonClick);
	$('save-image-button').addEventListener('click', saveMapAsImage);

	// display mode radio buttons
	dispModeRadios = document.querySelectorAll('input[name=\'display-mode\']');
	dispModeRadios.forEach( radio => {
		radio.addEventListener('change', onDispModeChange)
	} );

	// transparency slider
	// var slider = $("myRange");
	// slider.oninput = onSliderChange;

	// init the display module
	display.init( $('map-area'), $('canvas') );

	// TODO remove
	// handleUserToken("32f9c7b1-9b58-48a4-8913-8124b385993d");
}


// =================================================================================================

function onResize() {
	// TODO resize canvas
}

function onSubmitButtonClick() {
	displayResult("Loading...");
	const token = $("input-token").value;

	if (!token.length)
		return displayResult('Token required.', true);
	if (!token.match(tokenRegex))
		return displayResult('Token is not the right format. Did you get a v1 token by accident?', true);
	
	handleUserToken(token);
}

async function handleUserToken(token) {
	var json = await data.getUserKanji(token);
	if (!!json.error)
		return displayResult('That token didn\'t work...', true);
  else
		onUserDataSuccess(json);
}

function onUserDataSuccess(dataset) {
	// switch virtual pages
	$('landing-menu').style.display = 'none';
	$('map-menu').style.display = 'initial';

	// show actual overlay (bingo mode by default)
	display.setDataset(dataset);

	const userCount = dataset.length;
	const statStr = `You know ${userCount} out of 3002, which is ${getPrettyPercent(userCount)}% `
		+ `of the kanji on the map.`;
	$('info-user').innerHTML = statStr;
	const extraKanjiStr = `You also know ${dataset.filter(e => !e).length} of the 8 kanji that `
		+ `are not on the map.`;
	$('info-extra-kanji').innerHTML = extraKanjiStr;
}

function getPrettyPercent(userCount) {
	return ((userCount / 3002) * 100).toFixed(1);
}

function displayResult(text, isError = false) {
	const submitResult = $('submit-result');
	submitResult.innerHTML = text + "";
	submitResult.style.color = isError ? 'red' : 'initial';
}

// Update the current slider value (each time you drag the slider handle)
function onSliderChange() {
  // drawKanjiSquares(this.value / 100);
}

function onDispModeChange() {
	dispModeRadios.forEach( radio => {
		if (radio.checked) {
			console.log(radio.value + ' was clicked');
			display.switchDisplayMode(radio.value);
		}
	} );
}

function saveMapAsImage() {
	// TODO
	console.log('Saving...');
}
