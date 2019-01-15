"use strict";

function $(id) {
	return document.getElementById(id);
}

const map = $('map');
const canvas = $('canvas');
canvas.style.left = map.offsetLeft; 
canvas.style.top = map.offsetTop; 
const ctx = canvas.getContext('2d');

let kanjiCoords = [];
getUserKanji("f1513ed8-8f45-4fd6-9d45-1a2486cc65ba");


// ===========================================

function getUserKanji(token) {
	// const num = 3002;
	// for (var i = 1; i <= num; i++)
	// 	drawSquare(indexToCoord(i));
	  
	// TODO get list of inds from API
	const userAction = async () => {
	  const response = await fetch('http://localhost:8081/api/ids', {
	  	headers: {
	  		"Authorization": "Bearer " + token
	  	}
	  });
	  const myJson = await response.json(); //extract JSON from the http response

		myJson.forEach(i => {
			kanjiCoords.push(indexToCoord(i));
		});

		drawKanjiSquares(.1);
	}

	userAction();
}

function indexToCoord(i) {
	if (i === 3002) return { x: 1, y: 50 };
	else {
		i--;
		return {
			x: Math.floor((i % 600) / 10),
			y: ((Math.floor(i / 600) * 10) + (i % 10))
		}
	}
}

// TODO draw square for each point
function drawKanjiSquares(alpha) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	kanjiCoords.forEach(square => {
		drawSquare(square);
	});

	ctx.fillStyle = "rgba(255, 0, 0, " + alpha + ")";
	ctx.fill();
	ctx.stokeStyle = "rgba(0,0,0,.1)";
	ctx.stroke();
}

function drawSquare(square) {
	// console.log(JSON.stringify(square));
	let w = 800; // image width
	// let offset = 20; // space between blocks
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

	ctx.rect(realx, realy, checkw, checkh);
}

var slider = $("myRange");
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  drawKanjiSquares(this.value / 100);
}