const { $, MAX_KANJI_COUNT } = require('./utils');
const Paper = require('paper');
const Path = Paper.Path;

var displayMode = 'bingo';
var alpha = 1;
var mapGroup, dataGroup, inverseDataGroup, currentDataGroup;
var isDatasetLoaded = false;
var zoomFactor = 2;
var map;
var width, height;


module.exports.init = (mapArea, canvas) => {
	canvas.width = width = mapArea.clientWidth;
	canvas.height = height = mapArea.clientHeight;

	Paper.setup(canvas);
	map = new Paper.Raster('map');
	map.position = Paper.view.center;
	map.fitBounds(Paper.view.bounds);
	mapGroup = new Paper.Group(map);

	// init overlay mouse controls
	Paper.view.onKeyDown = onKeyDown;
	Paper.view.onMouseEnter = onMouseEnter;
	Paper.view.onMouseLeave = onMouseLeave;
	Paper.view.onMouseMove = onMouseMove;
}

module.exports.resizeCanvas = resizeCanvas;
function resizeCanvas() {

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
	// console.log(zoomFactor);
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

	// map mouse in corners of viewport to corners of map
	let viewWidth  = Paper.view.viewSize.width,
	    viewHeight = Paper.view.viewSize.height;
	// ratios are 0..1 for relative position in viewport
	let xRatio = event.point.x / viewWidth;
	let yRatio = event.point.y / viewHeight;
	// this brings the virtual corners in to make panning a little more friendly
	// const compressionPercent = 0.15, // 5% compression on all sides (think 5% padding in viewport)
	//       compressedAmount = 1 + (compressionPercent * 2);
	// xRatio = (xRatio * compressedAmount) - compressionPercent;
	// yRatio = (yRatio * compressedAmount) - compressionPercent;
	// transform amounts are the maximum translation along either axis
	let xTrans = mapGroup.bounds.width  - viewWidth;
	let yTrans = mapGroup.bounds.height - viewHeight;
	// console.log(`ratio(${xRatio},${yRatio}) trans(${xTrans},${yTrans})`);
	let x = -1 * xRatio * xTrans;
	let y = -1 * yRatio * yTrans;
	// adjust for the pivot being at the center of the mapGroup
	x += mapGroup.bounds.width  / 2;
	y += mapGroup.bounds.height / 2;

	mapGroup.position = new Paper.Point(x, y);
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
	inverseDataGroup = drawSquaresFromIndices(inverseInds, 'white');

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

	const w = width < height ? width : height; // shortest dimension
	let realx = square.x + 2; // offset
	let realy = square.y + 3; // offset;
	realx += Math.floor(square.x / 10);
	realy += Math.floor(square.y / 10);
	const squareSide = (w / 67); // width / number of squares across
	realx *= squareSide;
	realy *= squareSide;
	realx = w - realx;
	// realx = w - realx - .2;
	realx += mapGroup.bounds.topLeft.x;
	realy += mapGroup.bounds.topLeft.y;

	var path = new Path();
	var rect = new Path.Rectangle(realx, realy, squareSide, squareSide);
	rect.fillColor = fillColor;
	return rect;
}

module.exports.switchDisplayMode = switchDisplayMode;
function switchDisplayMode (displayMode) {
	// filter based on displaymode	
	if (displayMode === 'none') {
		dataGroup.visible = false;
		inverseDataGroup.visible = false;
	} else if (displayMode === 'bingo') {
		dataGroup.visible = true;
		inverseDataGroup.visible = false;
		currentDataGroup = dataGroup;
	} else {
		inverseDataGroup.visible = true;
		dataGroup.visible = false;
		currentDataGroup = inverseDataGroup;

		inverseDataGroup.style.fillColor = 
			displayMode === 'whiteout' ? 'white' : 'black';
	}

	changeAlpha(this.alpha);
	this.displayMode = displayMode;
}

module.exports.changeAlpha = changeAlpha;
function changeAlpha(alpha) {
	this.alpha = alpha;
	let color = currentDataGroup.style.fillColor;
	color.alpha = alpha;
	currentDataGroup.style.fillColor = color;
}