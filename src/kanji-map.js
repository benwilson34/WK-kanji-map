"use strict";

const Paper = require('paper');
const Path = Paper.Path;

const map = $('map');
const canvas = $('canvas');
canvas.style.left = map.offsetLeft; 
canvas.style.top = map.offsetTop; 

let kanjiCoords = [];

$('api-submit-button').addEventListener("click", onSubmitButtonClick);

function $(id) {
	return document.getElementById(id);
}

function setup() {
	console.log('Setting up...');
	Paper.setup(canvas);
	// var path = new Path();
	// path.strokeColor = 'black';
	// var start = new Paper.Point(100, 100);
	// path.moveTo(start);
	// path.lineTo(start.add([ 200, -50 ]));
	// Paper.view.draw();
	console.log("Done drawing!");

	// var path = new Path();
	// var circlePath = new Path.Circle(new Paper.Point(50, 50), 25);
	// circlePath.fillColor = 'red';

	// path = new Path();
	// var rect = new Path.Rectangle(20, 20, 40, 80);
	// rect.fillColor = "rgba(255, 0, 0, 0.5)";

	// Paper.onMouseMove = (event) => {
	// 	circlePath.position = event.point;
	// }

	getUserKanji("f1513ed8-8f45-4fd6-9d45-1a2486cc65ba");
}


setup();


// ===========================================

function onSubmitButtonClick() {
	$('submit-error').innerHTML = "";
	let token = $("input-token");
	getUserKanji(token.value);
}

function getUserKanji(token) {
	// const num = 3002;
	// for (var i = 1; i <= num; i++)
	// 	drawSquare(indexToCoord(i));

	// get list of inds from API
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
	// TODO switch virtual pages
	$('page1').style.display = 'none';
	$('page2').style.display = 'initial';

	// TODO move drawSquares call down here
	drawKanjiSquares(.1);
}

function onUserDataFailure(error) {
	$('submit-error').innerHTML = error + "";
}

function indexToCoord(i) {
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
	kanjiCoords.forEach(square => {
		drawSquare(square);
	});
}

function drawSquare(square, alpha) {
	// console.log(JSON.stringify(square));
	alpha = alpha === 0 ? 1 : 1;

	let w = 800; // image width
	let realx = square.x + 2; // offset
	let realy = square.y + 1; // offset;
	realx += Math.floor(square.x / 10);
	realy += Math.floor(square.y / 10)
	let checkw = 11.95;
	let checkh = 11.95;
	realx *= checkw;
	realy *= checkh;
	realx = w - (realx + 1);
	realy -= 1;

	var path = new Path();
	var rect = new Path.Rectangle(realx, realy, checkw, checkh);
	rect.fillColor = "rgba(255, 0, 0, " + alpha + ")";
	// rect.stokeColor = "rgba(128,128,128,.1)";
}

var slider = $("myRange");
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  drawKanjiSquares(this.value / 100);
}