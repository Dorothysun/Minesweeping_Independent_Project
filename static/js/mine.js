const ID_MAX = 999999;
const ID_MIN = 100000;

const SIZE = 31;
const LENGTH = 32;
const BLOCK_WIDTH = SIZE * LENGTH;
const BLOCK_HEIGHT = SIZE * LENGTH;
const NAV_HEIGHT = 64;

const VAL_INVISIBLE = 0;
const VAL_VISIBLE = 1;
const VAL_OWNED = 2;
const STYLE_INVISIBLE = "#000000";
const STYLE_SWEPT = "#e0e0e0";
const STYLE_UNSWEPT = "#9e9e9e";

var idUser;
var idRoom;
var grids;
var canvas;
var context;

var socket = io('http://localhost');
socket.on('news', function(data) {
    //console.log(data);
    //socket.emit('my other event', { my: 'data' });
});


function start() {
    idUser = Math.floor(Math.random() * (ID_MAX - ID_MIN + 1)) + ID_MIN;
    document.getElementById("ID").value = idUser.toString();
}

function ready() {
    console.log("came here");
    // switch div
     document.getElementById("divOne").style.display = "none";
     document.getElementById("divTwo").style.display = "block";
    idRoom = document.getElementById("room").value;
    // connect to back end
    socket.emit('ready', {
        roomID: idRoom,
        userID: idUser
    });
}

function init(data) {
    // instantiate array
    // grids = new Array(SIZE);
    // for (var i = 0; i < SIZE; i++) {
    //     grids[i] = new Array(SIZE);
    //     for (var j = 0; j < SIZE; j++) {
    //         grids[i][j] = {
    //             row: i,
    //             col: j,
    //             visible: false,
    //             swept: false,
    //             flag: false,
    //             neighborMines = 0
    //         }
    //     }
    // }

    document.getElementById("divTwo").style.display = "none";
    document.getElementById("divThree").style.display = "block";


    grids = data;

    drawBoard();

    document.addEventListener("mousedown", handleClick, false);
    document.addEventListener("contextmenu", handleMenu, false);
}

function drawBoard() {
    canvas = $('<canvas/>').attr({
        width: BLOCK_WIDTH + 2 * LENGTH,
        height: BLOCK_HEIGHT + 2 * LENGTH
    }).appendTo('body');
    context = canvas.get(0).getContext("2d");

    for (var x = 0; x <= BLOCK_WIDTH; x += LENGTH) {
        context.moveTo(x + LENGTH, LENGTH);
        context.lineTo(x + LENGTH, BLOCK_HEIGHT + LENGTH);
    }

    for (var y = 0; y <= BLOCK_HEIGHT; y += LENGTH) {
        context.moveTo(LENGTH, y + LENGTH);
        context.lineTo(BLOCK_WIDTH + LENGTH, y + LENGTH);
    }

    for (var i = 0; i < SIZE; i++) {
        for (var j = 0; j < SIZE; j++) {
            changeStyle(i, j);
        }
    }

    context.strokeStyle = "black";
    context.stroke();
}

function update(data) {
    for (var k in newStatus) {
        var e = newStatus[k];
        var curr = grids[e.row][e.col];
        curr.swept = e.swept;
        curr.visible = e.visible;
        changeStyle(e.row, e.col);
    }
}

function setMineCount(row, col, count) {
    var contained = true;
    for (var i = -1; i < 2; i++) {
        var newRow = row + i;
        for (var j = -1; j < 2; j++) {
            var newCol = col + j;
            if (isInRange(newRow, newCol)) {
                contained &= grids[newRow][newCol].swept;
            }
        }
    }
    if (!contained)
        addIcon(row, col, "number-" + count);
}

function addIcon(row, col, filename) {
    var myImg = new Image();
    myImg.onload = function() {
        var myPtn = context.createPattern(this, "repeat");
        context.fillStyle = myPtn;
        context.fillRect((col + 1) * LENGTH, (row + 1) * LENGTH, LENGTH, LENGTH);
        context.fill();
    };
    myImg.src = "static/icons/" + filename + ".png";
}

function changeStyle(row, col) {
    var curr = grids[row][col];
    var style;
    if (!curr.visible) {
        style = STYLE_INVISIBLE;
    } else if (curr.swept) {
        style = STYLE_SWEPT;
    } else {
        style = STYLE_UNSWEPT;
    }
    context.fillStyle = style;
    context.fillRect((col + 1) * LENGTH, (row + 1) * LENGTH, LENGTH, LENGTH);
    if (curr.flag) {
        addIcon(row, col, "flag");
    } else if (curr.swept && curr.neighborMines) {
        setMineCount(row, col, curr.neighborMines);
    }
}

function isInRange(row, col) {
    return (row >= 0 && row < SIZE && col >= 0 && col < SIZE);
}

function handleClick(evt) {
    var cCol = parseInt((parseInt(evt.pageX) / LENGTH)) - 1;
    var cRow = parseInt((parseInt(evt.pageY) - NAV_HEIGHT) / LENGTH) - 1;
    if (isInRange(cRow, cCol) && grids[cRow][cCol].visible) {
        socket.emit('click', {
            row: cRow,
            col: cCol,
            leftClick: (evt.which == 1),
            userID: idUser
        });
        if (evt.which == 3) {
            grids[cRow][cCol] = !grids[cRow][cCol];
            changeStyle(row, col);
        }
    }
}

function handleMenu(evt) {
    var cCol = parseInt((parseInt(evt.pageX) / LENGTH)) - 1;
    var cRow = parseInt((parseInt(evt.pageY) - NAV_HEIGHT) / LENGTH) - 1;
    if (isInRange(cRow, cCol))
        evt.preventDefault();
}

function endGame() {
    document.removeEventListener("mousedown", handleClick, false);
    document.removeEventListener("contextmenu", handleMenu, false);
    document.getElementById("divFour").style.display = "block";
}

socket.on('start_game', function(data) {
    socket.emit('my_id', idUser);
});
socket.on('init', init);
socket.on('change', update);
socket.on('dead', endGame);