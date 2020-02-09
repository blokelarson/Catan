const ROW_WIDTHS = [3, 4, 5, 4, 3];
const ADJACENT_TILES = [[1, 3, 4], [0, 2, 4, 5], [1, 5, 6],
                             [0, 4, 7, 8], [0, 1, 3, 5, 8, 9], [1, 2, 4, 6, 9, 10], [2, 5, 10, 11],
                             [3, 8, 12], [3, 4, 7, 9, 12, 13], [4, 5, 8, 10, 13, 14], [5, 6, 9, 11, 14, 15], [6, 10, 15],
                             [7, 8, 13, 16], [8, 9, 12, 14, 16, 17], [9, 10, 13, 15, 17, 18], [10, 11, 14, 18],
                             [12, 13, 17], [13, 14, 16, 18], [14, 15, 17]];
const VERTEX_CONNECTIONS = [[[0, 0]], [[1, 0]], [[2, 0]],
                    [[0, 5]], [[0, 1], [1, 5]], [[1, 1], [2, 5]], [[2, 1]],
                    [[0, 4], [3, 0]], [[0, 2], [1, 4], [4, 0]], [[1, 2], [2, 4], [5, 0]], [[2, 2], [6, 0]],
                    [[3, 5]], [[0, 3], [3, 1], [4, 5]], [[1, 3], [4, 1], [5, 5]], [[2, 3], [5, 1], [6, 5]], [[6, 1]],
                    [[3, 4], [7, 0]], [[3, 2], [4, 4], [8, 0]], [[4, 2], [5, 4], [9, 0]], [[5, 2], [6, 4], [10, 0]], [[6, 2], [11, 0]],
                    [[7, 5]], [[3, 3], [7, 1], [8, 5]], [[4, 3], [8, 1], [9, 5]], [[5, 3], [9, 1], [10, 5]], [[6, 3], [10, 1], [11, 5]], [[11, 1]],
                    [[7, 4]], [[7, 2], [8, 4], [12, 0]], [[8, 2], [9, 4], [13, 0]], [[9, 2], [10, 4], [14, 0]], [[10, 2], [11, 4], [15, 0]], [[11, 2]],
                    [[7, 3], [12, 5]], [[8, 3], [12, 1], [13, 5]], [[9, 3], [13, 1], [14, 5]], [[10, 3], [14, 1], [15, 5]], [[11, 3], [15, 1]],
                    [[12, 4]], [[12, 2], [13, 4], [16, 0]], [[13, 2], [14, 4], [17, 0]], [[14, 2], [15, 4], [18, 0]], [[15, 2]],
                    [[12, 3], [16, 5]], [[13, 3], [16, 1], [17, 5]], [[14, 3], [17, 1], [18, 5]], [[15, 3], [18, 1]],
                    [[16, 4]], [[16, 2], [17, 4]], [[17, 2], [18, 4]], [[18, 2]],
                    [[16, 3]], [[17, 3]], [[18, 3]]];

const CONNECTED_EDGES = [[0, 1], [2, 3], [4, 5],
                     [0, 6], [1, 2, 7], [3, 4, 8], [5, 9],
                     [6, 10, 11], [7, 12, 13], [8, 14, 15], [9, 16, 17],
                     [10, 18], [11, 12, 19], [13, 14, 20], [15, 16, 21], [17, 22],
                     [18, 23, 24], [19, 25, 26], [20, 27, 28], [21, 29, 30], [22, 31, 32],
                     [23, 33], [24, 25, 34], [26, 27, 35], [28, 29, 36], [30, 31, 37], [32, 38],
                     [33, 39], [34, 40, 41], [35, 42, 43], [36, 44, 45], [37, 46, 47], [38, 47],
                     [39, 40, 49], [41, 42, 50], [43, 44, 51], [45, 46, 52], [47, 48, 53],
                     [49, 54], [50, 55, 56], [51, 57, 58], [52, 59, 60], [53, 61],
                     [54, 55, 62], [56, 57, 63], [58, 59, 64], [60, 61, 65],
                     [62, 66], [63, 67, 68], [64, 69, 70], [65, 71],
                     [66, 67], [68, 69], [70, 71]];

const EDGE_CONNECTIONS = [[[0, 5]], [[0, 0]], [[1, 5]], [[1, 0]], [[2, 5]], [[2, 0]],
                  [[0, 4]], [[0, 1], [1, 4]], [[1, 1], [2, 4]], [[2, 1]],
                  [[3, 5]], [[0, 3], [3, 0]], [[0, 2], [4, 5]], [[1, 3], [4, 0]], [[1, 2], [5, 5]], [[2, 3], [5, 0]], [[2, 2], [6, 5]], [[6, 0]],
                  [[3, 4]], [[3, 1], [4, 4]], [[4, 1], [5, 4]], [[5, 1], [6, 4]], [[6, 1]],
                  [[7, 5]], [[3, 3], [7, 0]], [[3, 2], [8, 5]], [[4, 3], [8, 0]], [[4, 2], [9, 5]], [[5, 3], [9, 0]], [[5, 2], [10, 5]], [[6, 3], [10, 0]], [[6, 2], [11, 5]], [[11, 0]],
                  [[7, 4]], [[7, 1], [8, 4]], [[8, 1], [9, 4]], [[9, 1], [10, 4]], [[10, 1], [11, 4]], [[11, 1]],
                  [[7, 3]], [[7, 2], [12, 5]], [[8, 3], [12, 0]], [[8, 2], [13, 5]], [[9, 3], [13, 0]], [[9, 2], [14, 5]], [[10, 3], [14, 0]], [[10, 2], [15, 5]], [[11, 3], [15, 0]], [[11, 2]],
                  [[12, 4]], [[12, 1], [13, 4]], [[13, 1], [14, 4]], [[14, 1], [15, 4]], [[15, 1]],
                  [[12, 3]], [[12, 2], [16, 5]], [[13, 3], [16, 0]], [[13, 2], [17, 5]], [[14, 3], [17, 0]], [[14, 2], [18, 5]], [[15, 3], [18, 0]], [[15, 2]],
                  [[16, 4]], [[16, 1], [17, 4]], [[17, 1], [18, 4]], [[18, 1]],
                  [[16, 3]], [[16, 2]], [[17, 3]], [[17, 2]], [[18, 3]], [[18, 2]]];

const CONNECTED_VERTICES = [[0, 3], [0, 4], [1, 4], [1, 5], [2, 5], [2, 6],
                   [3, 7], [4, 8], [5, 9], [6, 10],
                   [7, 11], [7, 12], [8, 12], [8, 13], [9, 13], [9, 14], [10, 14], [10, 15],
                   [11, 16], [12, 17], [13, 18], [14, 19], [15, 20],
                   [16, 21], [16, 22], [17, 22], [17, 23], [18, 23], [18, 24], [19, 24], [19, 25], [20, 25], [20, 26],
                   [21, 27], [22, 28], [23, 29], [24, 30], [25, 31], [26, 32],
                   [27, 33], [28, 33], [28, 34], [29, 34], [29, 35], [30, 35], [30, 36], [31, 36], [31, 37], [32, 37],
                   [33, 38], [34, 39], [35, 40], [36, 41], [37, 42],
                   [38, 43], [39, 43], [39, 44], [40, 44], [40, 45], [41, 45], [41, 46], [42, 46],
                   [43, 47], [44, 48], [45, 49], [46, 50],
                   [47, 51], [48, 51], [48, 52], [49, 52], [49, 53], [50, 53]];

module.exports = class Board {
  static get ROW_WIDTHS() {
    return ROW_WIDTHS;
  }

  static get ADJACENT_TILES() {
    return ADJACENT_TILES;
  }

  static get VERTEX_CONNECTIONS() {
    return VERTEX_CONNECTIONS;
  }

  static get CONNECTED_EDGES() {
    return CONNECTED_EDGES;
  }

  static get EDGE_CONNECTIONS() {
    return EDGE_CONNECTIONS;
  }

  static get CONNECTED_VERTICES() {
    return CONNECTED_VERTICES;
  }

  constructor(terrains, values) {
    this.tiles = new Array(19);
    this.vertices = new Array(54);
    this.edges = new Array(72);

    this.initialize(terrains, values);

    this.stateOfVertices = new Array(54).fill(1);
    this.settlements = [];
    this.cities = [];

    this.stateOfEdges = new Array(72).fill(1);
    this.roads = [];
  }

  close_vertices(baseVertexId) {
    var connectedEdges = this.vertices[baseVertexId].connectedEdges;
    for(let i = 0; i < connectedEdges.length; ++i) {
      let edge = this.edges[connectedEdges[i]];
      this.stateOfVertices[edge.connectedVertices[0]] = 0;
      this.stateOfVertices[edge.connectedVertices[1]] = 0;
    }
  }

  close_edge(edgeId) {
    this.stateOfEdges[edgeId] = 0;
  }

  initialize(terrains, values) {
    this.generateTiles(terrains, values);
    this.generateVertices();
    this.generateEdges();
  }

  generateTiles(terrains, values) {
    for(let tileId = 0; tileId < this.tiles.length; ++tileId) {
      let tile = new Tile(tileId, terrains[tileId], values[tileId], Board.ADJACENT_TILES[tileId]);
      this.tiles[tileId] = tile;
    }
  }

  generateVertices() {
    for(let vertexId = 0; vertexId < this.vertices.length; ++vertexId) {
      let connectedTiles = Board.VERTEX_CONNECTIONS[vertexId];
      let connectedEdges = Board.CONNECTED_EDGES[vertexId];
      let vertex = new Vertex(vertexId, connectedTiles, connectedEdges);
      for(let i = 0; i < connectedTiles.length; ++i) {
        let connectedTile = connectedTiles[i];
        this.tiles[connectedTile[0]].vertices[connectedTile[1]] = vertex;
      }
      this.vertices[vertexId] = vertex;
    }
  }

  generateEdges() {
    for(let edgeId = 0; edgeId < this.edges.length; edgeId++) {
      let connectedTiles = Board.EDGE_CONNECTIONS[edgeId];
      let connectedVertices = Board.CONNECTED_VERTICES[edgeId];
      let edge = new Edge(edgeId, connectedTiles, connectedVertices);
      for(let i = 0; i < connectedTiles.length; i++) {
        let connectedTile = connectedTiles[i];
        this.tiles[connectedTile[0]].edges[connectedTile[1]] = edge;
      }
      this.edges[edgeId] = edge;
    }
  }
}

class Tile {
  constructor(id, terrain, value, adjacentTiles) {
    this.id = id;
    this.terrain = terrain;
    this.value = value;
    this.adjacentTiles = adjacentTiles;

    this.vertices = [];
    this.edges = [];
  }
}

class Vertex {
  constructor(id, connectedTiles, connectedEdges) {
    this.id = id
    this.connectedTiles = connectedTiles;
    this.connectedEdges = connectedEdges;

    this.value = Math.floor(Math.random() * 3);
  }
}

class Edge {
    constructor(id, connectedTiles, connectedVertices) {
      this.id = id
      this.connectedTiles = connectedTiles;
      this.connectedVertices = connectedVertices;

      this.value = Math.floor(Math.random() * 2);
    }
}
