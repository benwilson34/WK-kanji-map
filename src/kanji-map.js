"use strict";
const { $, MAX_KANJI_COUNT } = require('./utils');
const display = require('./display');
const data = require('./data');

var dispModeRadios;


// setup -- have to wait for onload because the queries won't work unless the elements exist
window.onload = () => {
	console.log('Setting up...');

	// event listeners
	// submit button
	$('api-submit-button').addEventListener("click", onSubmitButtonClick);

	// display mode radio buttons
	dispModeRadios = document.querySelectorAll('input[name=\'display-mode\']');
	dispModeRadios.forEach( radio => {
		radio.addEventListener('change', onDispModeChange)
	} );

	// transparency slider
	// var slider = $("myRange");
	// slider.oninput = onSliderChange;

	// init the display module
	display.init( $('canvas') );

	// TODO remove
	// handleUserToken("f1513ed8-8f45-4fd6-9d45-1a2486cc65ba");
}


// ===========================================

function onSubmitButtonClick() {
	displayResult("Loading...");
	let token = $("input-token");
	handleUserToken(token.value);
}

async function handleUserToken(token) {
	var json = await data.getUserKanji(token);
	if (!!json.error)
  	onUserDataFailure(json.error);
  else
		onUserDataSuccess(json);
}

function onUserDataSuccess(dataset) {
	// switch virtual pages
	$('token-controls').style.display = 'none';
	$('map-controls').style.display = 'initial';

	// show actual overlay (bingo mode by default)
	display.setDataset(dataset);
}

function onUserDataFailure(error) {
	displayResult('That token didn\'t work...', true);
}

function displayResult(text, isError = false) {
	let submitResult = $('submit-result');
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
