const height = 20;
const width = 10;
const displayGrid = 4;
let nextRandom = 0;
let timerId = null;
let totalTime = 0;
let level = 1;
let score = 0;
let speed = 100;
const timeOfLevels = 30;
const colors = ['#FFBF00', '#FF005C', '#cc00cc', '#68FF00', '#FAFF00'];

document.addEventListener('DOMContentLoaded', () => {
	const el = (obj) => document.querySelector(obj);
	const all = (obj) => document.querySelectorAll(obj);
	const grid = el('.grid');
	const startBtn = el('#start-button');
	const levelDisplay = el('#level');
	const scoreDisplay = el('#score');

	const startBtnText = (text) => (startBtn.textContent = text);
	const levelDisplayText = (n) => (levelDisplay.textContent = n);
	const scoreDisplayText = (n) => (scoreDisplay.textContent = n);

	const notPlaying =
		startBtn.textContent === ('game over' || 'resume' || 'restart');

	const drawGrids = () => {
		for (var cell = 0; cell < width * height; cell++) {
			grid.innerHTML += `<div></div>`;
		}
		for (var cell = 0; cell < width; cell++) {
			grid.innerHTML += `<div class="taken"></div>`;
		}

		for (var cell = 0; cell < Math.pow(displayGrid, 2); cell++) {
			el('.mini-grid').innerHTML += `<div></div>`;
		}
	};

	let squares;

	const lTetromino = [
		[1, width + 1, width * 2 + 1, 2],
		[width, width + 1, width + 2, width * 2 + 2],
		[1, width + 1, width * 2 + 1, width * 2],
		[width, width * 2, width * 2 + 1, width * 2 + 2],
	];
	const zTetromino = [
		[width + 1, width + 2, width * 2, width * 2 + 1],
		[0, width, width + 1, width * 2 + 1],
		[width + 1, width + 2, width * 2, width * 2 + 1],
		[0, width, width + 1, width * 2 + 1],
	];
	const tTetromino = [
		[1, width, width + 1, width + 2],
		[1, width + 1, width + 2, width * 2 + 1],
		[width, width + 1, width + 2, width * 2 + 1],
		[1, width, width + 1, width * 2 + 1],
	];
	const oTetromino = [
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
	];
	const iTetromino = [
		[1, width + 1, width * 2 + 1, width * 3 + 1],
		[width, width + 1, width + 2, width + 3],
		[1, width + 1, width * 2 + 1, width * 3 + 1],
		[width, width + 1, width + 2, width + 3],
	];
	const theTetrominos = [
		lTetromino,
		zTetromino,
		tTetromino,
		oTetromino,
		iTetromino,
	];
	let currentPosition = 4;
	let currentRotation = 0;

	let random = Math.floor(Math.random() * theTetrominos.length);
	let current = theTetrominos[random][currentRotation];

	const draw = () => {
		if (notPlaying) return;
		current.forEach((index) => {
			squares[currentPosition + index].classList.add('tetromino');
			squares[currentPosition + index].style.backgroundColor = colors[random];
		});
	};

	const undraw = () => {
		current.forEach((index) => {
			squares[currentPosition + index].classList.remove('tetromino');
			squares[currentPosition + index].style.backgroundColor = '';
		});
	};

	const isAtLeftEdge = () =>
		current.some((index) => (currentPosition + index) % width === 0);

	const isAtRightEdge = () =>
		current.some((index) => (currentPosition + index - 9) % width === 0);
	const isSplit = () => isAtLeftEdge() && isAtRightEdge();
	const updateLevel = () => {
		if (totalTime % timeOfLevels === 0) {
			level++;
			levelDisplayText(level);
			speed = speed * 0.95;
			clearInterval(timerId);
			timerId = setInterval(updateTime, speed);
		}
	};

	const updateTime = () => {
		moveDown();
		totalTime++;
		updateLevel();
	};
	const startNewGame = () => {
		startBtnText('pause');
		drawGrids();
		squares = Array.from(document.querySelectorAll('.grid div'));
		timerId = setInterval(updateTime, speed);
		draw();
		displayMiniGridShape();
	};
	const restartGame = () => {
		grid.innerHTML = '';
		el('.mini-grid').innerHTML = '';
		nextRandom = 0;
		timerId = null;
		totalTime = 0;
		level = 1;
		score = 0;
		levelDisplayText(level);
		scoreDisplayText(score);
		speed = 1000;
		startNewGame();
	};
	startBtn.addEventListener('click', () => {
		if (startBtn.textContent === 'restart') {
			restartGame();
		} else if (startBtn.textContent === 'resume') {
			startBtn.textContent = 'pause';
			timerId = setInterval(updateTime, speed);
		} else if (startBtn.textContent === 'start') {
			startNewGame();
		} else if (timerId) {
			startBtnText('resume');
			clearInterval(timerId);
			timerId = null;
		}
	});

	const moveDown = () => {
		if (notPlaying) return;
		undraw();
		currentPosition += width;
		draw();
		freeze();
	};
	const freeze = () => {
		if (
			current.some((index) =>
				squares[currentPosition + index + width].classList.contains('taken')
			)
		) {
			current.forEach((index) =>
				squares[currentPosition + index].classList.add('taken')
			);
			//start a new tetromino falling
			random = nextRandom;
			nextRandom = Math.floor(Math.random() * theTetrominos.length);
			current = theTetrominos[random][currentRotation];
			currentPosition = 4;
			draw();
			displayMiniGridShape();
			addScore();
			gameOver();
		}
	};

	const moveLeft = () => {
		if (notPlaying) return;
		undraw();
		if (!isAtLeftEdge()) currentPosition--;

		if (
			current.some((index) =>
				squares[currentPosition + index].classList.contains('taken')
			)
		) {
			currentPosition++;
		}
		draw();
	};

	const moveRight = () => {
		if (notPlaying) return;
		undraw();
		if (!isAtRightEdge()) currentPosition++;

		if (
			current.some((index) =>
				squares[currentPosition + index].classList.contains('taken')
			)
		) {
			currentPosition--;
		}
		draw();
	};

	const rotate = () => {
		if (!timerId) return;
		let moveRight = currentPosition % 10 === (0 || 9);
		currentRotation === current.length - 1
			? (currentRotation = 0)
			: currentRotation++;

		undraw();
		current = theTetrominos[random][currentRotation];
		while (isSplit() && moveRight) currentPosition++;
		while (isSplit()) currentPosition--;
		draw();
	};

	const controlKeys = (e) => {
		if (!timerId) return;
		const key = (n) => e.keyCode === n;
		(key(37) && moveLeft()) ||
			(key(38) && rotate()) ||
			(key(39) && moveRight()) ||
			(key(40) && moveDown());
	};
	document.addEventListener('keyup', controlKeys);

	el('#rotate').addEventListener('click', rotate);
	el('#down').addEventListener('click', moveDown);
	el('#left').addEventListener('click', moveLeft);
	el('#right').addEventListener('click', moveRight);

	// The display Tetrominos
	const displayIndex = 0;
	const upNextTetrominoes = [
		[1, displayGrid + 1, displayGrid * 2 + 1, 2],
		[displayGrid + 1, displayGrid + 2, displayGrid * 2, displayGrid * 2 + 1],
		[1, displayGrid, displayGrid + 1, displayGrid + 2],
		[0, 1, displayGrid, displayGrid + 1],
		[1, displayGrid + 1, displayGrid * 2 + 1, displayGrid * 3 + 1],
	];

	// Display the shape in the mini-grid display
	const displayMiniGridShape = () => {
		all('.mini-grid div').forEach((square) => {
			square.classList.remove('tetromino');
			square.style.backgroundColor = '';
		});
		upNextTetrominoes[nextRandom].forEach((index) => {
			all('.mini-grid div')[displayIndex + index].classList.add('tetromino');
			all('.mini-grid div')[displayIndex + index].style.backgroundColor =
				colors[nextRandom];
		});
	};

	const addScore = () => {
		for (var i = 0; i < height * width; i += width) {
			const row = [
				i,
				i + 1,
				i + 2,
				i + 3,
				i + 4,
				i + 5,
				i + 6,
				i + 7,
				i + 8,
				i + 9,
			];
			if (row.every((index) => squares[index].classList.contains('taken'))) {
				score += 10;
				scoreDisplay.innerHTML = score;
				row.forEach((index) => {
					squares[index].classList.remove('taken');
					squares[index].classList.remove('tetromino');
					squares[index].style.backgroundColor = '';
				});
				const squaresRemoved = squares.splice(i, width);
				squares = squaresRemoved.concat(squares);
				squares.forEach((cell) => grid.appendChild(cell));
			}
		}
	};

	const gameOver = () => {
		if (
			current.some((index) =>
				squares[currentPosition + index].classList.contains('taken')
			)
		) {
			clearInterval(timerId);
			scoreDisplayText('game over');
			startBtnText('restart');
		}
	};
});
