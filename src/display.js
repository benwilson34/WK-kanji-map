const { $, MAX_KANJI_COUNT } = require('./utils');
const Paper = require('paper');
const Path = Paper.Path;
var displayMode = 'bingo';
var mapGroup, dataGroup, inverseDataGroup;
var isDatasetLoaded = false;
var zoomFactor = 2;


module.exports.init = (canvas) => {
	Paper.setup(canvas);
	var map = new Paper.Raster('map');
	map.position = Paper.view.center;
	map.fitBounds(Paper.view.bounds);
	mapGroup = new Paper.Group(map);

	// init overlay mouse controls
	Paper.view.onKeyDown = onKeyDown;
	Paper.view.onMouseEnter = onMouseEnter;
	Paper.view.onMouseLeave = onMouseLeave;
	Paper.view.onMouseMove = onMouseMove;
}

function onKeyDown(event) {
	if (!isDatasetLoaded) return;

	const zoomInc = .2;
	if (event.key === 'w') {
		zoomFactor += zoomInc;
		mapGroup.scale(1 + zoomInc);
	}	else if (event.key === 's') {
		zoomFactor -= zoomInc;
		mapGroup.scale(1 + (-1 * zoomInc));
	}
	console.log(zoomFactor);
}

function onMouseEnter(event) {
	if (!isDatasetLoaded) return;
	// console.log('\\  Mouse enter!');
	mapGroup.scale(zoomFactor);
}

function onMouseLeave(event) {
	if (!isDatasetLoaded) return;
	// console.log('/  Mouse leave!');
	mapGroup.fitBounds(Paper.view.bounds);
	mapGroup.position = Paper.view.center;
}

function onMouseMove(event) {
	if (!isDatasetLoaded) return;

	// transform mouse point
	let x = event.point.x / Paper.view.viewSize.width;
	let y = event.point.y / Paper.view.viewSize.height;
	x = 1 - (x + .25);
	y = 1 - (y + .25);
	x *= mapGroup.bounds.width;
	y *= mapGroup.bounds.height;

	// console.log(x + ', ' + y);
	let point = new Paper.Point(x, y);
	// console.log (' |  ' + point);
	mapGroup.position = point;
}

// no return
module.exports.setDataset = (dataset) => {
	// prevent mouse events before the dataset is loaded
	isDatasetLoaded = false;

	// filter out any -1 inds (which indicate one of the 8 WK kanji that aren't on the map)
	dataset = dataset.filter( ind => ind > 0 );
	dataGroup = drawSquaresFromIndices(dataset, "#F84C2E");

	// if it's either of the two other display modes, we'll invert which squares are drawn
	var inverseInds = [];
	for(var i = 1; i <= MAX_KANJI_COUNT; i++) {
		if (dataset.indexOf(i + "") < 0) { // i is not in the inds list
			// console.log(i);
			inverseInds.push(i);
		}
	}
	var fillColor = displayMode === 'whiteout' ? 'rgb(255,255,255)' : 'rgb(0,0,0)';
	inverseDataGroup = drawSquaresFromIndices(inverseInds, fillColor);

	// set both groups as children of the map obj so that they transform together
	mapGroup.addChildren( [ dataGroup, inverseDataGroup ] );

	// refresh the display
	switchDisplayMode(displayMode);

	// allow mouse events
	isDatasetLoaded = true;
}

// draw square for each point
function drawSquaresFromIndices(inds, fillColor) {
	var group = new Paper.Group();
	var squares = [];
	inds.forEach(ind => {
		squares.push( drawSquare(ind, fillColor) );
	});
	console.log('finished drawing ' + squares.length + ' squares.');
	group.addChildren(squares);
	return group;
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

function drawSquare(ind, fillColor) {
	var square = indexToCoord(ind);
	// console.log(JSON.stringify(square));

	let w = 800; // image width
	let realx = square.x + 2; // offset
	let realy = square.y + 3; // offset;
	realx += Math.floor(square.x / 10);
	realy += Math.floor(square.y / 10);
	let squareSide = w / 67; // width / number of squares across
	realx *= squareSide;
	realy *= squareSide;
	realx = w - realx;

	var path = new Path();
	var rect = new Path.Rectangle(realx, realy, squareSide, squareSide);
	rect.fillColor = fillColor;
	return rect;
}

module.exports.switchDisplayMode = switchDisplayMode;
function switchDisplayMode (displayMode) {
	// filter based on displaymode	
	if (displayMode === 'bingo') {
		dataGroup.visible = true;
		inverseDataGroup.visible = false;
	} else {
		inverseDataGroup.visible = true;
		dataGroup.visible = false;

		inverseDataGroup.style.fillColor = 
			displayMode === 'whiteout' ? 'rgb(255,255,255)' : 'rgb(0,0,0)';
	}
		
	this.displayMode = displayMode;
}
