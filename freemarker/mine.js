const ID_MAX = 999999;
const ID_MIN = 100000;

const SIZE = 10;
const MINE_PC = SIZE*SIZE/6;
const LENGTH = 32;
const BLOCK_WIDTH = SIZE * LENGTH;
const BLOCK_HEIGHT = SIZE * LENGTH;
const NAV_HEIGHT = 64;

const VAL_INVISIBLE = 0;
const VAL_VISIBLE = 1;
const VAL_OWNED = 2;

const STYLE_INVISIBLE = "#000000";
// const STYLE_SWEPT_SAFE = "#e0e0e0";
// const STYLE_SWEPT_UNSAFE = "#9e9e9e";

//PRE
const STYLE_SWEPT = "#e0e0e0";
const STYLE_UNSWEPT = "#9e9e9e";
const STYLE_MINE = "#ff0000";

var idUser;
var idRoom;
var webSocket;
var grid;
var canvas;
var context;

var has_mine;
var neighbor_mines;
var game_over;


//plant bomb 
function generate_game_grid(){
    for(i=0; i < SIZE; i++){
      for(j=0; j < SIZE; j++){
        // generate mines
        var rand = Math.floor(Math.random() * 100 + 1);

        if (rand < 100 - MINE_PC) {
          grid[i][j].has_mine = 0;

        } else {
          grid[i][j].has_mine = 1;

        }


        // try to count the 8 neighbor_mines
        for( k = i-1; k < i+2; k++){
            for( l = j-1; l < j+2; l++){
              if(isInRange(k, l)){
                grid[i][j].neighbor_mines += grid[k][l].has_mine;
              }
          }
        }
       grid[i][j].neighbor_mines -= grid[i][j].has_mine; // exclude itself
      }
    }
}



function drawBoard() {
    for (var x = 0; x <= BLOCK_WIDTH; x += LENGTH) {
        context.moveTo(x + LENGTH, LENGTH);
        context.lineTo(x + LENGTH, BLOCK_HEIGHT + LENGTH);
    }

    for (var y = 0; y <= BLOCK_HEIGHT; y += LENGTH) {
        context.moveTo(LENGTH, y + LENGTH);
        context.lineTo(BLOCK_WIDTH + LENGTH, y + LENGTH);
    }

    context.strokeStyle = "black";
    context.stroke();
}

function isInRange(row, col) {
    return (row >= 0 && row < SIZE && col >= 0 && col < SIZE);
}


// function explore(row, col) {
//     var newRow;
//     var newCol;
//     for (var i = -1; i < 2; i++) {
//         newRow = row + i;
//         for (var j = -1; j < 2; j++) {
//             newCol = col + j;
//             if (isInRange(newRow, newCol, SIZE)) {
//                 changeColor(newRow, newCol, STYLE_UNSWEPT);
//             }
//         }
//     }
//     changeColor(row, col, STYLE_SWEPT);
// }

//recursion 
function explore(row, col) {
    if(grid[row][col].has_mine == 1){
        // end the game
        showFinalBoard();
        return;
    }else{
        changeColor(row, col, STYLE_SWEPT);
        grid[row, col].visited == true;
        explore_helper(row, col);
    }

}


//recursive helper functin to recurse on the surrounding 8 neighbours 
// I dont think the visited work properly 
function explore_helper(row, col) { 
	if(row < 0 || row > SIZE || col < 0 || col > SIZE){
		return;
	}


    if((grid[row][col].neighbor_mines != 0)&& (grid[row][col].visited != undefined)){
        grid[row][col].visited == true;
        changeColor(row, col, STYLE_UNSWEPT);
        return;
    }else{
        console.log("enter the helper");
        console.log(grid[row][col].neighbor_mines);
        var newRow;
        var newCol;

        for (var i = -1; i < 2; i++) {
            newRow = row + i;
            for (var j = -1; j < 2; j++) {
                newCol = col + j;
                if (isInRange(newRow, newCol, SIZE) && grid[newRow, newCol].visited == false) {
                    grid[newRow, newCol].visited == true;
                    explore_helper(newRow, newCol);
                }
            }
        }
    }
}


function bomb(row,col){
    //context.drawImage(bombImg,col*30,row*30);

    var myImg = new Image();
    myImg.onload = function() {
        var myPtn = context.createPattern(this, "repeat");
        context.fillStyle = myPtn;
        context.fillRect((col + 1) * LENGTH, (row + 1) * LENGTH, LENGTH, LENGTH);
        context.fill();
    };
    myImg.src = "static/css/bomb.png";
}


function draw_bomb(grid){
    for( i = 0; i < SIZE; i++){
        for( j = 0; j < SIZE; j++){
          if(grid[i][j].has_mine == 1){
            bomb(row,col);
          }
        }
      }
}


function makeFlag(row, col) {
    var myImg = new Image();
    myImg.onload = function() {
        var myPtn = context.createPattern(this, "repeat");
        context.fillStyle = myPtn;
        context.fillRect((col + 1) * LENGTH, (row + 1) * LENGTH, LENGTH, LENGTH);
        context.fill();
    };
    myImg.src = "static/css/flag.png";
}

function gameOverChecker(row, col) {
    //console.log("gameover checking row col --> " + row + col);

    if(grid[row][col].has_mine == 1){
        alert("Sorry, you lose the game");
        showFinalBoard();
        return;
    }

}

function showFinalBoard(){
    for(i=0; i < SIZE; i++){
      for(j=0; j < SIZE; j++){
        if(grid[i][j].has_mine){
            //changeColor(i, j, STYLE_MINE);
            bomb(i,j);
        }
      }
    }

    document.removeEventListener("mousedown", handleClick);
    document.removeEventListener("contextmenu", handleMenu);
}

function changeColor(row, col, style) {
    context.fillStyle = style;
    context.fillRect((col + 1) * LENGTH, (row + 1) * LENGTH, LENGTH, LENGTH);
}

function handleClick(evt) {
    var col = parseInt(parseInt(evt.pageX.toString()) / LENGTH) - 1;
    var row = parseInt(parseInt(evt.pageY.toString() - NAV_HEIGHT) / LENGTH) - 1;
    if (isInRange(row, col)) {
        var curr = grid[row][col];
        if (evt.which == 1) {
            if ((!curr.isVisible) || curr.isSwept || curr.isFlag)
                //console.log("should not respond");
            explore(row, col);
            gameOverChecker(row, col);
        } else if (evt.which == 3) {
            makeFlag(row, col);
        }
    }
}

function handleMenu(evt) {
    var col = parseInt(parseInt(evt.pageX.toString()) / LENGTH) - 1;
    var row = parseInt(parseInt(evt.pageY.toString() - NAV_HEIGHT) / LENGTH) - 1;
    if (isInRange(row, col))
        evt.preventDefault();
}

function init() {
    // switch div
    document.getElementById("divOne").style.display = "none";
    document.getElementById("divThree").style.display = "block";
    // instantiate array
    grid = new Array(SIZE);
    for (var i = 0; i < SIZE; i++) {
        grid[i] = new Array(SIZE);
        for (var j = 0; j < SIZE; j++) {
            grid[i][j] = {
                x: i,
                y: j,
                mine: false,
                visible: false,
                swept: false,
                flag: false,
                has_mine: 0,
                neighbor_mines: 0,
                visited: false 
            }
        }
    }

    // place mine
    generate_game_grid();

    canvas = $('<canvas/>').attr({
        width: BLOCK_WIDTH + 2 * LENGTH,
        height: BLOCK_HEIGHT + 2 * LENGTH
    }).appendTo('body');
    context = canvas.get(0).getContext("2d");

    drawBoard();

    document.addEventListener("mousedown", handleClick, false);
    document.addEventListener("contextmenu", handleMenu, false); //right click
}