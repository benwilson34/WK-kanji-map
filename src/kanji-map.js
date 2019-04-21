"use strict";
const Cookies = require('js-cookie');
const tokenCname = 'wktoken';
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
	$('clear-token').addEventListener("click", onClearTokenClick);
	// $('save-image-button').addEventListener('click', saveMapAsImage);

	// display mode radio buttons
	dispModeRadios = document.querySelectorAll('input[name=\'display-mode\']');
	dispModeRadios.forEach( radio => {
		radio.addEventListener('change', onDispModeChange)
	} );

	// transparency slider
	const slider = $("myRange");
	slider.oninput = onSliderChange;

	// init the display module
	display.init( $('map-area'), $('canvas') );

	// check for saved token
	const token = Cookies.get(tokenCname);
	if (!!token) {
		switchMenu('cookie-loading-menu');
		handleUserToken(token);
		// alert('found saved token');
		// TODO enable UI element to clear cookie
	}
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
		return displayResult('Token is not the right format. Did you copy the v1 token by accident?', true);
	
	const rememberToken = $('remember-token').checked;
	if (rememberToken) Cookies.set(tokenCname, token);

	handleUserToken(token);
}

async function handleUserToken(token) {
	const json = await data.getUserKanji(token);
	if (!!json.error)
		return displayResult('That token didn\'t work...', true);
  else
		onUserDataSuccess(json);
}

function onUserDataSuccess(dataset) {
	// switch virtual pages
	switchMenu('map-menu');

	// show actual overlay (bingo mode by default)
	display.setDataset(dataset);

	const userCount = dataset.length;
	const statStr = `You know ${userCount} out of 3002, which is ${getPrettyPercent(userCount)}% ` + 
		`of the kanji on the map.`;
	$('info-user').innerHTML = statStr;
	const extraKanjiStr = `You also know ${dataset.filter(e => !e).length} of the 8 kanji that ` + 
		`are not on the map.`;
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

function switchMenu(displayMenu) {
	const menus = [ 'landing-menu', 'cookie-loading-menu', 'map-menu' ];
	menus.forEach( menu => {
		$(menu).style.display = displayMenu === menu ? 'initial' : 'none';
	} );
}

// Update the current slider value (each time you drag the slider handle)
function onSliderChange() {
  // drawKanjiSquares(this.value / 100);
  display.changeAlpha( (100 - this.value) / 100);
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

function onClearTokenClick() {
	console.log('clearing token...');

	Cookies.remove(tokenCname);
	// TODO go back to first toolbar screen
	// or just refresh?
	location.reload();
}
