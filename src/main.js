/**
 * This is the main module for the frontend. It mainly manages the other modules and handles the UI.
 * @module  src/main
 */
"use strict";
const Cookies = require('js-cookie');
const tokenCookieKey = 'wktoken';
const { saveAs } = require('file-saver');
const map = require('./map');
const data = require('./data');
const { $, MAX_KANJI_COUNT, getCurrentDateString } = require('./utils');
const tokenRegex = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/gi;


var dispModeRadios;


/**
 * MAIN -- have to wait for onload because the queries won't work unless the elements exist.
 */
window.onload = () => {
	// event listeners
	setUpEventListeners();

	// init the display module
	map.init($('map-area'), $('canvas'));

	// check for saved token
	const token = Cookies.get(tokenCookieKey);
	if (!!token) {
		switchMenu('cookie-loading-menu');
		handleUserToken(token);
	}
}


// EVENT LISTENERS =================================================================================

/**
 * Initialize all the event listeners.
 */
function setUpEventListeners() {
	// buttons
	$('api-submit-button').addEventListener("click", onSubmitButtonClick);
	$('clear-token').addEventListener("click", onClearTokenClick);
	$('save-image-button').addEventListener('click', onSaveImageButtonClick);

	// display mode radio buttons
	dispModeRadios = document.querySelectorAll('input[name=\'display-mode\']');
	dispModeRadios.forEach( radio => {
		radio.addEventListener('change', onDispModeChange)
	} );

	// transparency slider
	const slider = $("myRange");
	slider.oninput = onSliderChange;
}

/**
 * Handler for submit (token) button on landing menu (@see index.html). If the token is valid, it 
 * moves on to the API call @see handleUserToken.
 */
function onSubmitButtonClick() {
	displayResult("Loading...");
	const token = $("input-token").value;

	if (!token.length)
		return displayResult('Token required.', true);
	if (!token.match(tokenRegex))
		return displayResult('Token is not the right format. Did you copy the v1 token by accident?', true);
	
	const rememberToken = $('remember-token').checked;
	if (rememberToken) Cookies.set(tokenCookieKey, token);

	// get indices of user kanji from API
	handleUserToken(token);
}

/**
 * Handler for clear token button (see @index.html). Deletes the token from the cookie and refreshes
 * the page.
 */
function onClearTokenClick() {
	console.log('clearing token...');
	Cookies.remove(tokenCookieKey);
	location.reload(); // refresh page
}

/**
 * Handler for the display mode radio buttons. Switches display mode on click.
 */
function onDispModeChange() {
	dispModeRadios.forEach( radio => {
		if (radio.checked) {
			console.log(radio.value + ' was clicked');
			map.switchDisplayMode(radio.value);
		}
	} );
}

/**
 * Handler for the transparency slider. Update the alpha on drag.
 */
function onSliderChange() {
  map.changeAlpha( (100 - this.value) / 100 );
}

function onSaveImageButtonClick() {
	console.log('Saving...');
	const data = map.getMapImageData();
	const filename = 'WaniKani Kanji Map ' + getCurrentDateString();
	saveAs(data, filename);
}

function onResize() {
	// TODO resize canvas
}


// =================================================================================================

/**
 * Take a WK v2 token and retrieve the user kanji indices from the backend API.
 * @param  {string} token - the user's WK v2 API token.
 */
async function handleUserToken(token) {
	const json = await data.getUserKanji(token);
	if (!!json.error)
		return displayResult('That token didn\'t work...', true);
	else
		showUserKanjiMap(json.assocWkKanjiIdxs, json.unassocWkKanjiIds);
}

/**
 * Display user kanji on map and switch interface menu to map controls.
 * @param  {number[], number[]} dataset - assoc indices of user kanji; unassoc learned wk kanji ids.
 */
function showUserKanjiMap(assocKanjiIdxs, unassocIds) {
	// switch virtual page
	switchMenu('map-menu');

	// show actual overlay (bingo mode by default)
	map.setDataset(assocKanjiIdxs);

	// set info text 
	const userCount = assocKanjiIdxs.length;
	const statStr = `You know ${userCount} out of 3002, which is ${getPrettyPercent(userCount)}% ` + 
		`of the kanji on the map.`;
	$('info-user').innerHTML = statStr;
	const extraKanjiStr = `You also know ${unassocIds.length} of the 11 kanji that ` + 
		`are not on the map.`;
	$('info-extra-kanji').innerHTML = extraKanjiStr;
}

/**
 * Print percent of kanji with precision to one decimal, e.g. 67.8%
 * @param  {number} userCount - count of user kanji.
 * @return {string}           - formatted percentage.
 */
function getPrettyPercent(userCount) {
	return ((userCount / MAX_KANJI_COUNT) * 100).toFixed(1);
}

/**
 * Display a result text near the submit button.
 * @param  {string}  text    - the message to display to the user.
 * @param  {Boolean} isError - whether to color the message red or not.
 */
function displayResult(text, isError = false) {
	const submitResult = $('submit-result');
	submitResult.innerHTML = text + "";
	submitResult.style.color = isError ? 'red' : 'initial';
}

/**
 * Switch menu to a different virtual page.
 * @param  {string} displayMenu - the id of the menu to show, @see dist/index.html.
 */
function switchMenu(displayMenu) {
	// displayMenu must be one of these menus; the others will be hidden
	const menus = [ 'landing-menu', 'cookie-loading-menu', 'map-menu' ];
	menus.forEach( menu => {
		$(menu).style.display = displayMenu === menu ? 'initial' : 'none';
	} );
}
