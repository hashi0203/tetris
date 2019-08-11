var msg = ["Hello World", "はじめてのJavaScript", "TETRISだよ"];
var count = 0;
var msgCount = 0;
msgTimer();
function msgTimer(){
	count++;
	msgCount = count%3;
	if (msgCount === 1) {
		document.getElementById("hello_text").textContent = msg[msgCount] + "(" + count + ")";
	} else {
		document.getElementById("hello_text").textContent = msg[msgCount];
	}
	setTimeout("msgTimer()", 5000);
}

function startCheck() {
	if (!start && confirm("Start TETRIS?")) {
		start=true;
	}
}
function pauseCheck() {
	if (start) {
		alert("Pausing...\nRestart?");
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

// var score = 0;
// scoreTimer();
// function scoreTimer(){
// 	document.getElementById("score").textContent = "Your score is " + score;
// 	setTimeout("msgTimer()", 10);
// }

// var start = true;
var start = false;
var cells = [];
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
var fallingBlockNum = 0;
var fallingBlockDir = 0;
var fallingBlockPtn = [];
var fallingBlockCls = null;
loadTable();
setInterval(function () {
	if (start) {
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
}, 500);

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
    
function deleteRow() {
	var tmpScore = 0;
	for (var row = 19; row >= 0; row--) {
		var canDelete = true;
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].className === "") {
				canDelete = false;
				break;
			}
		}
		if (canDelete) {
			tmpScore++;
			for (var col = 0; col > 10; col++) {
				cells[row][col].className = "";
			}
			for (var downRow = row - 1; downRow >= 0; downRow--) {
				for (var col = 0; col < 10; col++) {
					cells[downRow + 1][col].className = cells[downRow][col].className;
					cells[downRow + 1][col].blockNum = cells[downRow][col].blockNum;
					cells[downRow][col].class = "";
					cells[downRow][col].blockNum = null;
				}
			}
			row++;
		}
	}
	if (tmpScore === 1) {
		score++;
		alert(score);
	} else if (tmpScore ===2) {
		score = score + 4;
	} else if (tmpScore === 3) {
		score = score + (score / 2);
	} else if (tmpScore === 4) {
		score = score * 2;
	}
}

var rl = 3;
function completeGeneration() {
	for (var col= 0; col < fallingBlockPtn.length; col++) {
		if (fallingBlockPtn[col]) {
			if (cells[0][col + rl].className !== "") {
				alert("game over");
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
	var nextBlock = blocks[nextBlockKey];
	var nextFallingBlockNum = fallingBlockNum + 1;
	var pattern = nextBlock.pattern;
	fallingBlockNum = nextFallingBlockNum;
	fallingBlockDir = 0;
	fallingBlockPtn = pattern[0];
	fallingBlockCls = nextBlock.class;
	for (var col= 0; col < pattern[1].length; col++) {
		if (pattern[1][col]) {
			if (cells[0][col + 3].className !== "") {
				alert("game over");
				clearAll();
				return;
			}
			cells[0][col + 3].className = fallingBlockCls;
			cells[0][col + 3].blockNum = nextFallingBlockNum;
		}
	}
	isFalling = true;
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

function clearAll() {
	generating = false;
	fallingBlockNum = 0;
	fallingBlockDir = 0;
  fallingBlockPtn = [];
	fallingBlockCls = null;
	start = false;
	isFalling = false;
	for (var row = 19; row >= 0; row--) {
		for (var col = 0; col < 10; col++) {
			cells[row][col].className = "";
			cells[row][col].blockNum = null;
		}
	}  
}