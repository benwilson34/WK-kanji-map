"use strict";

const Paper = require('paper');
const Path = Paper.Path;
var canvas;
var group;
var zoomFactor = 2;

let kanjiCoords = [];


function $(id) {
	return document.getElementById(id);
}

function setup() {
	console.log('Setting up...');

	// event listeners
	$('api-submit-button').addEventListener("click", onSubmitButtonClick);

	canvas = $('canvas');
	Paper.setup(canvas);

	var map = new Paper.Raster('map');
	map.position = Paper.view.center;
	map.fitBounds(Paper.view.bounds);
	group = new Paper.Group(map);

	getUserKanji("f1513ed8-8f45-4fd6-9d45-1a2486cc65ba");
}

window.onload = () => { setup(); }


// ===========================================

function onSubmitButtonClick() {
	$('submit-error').innerHTML = "";
	let token = $("input-token");
	getUserKanji(token.value);
}

function getUserKanji(token) {
	// const num = 3002;
	// for (var i = 1; i <= num; i++)
	// 	kanjiCoords.push(indexToCoord(i));
	// onUserDataSuccess();


	//get list of inds from API
	( async () => {
	  const response = await fetch('http://localhost:8081/api/ids', {
	  	headers: {
	  		"Authorization": "Bearer " + token
	  	}
	  });
	  const json = await response.json(); //extract JSON from the http response

	  if (!!json.error) return onUserDataFailure(json.error);

		json.forEach(i => {
			kanjiCoords.push(indexToCoord(i));
		});

		onUserDataSuccess();
	} )();
}

function onUserDataSuccess() {
	// switch virtual pages
	$('page1').style.display = 'none';
	$('page2').style.display = 'initial';

	drawKanjiSquares(.1);

	Paper.view.onKeyDown = onKeyDown;
	Paper.view.onMouseEnter = onMouseEnter;
	Paper.view.onMouseLeave = onMouseLeave;
	Paper.view.onMouseMove = onMouseMove;
}

function onUserDataFailure(error) {
	$('submit-error').innerHTML = error + "";
}

function indexToCoord(i) {
	if (i <= 0)  {
		console.log('Got one of the 8 undefined kanji.');
		return { x: -1, y: -1 };
	}
	if (i === 3002) return { x: 1, y: 50 }; // literally the only one out of place
	else {
		i--;
		return {
			x: Math.floor((i % 600) / 10),
			y: ((Math.floor(i / 600) * 10) + (i % 10))
		}
	}
}

// draw square for each point
function drawKanjiSquares(alpha) {
	// ctx.clearRect(0, 0, canvas.width, canvas.height);
	var squares = [];
	kanjiCoords.forEach(square => {
		// this 'if' will catch the 8 undefined kanji
		if (square.x !== -1) squares.push(drawSquare(square));
	});
	group.addChildren(squares);
}

function drawSquare(square, alpha) {
	// console.log(JSON.stringify(square));
	alpha = alpha === 0 ? 1 : 1;

	let w = 800; // image width
	let realx = square.x + 2; // offset
	let realy = square.y + 3; // offset;
	realx += Math.floor(square.x / 10);
	realy += Math.floor(square.y / 10);
	let squareSide = 800 / 67; // 800px / number of squares across
	realx *= squareSide;
	realy *= squareSide;
	realx = w - realx;

	var path = new Path();
	var rect = new Path.Rectangle(realx, realy, squareSide, squareSide);
	rect.fillColor = "rgba(255, 0, 0, " + alpha + ")";
	// rect.stokeColor = "rgba(128,128,128,.1)";
	return rect;
}

function onKeyDown(event) {
	const zoomInc = .2;
	if (event.key === 'w') {
		zoomFactor += zoomInc;
		group.scale(1 + zoomInc);
	}	else if (event.key === 's') {
		zoomFactor -= zoomInc;
		group.scale(1 + (-1 * zoomInc));
	}
	console.log(zoomFactor);
}

function onMouseEnter(event) {
	console.log('\\  Mouse enter!');
	group.scale(zoomFactor);
}

function onMouseLeave(event) {
	console.log('/  Mouse leave!');
	group.fitBounds(Paper.view.bounds);
	group.position = Paper.view.center;
}

function onMouseMove(event) {
	// transform mouse point
	let x = event.point.x / Paper.view.viewSize.width;
	let y = event.point.y / Paper.view.viewSize.height;
	x = 1 - (x + .25);
	y = 1 - (y + .25);
	x *= group.bounds.width;
	y *= group.bounds.height;

	// console.log(x + ', ' + y);
	let point = new Paper.Point(x, y);
	// console.log (' |  ' + point);
	group.position = point;
}

var slider = $("myRange");
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  drawKanjiSquares(this.value / 100);
}