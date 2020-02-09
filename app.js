const Board = require("./structure.js");
const http = require("http");
const fs = require("fs");
const extensions = {".html": "text/html",
                    ".css": "text/css",
                    ".js": "text/javascript",
                    ".png": "image/png"};


function requestHandler(request, response) {
  function fileHandler(error, content) {
    var fileExtensionLocation = filePath.indexOf(".");
    var extension = filePath.substring(fileExtensionLocation);
    var contentType = extensions[extension];

    response.writeHead(200, {"Content-Type": contentType});
    response.end(content);
  }

  var filePath = __dirname + "/client" + request.url;
  if(filePath === __dirname + "/client/") {
    filePath = __dirname + "/client/test.html";
  }

  if(filePath !== __dirname + "/client/favicon.ico") {
    fs.readFile(filePath, fileHandler);
  }
}

const server = http.createServer(requestHandler);
server.listen(2000);

// -----------------------------------------------------------------------------

class Game {
  emit_victory_points() {
    let victoryPoints = [];
    for(let p = 0; p < this.orderedPlayers.length; ++p) {
      victoryPoints.push(this.orderedPlayers[p].victoryPoints);
    }

    for(let index = 0; index < this.sockets.length; ++index) {
      let socket = this.sockets[index];
      socket.emit("victoryPointsUpdate", victoryPoints);
    }

  }

  emit_player_ended_turn() {
    for(let index = 0; index < this.sockets.length; ++index) {
      let socket = this.sockets[index];
      socket.emit("endTurnPopup");
    }
  }

  emit_whose_turn() {
    for(let index = 0; index < this.sockets.length; ++index) {
      let socket = this.sockets[index];
      socket.emit("whoseTurn", this.currentPlayer);
    }
  }

  send_board() {
    for(let index = 0; index < this.sockets.length; ++index) {
      let socket = this.sockets[index];
      socket.emit("boardUpdate", this.board);
    }
  }

  roll_the_dice(data) {
    let sum = data[1][0] + data[1][1];
    let tiles = [];
    for(let i = 0; i < this.board.tiles.length; ++i) {
      let tile = this.board.tiles[i];
      if(tile.value === sum) {
        tiles.push([tile.id, tile.terrain]);
      }
    }

    let settlementPayoff = [];

    for(let i = 0; i < this.board.settlements.length; ++i) {
      let settlement = this.board.settlements[i];
      let vertex = this.board.vertices[settlement[0]];
      for(let j = 0; j < vertex.connectedTiles.length; ++j) {
        for(let k = 0; k < tiles.length; ++k) {
          if(vertex.connectedTiles[j][0] === tiles[k][0]) {
            settlementPayoff.push([tiles[k][1], settlement[1]]);
          }
        }
      }
    }

    let cityPayoff = [];

    for(let i = 0; i < this.board.cities.length; ++i) {
      let city = this.board.cities[i];
      let vertex = this.board.vertices[city[0]];
      for(let j = 0; j < vertex.connectedTiles.length; ++j) {
        for(let k = 0; k < tiles.length; ++k) {
          if(vertex.connectedTiles[j][0] === tiles[k][0]) {
            cityPayoff.push([tiles[k][1], city[1]]);
          }
        }
      }
    }

    for(let i = 0; i < this.orderedPlayers.length; ++i) {
      var resourcesToAdd = [0, 0, 0, 0, 0];
      let player = this.orderedPlayers[i];
      for(let j = 0; j < settlementPayoff.length; ++j) {
        let payoff = settlementPayoff[j];
        if(payoff[1] === player.color) {
          if(payoff[0] === "brick") {
            resourcesToAdd[0]++;
          } else if(payoff[0] === "wood") {
            resourcesToAdd[1]++;
          } else if(payoff[0] === "wheat") {
            resourcesToAdd[2]++;
          } else if(payoff[0] === "sheep") {
            resourcesToAdd[3]++;
          } else if(payoff[0] === "ore") {
            resourcesToAdd[4]++;
          }
        }
      }

      for(let j = 0; j < cityPayoff.length; ++j) {
        let payoff = cityPayoff[j];
        if(payoff[1] === player.color) {
          if(payoff[0] === "brick") {
            resourcesToAdd[0] += 2;
          } else if(payoff[0] === "wood") {
            resourcesToAdd[1] += 2;
          } else if(payoff[0] === "wheat") {
            resourcesToAdd[2] += 2;
          } else if(payoff[0] === "sheep") {
            resourcesToAdd[3] += 2;
          } else if(payoff[0] === "ore") {
            resourcesToAdd[4] += 2;
          }
        }
      }

      player.add_resources(resourcesToAdd);
      player.send_resource_count_update(player.resources);
    }


    //37, yellow

    for(let index = 0; index < this.sockets.length; ++index) {
      let socket = this.sockets[index];
      socket.emit("rollTheDice", data);
    }
  }

  emit_seconds_remaining(secondsRemaining, color) {
    for(let i = 0; i < this.sockets.length; ++i) {
      this.sockets[i].emit("secondsRemainingUpdate", [secondsRemaining, color]);
    }
  }

  emit_player_order() {
    let colors = [];
    let names = [];
    for(let i = 0; i < this.orderedPlayers.length; ++i) {
      let player = this.orderedPlayers[i];
      colors.push(player.color);
      names.push(player.name);
    }
    for(let i = 0; i < this.orderedPlayers.length; ++i) {
      this.orderedPlayers[i].socket.emit("player_order", [colors, names, i]);
    }
  }

  constructor(sockets, board) {
    this.sockets = sockets;
    this.board = board;

    this.gameName = "Game-" + Object.keys(Game.games).length;
    this.orderedPlayers = new Array(4).fill(null);

    // Test Stuff
    this.stage = "normal"; //setup1
    this.currentPlayer = 0;
    this.change = 1;

    this.initialize();

    Game.games[this.gameName] = this;

    emit_begin_game(this.gameName, board, this.orderedPlayers);
    game_loop(this.gameName);
  }

  initialize() {
    this.initialize_players();
  }

  initialize_players() {
    let colors = ["red", "blue", "purple", "yellow"];
    for(let index = 0; index < this.sockets.length; ++index) {
      let socket = this.sockets[index];
      socket.inGame = true;
      socket.gameName = this.gameName;
      let randomIndex = Math.floor(Math.random() * colors.length);

      let player = new User(socket, this.gameName, this.board, colors[randomIndex]);
      colors.splice(randomIndex, 1);
      this.assign_turn_number(player);
    }
    this.emit_player_order();
  }

  assign_turn_number(player) {
    var availableTurns = [];
    for(let index = 0; index < this.orderedPlayers.length; ++index) {
      if(this.orderedPlayers[index] === null) {
        availableTurns.push(index);
      }
    }

    var randomNumber = Math.floor(Math.random() * availableTurns.length);
    var randomIndex = availableTurns[randomNumber];
    let name = "Player " + (randomIndex + 1);
    player.turnPosition = randomIndex;
    player.name = name;
    this.orderedPlayers[randomIndex] = player;
  }

  get_next_turn() {
    var player = this.orderedPlayers[this.currentPlayer];
    this.emit_whose_turn();
    if(this.stage === "setup1" || this.stage === "setup2") {
      player.emit_initial_setup(this.stage);
      if(this.currentPlayer === 3 && this.change === 0) {
        this.change = -1;
      } else if(this.currentPlayer === 3) {
        this.change = 0;
        this.stage = "setup2";
      } else if(this.change === -1 && this.currentPlayer === 0) {
        this.stage = "normal";
        this.change = 1;
      }
      this.currentPlayer += this.change;
    } else {
      if(this.currentPlayer === 3) {
        this.change = -3;
      } else if(this.currentPlayer === 0 && this.change === -3) {
        this.change = 1;
      }
      this.currentPlayer += this.change;
    }
    player.emit_your_turn(this.stage);
    // this.get_next_turn();
  }
}
Game.games = {};

class Player {
  // Implement a function to turn a user to a computer.

  constructor(gameName, board, color) {
    this.gameName = gameName;
    this.board = board;
    this.turnPosition = null;
    this.color = color;
    this.name = null;
    this.resources = [5, 5, 5, 5, 6] // Brick, wood, wheat, sheep, stone
    this.victoryPoints = 0;
  }
}

class User extends Player {
  send_resource_count_update(resourceCount) {
    this.socket.emit("resourceCountUpdate", resourceCount);
  }

  on_connect(socket) {
    var player = this;
    socket.on("endSetup", function(data) {
      player.end_turn();
    });

    socket.on("settlementSelected", function(data) {
      var vertexId = player.place_settlement(data);
      player.placedSettlement = vertexId;
    });

    socket.on("citySelected", function(data) {
      var vertexId = player.place_city(data);
    });

    socket.on("roadSelected", function(data) {
      player.place_road(data, null);
    });

    socket.on("popupUp", function() {
      setTimeout(function() {
        socket.emit("closePopup");
      }, 1000)
    });

    socket.on("endedMyTurn", function() {
      player.end_turn();
    });

    socket.on("rollDice", function() {
      if(player.yourTurn) {
        let randomNumbers = [];
        let realRand = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
        for(let i = 0; i < 20; ++i) {
          let rand = Math.floor(Math.random() * 6) + 1;
          randomNumbers.push(rand);
        }
        let game = Game.games[player.gameName];
        let data = [randomNumbers, realRand];

        game.roll_the_dice(data);
      }
    });

  }

  place_settlement(vertexId) {
    this.victoryPoints += 1;
    var location = vertexId;
    if(location === null) {
      let availableVertices = [];
      for(let i = 0; i < this.board.stateOfVertices.length; ++i) {
        if(this.board.stateOfVertices[i]) {
          availableVertices.push(i);
        }
      }
      location = availableVertices[Math.floor(Math.random() * availableVertices.length)];
    }
    this.board.close_vertices(location);
    this.board.settlements.push([location, this.color]);
    var game = Game.games[this.gameName];
    this.resources[0] -= 1;
    this.resources[1] -= 1;
    this.resources[2] -= 1;
    this.resources[3] -= 1;
    this.send_resource_count_update(this.resources);
    game.send_board();
    this.socket.emit("placingSettlementUpdate", [false, null]);
    game.emit_victory_points();
    return location;
    // this.end_turn();
  }

  place_city(vertexId) {
    this.victoryPoints += 2;
    var location = vertexId;

    this.board.close_vertices(location);
    this.board.cities.push([location, this.color]);
    var game = Game.games[this.gameName];
    this.resources[2] -= 2;
    this.resources[4] -= 3;
    this.send_resource_count_update(this.resources);
    game.send_board();
    this.socket.emit("placingCityUpdate", [false, null]);
    game.emit_victory_points();
    // this.end_turn();
  }

  place_road(edgeId, vertexId) {
    var location = edgeId;
    if(location === null) {
      let availableEdges = this.board.vertices[vertexId].connectedEdges;
      location = availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }
    this.board.close_edge(location);
    this.board.roads.push([location, this.color]);
    var game = Game.games[this.gameName];
    this.resources[0] -= 1;
    this.resources[1] -= 1;
    this.send_resource_count_update(this.resources);
    game.send_board();
  }

  add_resources(resourcesToAdd) {
    for(let i = 0; i < this.resources.length; ++i) {
      this.resources[i] += resourcesToAdd[i];
    }
  }

  give_starting_resources(settlementId) {
    var vertex = this.board.vertices[settlementId];
    var connectedTiles = vertex.connectedTiles;
    var resourcesToAdd = [0, 0, 0, 0, 0];

    for(let i = 0; i < connectedTiles.length; ++i) {
      let tile = this.board.tiles[connectedTiles[i][0]];
      if(tile.terrain === "brick") {
        resourcesToAdd[0]++;
      } else if(tile.terrain === "wood") {
        resourcesToAdd[1]++;
      } else if(tile.terrain === "wheat") {
        resourcesToAdd[2]++;
      } else if(tile.terrain === "sheep") {
        resourcesToAdd[3]++;
      } else if(tile.terrain === "ore") {
        resourcesToAdd[4]++;
      }
    }
    this.add_resources(resourcesToAdd);
  }

  end_turn() {

    if(this.round === "setup2") {
      this.give_starting_resources(this.placedSettlement);
      this.send_resource_count_update(this.resources);
    }
    this.placedSettlement = null;
    clearInterval(this.turnTimer);
    var game = Game.games[this.gameName];
    this.yourTurn = false;
    game.emit_player_ended_turn();
    this.socket.emit("turnOver");
    game.get_next_turn();
  }

  emit_initial_setup(round) {
    this.socket.emit("initialSetup");
    var secondsRemaining = 100;
    var player = this;
    var color = this.color;
    var socket = this.socket;
    var gameName = this.gameName;
    this.round = round;
    player.placedSettlement = false;
    Game.games[gameName].emit_seconds_remaining(secondsRemaining, color);
    this.turnTimer = setInterval(function() {
      secondsRemaining -= 1;
      if(secondsRemaining === 0) {
        if(player.placedSettlement === false) {
          player.placedSettlement = player.place_settlement(null);
          player.place_road(null, player.placedSettlement);
        } else {
          player.place_road(null, player.placedSettlement);
          socket.emit("stopPlacingRoad");
        }
        player.end_turn();
      } else {
          Game.games[gameName].emit_seconds_remaining(secondsRemaining, color);
      }
    }, 1000);

  }

  emit_your_turn(round) {
    this.socket.emit("yourTurn");
    this.yourTurn = true;
    this.round = round;
    var player = this;
    var secondsRemaining = 60; //60
    var gameName = this.gameName;
    var color = this.color;
    Game.games[gameName].emit_seconds_remaining(secondsRemaining, color);
    this.turnTimer = setInterval(function() {
      secondsRemaining -= 1;
      if(secondsRemaining === 0) {
        player.end_turn();
      } else {
        Game.games[gameName].emit_seconds_remaining(secondsRemaining, color);
      }
    }, 1000);
  }

  constructor(socket, gameName, board, color) {
    super(gameName, board, color);
    this.socket = socket;
    this.on_connect(this.socket);
    this.placedSettlement = null;
    this.send_resource_count_update(this.resources);
    this.yourTurn = false;
    socket.emit("yourColor", this.color);
  }
}

class Computer extends Player {
  constructor(gameName, board, color) {
    super(gameName, board, color);
  }
}


// Google api login

var io = require("socket.io")(server);



var waitingSockets = [];

io.on("connection", function(socket) {
  console.log("In?");
  socket.inGame = false;
  waitingSockets.push(socket);
  if(waitingSockets.length === 4) { // If there are 4 players waiting then start a game.
    let board = generate_board();
    new Game(waitingSockets, board);
    waitingSockets = [];
  } else { // If there are less than 4 players waiting then send each one an update about the number of players waiting.
    emit_waiting_players_count_update();
  }

  socket.on("disconnect", function() {
    if(!socket.inGame) {
      for(let index = 0; index < waitingSockets.length; ++index) {
        if(socket.id === waitingSockets[index].id) {
          waitingSockets.splice(index, 1);
          emit_waiting_players_count_update();
        }
      }
    }
  });
});

function game_loop(gameName) {
  var game = Game.games[gameName];
  game.get_next_turn();
}































// const timeoutObj = setTimeout(() => {
//   console.log('timeout beyond time');
// }, 1500);
//
// const immediateObj = setImmediate(() => {
//   console.log('immediately executing immediate');
// });
//
// const intervalObj = setInterval(() => {
//   console.log('interviewing the interval');
// }, 500);
//
// clearTimeout(timeoutObj);
// clearImmediate(immediateObj);
// clearInterval(intervalObj);























function emit_waiting_players_count_update() {
  for(let index = 0; index < waitingSockets.length; ++index) {
    let socket = waitingSockets[index];
    socket.emit("waitingPlayersCountUpdate", waitingSockets.length);
  }
}

function emit_begin_game(gameName, board, players) {
  var game = Game.games[gameName];
  var names = [];
  var colors = [];
  for(let i = 0; i < players.length; ++i) {
    names.push(players[i].name);
  }
  for(let index = 0; index < game.sockets.length; ++index) {
    let socket = game.sockets[index];
    socket.emit("beginGame", board);
    socket.emit("playerNames", names);
  }
}










function generate_terrains() {
  var terrains = ["wood", "sheep", "wheat", "brick", "ore", "brick", "sheep", "desert", "wood", "wheat", "wood", "wheat", "brick", "sheep", "sheep", "ore", "ore", "wheat", "wood"];
  return terrains;
}

function generate_values() {
  var values = [11, 12, 9, 4, 6, 5, 10, 0, 3, 11, 4, 8, 8, 10, 9, 3, 5, 2, 6];
  return values;
}

function generate_board() {
  var terrains = generate_terrains();
  var values = generate_values();
  var board = new Board(terrains, values);
  return board;
}
