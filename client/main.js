var isLeftSidebarOpen = true;
var isRightSidebarOpen = false;

var board = null;

var gameStage = null;
var placingSettlement = false;
var placingCity = false;
var cityOrSettlement = null;

var secondsRemaining = null;
var secondsRemainingColor = null;
var selectedVertex = null;
var placingRoad = false;
var availableEdges = [];
var availableEdges2 = [];
var selectedEdge = null;
var playerNames = [];
var whoseTurn = null;

var yourTurn = false;
var yourColor = null;
var rollDice = false
var drawDice = true;
var rollOne = 6;
var rollTwo = 6;

var resources = [0, 0, 0, 0, 0];

var aVsAn = {2: "a", 3: "a", 4: "a", 5: "a", 6: "a", 7: "a", 8: "an", 9: "a", 10: "a", 11: "an", 12: "a"};


let gui = new Gui(window.innerWidth, window.innerHeight, isLeftSidebarOpen, isRightSidebarOpen);
// console.log(io);
var socket = io();

function update_gui() {
  gui = new Gui(window.innerWidth, window.innerHeight, isLeftSidebarOpen, isRightSidebarOpen);
  intialize_board(board, placingSettlement, secondsRemaining, selectedVertex, placingRoad, availableEdges, selectedEdge, secondsRemainingColor, drawDice, rollOne, rollTwo, placingCity);
}

function check_if_player_can_build_road() {
  let c = document.getElementById("road-container");
  let isGreen = c.style.backgroundColor === "rgb(133, 187, 101)";

  if(isGreen) {
    placingRoad = true;
    availableEdges = availableEdges2;
    update_gui();
  }
}

function check_if_player_can_build_settlement() {
  let c = document.getElementById("settlement-container");
  let isGreen = c.style.backgroundColor === "rgb(133, 187, 101)";

  if(isGreen) {
    placingSettlement = true;
    update_gui();
  }
}

function check_if_player_can_build_city() {
  let c = document.getElementById("city-container");
  let isGreen = c.style.backgroundColor === "rgb(133, 187, 101)";

  if(isGreen) {
    placingCity = true;
    update_gui();
  }
}

function update_possible_buys() {

  // data[0] = brick count
  // data[1] = wood count
  // data[2] = wheat count
  // data[3] = sheep count
  // data[4] = stone count

  var canBuyRoad = false;
  var canBuySettlement = false;
  var canBuyCity = false;
  var canBuyCard = false;
  var canBuyRoadSpecific = [];
  var canBuySettlementSpecific = [];
  var canBuyCitySpecific = [];
  var canBuyCardSpecific = [];
  if(resources[0] >= 1 && resources[1] >= 1 && availableEdges2.length !== 0 && (yourTurn && !rollDice)) {
    canBuyRoad = true;
  }
  canBuyRoadSpecific = [resources[0] >= 1, resources[1] >= 1];

  if(resources[0] >= 1 && resources[1] >= 1 && resources[2] >= 1 && resources[3] >= 1 && (yourTurn && !rollDice)) {
    canBuySettlement = true;
  }
  canBuySettlementSpecific = [resources[0] >= 1, resources[1] >= 1, resources[2] >= 1, resources[3] >= 1];

  if(resources[2] >= 2 && resources[4] >= 3 && (yourTurn && !rollDice)) {
    canBuyCity = true;
  }
  canBuyCitySpecific = [resources[2] >= 2, resources[4] >= 3];

  if(resources[2] >= 1 && resources[3] >= 1 && resources[4] >= 1 && yourTurn) {
    canBuyCard = true;
  }
  canBuyCardSpecific = [resources[2] >= 1, resources[3] >= 1, resources[4] >= 1];

  let roadContainer = document.getElementById("road-container");
  let settlementContainer = document.getElementById("settlement-container");
  let cityContainer = document.getElementById("city-container");
  let cardContainer = document.getElementById("card-container");
  if(canBuyRoad) {
    roadContainer.style.backgroundColor = "#85BB65";
  } else {
    roadContainer.style.backgroundColor = "#C24641";
  }

  if(canBuySettlement) {
    settlementContainer.style.backgroundColor = "#85BB65";
  } else {
    settlementContainer.style.backgroundColor = "#C24641";
  }

  if(canBuyCity) {
    cityContainer.style.backgroundColor = "#85BB65";
  } else {
    cityContainer.style.backgroundColor = "#C24641";
  }

  if(canBuyCard) {
    cardContainer.style.backgroundColor = "#85BB65";
  } else {
    cardContainer.style.backgroundColor = "#C24641";
  }

  let roadNumberContainers = [document.getElementById("brick-container2").children[0], document.getElementById("wood-container2").children[0]];
  let settlementNumberContainers = [document.getElementById("brick-container3").children[0], document.getElementById("wood-container3").children[0],
                                    document.getElementById("wheat-container3").children[0], document.getElementById("sheep-container3").children[0]];
  let cityNumberContainers = [document.getElementById("wheat-container4").children[0], document.getElementById("stone-container4").children[0]];
  let cardNumberContainers = [document.getElementById("wheat-container5").children[0], document.getElementById("sheep-container5").children[0],
                              document.getElementById("stone-container5").children[0]];

  for(let i = 0; i < roadNumberContainers.length; ++i) {
    let c = roadNumberContainers[i];
    if(canBuyRoadSpecific[i]) {
      c.style.backgroundColor = "#85BB65";
    } else {
      c.style.backgroundColor = "#C24641";
    }
  }
  for(let i = 0; i < settlementNumberContainers.length; ++i) {
    let c = settlementNumberContainers[i];
    if(canBuySettlementSpecific[i]) {
      c.style.backgroundColor = "#85BB65";
    } else {
      c.style.backgroundColor = "#C24641";
    }
  }
  for(let i = 0; i < cityNumberContainers.length; ++i) {
    let c = cityNumberContainers[i];
    if(canBuyCitySpecific[i]) {
      c.style.backgroundColor = "#85BB65";
    } else {
      c.style.backgroundColor = "#C24641";
    }
  }
  for(let i = 0; i < cardNumberContainers.length; ++i) {
    let c = cardNumberContainers[i];
    if(canBuyCardSpecific[i]) {
      c.style.backgroundColor = "#85BB65";
    } else {
      c.style.backgroundColor = "#C24641";
    }
  }
}


function handle_end_turn_click() {
  if(!yourTurn) {
    fade_in_popup(3);
  } else if(yourTurn && rollDice) {
    fade_in_popup(4);
  } else {
    socket.emit("endedMyTurn");
  }
}


function handle_left_sidebar_button_click() {
  isLeftSidebarOpen = !isLeftSidebarOpen;
  update_gui();
}

function handle_right_sidebar_button_click() {
  isRightSidebarOpen = !isRightSidebarOpen;
  update_possible_buys();
  update_gui();
}

function handle_dice_click() {
  if(!rollDice) {
    fade_in_popup(1);
  } else {
    socket.emit("rollDice");
  }
}

function handle_trade_click() {
  if(!yourTurn) {
    fade_in_popup(3);
  }  else if(rollDice) {
    fade_in_popup(4);
  } else {
    isRightSidebarOpen = true;
    let button1 = document.getElementById("spend-button");
    let button2 = document.getElementById("use-button");
    let button3 = document.getElementById("trade-button");
    button1.style.backgroundColor = "#FFE4CD";
    button2.style.backgroundColor = "#FFE4CD";
    button3.style.backgroundColor = "#85BB65";

    let interface1 = document.getElementById("build-interface");
    let interface2 = document.getElementById("use-interface");
    let interface3 = document.getElementById("trade-interface");
    interface1.style.display = "none";
    interface2.style.display = "none";
    interface3.style.display = "inline-flex";
    update_gui();
  }
}

function handle_build_click() {
  if(!yourTurn) {
    fade_in_popup(3);
  } else if(rollDice) {
    fade_in_popup(4);
  } else {
    update_possible_buys();
    isRightSidebarOpen = true;
    let button1 = document.getElementById("spend-button");
    let button2 = document.getElementById("use-button");
    let button3 = document.getElementById("trade-button");
    button1.style.backgroundColor = "#85BB65";
    button2.style.backgroundColor = "#FFE4CD";
    button3.style.backgroundColor = "#FFE4CD";

    let interface1 = document.getElementById("build-interface");
    let interface2 = document.getElementById("use-interface");
    let interface3 = document.getElementById("trade-interface");
    interface1.style.display = "inline-flex";
    interface2.style.display = "none";
    interface3.style.display = "none";
    update_gui();

  }
}

function handle_use_click() {
  if(!yourTurn) {
    fade_in_popup(3);
  } else {
    isRightSidebarOpen = true;
    let button1 = document.getElementById("spend-button");
    let button2 = document.getElementById("use-button");
    let button3 = document.getElementById("trade-button");
    button1.style.backgroundColor = "#FFE4CD";
    button2.style.backgroundColor = "#85BB65";
    button3.style.backgroundColor = "#FFE4CD";

    let interface1 = document.getElementById("build-interface");
    let interface2 = document.getElementById("use-interface");
    let interface3 = document.getElementById("trade-interface");
    interface1.style.display = "none";
    interface2.style.display = "inline-flex";
    interface3.style.display = "none";
    update_gui();
  }
}

function fade_in_popup(message) {
  let popup = document.getElementsByClassName("popup")[0];
  if(message === 1) {
    popup.innerHTML = "You can't roll the dice right now."
  } else if (message === 2) {
    if(yourTurn) {
      popup.innerHTML = "You rolled " + aVsAn[rollOne + rollTwo] + " " + (rollOne + rollTwo) + ".";
    } else {
      popup.innerHTML = playerNames[whoseTurn] + " rolled " + aVsAn[rollOne + rollTwo] + " " + (rollOne + rollTwo) + ".";
    }
  } else if(message === 3) {
    popup.innerHTML = "It's not your turn.";
  } else if(message === 4) {
    popup.innerHTML = "Roll the dice first.";
  } else if(message === 5) {
    if(yourTurn) {
      popup.innerHTML = "You ended your turn.";
    } else {
      popup.innerHTML = playerNames[whoseTurn] + " ended their turn.";
    }
  }
  popup.id = "fade-in-popup";
  socket.emit("popupUp");
}

function fade_out_popup() {
  let popup = document.getElementsByClassName("popup")[0];
  popup.id = "fade-out-popup";
}

socket.on("closePopup", function() {
  fade_out_popup();
});

socket.on("whoseTurn", function(data) {
  whoseTurn = data;
});

socket.on("yourColor", function(data) {
  yourColor = data;
});

socket.on("endTurnPopup", function() {
  fade_in_popup(5);
});

socket.on("victoryPointsUpdate", function(data) {
  let p1 = document.getElementById("player1-victory-points");
  let p2 = document.getElementById("player2-victory-points");
  let p3 = document.getElementById("player3-victory-points");
  let p4 = document.getElementById("player4-victory-points");
  p1.innerHTML = "Victory Points: " + data[0];
  p2.innerHTML = "Victory Points: " + data[1];
  p3.innerHTML = "Victory Points: " + data[2];
  p4.innerHTML = "Victory Points: " + data[3];
});

function update_top_buttons() {
  let buildButton = document.getElementById("build-top");
  let useButton = document.getElementById("use-top");
  let tradeButton = document.getElementById("trade-top");
  let doRollImage = document.getElementById("do-roll-image");
  let doNotRollImage = document.getElementById("do-not-roll-image");
  let doNextTurnImage = document.getElementById("do-next-turn-image");
  let doNotNextTurnImage = document.getElementById("do-not-next-turn-image");

  if(!yourTurn) {
    buildButton.style.backgroundColor = "#C24641";
    useButton.style.backgroundColor = "#C24641";
    tradeButton.style.backgroundColor = "#C24641";
    doNotRollImage.style.display = "block";
    doNotNextTurnImage.style.display = "block";
    doRollImage.style.display = "none";
    doNextTurnImage.style.display = "none";

  } else {
    if(rollDice) {
      buildButton.style.backgroundColor = "#C24641";
      useButton.style.backgroundColor = "#85BB65";
      tradeButton.style.backgroundColor = "#C24641";
      doNotRollImage.style.display = "none";
      doNotNextTurnImage.style.display = "block";
      doRollImage.style.display = "block";
      doNextTurnImage.style.display = "none";
    } else {
      buildButton.style.backgroundColor = "#85BB65";
      useButton.style.backgroundColor = "#85BB65";
      tradeButton.style.backgroundColor = "#85BB65";
      doNotRollImage.style.display = "block";
      doNotNextTurnImage.style.display = "none";
      doRollImage.style.display = "none";
      doNextTurnImage.style.display = "block";
    }
  }
}



// var stateOfVertices = new Array(54).fill(1); // 0: Closed | 1: Open

// var mousePosition


// Assuming an array of 19 hex objects



var players = [];

// generatePlayers(players, board);

// drawGradient();

//--------------------------------------------

socket.on("playerNames", function(data) {
  playerNames = data;
});

socket.on("yourTurn", function() {
  gameStage = "normal";
  yourTurn = true;
  rollDice = true;
  update_gui();
  update_top_buttons();
  update_possible_buys();

});

socket.on("turnOver", function() {
  yourTurn = false;
  update_top_buttons();
  update_possible_buys();
});

socket.on("rollTheDice", function(data) {
  rollDice = false;
  rollOne = data[1][0];
  rollTwo = data[1][1];
  update_top_buttons();
  update_possible_buys();
  data[0].push(data[1][0]);
  data[0].push(data[1][1]);
  roll_dice_animation(data[0]);
});

socket.on("resourceCountUpdate", function(data) {
  // data[0] = brick count
  // data[1] = wood count
  // data[2] = wheat count
  // data[3] = sheep count
  // data[4] = stone count
  resources = data;
  var brickContainer = document.getElementById("brick-container").children[0];
  var woodContainer = document.getElementById("wood-container").children[0];
  var wheatContainer = document.getElementById("wheat-container").children[0];
  var sheepContainer = document.getElementById("sheep-container").children[0];
  var stoneContainer = document.getElementById("stone-container").children[0];
  var containers = [brickContainer, woodContainer, wheatContainer, sheepContainer, stoneContainer];

  for(let i = 0; i < containers.length; ++i) {
    containers[i].innerHTML = data[i];
  }

  var brickContainer2 = document.getElementById("brick-container-bottom").children[0];
  var woodContainer2 = document.getElementById("wood-container-bottom").children[0];
  var wheatContainer2 = document.getElementById("wheat-container-bottom").children[0];
  var sheepContainer2 = document.getElementById("sheep-container-bottom").children[0];
  var stoneContainer2 = document.getElementById("stone-container-bottom").children[0];
  var containers2 = [brickContainer2, woodContainer2, wheatContainer2, sheepContainer2, stoneContainer2];

  for(let i = 0; i < containers2.length; ++i) {
    containers2[i].innerHTML = data[i];
  }
  update_possible_buys();
});


socket.on("player_order", function(data) {
  let players = [document.getElementById("player-1").children[0].children[1], document.getElementById("player-2").children[0].children[1], document.getElementById("player-3").children[0].children[1], document.getElementById("player-4").children[0].children[1]];

  for(let i = 0; i < players.length; ++i) {
    let p = players[i];
    if(data[0][i] === "blue") {
      p.id = "basic-info-player-name-blue";
    }
    if(data[0][i] === "red") {
      p.id = "basic-info-player-name-red";
    }
    if(data[0][i] === "yellow") {
      p.id = "basic-info-player-name-yellow";
    }
    if(data[0][i] === "purple") {
      p.id = "basic-info-player-name-purple";
    }

    if(i === data[2]) {
      p.innerHTML = "You"
    } else {
      p.innerHTML = data[1][i];
    }
    // p.
    // if(data[1] === i) {
    //   let idName = "player-" + (i + 1);
    //   let p2 = document.getElementById(idName).children[0].children[0];
    //   p2.id = "basic-info-player-number-selected";
    // }
  }
});

socket.on("waitingPlayersCountUpdate", function(data) {
  var div = document.getElementById("lobbyText");
  div.innerHTML = "" + data + " / 4 Players";
});

socket.on("beginGame", function(data) {

  var div = document.getElementById("lobby");
  div.style.display = "none";
  var div2 = document.getElementById("content-container");
  div2.style.display = "flex";
  div2.style.flexWrap = "wrap";
  board = data;
  console.log(board);
  update_gui();
  update_top_buttons();
});

socket.on("initialSetup", function() {
  gameStage = "setup";
  placingSettlement = true;
  update_gui();
  update_top_buttons();
});

socket.on("secondsRemainingUpdate", function(data) {
  secondsRemaining = data[0];
  secondsRemainingColor = data[1];

  update_gui();
});

socket.on("boardUpdate", function(data) {
  board = data;
  let aE = [];
  for(let i = 0; i < board.settlements.length; ++i) {
    let s = board.settlements[i];
    if(s[1] === yourColor) {
      let edges = board.vertices[s[0]].connectedEdges;
      for(let j = 0; j < edges.length; ++j) {
        if(board.stateOfEdges[edges[j]]) {
          aE.push(edges[j]);
        }
      }
    }
  }
  for(let i = 0; i < board.cities.length; ++i) {
    let s = board.cities[i];
    if(s[1] === yourColor) {
      let edges = board.vertices[s[0]].connectedEdges;
      for(let j = 0; j < edges.length; ++j) {
        if(board.stateOfEdges[edges[j]]) {
          aE.push(edges[j]);
        }
      }
    }
  }
  availableEdges2 = aE;
  update_possible_buys();
  update_gui();
});

socket.on("placingSettlementUpdate", function(data) {
  placingSettlement = data[0];
  selectedVertex = data[1];
  update_gui();
});

socket.on("placingCityUpdate", function(data) {
  placingCity = data[0];
  selectedVertex = data[1];
  update_gui();
});

socket.on("stopPlacingRoad", function() {
  placingRoad = false;
  selectedEdge = null;
  update_gui();
});

var variableCanvas = document.getElementById("variable-canvas");

variableCanvas.addEventListener("mousedown", handle_mouse_down);

function handle_mouse_down(e) {
  // console.log(selectedVertex);
  if(placingSettlement) {
    let result = check_available_vertex_clicked(e.offsetX, e.offsetY);
    if(result != null) {
      cityOrSettlement = "settlement";
      placingSettlement = false;
      // console.log(result);
      selectedVertex = result;
      update_gui();
    }
  } else if(placingCity) {
    let result = check_available_vertex_clicked(e.offsetX, e.offsetY);
    if(result != null) {
      cityOrSettlement = "city";
      placingCity = false;
      // console.log(result);
      selectedVertex = result;
      update_gui();
    }
  }

  else if(placingRoad) {
    let result = check_available_road_clicked(e.offsetX, e.offsetY, availableEdges);
    if(result != null) {
      placingRoad = false;
      selectedEdge = result;
      update_gui();
    }
  }

  else if(selectedVertex !== null) {
    if(cityOrSettlement === "settlement") {
      let result = check_selected_vertex_box_clicked(selectedVertex, e.offsetX, e.offsetY);
      if(result === "red") {
        placingSettlement = true;
        selectedVertex = null;
        update_gui();
      } else if(result === "green") {
        socket.emit("settlementSelected", selectedVertex);
        placingSettlement = false;
        if(gameStage === "setup") {
          placingRoad = true;
          availableEdges = board.vertices[selectedVertex].connectedEdges;
        }
        selectedVertex = null;
        update_gui();
      }
    } else {
      let result = check_selected_vertex_box_clicked(selectedVertex, e.offsetX, e.offsetY);
      if(result === "red") {
        placingCity = true;
        selectedVertex = null;
        update_gui();
      } else if(result === "green") {
        socket.emit("citySelected", selectedVertex);
        placingCity = false;
        selectedVertex = null;
        update_gui();

      }
    }
    cityOrSettlement = null;
  }

  else if(selectedEdge !== null) {
    let result = check_selected_edge_box_clicked(selectedEdge, e.offsetX, e.offsetY);
    if(result === "red") {
      placingRoad = true;
      selectedEdge = null;
      update_gui();
    } else if(result === "green") {
      socket.emit("roadSelected", selectedEdge);
      placingRoad = false;
      if(gameStage === "setup") {
        socket.emit("endSetup");
      }
      selectedEdge = null;
      update_gui();
    }
  }
  // console.log(e.offsetX, e.offsetY);
}


// topCanvas.addEventListener("mousedown", handle_mouse_down);


//
// function handle_mouse_down(e) {
//   if(nextButton.isClicked(e.offsetX, e.offsetY)) {
//     getNext();
//   }
//   // console.log(e.offsetX, e.offsetY);
// }


function drawEverything() {
  canvasCxt.clearRect(0, 0, canvas.width, canvas.height);

  nextButton.updatePosition(canvas.width - 95, canvas.height - 75);
  // draw_game_board(canvas, false, false);
  // board.close_vertices(4);
  // close_vertices(stateOfVertices, 5);
  // draw_edges();
  draw_vertices2();
  nextButton.draw();
}



// initialize_positions_of_vertices(canvas);
// draw_game_board(canvas, false, false);
// // board.close_vertices(4);
// // close_vertices(stateOfVertices, 5);
// draw_edges();
// draw_vertices2();

// let banner = new Turn_Banner(topCanvas, "oof");
// banner.set_position();
// banner.draw(60);

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// canvasCxt.clearRect(0, 0, canvas.width, canvas.height);

// nextButton.draw();
// round_one();

var currentStage = "setup";


var currentPlayer = 3;
//
// async function round_one() {
//   for(let i = 0; i < players.length; ++i) {
//     // draw_banner(60, topCanvas);
//     // await sleep(3000);
//     // topCanvasCxt.clearRect(0, 0, canvas.width, canvas.height);
//     let player = players[i];
//     player.build_settlement();
//
//
//   }
// }



function getNext() {
  // board.stateOfVertices[players[currentPlayer].get_next_action()] = [currentPlayer, 1];
  // consol
  let v = players[currentPlayer].get_next_action("settlement");
  this.board.settlements.push([v, currentPlayer]);

  let e = players[currentPlayer].get_next_action("road");
  console.log(e);
  this.board.roads.push([e, currentPlayer]);
  canvasCxt.clearRect(0, 0, canvas.width, canvas.height);
  draw_game_board(canvas, false, false);
  draw_edges();
  draw_vertices2();

}

window.onresize = function(event) {
  update_gui();
}
