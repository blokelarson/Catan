const TILE_COLORS = {"brick": "#7B3F37", "wood": "#254117", "wheat": "#EDA55D", "sheep": "#A4A981", "ore": "#70726F", "desert": "#F5CBA7"};
const TILE_BORDER_COLOR = "#9B7653";

const TILE_VALUE_STAND_HEIGHT = 7;
const TILE_VALUE_STAND_DARK_COLOR = "#664B34";
const TILE_VALUE_STAND_LIGHT_COLOR = "#FFE4CD";
const TILE_VALUE_STAND_BORDER_SIZE = 2;
const TILE_VALUE_STAND_BORDER_COLOR = "#000000";
const TILE_VALUE_FONT_SIZE = 20;
const TILE_VALUE_FONT_COLORS = ["black", "red"];

const TOP_BAR_PERCENTAGE = 0.08;
const BOTTOM_BAR_PERCENTAGE = 0.08;

var boardHeight = window.innerHeight - window.innerHeight * (TOP_BAR_PERCENTAGE + BOTTOM_BAR_PERCENTAGE);
var tileSize = boardHeight / 10;



var constantCanvas = document.getElementById("constant-canvas");
var constantCanvasContext = constantCanvas.getContext("2d");
var variableCanvas = document.getElementById("variable-canvas");
var variableCanvasContext = variableCanvas.getContext("2d");

var positionsOfVertices = new Array(54);

function roll_dice_animation(diceToRoll) {
  var count = 0;
  var interval = setInterval(function() {
    if(count === 22) {
      fade_in_popup(2);
      clearInterval(interval);
    } else {
      draw_dice(variableCanvasContext, diceToRoll[count], diceToRoll[count + 1]);
      count += 2;
    }
  }, 75);
}

function check_available_vertex_clicked(mouseX, mouseY) {
  var circles = [];
  var circlesIndices = [];
  for(let i = 0; i < board.stateOfVertices.length; ++i) {
    if(board.stateOfVertices[i]) {
      circles.push(positionsOfVertices[i]);
      circlesIndices.push(i);
    }
  }
  for(let i = 0; i < circles.length; ++i) {
    let x = circles[i][0];
    let y = circles[i][1];
    let radius = 16;
    let distance =  Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
    if(distance <= radius) {
      return circlesIndices[i];
    }
  }
  return null;
}

function check_available_road_clicked(mouseX, mouseY, availableEdges) {
  var circles = [];
  var circlesIndices = [];
  for(let i = 0; i < availableEdges.length; ++i) {
    let edge = board.edges[availableEdges[i]];

    let p1 = positionsOfVertices[edge.connectedVertices[0]];
    let p2 = positionsOfVertices[edge.connectedVertices[1]];
    let position = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    circles.push(position);
    circlesIndices.push(availableEdges[i]);
  }
  for(let i = 0; i < circles.length; ++i) {
    let x = circles[i][0];
    let y = circles[i][1];
    let radius = 16;
    let distance =  Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
    if(distance <= radius) {
      return circlesIndices[i];
    }
  }
  return null;
}
// Have a red circle and a green circle next to thing


function intialize_board(board, placingSettlement, secondsRemaining, selectedVertex, placingRoad, availableEdges, selectedEdge, secondsRemainingColor, drawDice, rollOne, rollTwo, placingCity) {
  constantCanvasContext.clearRect(0, 0, constantCanvas.width, constantCanvas.height);
  variableCanvasContext.clearRect(0, 0, variableCanvas.width, variableCanvas.height);
  initialize_positions_of_vertices(board);
  draw_board(constantCanvasContext, board);
  if(secondsRemaining != null) {
    draw_timer(variableCanvasContext, secondsRemaining, secondsRemainingColor);
  }

  if(placingSettlement || placingCity) {
    draw_available_vertices(board);
  }


  if(selectedVertex !== null) {
    draw_selected_vertex(selectedVertex);
  }

  if(selectedEdge !== null) {
    draw_selected_edge(selectedEdge);
  }

  if(placingRoad) {
    draw_available_edges(board, availableEdges);
  }

  if(drawDice) {
    draw_dice(variableCanvasContext, rollOne, rollTwo);
  }
}

function check_selected_vertex_box_clicked(selectedVertex, mouseX, mouseY) {
  let vertexPosition = positionsOfVertices[selectedVertex];
  let greenPosition = [vertexPosition[0] + 16, vertexPosition[1] - 8];
  let redPosition = [vertexPosition[0] + 16, vertexPosition[1] + 8];
  if(mouseX >= greenPosition[0] - 8 && mouseX <= greenPosition[0] + 8 && mouseY >= greenPosition[1] - 8 && mouseY <= greenPosition[1] + 8) {
    return "green";
  } else if(mouseX >= redPosition[0] - 8 && mouseX <= redPosition[0] + 8 && mouseY >= redPosition[1] - 8 && mouseY <= redPosition[1] + 8) {
    return "red";
  }
  return null;
}

function check_selected_edge_box_clicked(selectedEdge, mouseX, mouseY) {
  let edge = board.edges[selectedEdge];
  let p1 = positionsOfVertices[edge.connectedVertices[0]];
  let p2 = positionsOfVertices[edge.connectedVertices[1]];
  let vertexPosition = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  let greenPosition = [vertexPosition[0] + 16, vertexPosition[1] - 8];
  let redPosition = [vertexPosition[0] + 16, vertexPosition[1] + 8];
  if(mouseX >= greenPosition[0] - 8 && mouseX <= greenPosition[0] + 8 && mouseY >= greenPosition[1] - 8 && mouseY <= greenPosition[1] + 8) {
    return "green";
  } else if(mouseX >= redPosition[0] - 8 && mouseX <= redPosition[0] + 8 && mouseY >= redPosition[1] - 8 && mouseY <= redPosition[1] + 8) {
    return "red";
  }
  return null;
}



function initialize_positions_of_vertices(board) {
  boardHeight = window.innerHeight - window.innerHeight * (TOP_BAR_PERCENTAGE + BOTTOM_BAR_PERCENTAGE);
  tileSize = boardHeight / 10;
  var canvas = document.getElementById("constant-canvas");
  var boardCenter = [canvas.width / 2, canvas.height / 2];
  var startX = boardCenter[0] - 2 * Math.sqrt(3) * tileSize;
  var startY = boardCenter[1] - 3 * tileSize;

  var rowWidths = [3, 4, 5, 4, 3];
  var tileCount = 0;

  for(let row = 0; row < 5; row++) {
    var xOffset;
    if(rowWidths[row] === 3) {
      xOffset = startX + Math.sqrt(3) * tileSize;
    } else if(rowWidths[row] === 4) {
      xOffset = startX + (Math.sqrt(3) * tileSize) / 2;
    } else {
      xOffset = startX;
    }

    var yOffset = startY + row * (tileSize * 1.5);

    for(let column = 0; column < rowWidths[row]; column++) {
      let positions = get_hexagon_vertices({x: xOffset, y: yOffset}, tileSize);
      let tileV = board.tiles[tileCount].vertices;
      for(let i = 0; i < tileV.length; ++i) {
        positionsOfVertices[tileV[i].id] = positions[i];
      }

      xOffset += Math.sqrt(3) * tileSize;
      tileCount++;
    }
  }
}

function draw_board(canvasContext, board) {
  for(let i = 0; i < board.tiles.length; ++i) {
    draw_tile(canvasContext, board, i);
  }
  draw_roads(board.roads);
  draw_settlements(board.settlements);
  draw_cities(board.cities);
}

function draw_settlements(settlements) {
  for(let i = 0; i < settlements.length; ++i) {
    let data = settlements[i];
    let x = positionsOfVertices[data[0]][0];
    let y = positionsOfVertices[data[0]][1];
    let color = data[1];
    draw_settlement(variableCanvasContext, x, y, color);
  }
}

function draw_cities(cities) {
  for(let i = 0; i < cities.length; ++i) {
    let data = cities[i];
    let x = positionsOfVertices[data[0]][0];
    let y = positionsOfVertices[data[0]][1];
    let color = data[1];
    draw_city(variableCanvasContext, x, y, color);
  }
}

function draw_settlement(canvasContext, x, y, color) {
  x = x - 3;
  y = y + 5;
  canvasContext.fillStyle = color;
  canvasContext.lineWidth = 3;
  canvasContext.beginPath();
  canvasContext.moveTo(x - 6, y + 5);
  canvasContext.lineTo(x + 6, y + 5);
  canvasContext.lineTo(x + 6, y - 5);
  canvasContext.lineTo(x, y - 10);
  canvasContext.lineTo(x - 6, y - 5);
  canvasContext.lineTo(x - 6, y + 5);
  canvasContext.closePath();
  canvasContext.fill();
  canvasContext.stroke();

  canvasContext.beginPath();
  canvasContext.lineWidth = 3;
  canvasContext.moveTo(x + 6, y + 5);
  canvasContext.lineTo(x + 12, y);
  canvasContext.lineTo(x + 12, y - 10);
  canvasContext.lineTo(x + 6, y - 5);
  canvasContext.lineTo(x + 6, y + 5);
  // canvasCxt.lineTo(x - 12, y + 10);
  canvasContext.closePath();
  canvasContext.fill();
  canvasContext.stroke();

  canvasContext.beginPath();
  canvasContext.lineWidth = 3;
  canvasContext.moveTo(x + 6, y - 5);
  canvasContext.lineTo(x + 12, y - 10);
  canvasContext.lineTo(x + 6, y - 15);
  canvasContext.lineTo(x, y - 10);
  canvasContext.lineTo(x + 6, y - 5);
  // canvasCxt.lineTo(x - 12, y + 10);
  canvasContext.closePath();
  canvasContext.fill();
  canvasContext.stroke();
  // canvasCxt.moveTo(x + 12, y + 10);
  // canvasCxt.moveTo(x + 12, y + 10);
  // canvasCxt.lineTo(x + 22, y);
  // canvasCxt.lineTo(x + 22, y - 20);
  // canvasCxt.lineTo(x + 12, y - 10);
  // // canvasCxt.fill();
  // // canvasCxt.stroke();
  // canvasCxt.moveTo(x, y - 20);
  // canvasCxt.lineTo(x + 12, y - 30);
  // canvasCxt.lineTo(x + 22, y - 20);
  // // canvasCxt.fill();
  // canvasCxt.stroke();
  // canvasCxt.closePath();
}

function draw_city(canvasContext, x, y, color) {
  x = x - 6;
  y = y + 10;
  canvasContext.fillStyle = color;
  canvasContext.lineWidth = 3;
  canvasContext.beginPath();
  canvasContext.moveTo(x - 12, y + 10);
  canvasContext.lineTo(x + 12, y + 10);
  canvasContext.lineTo(x + 12, y - 10);
  canvasContext.lineTo(x, y - 20);
  canvasContext.lineTo(x - 12, y - 10);
  canvasContext.lineTo(x - 12, y + 10);
  canvasContext.closePath();
  canvasContext.fill();
  canvasContext.stroke();

  canvasContext.beginPath();
  canvasContext.lineWidth = 3;
  canvasContext.moveTo(x + 12, y + 10);
  canvasContext.lineTo(x + 24, y);
  canvasContext.lineTo(x + 24, y - 20);
  canvasContext.lineTo(x + 12, y - 10);
  canvasContext.lineTo(x + 12, y + 10);
  // canvasCxt.lineTo(x - 12, y + 10);
  canvasContext.closePath();
  canvasContext.fill();
  canvasContext.stroke();

  canvasContext.beginPath();
  canvasContext.lineWidth = 3;
  canvasContext.moveTo(x + 12, y - 10);
  canvasContext.lineTo(x + 24, y - 20);
  canvasContext.lineTo(x + 12, y - 30);
  canvasContext.lineTo(x, y - 20);
  canvasContext.lineTo(x + 12, y - 10);
  // canvasCxt.lineTo(x - 12, y + 10);
  canvasContext.closePath();
  canvasContext.fill();
  canvasContext.stroke();
  // canvasCxt.moveTo(x + 12, y + 10);
  // canvasCxt.moveTo(x + 12, y + 10);
  // canvasCxt.lineTo(x + 22, y);
  // canvasCxt.lineTo(x + 22, y - 20);
  // canvasCxt.lineTo(x + 12, y - 10);
  // // canvasCxt.fill();
  // // canvasCxt.stroke();
  // canvasCxt.moveTo(x, y - 20);
  // canvasCxt.lineTo(x + 12, y - 30);
  // canvasCxt.lineTo(x + 22, y - 20);
  // // canvasCxt.fill();
  // canvasCxt.stroke();
  // canvasCxt.closePath();
}

function draw_timer(canvasContext, secondsRemaining, secondsRemainingColor) {
  var position = [75, constantCanvas.height - 75];
  draw_circle(canvasContext, position, 50, "#FFE4CD", 2, "black");
  draw_timer_text(canvasContext, position, secondsRemaining, 44);
  draw_real_rectangle(canvasContext, [75, constantCanvas.height - 50], 60, 10, secondsRemainingColor, 2, "black");
}

function draw_tile(canvasContext, board, tileId) {
  var verticesToDraw = board.tiles[tileId].vertices;
  var positions = [];
  for(let i = 0; i < verticesToDraw.length; ++i) {
    positions.push(positionsOfVertices[verticesToDraw[i].id]);
  }
  var tileColor = TILE_COLORS[board.tiles[tileId].terrain];
  var borderColor = TILE_BORDER_COLOR;
  var borderSize = 8; // This should vary with hexagon size.

  var tileValue = board.tiles[tileId].value;

  draw_hexagon(canvasContext, positions, tileColor, borderSize, borderColor);
  if(tileValue !== 0) {
    draw_tile_value(canvasContext, positions, tileValue);
  }
}

function draw_tile_value(canvasContext, positions, tileValue) {
  for(let i = 0; i < TILE_VALUE_STAND_HEIGHT - 1; ++i) {
    let position = [(positions[1][0] + positions[4][0]) / 2, ((positions[0][1] + positions[3][1]) / 2) - ((TILE_VALUE_STAND_HEIGHT - 1) / 2 - 1) + i];
    draw_circle(canvasContext, position, 15, TILE_VALUE_STAND_DARK_COLOR, TILE_VALUE_STAND_BORDER_SIZE, TILE_VALUE_STAND_BORDER_COLOR);
  }
  var position = [(positions[1][0] + positions[4][0]) / 2, ((positions[0][1] + positions[3][1]) / 2) - (TILE_VALUE_STAND_HEIGHT - 1) / 2];
  draw_circle(canvasContext, position, 15, TILE_VALUE_STAND_LIGHT_COLOR, TILE_VALUE_STAND_BORDER_SIZE, TILE_VALUE_STAND_BORDER_COLOR);
  draw_text(canvasContext, position, tileValue, TILE_VALUE_FONT_SIZE);
}


function draw_hexagon(canvasContext, positions, color, borderSize, borderColor) {
  canvasContext.fillStyle = color;
  canvasContext.lineWidth = borderSize;
  canvasContext.strokeStyle = borderColor;
  canvasContext.beginPath();
  canvasContext.moveTo(positions[0][0], positions[0][1]);
  for(let i = 1; i < positions.length; ++i) {
    canvasContext.lineTo(positions[i][0], positions[i][1]);
  }
  canvasContext.closePath();
  canvasContext.fill();
  canvasContext.stroke();
}


function draw_circle(canvasContext, position, radius, color, borderSize, borderColor) {
  canvasContext.fillStyle = color;
  canvasContext.lineWidth = borderSize;
  canvasContext.strokeStyle = borderColor;
  canvasContext.beginPath();
  canvasContext.arc(position[0], position[1], radius, 0, Math.PI * 2);
  canvasContext.closePath();
  canvasContext.fill();
  canvasContext.stroke();
}

function draw_rectangle(canvasContext, position, width, color, borderSize, borderColor) {
  canvasContext.fillStyle = color;
  canvasContext.lineWidth = borderSize;
  canvasContext.strokeStyle = borderColor;
  canvasContext.beginPath();
  canvasContext.rect(position[0] - width / 2, position[1] - width / 2, width, width);
  canvasContext.closePath();
  canvasContext.fill();
  canvasContext.stroke();
}

function draw_real_rectangle(canvasContext, position, width, height, color, borderSize, borderColor) {
  canvasContext.fillStyle = color;
  canvasContext.lineWidth = borderSize;
  canvasContext.strokeStyle = borderColor;
  canvasContext.beginPath();
  canvasContext.rect(position[0] - width / 2, position[1] - height / 2, width, height);
  canvasContext.closePath();
  canvasContext.fill();
  canvasContext.stroke();
}

function draw_text(canvasContext, position, value, size) {
  if(value === 6 || value === 8) {
    canvasContext.font = "bold italic " + size + "px monospace";
    canvasContext.fillStyle = "#C24641";
  } else {
    canvasContext.font = "bold " + size + "px monospace";
    canvasContext.fillStyle = "black";
  }
  canvasContext.textAlign = "center";
  canvasContext.textBaseline = "middle";
  canvasContext.fillText(value, position[0], position[1]);
}

function draw_timer_text(canvasContext, position, value, size) {
  if(value <= 5) {
    canvasContext.font = "bold italic " + size + "px monospace";
    canvasContext.fillStyle = "#C24641";
  } else {
    canvasContext.font = "bold italic " + size + "px monospace";
    canvasContext.fillStyle = "black";
  }
  canvasContext.textAlign = "center";
  canvasContext.textBaseline = "middle";
  canvasContext.fillText(value, position[0], position[1]);
}


function get_hexagon_vertices(position, radius) {
  var vertices = [];
  for(let i = 0; i < 6; i++) {
    let angle = ((Math.PI / 3) * i) - (Math.PI / 6) * 3;
    vertices.push([position.x + radius * Math.cos(angle), position.y + radius * Math.sin(angle)]);
  }
  return vertices;
};

function draw_selected_vertex(index) {
  let position = positionsOfVertices[index];
  let radius = 16;
  let color = "rgba(133, 187, 101, 0.6)";
  let borderSize = 2;
  let borderColor = "#000000";
  draw_circle(variableCanvasContext, position, radius, color, borderSize, borderColor);

  let position2 = [position[0] + 16, position[1] - 8];
  let position3 = [position[0] + 16, position[1] + 8];
  let radius2 = 16;
  let color2 = "rgba(133, 187, 101, 1)";
  let color3 = "#C11B17"; //red
  let borderSize2 = 2;
  let borderColor2 = "#000000";
  draw_rectangle(variableCanvasContext, position2, radius2, color2, borderSize2, borderColor2);
  draw_rectangle(variableCanvasContext, position3, radius2, color3, borderSize2, borderColor2);
}

function draw_selected_edge(index) {
  let edge = board.edges[index];
  let p1 = positionsOfVertices[edge.connectedVertices[0]];
  let p2 = positionsOfVertices[edge.connectedVertices[1]];
  let position = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  let radius = 16;
  let color = "rgba(133, 187, 101, 0.6)";
  let borderSize = 2;
  let borderColor = "#000000";

  draw_circle(variableCanvasContext, position, radius, color, borderSize, borderColor);

  let position2 = [position[0] + 16, position[1] - 8];
  let position3 = [position[0] + 16, position[1] + 8];
  let radius2 = 16;
  let color2 = "rgba(133, 187, 101, 1)";
  let color3 = "#C11B17"; //red
  let borderSize2 = 2;
  let borderColor2 = "#000000";
  draw_rectangle(variableCanvasContext, position2, radius2, color2, borderSize2, borderColor2);
  draw_rectangle(variableCanvasContext, position3, radius2, color3, borderSize2, borderColor2);
}

function draw_available_vertices(board) {
  for(let i = 0; i < board.stateOfVertices.length; ++i) {
    if(board.stateOfVertices[i]) {
      let position = positionsOfVertices[i];
      let radius = 16;
      let color = "rgba(133, 187, 101, 0.6)";
      let borderSize = 2;
      let borderColor = "#000000";
      draw_circle(variableCanvasContext, position, radius, color, borderSize, borderColor);
    }
  }
}

function draw_available_edges(board, availableEdges) {
  for(let i = 0; i < availableEdges.length; ++i) {
    let edge = board.edges[availableEdges[i]];
    // let edgeLocation = edge.connectedTiles[0][1];
    let p1 = positionsOfVertices[edge.connectedVertices[0]];
    let p2 = positionsOfVertices[edge.connectedVertices[1]];
    let position = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    let color = "rgba(133, 187, 101, 0.6)";
    let borderSize = 2;
    let borderColor = "#000000";
    draw_circle(variableCanvasContext, position, 16, color, borderSize, borderColor);
  }
}

function draw_edges() {
  for(let i = 0; i < board.roads.length; ++i) {
    console.log(board.roads);
    let edge = board.edges[board.roads[i][0]];
    let edgeLocation = edge.connectedTiles[0][1];
    let p1 = positionsOfVertices[edge.connectedVertices[0]];
    let p2 = positionsOfVertices[edge.connectedVertices[1]];

    draw_road(edgeLocation, p1, p2, players[board.roads[i][1]].color);
  }
}

function draw_roads(data) {
  for(let i = 0; i < data.length; ++i) {
    let edge = board.edges[data[i][0]];
    let edgeLocation = edge.connectedTiles[0][1];
    let p1 = positionsOfVertices[edge.connectedVertices[0]];
    let p2 = positionsOfVertices[edge.connectedVertices[1]];
    let color = data[i][1];

    draw_road(variableCanvasContext, edgeLocation, p1, p2, color);
  }
}

function draw_road(canvasContext, edgeLocation, pos1, pos2, color) {
  var points = [];
  if(edgeLocation === 2 || edgeLocation === 5) {
    var p1 = [pos1[0] - 3, pos1[1] - 3];
    var p2 = [pos1[0] + 3, pos1[1] + 3];
    var p3 = [pos2[0] + 3, pos2[1] + 3];
    var p4 = [pos2[0] - 3, pos2[1] - 3];
  } else if(edgeLocation === 0 || edgeLocation === 3) {
    var p1 = [pos1[0] - 3, pos1[1] + 3];
    var p2 = [pos1[0] + 3, pos1[1] - 3];
    var p3 = [pos2[0] + 3, pos2[1] - 3];
    var p4 = [pos2[0] - 3, pos2[1] + 3];
  } else if(edgeLocation === 1 || edgeLocation === 4) {
    var p1 = [pos1[0] - 5, pos1[1]];
    var p2 = [pos1[0] + 5, pos1[1]];
    var p3 = [pos2[0] + 5, pos2[1]];
    var p4 = [pos2[0] - 5, pos2[1]];
  }
  points = [p1, p2, p3, p4];
  canvasContext.beginPath();
  canvasContext.fillStyle = color;
  canvasContext.lineWidth = 2;
  canvasContext.moveTo(points[0][0], points[0][1]);
  for(let i = 0; i < 4; ++i) {
    canvasContext.lineTo(points[i][0], points[i][1]);
  }
  canvasContext.lineTo(points[0][0], points[0][1]);
  canvasContext.stroke();
  canvasContext.fill();
  canvasContext.closePath();
}

function draw_dice(canvasContext, rollOne, rollTwo) {
  var position = [constantCanvas.width - 75, constantCanvas.height - 75];
  draw_circle(canvasContext, position, 50, "#6F4E37", 2, "black");
  draw_rectangle(canvasContext, [constantCanvas.width - 97, constantCanvas.height - 75], 34, "#FFE4CD", 2, "black");
  draw_rectangle(canvasContext, [constantCanvas.width - 53, constantCanvas.height - 75], 34, "#FFE4CD", 2, "black");
  draw_roll_value(canvasContext, [constantCanvas.width - 97, constantCanvas.height - 75], rollOne);
  draw_roll_value(canvasContext, [constantCanvas.width - 53, constantCanvas.height - 75], rollTwo);

}

function draw_roll_value(canvasContext, position, value) {
  if(value === 1) {
    draw_circle(canvasContext, position, 3, "black", 1, "black");
  } else if(value === 2) {
    draw_circle(canvasContext, [position[0] - 9, position[1] - 9], 3, "black", 1, "black");
    draw_circle(canvasContext, [position[0] + 9, position[1] + 9], 3, "black", 1, "black");
  } else if(value === 3) {
    draw_circle(canvasContext, [position[0] - 9, position[1] - 9], 3, "black", 1, "black");
    draw_circle(canvasContext, [position[0] + 9, position[1] + 9], 3, "black", 1, "black");
    draw_circle(canvasContext, position, 3, "black", 1, "black");
  } else if(value === 4) {
    draw_circle(canvasContext, [position[0] - 9, position[1] - 9], 3, "black", 1, "black");
    draw_circle(canvasContext, [position[0] + 9, position[1] + 9], 3, "black", 1, "black");
    draw_circle(canvasContext, [position[0] - 9, position[1] + 9], 3, "black", 1, "black");
    draw_circle(canvasContext, [position[0] + 9, position[1] - 9], 3, "black", 1, "black");
  } else if(value === 5) {
    draw_circle(canvasContext, [position[0] - 9, position[1] - 9], 3, "black", 1, "black");
    draw_circle(canvasContext, [position[0] + 9, position[1] + 9], 3, "black", 1, "black");
    draw_circle(canvasContext, [position[0] - 9, position[1] + 9], 3, "black", 1, "black");
    draw_circle(canvasContext, [position[0] + 9, position[1] - 9], 3, "black", 1, "black");
    draw_circle(canvasContext, position, 3, "black", 1, "black");
  } else if(value === 6) {
    draw_circle(canvasContext, [position[0] - 9, position[1] - 9], 3, "#C24641", 1, "black");
    draw_circle(canvasContext, [position[0] + 9, position[1] + 9], 3, "#C24641", 1, "black");
    draw_circle(canvasContext, [position[0] - 9, position[1] + 9], 3, "#C24641", 1, "black");
    draw_circle(canvasContext, [position[0] + 9, position[1] - 9], 3, "#C24641", 1, "black");
    draw_circle(canvasContext, [position[0] - 9, position[1]], 3, "#C24641", 1, "black");
    draw_circle(canvasContext, [position[0] + 9, position[1]], 3, "#C24641", 1, "black");
  }
}
