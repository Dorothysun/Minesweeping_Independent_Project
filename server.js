  /* ------------------------------- global ---------------------------- */
  // var rooms; // {roomID : users[4]}
  // var users; // {userID : roomID}
  // var games; // {roomID : {userID : user_grid[][]{flagged, reavealed}
  //            // game_grid : game_grid[][]{has_mine, neighbor_mines, visited}}}

  // const SIZE = 31;
  // const MINE_PC = 15;

  // function global_init() {
  //   rooms = {};
  //   users = {};
  //   games = {};
  // }
  // global_init();

/* ----------------------------------  Socket  -----------------------------------------*/

var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(3000);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {

  /* ------------------------------- game ---------------------------- */

  function init_game(roomID){
    var content = {};
    content[rooms[roomID[0]]] = games[generate_user_grid(0)];
    content[rooms[roomID[1]]] = games[generate_user_grid(1)];
    content[rooms[roomID[2]]] = games[generate_user_grid(2)];
    content[rooms[roomID[3]]] = games[generate_user_grid(3)];
    content.game_grid = games.generate_game_grid();
    games.roomID = content;
    io.broadcast.to(roomID).emit('start_game', true);
  }


  /* -------- generate user grid ---------- */
  // plant mines 
  function generate_game_grid(){
    var grid = new Array(SIZE);
    for (i = 0; i < SIZE; ++i) grid(i) = new Array(SIZE);
    for(i=0; i < SIZE; i++){
      for(j=0; j < SIZE; j++){
        grid[i][j].visited = 0;
        // assign a random num to each slot
        var rand = Math.floor(Math.random() * 100 + 1);

        if (rand < 100 - MINE_PC) {
          grid[i][j].has_mine = 0;
        } else {
          grid[i][j].has_mine = 1;
        }
      }
    }
    for(i=0; i < SIZE; i++){
      for(j=0; j < SIZE; j++){
        countAtIndex(game_grid);
      }
    }
  }


  function inBound(x,y){
    if(x >= 0 && x <= SIZE-1 && y >= 0 && y <= SIZE-1){
        return true;
      }else{
        return false;
      }
  }

  function countAtIndex(game_grid){
    for( i = 0; i < SIZE; i++){
        for( j = 0; j < SIZE; j++){
          for( k = i-1; k < i+2; k++){
            for( l = j-1; l < j+2; l++){
              if(inBounds(k, l)){
                game_grid[i][j].neighbor_mines += game_grid[k][l].has_mine;
              }
            }
          }
          game_grid[i][j].neighbor_mines -= game_grid[i][j].has_mine; // include itself
        }
     }
  }


  /* -------- generate user grid ---------- */
  // function generate_user_grid(i){
  //   var grid = new Array(SIZE);
  //   for (i = 0; i < SIZE; ++i) grid(i) = new Array(SIZE);
  //   for(i=0; i < SIZE; i++){
  //       for(j=0; j < SIZE; j++) {
  //         grid[i][j].flagged = 0;
  //         grid[i][j].visible = 0;
  //       }
  //     }
  //     if (i == 0) grid[0][0].visible = 1;
  //     if (i == 1) grid[SIZE-1][0] = 1;
  //     if (i == 2) grid[0][SIZE-1] = 1;
  //     if (i == 3) grid[SIZE-1][SIZE-1] = 1;
  // }


  /* -------- in game ---------= */
  // returns all points that can be visible once this point is clicked on
  function left_click(x,y, userID){
    var gameID = users.userID;
    var game_grid = games.gameID.game_grid;
    var user_grid = games.gameID.userID;
    if(game_grid[x][y].has_mine == 1){
      return null;
    }
    var result = get_safe_nei_helper(x,y,{}, new Array(), userID);

    for (user_id in rooms.game) {
      if (user_id != userID) {
        var other_user_result = {};
        for (instance in result) {
          if (game_grid[instane.row][instance.col].visited &&
            games.gameID.user_id[instance.row][instance.col].visible) {
            var instance = {};
            instance.row = p;
            instance.col = q;
            instance.swept = game_grid[p][q].visited;
            instance.visible = user_grid[p][q].visible;
            other_user_result[x + " " + y] = instance;
          }
        }
        if (other_user_result != {}) {
          /********************SOCKET********************/
        }
      }
    }

    return result;
  }


  function get_safe_nei_helper(x,y,result,visited, userID) {
    var gameID = users.userID;
    var game_grid = games.gameID.game_grid;
    var user_grid = games.gameID.userID;
    // stop search critera
    if(Array.contains([x,y],visited) ||
       game_grid[x][y].is_mine ||
       game_grid[x][y].neighbor_mines ||
       game_grid[x][y].visited ||
       user_grid[x][y].flagged){
      // update visible grids
      for (i = 1; i < 4; ++i) {
        for (j = 1; j < 4; ++j) {
          if (inBounds(x + i, y + j)) {
            var p = x + i;
            var q = y + j
            user_grid[p][q].visible = 1;
            if (result[p + " " + q] != null) {
              var instance = {};
              instance.row = p;
              instance.col = q;
              instance.swept = game_grid[p][q].visited;
              instance.visible = user_grid[p][q].visible;
              result[x + " " + y] = instance;
            }
          }
          if (inBounds(x + i, y - j)) {
            var p = x + i;
            var q = y - j
            user_grid[p][q].visible = 1;
            if (result[x + " " + y] != null) {
              var instance = {};
              instance.row = p;
              instance.col = q;
              instance.swept = game_grid[p][q].visited;
              instance.visible = user_grid[p][q].visible;
              result[x + " " + y] = instance;
            }
          }
          if (inBounds(x - i, y + j)) {
            var p = x - i;
            var q = y + j
            user_grid[p][q].visible = 1;
            if (result[x + " " + y] != null) {
              var instance = {};
              instance.row = p;
              instance.col = q;
              instance.swept = game_grid[p][q].visited;
              instance.visible = user_grid[p][q].visible;
              result[x + " " + y] = instance;
            }
          }
          if (inBounds(x - i, y - j)) {
            var p = x - i;
            var q = y - j
            user_grid[p][q].visible = 1;
            if (result[x + " " + y] != null) {
              var instance = {};
              instance.row = p;
              instance.col = q;
              instance.swept = game_grid[p][q].visited;
              instance.visible = user_grid[p][q].visible;
              result[x + " " + y] = instance;
            }
          }
        }
      }
      return;
    }
    visited.push([x,y]);
    game_grid[x][y].visited = 1;
    user_grid[x][y].visible = 1;
    
    var instance = {};
    instance.row = x;
    instance.col = y;
    instance.swept = game_grid[x][y].visited;
    instance.visible = user_grid[x][y].visible;
    result[x + " " + y] = instance;

    for( i = x-1; i < x+2; i++){
      for( j = y-1; j < y+2; j++){
        if(inBounds(i, j)){
          get_safe_nei_helper(i, j, result, visited, userID);
        }
      }
    }
  }


  function right_click(x, y, userID) {
    games[users.userID][x][y].flagged * (-1) + 1;
  }

  function game_over() {
    socket.emit('dead', true);
  }


  //socket.emit('news', { hello: 'world' });
  socket.on('ready', function (data) {
    var roomID = data.roomID;
    var userID = data.userID;
    socket.join(roomID);
    users[userID] = roomID;
    rooms[roomID] = userID
  });

  socket.on('my_id', function(data) {
    var user_id = data;
    var user_grid = game[users[user_id]][user_id];
    var game_grid = game[users[user_id]]["game_id"];
    var init_data = new Array(SIZE);
    for (ele in init_data) {ele = new Array(SIZE);}
    for (i = 0; i < SIZE; ++i) {
      for (j = 0; j < SIZE; ++j) {
        init_data[i][j] = 
        {row : i, col : j, neighbor_mines : game_grid[i][j].neighbor_mines, 
          swept : false, flag : false, visible : user_grid[i][j].neighbor_mines};
      }
    }
             //{roomID : {userID : user_grid[][]{flagged, reavealed}
             // game_grid : game_grid[][]{has_mine, neighbor_mines, visited}}}
    socket.emit('init', init_data);
  });

  socket.on('click', function(data) {
    var user_id = data.userID;
    var left = data.leftClick;
    var x = row;
    var y = col;
    var result;
    if (leftClick) result = left_click(x, y, user_id);
    else result = right_click(x, y, user_id);
    socket.emit('change', result);
  });
});

