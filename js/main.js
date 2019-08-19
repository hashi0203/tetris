var msg = ["Hello World", "はじめてのJavaScript", "TETRISだよ"];
var count = 0;
var msgCount = 0;
setInterval(function () {
	count++;
	msgCount = count%3;
	if (msgCount === 1) {
		document.getElementById("hello_text").textContent = msg[msgCount] + "(" + count + ")";
	} else {
		document.getElementById("hello_text").textContent = msg[msgCount];
	}
}, 5000);

// 矢印でスクロール禁止
document.onkeydown = function(evt) {
	evt = evt || window.event;
	var keyCode = evt.keyCode;
	if (keyCode >= 37 && keyCode <= 40) {
			return false;
	}
};

function startCheck() {
	if (!start && confirm("Start TETRIS?")) {
		start=true;
	}
}
function pauseCheck() {
	if (start) {
		alert("Pausing...\nRestart?\nScore is now " + score);
	}
}
function resetCheck() {
	if (start && confirm("Reset?")) {
		clearAll();
	}
}
function helpCheck() {
	window.open('./rules.html', '_blank');
}

var score = 0;
var lines = 0;
var combo = 0;
var deleted_lines = 0;
var del_count = 0;
var level_count = 0;
var level_flag = true;
setInterval(function () {
	document.getElementById("score").textContent = "Score: " + score;
	document.getElementById("level").textContent = "Level " + level;
	document.getElementById("lines").textContent = "Lines: " + lines;
	document.getElementById("combo").textContent = "Combo: " + combo;
	if (deleted_lines !== 0) {
		if (deleted_lines === 1) {
			document.getElementById("deleted_lines").textContent = deleted_lines + " line is deleted.";
		} else {
			document.getElementById("deleted_lines").textContent = deleted_lines + " lines are deleted.";
		}
		del_count++;
		if (del_count === 200) {
			deleted_lines = 0;
			del_count = 0;
		}
	} else {
		document.getElementById("deleted_lines").textContent = "";
	}
	if (start && level_flag) {
		document.getElementById("print_level").textContent = "Level " + level;
		level_count++;
		if (level_count === 200) {
			level_flag = false;
			level_count = 0;
		}
	} else {
		document.getElementById("print_level").textContent = "";
	}
}, 10);

var start = false;
var cells = [];
var hold_cells = [];
var next_cells = [];
var blocks = {
	i: {
		class: "i",
		pattern: [
			[0, 0, 0, 0],
			[1, 1, 1, 1]
		]
	},
	o: {
		class: "o",
		pattern: [
			[0, 1, 1],
			[0, 1, 1]
		]
	},
	t: {
		class: "t",
		pattern: [
			[0, 1, 0],
			[1, 1, 1]
		]
	},
	s: {
		class: "s",
		pattern: [
			[0, 1, 1],
			[1, 1, 0]
		]
	},
	z: {
		class: "z",
		pattern: [
			[1, 1, 0],
			[0, 1, 1]
		]
	},
	j: {
		class: "j",
		pattern: [
			[1, 0, 0],
			[1, 1, 1]
		]
	},
	l: {
		class: "l",
		pattern: [
			[0, 0, 1],
			[1, 1, 1]
		]
	},
}
var generating = false;
var fallingBlock = null;
var fallingBlockNum = 0;
var fallingBlockDir = 0;
var fallingBlockPtn = [];
var fallingBlockCls = null;
var holdBlock = null;
var holdBlockPtn = [];
var holdFrag = true;
var nextBlock = null;
var nextBlockPtn = [];
var level = 1;
loadTable();
setInterval(function () {play(1,20)}, 500);
setInterval(function () {play(2,50)}, 400);
setInterval(function () {play(3,100)}, 300);
setInterval(function () {play(4,200)}, 200);

setInterval(function () {
	if (start && level === 5) {
		if (generating) {
			fallBlocks();
			completeGeneration();
			generating = false;
		}	else if (hasFallingBlock()) {
			fallBlocks();
		} else {
			deleteRow();
			generateBlock();
			generating = true;
		}
	}
}, 100);

function loadTable() {
	var td_array = document.getElementsByTagName("td");
	var index = 0;
	for (var row = 0; row < 20; row++) {
		cells[row] = [];
		for(var col = 0; col < 10; col++){
			cells[row][col] = td_array[index];
			index++;
		}
	}
	for (var row = 0; row < 2; row++) {
		hold_cells[row] = [];
		for (var col = 0; col < 4; col++) {
			hold_cells[row][col] = td_array[index];
			index++;
		}
	}
	for (var row = 0; row < 2; row++) {
		next_cells[row] = [];
		for (var col = 0; col < 4; col++) {
			next_cells[row][col] = td_array[index];
			index++;
		}
	}
}

function play(l,s) {
	if (start && level === l) {
		if (generating) {
			fallBlocks();
			completeGeneration();
			generating = false;
			holdFrag = true;
		}	else if (hasFallingBlock()) {
			fallBlocks();
		} else {
			deleteRow();
			generateBlock();
			generating = true;
			if (score >= s) {
				level = l + 1;
				level_flag = true;
			}
		}
	}
}

function fallBlocks() {
	for (var col = 0; col < 10; col++){
		if (cells[19][col].blockNum === fallingBlockNum) {
			isFalling = false;
			return;
		}
	}
	for (var row = 18; row >= 0; row--) {
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].blockNum === fallingBlockNum) {
				if (cells[row + 1][col].className !== "" && cells[row + 1][col].blockNum !== fallingBlockNum) {
					isFalling = false;
					return;
				}
			}
		}
	}           
	for (var row = 18; row >= 0; row--) {
		for(var col = 0; col < 10; col++) {
			if (cells[row][col].blockNum === fallingBlockNum){
				cells[row + 1][col].className = cells[row][col].className;
				cells[row + 1][col].blockNum = cells[row][col].blockNum;
				cells[row][col].className = "";
				cells[row][col].blockNum = null;
			}
		}
	}
}

var isFalling = false;
function hasFallingBlock() {
	return isFalling;
}

var combo = 0;
function deleteRow() {
	deleted_lines = 0;
	for (var row = 19; row >= 0; row--) {
		var canDelete = true;
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].className === "") {
				canDelete = false;
				break;
			}
		}
		if (canDelete) {
			deleted_lines++;
			for (var col = 0; col > 10; col++) {
				cells[row][col].className = "";
			}
			if (row === 0) {
				for (var col = 0; col < 10; col++) {
					cells[0][col].className = "";
					cells[0][col].blockNum = null;
				}
			} else {
				for (var downRow = row - 1; downRow >= 0; downRow--) {
					for (var col = 0; col < 10; col++) {
						cells[downRow + 1][col].className = cells[downRow][col].className;
						cells[downRow + 1][col].blockNum = cells[downRow][col].blockNum;
						cells[downRow][col].className = "";
						cells[downRow][col].blockNum = null;
					}
				}
			}
			row++;
		}
	}
	if (deleted_lines === 1) {
		score = score + 1 + combo * combo;
		combo++;
	} else if (deleted_lines ===2) {
		score = score + 4 + combo * combo;
		combo++;
	} else if (deleted_lines === 3) {
		score = score + 10 + combo * combo;
		combo++;
	} else if (deleted_lines === 4) {
		score = score * 2 + combo * combo;
		combo++;
	} else {
		combo = 0;
	}
	lines = lines + deleted_lines;
}

var rl = 3;
function completeGeneration() {
	for (var col= 0; col < fallingBlockPtn[0].length; col++) {
		if (fallingBlockPtn[0][col]) {
			if (cells[0][col + rl].className !== "") {
				alert("game over\nYour Score is " + score);
				clearAll();
				return;
			}
			cells[0][col + rl].className = fallingBlockCls;
			cells[0][col + rl].blockNum = fallingBlockNum;
		}
	}
}

function generateBlock() {
	var keys = Object.keys(blocks);
	// var nextBlockKey = keys[6];
	var nextBlockKey = keys[Math.floor(Math.random() * keys.length)];
	if (nextBlock === null) {
		nextBlock = blocks[nextBlockKey];
		nextBlockKey = keys[Math.floor(Math.random() * keys.length)];
	}
	var nextFallingBlockNum = fallingBlockNum + 1;
	fallingBlock = nextBlock;
	fallingBlockNum = nextFallingBlockNum;
	fallingBlockDir = 0;
	fallingBlockPtn = nextBlock.pattern;
	fallingBlockCls = nextBlock.class;
	for (var col= 0; col < fallingBlockPtn[1].length; col++) {
		if (fallingBlockPtn[1][col]) {
			if (cells[0][col + 3].className !== "") {
				alert("game over\nYour Score is " + score);
				clearAll();
				return;
			}
			cells[0][col + 3].className = fallingBlockCls;
			cells[0][col + 3].blockNum = nextFallingBlockNum;
		}
	}
	isFalling = true;
	nextBlock = blocks[nextBlockKey];
	nextBlockPtn = nextBlock.pattern;
	for (var row = 0; row < 2; row++) {
		for (var col= 0; col < 4; col++) {
			if (col < nextBlockPtn[0].length && nextBlockPtn[row][col]) {
				next_cells[row][col].className = nextBlock.class;
			} else {
				next_cells[row][col].className = "none";

			}
		}
	}
	rl = 3;
}


document.addEventListener("keydown", onKeyDown);
function onKeyDown(event) {
	if (event.keyCode === 37) {
		moveLeft();
	} else if (event.keyCode === 39) {
		moveRight();
	} else if (event.keyCode === 40) {
		if (!generating) {
			fallBlocks();
		}
	} else if (event.keyCode === 38) {
		rotate();
	} else if (event.keyCode === 32) {
		hardDrop();
	} else if (event.keyCode === 17) {
		if (!generating && holdFrag) {
			hold();
		}
	}
}

function moveRight() {
	if (hasFallingBlock() && canMove("right")) {
		rl++;
		for (var row = 19; row >= 0; row--) {
			for (var col = 9; col >= 0; col--) {
				if (cells[row][col].blockNum === fallingBlockNum) {
					cells[row][col + 1].className = cells[row][col].className;
					cells[row][col + 1].blockNum = cells[row][col].blockNum;
					cells[row][col].className = "";
					cells[row][col].blockNum = null;
				}
			}
		}
	}
}

function moveLeft() {
	if (hasFallingBlock() && canMove("left")) {
		rl--;
		for (var row = 19; row >= 0; row--) {
			for (var col = 0; col < 10; col++) {
				if (cells[row][col].blockNum === fallingBlockNum) {
					cells[row][col - 1].className = cells[row][col].className;
					cells[row][col - 1].blockNum = cells[row][col].blockNum;
					cells[row][col].className = "";
					cells[row][col].blockNum = null;
				}
			}
		}
	}    
}

function rotate() {
	if (hasFallingBlock() && !generating) {
		if (fallingBlockCls === "i"){
			if (fallingBlockDir === 0) {
				var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							for (var ncol = pcol; ncol < pcol + 4; ncol++) {
								cells[prow][ncol].className = "";
								cells[prow][ncol].blockNum = null;
							}
							row = prow+1;
							col = pcol;
							break;
						}
					}
				}
				for (var ncol = col; ncol < col + 4; ncol++) {
					var u = 0;
					var d = 0;
					var num = 0;
					for (var rowi = 1; rowi <= 3; rowi++) {
						if (rowi - u === 1 && row - rowi >= 0 && cells[row - rowi][ncol].className === "") {
							u++;
							num++;
						}
						if (rowi - d === 1 && row + rowi < 20 && cells[row + rowi][ncol].className === "") {
							d++;
							num++;
						}
						if (num >= 3) {
							for (var nrow = row + d; nrow > row + d - 4; nrow--) {
								if (cells[nrow][ncol].className !== "") {
									alert("aaa");
								}
								cells[nrow][ncol].className = fallingBlockCls;
								cells[nrow][ncol].blockNum = fallingBlockNum;
							}
							fallingBlockDir = 1;
							return;
						}
					}
				}
				for (var ncol = col; ncol < col + 4; ncol++) {
					cells[row][ncol].className = fallingBlockCls;
					cells[row][ncol].blockNum = fallingBlockNum;
				}
			} else {
				var row;
				var col;
				for (prow = 19; prow >= 0; prow--) {
					for (pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							for (var nrow = prow; nrow > prow - 4; nrow--) {
								cells[nrow][pcol].className = "";
								cells[nrow][pcol].blockNum = null;
							}
							row = prow;
							col = pcol;
							break;
						}
					}
				}
				for (var nrow = row; nrow >= 0; nrow--) {
					if (cells[nrow][col].className === "") {
						var l = 0;
						var r = 0;
						var num = 0;
						for (var coli = 1; coli <= 3; coli++) {
							if (coli - l === 1 && col - coli >= 0 && cells[nrow][col - coli].className === "") {
								l++;
								num++;
							}
							if (coli - r === 1 && col + coli < 10 && cells[nrow][col + coli].className === "") {
								r++;
								num++;
							}
							if (num >= 3) {
								for (var ncol = col + r; ncol > col + r - 4; ncol--) {
									cells[nrow][ncol].className = fallingBlockCls;
									cells[nrow][ncol].blockNum = fallingBlockNum;
								}
								fallingBlockDir = 0;
								return;
							}
						}
					}
				}
				for (var nrow = row; nrow > row - 4; nrow--) {
					cells[nrow][col].className = fallingBlockCls;
					cells[nrow][col].blockNum = fallingBlockNum;
				}
			}
		} else if (fallingBlockCls === "t"){
			if (fallingBlockDir === 0) {
				var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow;
							col = pcol + 1;
							for (var ncol = col - 1; ncol <= col + 1; ncol++) {
								cells[row][ncol].className = "";
								cells[row][ncol].blockNum = null;
							}
							cells[row - 1][col].className = "";
							cells[row - 1][col].blockNum = null;
							break;
						}
					}
				}
				if (row < 19 && cells[row + 1][col].className === "") {
					for (var nrow = row - 1; nrow <= row + 1; nrow++) {
						cells[nrow][col].className = fallingBlockCls;
						cells[nrow][col].blockNum = fallingBlockNum;
					}
					cells[row][col + 1].className = fallingBlockCls;
					cells[row][col + 1].blockNum = fallingBlockNum;
					fallingBlockDir++;
					return;
				} else if (cells[row - 1][col - 1].className === "") {
					if (row >= 2 && cells[row - 2][col].className === "") {
						row--;
						for (var nrow = row - 1; nrow <= row + 1; nrow++) {
							cells[nrow][col].className = fallingBlockCls;
							cells[nrow][col].blockNum = fallingBlockNum;
						}
						cells[row][col + 1].className = fallingBlockCls;
						cells[row][col + 1].blockNum = fallingBlockNum;
						fallingBlockDir++;
						return;
					} else if (row < 19 && cells[row + 1][col - 1].className === "") {
						col--;
						for (var nrow = row - 1; nrow <= row + 1; nrow++) {
							cells[nrow][col].className = fallingBlockCls;
							cells[nrow][col].blockNum = fallingBlockNum;
						}
						cells[row][col + 1].className = fallingBlockCls;
						cells[row][col + 1].blockNum = fallingBlockNum;
						fallingBlockDir++;
						return;
					} else if (row >= 2 && cells[row - 2][col - 1].className === "") {
						row--;
						col--;
						for (var nrow = row - 1; nrow <= row + 1; nrow++) {
							cells[nrow][col].className = fallingBlockCls;
							cells[nrow][col].blockNum = fallingBlockNum;
						}
						cells[row][col + 1].className = fallingBlockCls;
						cells[row][col + 1].blockNum = fallingBlockNum;
						fallingBlockDir++;
						return;
					}
				}
				for (var ncol = col - 1; ncol <= col + 1; ncol++) {
					cells[row][ncol].className = fallingBlockCls;
					cells[row][ncol].blockNum = fallingBlockNum;
				}
				cells[row - 1][col].className = fallingBlockCls;
				cells[row - 1][col].blockNum = fallingBlockNum;
			} else if (fallingBlockDir === 1) {
				var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow - 1;
							col = pcol;
							for (var nrow = row - 1; nrow <= row + 1; nrow++) {
								cells[nrow][col].className = "";
								cells[nrow][col].blockNum = null;
							}
							cells[row][col + 1].className = "";
							cells[row][col + 1].blockNum = null;
							break;
						}
					}
				}
				if (col > 0 && cells[row][col - 1].className === "") {
					for (var ncol = col - 1; ncol <= col + 1; ncol++) {
						cells[row][ncol].className = fallingBlockCls;
						cells[row][ncol].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
					fallingBlockDir++;
					return;
				} else if (cells[row - 1][col + 1].className === "") {
					if (col <= 7 && cells[row][col + 2].className === "") {
						col++;
						for (var ncol = col - 1; ncol <= col + 1; ncol++) {
							cells[row][ncol].className = fallingBlockCls;
							cells[row][ncol].blockNum = fallingBlockNum;
						}
						cells[row + 1][col].className = fallingBlockCls;
						cells[row + 1][col].blockNum = fallingBlockNum;
						fallingBlockDir++;
						return;
					} else if (col > 0 && cells[row - 1][col - 1].className === "") {
						row--;
						for (var ncol = col - 1; ncol <= col + 1; ncol++) {
							cells[row][ncol].className = fallingBlockCls;
							cells[row][ncol].blockNum = fallingBlockNum;
						}
						cells[row + 1][col].className = fallingBlockCls;
						cells[row + 1][col].blockNum = fallingBlockNum;
						fallingBlockDir++;
						return;
					} else if (col <= 7 && cells[row - 1][col + 2].className === "") {
						row--;
						col--;
						for (var ncol = col - 1; ncol <= col + 1; ncol++) {
							cells[row][ncol].className = fallingBlockCls;
							cells[row][ncol].blockNum = fallingBlockNum;
						}
						cells[row + 1][col].className = fallingBlockCls;
						cells[row + 1][col].blockNum = fallingBlockNum;
						fallingBlockDir++;
						return;
					}
				}
				for (var nrow = row - 1; nrow <= row + 1; nrow++) {
					cells[nrow][col].className = fallingBlockCls;
					cells[nrow][col].blockNum = fallingBlockNum;
				}
				cells[row][col + 1].className = fallingBlockCls;
				cells[row][col + 1].blockNum = fallingBlockNum;
			} else if (fallingBlockDir === 2) {
				var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow - 1;
							col = pcol;
							for (var ncol = col - 1; ncol <= col + 1; ncol++) {
								cells[row][ncol].className = "";
								cells[row][ncol].blockNum = null;
							}
							cells[row + 1][col].className = "";
							cells[row + 1][col].blockNum = null;
							break;
						}
					}
				}
				if (row > 0 && cells[row - 1][col].className === "") {
					for (var nrow = row - 1; nrow <= row + 1; nrow++) {
						cells[nrow][col].className = fallingBlockCls;
						cells[nrow][col].blockNum = fallingBlockNum;
					}
					cells[row][col - 1].className = fallingBlockCls;
					cells[row][col - 1].blockNum = fallingBlockNum;
					fallingBlockDir++;
					return;
				} else if (row <= 17 && cells[row + 2][col].className === "" && cells[row + 1][col - 1].className === "") {
					row++;
					for (var nrow = row - 1; nrow <= row + 1; nrow++) {
						cells[nrow][col].className = fallingBlockCls;
						cells[nrow][col].blockNum = fallingBlockNum;
					}
					cells[row][col - 1].className = fallingBlockCls;
					cells[row][col - 1].blockNum = fallingBlockNum;
					fallingBlockDir++;
					return;
				} else if (cells[row + 1][col + 1].className === "") {
					if (row > 0 && cells[row - 1][col + 1].className === "") {
						col++;
						for (var nrow = row - 1; nrow <= row + 1; nrow++) {
							cells[nrow][col].className = fallingBlockCls;
							cells[nrow][col].blockNum = fallingBlockNum;
						}
						cells[row][col - 1].className = fallingBlockCls;
						cells[row][col - 1].blockNum = fallingBlockNum;
						fallingBlockDir++;
						return;
					} else if (row <= 17 && cells[row + 2][col + 1].className === "") {
						row++;
						col++;
						for (var nrow = row - 1; nrow <= row + 1; nrow++) {
							cells[nrow][col].className = fallingBlockCls;
							cells[nrow][col].blockNum = fallingBlockNum;
						}
						cells[row][col - 1].className = fallingBlockCls;
						cells[row][col - 1].blockNum = fallingBlockNum;
						fallingBlockDir++;
						return;
					}
				}
				for (var ncol = col - 1; ncol <= col + 1; ncol++) {
					cells[row][ncol].className = fallingBlockCls;
					cells[row][ncol].blockNum = fallingBlockNum;
				}
				cells[row + 1][ncol].className = fallingBlockCls;
				cells[row + 1][ncol].blockNum = fallingBlockNum;
			} else if (fallingBlockDir === 3) {
				var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow - 1;
							col = pcol;
							for (var nrow = row - 1; nrow <= row + 1; nrow++) {
								cells[nrow][col].className = "";
								cells[nrow][col].blockNum = null;
							}
							cells[row][col - 1].className = "";
							cells[row][col - 1].blockNum = null;
							break;
						}
					}
				}
				if (col < 9 && cells[row][col + 1].className === "") {
					for (var ncol = col - 1; ncol <= col + 1; ncol++) {
						cells[row][ncol].className = fallingBlockCls;
						cells[row][ncol].blockNum = fallingBlockNum;
					}
					cells[row - 1][col].className = fallingBlockCls;
					cells[row - 1][col].blockNum = fallingBlockNum;
					fallingBlockDir = 0;
					return;
				} else if (cells[row - 1][col - 1].className === "") {
					if (col >= 2 && cells[row][col - 2].className === "") {
						col--;
						for (var ncol = col - 1; ncol <= col + 1; ncol++) {
							cells[row][ncol].className = fallingBlockCls;
							cells[row][ncol].blockNum = fallingBlockNum;
						}
						cells[row - 1][col].className = fallingBlockCls;
						cells[row - 1][col].blockNum = fallingBlockNum;
						fallingBlockDir = 0;
						return;
					} else if (col < 9 && cells[row - 1][col + 1].className === "") {
						row--;
						for (var ncol = col - 1; ncol <= col + 1; ncol++) {
							cells[row][ncol].className = fallingBlockCls;
							cells[row][ncol].blockNum = fallingBlockNum;
						}
						cells[row - 1][col].className = fallingBlockCls;
						cells[row - 1][col].blockNum = fallingBlockNum;
						fallingBlockDir = 0;
						return;
					} else if (col >= 2 && cells[row - 1][col - 2].className === "") {
						row--;
						col--;
						for (var ncol = col - 1; ncol <= col + 1; ncol++) {
							cells[row][ncol].className = fallingBlockCls;
							cells[row][ncol].blockNum = fallingBlockNum;
						}
						cells[row - 1][col].className = fallingBlockCls;
						cells[row - 1][col].blockNum = fallingBlockNum;
						fallingBlockDir = 0;
						return;
					}
				}
				for (var nrow = row - 1; nrow <= row + 1; nrow++) {
					cells[nrow][col].className = fallingBlockCls;
					cells[nrow][col].blockNum = fallingBlockNum;
				}
				cells[row][col - 1].className = fallingBlockCls;
				cells[row][col - 1].blockNum = fallingBlockNum;
			}
		} else if (fallingBlockCls === "s"){
			if (fallingBlockDir === 0) {
				var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow;
							col = pcol;
							for (var i = 0; i <= 1; i++) {
								cells[row][col + i].className = "";
								cells[row][col + i].blockNum = null;
								cells[row - 1][col + i + 1].className = "";
								cells[row - 1][col + i + 1].blockNum = null;
							}
							break;
						}
					}
				}
				if (row >= 2 && cells[row - 1][col].className === "" && cells[row - 2][col].className === "") {
					col++;
					for (var i = 0; i <= 1; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
						cells[row - i - 1][col - 1].className = fallingBlockCls;
						cells[row - i - 1][col - 1].blockNum = fallingBlockNum;
					}
				} else if (row >= 2 && cells[row - 2][col + 1].className === "" && cells[row][col + 2].className === "") {
					col = col + 2;
					for (var i = 0; i <= 1; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
						cells[row - i - 1][col - 1].className = fallingBlockCls;
						cells[row - i - 1][col - 1].blockNum = fallingBlockNum;
					}
				} else if (row < 19 && cells[row - 1][col].className === "" && cells[row + 1][col + 1].className === "") {
					row++;
					col++;
					for (var i = 0; i <= 1; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
						cells[row - i - 1][col - 1].className = fallingBlockCls;
						cells[row - i - 1][col - 1].blockNum = fallingBlockNum;
					}
				} else {
					for (var i = 0; i <= 1; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
						cells[row - 1][col + i + 1].className = fallingBlockCls;
						cells[row - 1][col + i + 1].blockNum = fallingBlockNum;
					}
					return;
				}
			} else if (fallingBlockDir === 1) {
				var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow;
							col = pcol;
							for (var i = 0; i <= 1; i++) {
								cells[row - i][col].className = "";
								cells[row - i][col].blockNum = null;
								cells[row - i - 1][col - 1].className = "";
								cells[row - i - 1][col - 1].blockNum = null;
							}
							break;
						}
					}
				}
				if (col < 9 && cells[row][col - 1].className === "" && cells[row - 1][col + 1].className === "") {
					col--;
					for (var i = 0; i <= 1; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
						cells[row - 1][col + i + 1].className = fallingBlockCls;
						cells[row - 1][col + i + 1].blockNum = fallingBlockNum;
					}
				} else if (col >= 2 && cells[row][col - 1].className === "" && cells[row][col - 2].className === "") {
					col = col - 2;
					for (var i = 0; i <= 1; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
						cells[row - 1][col + i + 1].className = fallingBlockCls;
						cells[row - 1][col + i + 1].blockNum = fallingBlockNum;
					}
				} else if (col < 9 && cells[row - 2][col].className === "" && cells[row - 2][col + 1].className === "") {
					row--;
					col--;
					for (var i = 0; i <= 1; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
						cells[row - 1][col + i + 1].className = fallingBlockCls;
						cells[row - 1][col + i + 1].blockNum = fallingBlockNum;
					}
				} else if (col >= 2 && cells[row - 1][col - 2].className === "" && cells[row - 2][col].className === "") {
					row--;
					col = col - 2;
					for (var i = 0; i <= 1; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
						cells[row - 1][col + i + 1].className = fallingBlockCls;
						cells[row - 1][col + i + 1].blockNum = fallingBlockNum;
					}
				} else {
					for (var i = 0; i <= 1; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
						cells[row - i - 1][col - 1].className = fallingBlockCls;
						cells[row - i - 1][col - 1].blockNum = fallingBlockNum;
					}
					return;
				}
			}
			fallingBlockDir =  1 - fallingBlockDir;
			return;
		} else if (fallingBlockCls === "z"){
			if (fallingBlockDir === 0) {
				var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow - 1;
							col = pcol - 1;
							for (var i = 0; i <= 1; i++) {
								cells[row][col + i].className = "";
								cells[row][col + i].blockNum = null;
								cells[row + 1][col + i + 1].className = "";
								cells[row + 1][col + i + 1].blockNum = null;
							}
							break;
						}
					}
				}
				if (row >= 1 && cells[row][col + 2].className === "" && cells[row - 1][col + 2].className === "") {
					row++;
					col++;
					for (var i = 0; i <= 1; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
						cells[row - i - 1][col + 1].className = fallingBlockCls;
						cells[row - i - 1][col + 1].blockNum = fallingBlockNum;
					}
				} else if (row >= 1 && cells[row + 1][col].className === "" && cells[row - 1][col + 1].className === "") {
					row++;
					for (var i = 0; i <= 1; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
						cells[row - i - 1][col + 1].className = fallingBlockCls;
						cells[row - i - 1][col + 1].blockNum = fallingBlockNum;
					}
				} else if (row <= 17 && cells[row + 2][col + 1].className === "" && cells[row][col + 2].className === "") {
					row = row + 2;
					col++;
					for (var i = 0; i <= 1; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
						cells[row - i - 1][col + 1].className = fallingBlockCls;
						cells[row - i - 1][col + 1].blockNum = fallingBlockNum;
					}
				} else {
					for (var i = 0; i <= 1; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
						cells[row + 1][col + i + 1].className = fallingBlockCls;
						cells[row + 1][col + i + 1].blockNum = fallingBlockNum;
					}
					return;
				}
			} else if (fallingBlockDir === 1) {
				var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow;
							col = pcol;
							for (var i = 0; i <= 1; i++) {
								cells[row - i][col].className = "";
								cells[row - i][col].blockNum = null;
								cells[row - i - 1][col + 1].className = "";
								cells[row - i - 1][col + 1].blockNum = null;
							}
							break;
						}
					}
				}
				if (col > 0 && cells[row][col + 1].className === "" && cells[row - 1][col - 1].className === "") {
					row--;
					col--;
					for (var i = 0; i <= 1; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
						cells[row + 1][col + i + 1].className = fallingBlockCls;
						cells[row + 1][col + i + 1].blockNum = fallingBlockNum;
					}
				} else if (col <= 7 && cells[row][col + 1].className === "" && cells[row][col + 2].className === "") {
					row--;
					for (var i = 0; i <= 1; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
						cells[row + 1][col + i + 1].className = fallingBlockCls;
						cells[row + 1][col + i + 1].blockNum = fallingBlockNum;
					}
				} else if (col > 0 && cells[row - 2][col].className === "" && cells[row - 2][col - 1].className === "") {
					row = row - 2;
					col--;
					for (var i = 0; i <= 1; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
						cells[row + 1][col + i + 1].className = fallingBlockCls;
						cells[row + 1][col + i + 1].blockNum = fallingBlockNum;
					}
				} else if (col <= 7 && cells[row - 1][col + 2].className === "" && cells[row - 2][col].className === "") {
					row = row - 2;
					for (var i = 0; i <= 1; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
						cells[row + 1][col + i + 1].className = fallingBlockCls;
						cells[row + 1][col + i + 1].blockNum = fallingBlockNum;
					}
				} else {
					for (var i = 0; i <= 1; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
						cells[row - i - 1][col + 1].className = fallingBlockCls;
						cells[row - i - 1][col + 1].blockNum = fallingBlockNum;
					}
					return;
				}
			}
			fallingBlockDir =  1 - fallingBlockDir;
			return;
		} else if (fallingBlockCls === "j"){
			if (fallingBlockDir === 0) {
				var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow;
							col = pcol;
							for (var i = 0; i <= 2; i++) {
								cells[row][col + i].className = "";
								cells[row][col + i].blockNum = null;
							}
							cells[row - 1][col].className = "";
							cells[row - 1][col].blockNum = null;
							break;
						}
					}
				}
				if (row >= 2 && cells[row - 1][col + 1].className === "" && cells[row - 2][col + 1].className === "" && cells[row - 2][col + 2].className === "") {
					row = row - 2;
					col++;
					for (var i = 0; i <= 2; i++) {
						cells[row + i][col].className = fallingBlockCls;
						cells[row + i][col].blockNum = fallingBlockNum;
					}
					cells[row][col + 1].className = fallingBlockCls;
					cells[row][col + 1].blockNum = fallingBlockNum;
				} else if (row >= 2 && cells[row - 2][col].className === "" && cells[row - 2][col + 1].className === "") {
					row = row - 2;
					for (var i = 0; i <= 2; i++) {
						cells[row + i][col].className = fallingBlockCls;
						cells[row + i][col].blockNum = fallingBlockNum;
					}
					cells[row][col + 1].className = fallingBlockCls;
					cells[row][col + 1].blockNum = fallingBlockNum;
				} else if (row >= 2 && cells[row][col - 1].className === "" && cells[row - 1][col - 1].className === "" && cells[row - 2][col - 1].className === "" && cells[row - 2][col].className === "") {
					row = row - 2;
					col--;
					for (var i = 0; i <= 2; i++) {
						cells[row + i][col].className = fallingBlockCls;
						cells[row + i][col].blockNum = fallingBlockNum;
					}
					cells[row][col + 1].className = fallingBlockCls;
					cells[row][col + 1].blockNum = fallingBlockNum;
				} else if (row < 19 && cells[row + 1][col - 1].className === "" && cells[row][col - 1].className === "" && cells[row - 1][col - 1].className === "") {
					row--;
					col--;
					for (var i = 0; i <= 2; i++) {
						cells[row + i][col].className = fallingBlockCls;
						cells[row + i][col].blockNum = fallingBlockNum;
					}
					cells[row][col + 1].className = fallingBlockCls;
					cells[row][col + 1].blockNum = fallingBlockNum;
				} else {
					for (var i = 0; i <= 2; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
					}
					cells[row - 1][col].className = fallingBlockCls;
					cells[row - 1][col].blockNum = fallingBlockNum;
					return;
				}
			} else if (fallingBlockDir === 1) {
			  var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow - 2;
							col = pcol;
							for (var i = 0; i <= 2; i++) {
								cells[row + i][col].className = "";
								cells[row + i][col].blockNum = null;
							}
							cells[row][col + 1].className = "";
							cells[row][col + 1].blockNum = null;
							break;
						}
					}
				}
				if (col > 0 && cells[row + 1][col - 1].className === "" && cells[row + 1][col + 1].className === "" && cells[row + 2][col + 1].className === "") {
					row++;
					col++;
					for (var i = 0; i <= 2; i++) {
						cells[row][col - i].className = fallingBlockCls;
						cells[row][col - i].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
				} else if (col <= 7 && cells[row + 1][col + 1].className === "" && cells[row + 1][col + 2].className === "" && cells[row + 2][col + 2].className === "") {
					row++;
					col = col + 2;
					for (var i = 0; i <= 2; i++) {
						cells[row][col - i].className = fallingBlockCls;
						cells[row][col - i].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
				} else if (col > 0 && cells[row + 1][col + 1].className === "" && cells[row][col - 1].className === "") {
					col++;
					for (var i = 0; i <= 2; i++) {
						cells[row][col - i].className = fallingBlockCls;
						cells[row][col - i].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
				} else if (col <= 7 && cells[row][col + 2].className === "" && cells[row + 1][col + 2].className === "") {
					col = col + 2;
					for (var i = 0; i <= 2; i++) {
						cells[row][col - i].className = fallingBlockCls;
						cells[row][col - i].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
				} else if (col > 0 && row > 0 && cells[row - 1][col - 1].className === "" && cells[row - 1][col].className === "" && cells[row - 1][col + 1].className === "") {
					row--;
					col++;
					for (var i = 0; i <= 2; i++) {
						cells[row][col - i].className = fallingBlockCls;
						cells[row][col - i].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
				} else if (row > 0 && cells[row - 1][col].className === "" && cells[row - 1][col + 1].className === "" && cells[row - 1][col + 2].className === "" && cells[row][col + 2].className === "") {
					row--;
					col = col + 2;
					for (var i = 0; i <= 2; i++) {
						cells[row][col - i].className = fallingBlockCls;
						cells[row][col - i].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
				} else {
					for (var i = 0; i <= 2; i++) {
						cells[row + i][col].className = fallingBlockCls;
						cells[row + i][col].blockNum = fallingBlockNum;
					}
					cells[row][col + 1].className = fallingBlockCls;
					cells[row][col + 1].blockNum = fallingBlockNum;
					return;
				}
			} else if (fallingBlockDir === 2) {
			  var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow - 1;
							col = pcol;
							for (var i = 0; i <= 2; i++) {
								cells[row][col - i].className = "";
								cells[row][col - i].blockNum = null;
							}
							cells[row + 1][col].className = "";
							cells[row + 1][col].blockNum = null;
							break;
						}
					}
				}
				if (row >= 1 && cells[row - 1][col - 1].className === "" && cells[row + 1][col - 1].className === "" && cells[row + 1][col - 2].className === "") {
					row++;
					col--;
					for (var i = 0; i <= 2; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
					}
					cells[row][col - 1].className = fallingBlockCls;
					cells[row][col - 1].blockNum = fallingBlockNum;
				} else if (row >= 1 && cells[row - 1][col].className === "" && cells[row + 1][col - 1].className === "") {
					row++;
					for (var i = 0; i <= 2; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
					}
					cells[row][col - 1].className = fallingBlockCls;
					cells[row][col - 1].blockNum = fallingBlockNum;
				} else if (row >= 2 && cells[row][col - 1].className === "" && cells[row - 1][col - 1].className === "") {
					col--;
					for (var i = 0; i <= 2; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
					}
					cells[row][col - 1].className = fallingBlockCls;
					cells[row][col - 1].blockNum = fallingBlockNum;
				} else if (row < 19 && cells[row - 1][col].className === "" && cells[row - 2][col].className === "") {
					for (var i = 0; i <= 2; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
					}
					cells[row][col - 1].className = fallingBlockCls;
					cells[row][col - 1].blockNum = fallingBlockNum;
				} else {
					for (var i = 0; i <= 2; i++) {
						cells[row][col - i].className = fallingBlockCls;
						cells[row][col - i].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
					return;
				}
			} else if (fallingBlockDir === 3) {
			  var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow;
							col = pcol + 1;
							for (var i = 0; i <= 2; i++) {
								cells[row - i][col].className = "";
								cells[row - i][col].blockNum = null;
							}
							cells[row][col - 1].className = "";
							cells[row][col - 1].blockNum = null;
							break;
						}
					}
				}
				if (col < 9 && cells[row - 1][col - 1].className === "" && cells[row][col + 1].className === "") {
					col--;
					for (var i = 0; i <= 2; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
					}
					cells[row - 1][col].className = fallingBlockCls;
					cells[row - 1][col].blockNum = fallingBlockNum;
				} else if (col >= 2 && cells[row][col - 2].className === "" && cells[row - 1][col - 2].className === "") {
					col = col - 2;
					for (var i = 0; i <= 2; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
					}
					cells[row - 1][col].className = fallingBlockCls;
					cells[row - 1][col].blockNum = fallingBlockNum;
				} else if (col < 9 && cells[row - 1][col + 1].className === "" && cells[row - 1][col - 1].className === "" && cells[row - 2][col - 1].className === "") {
					row--;
					col--;
					for (var i = 0; i <= 2; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
					}
					cells[row - 1][col].className = fallingBlockCls;
					cells[row - 1][col].blockNum = fallingBlockNum;
				} else if (col >= 2 && cells[row - 1][col - 1].className === "" && cells[row - 1][col - 2].className === "" && cells[row - 2][col - 2].className === "") {
					row--;
					col = col - 2;
					for (var i = 0; i <= 2; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
					}
					cells[row - 1][col].className = fallingBlockCls;
					cells[row - 1][col].blockNum = fallingBlockNum;
				} else {
					for (var i = 0; i <= 2; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
					}
					cells[row][col - 1].className = fallingBlockCls;
					cells[row][col - 1].blockNum = fallingBlockNum;
					return;
				}
			}
			fallingBlockDir = (fallingBlockDir + 1) % 4;
			return;
		} else if (fallingBlockCls === "l"){
			if (fallingBlockDir === 0) {
				var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow;
							col = pcol + 2;
							for (var i = 0; i <= 2; i++) {
								cells[row][col - i].className = "";
								cells[row][col - i].blockNum = null;
							}
							cells[row - 1][col].className = "";
							cells[row - 1][col].blockNum = null;
							break;
						}
					}
				}
				if (row >= 2 && cells[row - 1][col - 1].className === "" && cells[row - 2][col - 1].className === "") {
					col--;
					for (var i = 0; i <= 2; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
					}
					cells[row][col + 1].className = fallingBlockCls;
					cells[row][col + 1].blockNum = fallingBlockNum;
				} else if (row >= 2 && cells[row - 1][col - 2].className === "" && cells[row - 2][col - 2].className === "") {
					col = col - 2;
					for (var i = 0; i <= 2; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
					}
					cells[row][col + 1].className = fallingBlockCls;
					cells[row][col + 1].blockNum = fallingBlockNum;
				} else if (row < 19 && cells[row + 1][col].className === "" && cells[row + 1][col - 1].className === "" && cells[row - 1][col - 1].className === "") {
					row++;
					col--;
					for (var i = 0; i <= 2; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
					}
					cells[row][col + 1].className = fallingBlockCls;
					cells[row][col + 1].blockNum = fallingBlockNum;
				} else if (row < 19 && cells[row + 1][col - 1].className === "" && cells[row + 1][col - 2].className === "" && cells[row - 1][col - 2].className === "") {
					row++;
					col = col - 2;
					for (var i = 0; i <= 2; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
					}
					cells[row][col + 1].className = fallingBlockCls;
					cells[row][col + 1].blockNum = fallingBlockNum;
				} else {
					for (var i = 0; i <= 2; i++) {
						cells[row][col - i].className = fallingBlockCls;
						cells[row][col - i].blockNum = fallingBlockNum;
					}
					cells[row - 1][col].className = fallingBlockCls;
					cells[row - 1][col].blockNum = fallingBlockNum;
					return;
				}
			} else if (fallingBlockDir === 1) {
			  var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow;
							col = pcol;
							for (var i = 0; i <= 2; i++) {
								cells[row - i][col].className = "";
								cells[row - i][col].blockNum = null;
							}
							cells[row][col + 1].className = "";
							cells[row][col + 1].blockNum = null;
							break;
						}
					}
				}
				if (col > 0 && cells[row][col - 1].className === "" && cells[row - 1][col - 1].className === "" && cells[row - 1][col + 1].className === "") {
					row--;
					col--;
					for (var i = 0; i <= 2; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
				} else if (col <= 7 && cells[row - 1][col + 1].className === "" && cells[row - 1][col + 2].className === "") {
					row--;
					for (var i = 0; i <= 2; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
				} else if (col > 0 && cells[row - 1][col - 1].className === "" && cells[row - 2][col - 1].className === "" && cells[row - 2][col + 1].className === "") {
					row = row - 2;
					col--;
					for (var i = 0; i <= 2; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
				} else if (col <= 7 && cells[row - 2][col + 1].className === "" && cells[row - 2][col + 2].className === "") {
					row = row - 2;
					for (var i = 0; i <= 2; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
				} else {
					for (var i = 0; i <= 2; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
					}
					cells[row][col + 1].className = fallingBlockCls;
					cells[row][col + 1].blockNum = fallingBlockNum;
					return;
				}
			} else if (fallingBlockDir === 2) {
			  var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow - 1;
							col = pcol;
							for (var i = 0; i <= 2; i++) {
								cells[row][col + i].className = "";
								cells[row][col + i].blockNum = null;
							}
							cells[row + 1][col].className = "";
							cells[row + 1][col].blockNum = null;
							break;
						}
					}
				}
				if (row >= 1 && cells[row + 1][col + 1].className === "" && cells[row - 1][col + 1].className === "" && cells[row - 1][col].className === "") {
					row--;
					col++;
					for (var i = 0; i <= 2; i++) {
						cells[row + i][col].className = fallingBlockCls;
						cells[row + i][col].blockNum = fallingBlockNum;
					}
					cells[row][col - 1].className = fallingBlockCls;
					cells[row][col - 1].blockNum = fallingBlockNum;
				} else if (row >= 1 && cells[row + 1][col + 2].className === "" && cells[row - 1][col + 2].className === "" && cells[row - 1][col + 1].className === "") {
					row--;
					col = col + 2;
					for (var i = 0; i <= 2; i++) {
						cells[row + i][col].className = fallingBlockCls;
						cells[row + i][col].blockNum = fallingBlockNum;
					}
					cells[row][col - 1].className = fallingBlockCls;
					cells[row][col - 1].blockNum = fallingBlockNum;
				} else if (row < 19 && cells[row + 1][col + 1].className === "" && cells[row + 2][col + 1].className === "") {
					col++;
					for (var i = 0; i <= 2; i++) {
						cells[row + i][col].className = fallingBlockCls;
						cells[row + i][col].blockNum = fallingBlockNum;
					}
					cells[row][col - 1].className = fallingBlockCls;
					cells[row][col - 1].blockNum = fallingBlockNum;
				} else if (row < 19 && cells[row + 1][col + 2].className === "" && cells[row + 2][col + 2].className === "") {
					col = col + 2;
					for (var i = 0; i <= 2; i++) {
						cells[row + i][col].className = fallingBlockCls;
						cells[row + i][col].blockNum = fallingBlockNum;
					}
					cells[row][col - 1].className = fallingBlockCls;
					cells[row][col - 1].blockNum = fallingBlockNum;
				} else {
					for (var i = 0; i <= 2; i++) {
						cells[row][col + i].className = fallingBlockCls;
						cells[row][col + i].blockNum = fallingBlockNum;
					}
					cells[row + 1][col].className = fallingBlockCls;
					cells[row + 1][col].blockNum = fallingBlockNum;
					return;
				}
			} else if (fallingBlockDir === 3) {
			  var row;
				var col;
				for (var prow = 19; prow >= 0; prow--) {
					for (var pcol = 0; pcol < 10; pcol++) {
						if (cells[prow][pcol].blockNum === fallingBlockNum) {
							row = prow - 2;
							col = pcol;
							for (var i = 0; i <= 2; i++) {
								cells[row + i][col].className = "";
								cells[row + i][col].blockNum = null;
							}
							cells[row][col - 1].className = "";
							cells[row][col - 1].blockNum = null;
							break;
						}
					}
				}
				if (col < 9 && cells[row + 1][col + 1].className === "" && cells[row + 2][col + 1].className === "" && cells[row + 2][col - 1].className === "") {
					row = row + 2;
					col++;
					for (var i = 0; i <= 2; i++) {
						cells[row][col - i].className = fallingBlockCls;
						cells[row][col - i].blockNum = fallingBlockNum;
					}
					cells[row - 1][col].className = fallingBlockCls;
					cells[row - 1][col].blockNum = fallingBlockNum;
				} else if (col >= 2 && cells[row + 2][col - 2].className === "" && cells[row + 2][col - 1].className === "") {
					row = row + 2;
					for (var i = 0; i <= 2; i++) {
						cells[row][col - i].className = fallingBlockCls;
						cells[row][col - i].blockNum = fallingBlockNum;
					}
					cells[row - 1][col].className = fallingBlockCls;
					cells[row - 1][col].blockNum = fallingBlockNum;
				} else if (col < 9 && cells[row][col + 1].className === "" && cells[row + 1][col + 1].className === "" && cells[row + 1][col - 1].className === "") {
					row++;
					col++;
					for (var i = 0; i <= 2; i++) {
						cells[row][col - i].className = fallingBlockCls;
						cells[row][col - i].blockNum = fallingBlockNum;
					}
					cells[row - 1][col].className = fallingBlockCls;
					cells[row - 1][col].blockNum = fallingBlockNum;
				} else if (col >= 2 && cells[row + 1][col - 2].className === "" && cells[row + 1][col - 1].className === "") {
					row++;
					for (var i = 0; i <= 2; i++) {
						cells[row][col - i].className = fallingBlockCls;
						cells[row][col - i].blockNum = fallingBlockNum;
					}
					cells[row - 1][col].className = fallingBlockCls;
					cells[row - 1][col].blockNum = fallingBlockNum;
				} else {
					for (var i = 0; i <= 2; i++) {
						cells[row - i][col].className = fallingBlockCls;
						cells[row - i][col].blockNum = fallingBlockNum;
					}
					cells[row][col - 1].className = fallingBlockCls;
					cells[row][col - 1].blockNum = fallingBlockNum;
					return;
				}
			}
			fallingBlockDir = (fallingBlockDir + 1) % 4;
			return;
		}
	}
}

function hardDrop() {
	if (generating) {
		fallBlocks();
		completeGeneration();
		generating = false;
		hardDrop();
	} else {
		fallBlocks();
		hardDrop();
	}
}

function canMove(e) {
	if (e === "right") {
		var col = 9;
	} else if (e === "left") {
		var col = 0;
	}
	for (var row = 19; row >= 0; row--) {
		if (cells[row][col].blockNum === fallingBlockNum) {
			return false;
		}
	}
	if (col === 9) {
		for (var row = 19; row >= 0; row--) {
			for (var rightCol = 0; rightCol < 9; rightCol++) {
				if (cells[row][rightCol].blockNum === fallingBlockNum) {
					if (cells[row][rightCol + 1].className !== "" && cells[row][rightCol + 1].blockNum !== fallingBlockNum) {
						return false;
					}
				}
			}
		}  
	} else if (col === 0) {
		for (var row = 19; row >= 0; row--) {
			for (var leftCol = 9; leftCol > 0; leftCol--) {
				if (cells[row][leftCol].blockNum === fallingBlockNum) {
					if (cells[row][leftCol - 1].className !== "" && cells[row][leftCol - 1].blockNum !== fallingBlockNum) {
						return false;
					}
				}
			}
		}  
	}
	return true;
}

function hold() {
	var nrow;
	var ncol;
	for (var prow = 0; prow < 20; prow++) {
		for (var pcol = 0; pcol < 10; pcol++) {
			if (cells[prow][pcol].blockNum === fallingBlockNum) {
				nrow = prow;
				ncol = pcol;
				break;
			}
		}
	}
	if (holdBlock === null) {
		// NEXTにあるブロックがはまるか確認
		var ncol = canReplace(nrow,ncol,fallingBlockPtn);
		if (ncol !== null) {
			// 盤面のブロックを消す
			for (var row = 0; row < 20; row++) {
				for (var col = 9; col >= 0; col--) {
					if (cells[row][col].blockNum === fallingBlockNum) {
						cells[row][col].className = "";
						cells[row][col].blockNum = null;
					}
				}
			}
			// 盤面のブロックをHOLDに
			for (var row = 0; row < 2; row++) {
				for (var col= 0; col < 4; col++) {
					if (col < fallingBlockPtn[0].length && fallingBlockPtn[row][col]) {
						hold_cells[row][col].className = fallingBlockCls;
					} else {
						hold_cells[row][col].className = "none";
					}
				}
			}
			holdBlock = fallingBlock;
			holdBlockPtn = fallingBlockPtn;
			// NEXTのブロックを盤面に
			for (var j = 0; j < 2; j++) {
				for (var k = 0; k < 4; k++) {
					if (nextBlockPtn[1 - j][k]) {
						cells[nrow - j][ncol + k].className = nextBlock.class;
						cells[nrow - j][ncol + k].blockNum = fallingBlockNum;
					}
				}
			}
			fallingBlock = nextBlock;
			fallingBlockCls = nextBlock.class;
			fallingBlockPtn = nextBlockPtn;
			fallingBlockDir = 0;

			// 新しいブロックをNEXTに
			var keys = Object.keys(blocks);
			var nextBlockKey = keys[Math.floor(Math.random() * keys.length)];
			nextBlock = blocks[nextBlockKey];
			nextBlockPtn = nextBlock.pattern;
			for (var row = 0; row < 2; row++) {
				for (var col= 0; col < 4; col++) {
					if (col < nextBlockPtn[0].length && nextBlockPtn[row][col]) {
						next_cells[row][col].className = nextBlock.class;
					} else {
						next_cells[row][col].className = "none";
					}
				}
			}
			holdFrag = false;
		}
	} else {
		// HOLDにあるブロックがはまるかどうか確認
		var ncol = canReplace(nrow,ncol,holdBlockPtn);
		if (ncol !== null) {
			// HOLDの情報をtmpに保存
			var tmpBlock = holdBlock;

			// 盤面のブロックを消す
			for (var row = 0; row < 20; row++) {
				for (var col = 9; col >= 0; col--) {
					if (cells[row][col].blockNum === fallingBlockNum) {
						cells[row][col].className = "";
						cells[row][col].blockNum = null;
					}
				}
			}
			
			// 盤面のブロックをHOLDに
			for (var row = 0; row < 2; row++) {
				for (var col= 0; col < 4; col++) {
					if (col < fallingBlockPtn[0].length && fallingBlockPtn[row][col]) {
						hold_cells[row][col].className = fallingBlockCls;
					} else {
						hold_cells[row][col].className = "none";
					}
				}
			}
			holdBlock = fallingBlock;
			holdBlockPtn = fallingBlockPtn;

			// tmpのブロックを盤面に
			for (var j = 0; j < 2; j++) {
				for (var k = 0; k < 4; k++) {
					if (tmpBlock.pattern[1 - j][k]) {
						cells[nrow - j][ncol + k].className = tmpBlock.class;
						cells[nrow - j][ncol + k].blockNum = fallingBlockNum;
					}
				}
			}
			fallingBlock = tmpBlock;
			fallingBlockCls = tmpBlock.class;
			fallingBlockPtn = tmpBlock.pattern;
			fallingBlockDir = 0;

			holdFrag = false;
		}
	}
}

function canReplace(row,col,pattern) {
	var flag;
	for (var h = 0; h < 2; h++) {
		for (var i = 0; i < 3; i++) {
			flag = true;
			for (var j = 0; j < 2; j++) {
				for (var k = 0; k < 4; k++) {
					if ((cells[row - h - j][col + k - i].className !== "" && cells[row - h - j][col + k - i].blockNum !== fallingBlockNum) && pattern[1 - j][k]) {
						flag = false;
					}
				}
			}
			if (flag) {
				return (col - i);
			}
			flag = true;
			for (var j = 0; j < 2; j++) {
				for (var k = 0; k < 4; k++) {
					if ((cells[row - h - j][col + k + i].className !== "" || cells[row - h - j][col + k + i].blockNum === fallingBlockNum) && pattern[1 - j][k]) {
						flag = false;
					}
				}
			}
			if (flag) {
				return (col + i);
			}
		}
	}
	return null;
}

function clearAll() {
	generating = false;
	fallingBlock = null;
	fallingBlockNum = 0;
	fallingBlockDir = 0;
	fallingBlockPtn = [];
	fallingBlockCls = null;
	start = false;
	isFalling = false;
	score = 0;
	lines = 0;
	combo = 0;
	deleted_lines = 0;
	del_count = 0;
	level = 1;
	level_flag = true;
	level_count = 0;
	holdBlock = null;
	holdBlockPtn = [];
	holdFrag = true;
	nextBlock = null;
	nextBlockPtn = [];
	for (var row = 19; row >= 0; row--) {
		for (var col = 0; col < 10; col++) {
			cells[row][col].className = "";
			cells[row][col].blockNum = null;
		}
	}
	for (var row = 0; row < 2; row++) {
		for (var col= 0; col < 4; col++) {
			hold_cells[row][col].className = "none";
		}
	}
	for (var row = 0; row < 2; row++) {
		for (var col= 0; col < 4; col++) {
			next_cells[row][col].className = "none";
		}
	}
}