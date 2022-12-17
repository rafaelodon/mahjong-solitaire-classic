/* 
 * Mahjong Solitarie Classic
 *
 * By Rafael Odon (2022)
 * odon.rafael@gmail.com
 * 
 * Notes:
 * - There are 2 main structures: a list of tiles and a board.
 * - The board is a 3d matrix where tiles are placed and stacked.
 * - A tile is placed at [z][y][x] board coordinate and has a 2x2 size.
 * - Every board cell that owns a tile has a reference to it. 
 * - When tiles are matched, their references are removed from the board but they
 *   keep existing on the tiles list and marked as 'removed'.
 */

// board matrix dimension constants
var MAX_Z = 5; // the number of tiles levels + 1
var MAX_Y = 17; // twice the number of rows + 1
var MAX_X = 30; // twice the number of cols

function initGameWithClassicDisposition() {

    // TODO: generate only solvables boards...    

    var tiles = generateRandomTilesArray();    
    var board = generateEmptyBoard();

    // a shallow copy to unstack tiles while filling the board
    var tilesStack = tiles.map((x) => x); 

    //central stacked rectangles
    fillBoard(board, tilesStack, 7, 1, 21, 15, 0);
    fillBoard(board, tilesStack, 9, 3, 19, 13, 1);
    fillBoard(board, tilesStack, 11, 5, 17, 11, 2);
    fillBoard(board, tilesStack, 13, 7, 15, 9, 3);
    fillBoard(board, tilesStack, 14, 8, 14, 8, 4);

    //1st line extra tiles
    fillBoard(board, tilesStack, 3, 1, 5, 1, 0);
    fillBoard(board, tilesStack, 23, 1, 25, 1, 0);

    //3nd line extra tiles
    fillBoard(board, tilesStack, 5, 5, 5, 5, 0);
    fillBoard(board, tilesStack, 23, 5, 23, 5, 0);

    //4th and 5th lines extra tiles
    fillBoard(board, tilesStack, 3, 7, 5, 9, 0);
    fillBoard(board, tilesStack, 23, 7, 25, 9, 0);

    //4th and 5th lines blocking mid tiles
    fillBoard(board, tilesStack, 1, 8, 1, 8, 0);
    fillBoard(board, tilesStack, 27, 8, 29, 8, 0);

    //6th line extra tiles
    fillBoard(board, tilesStack, 5, 11, 5, 11, 0);
    fillBoard(board, tilesStack, 23, 11, 23, 11, 0);

    //8th line extra tiles
    fillBoard(board, tilesStack, 3, 15, 5, 15, 0);
    fillBoard(board, tilesStack, 23, 15, 25, 15, 0);

    sortTilesInRenderingOrder(tiles);

    // return the game state
    return {
        starTime: Date.now(),
        board: board,
        tiles: tiles,
        cursor: undefined,
        cursorTile: undefined,
        selectedTile: undefined
    }
}

function generateEmptyBoard() {
    var board = new Array(MAX_Z);
    for (var z = 0; z < board.length; z++) {
        board[z] = new Array(MAX_Y);
        for (var y = 0; y < board[z].length; y++) {
            board[z][y] = new Array(MAX_X);
        }
    }
    return board;
}

function generateRandomTilesArray() {
    
    // Generates a symbol sequence based on the listed tiles and theirs counts
    var tiles = [];
    Object.keys(TILES_TYPES).forEach((key) => {        
        for(var j=0; j<TILES_TYPES[key].count; j++){
            // the tile initial state
            tiles.push({
                tileType: TILES_TYPES[key],
                x: undefined,
                y: undefined,
                z: undefined,
                removed: false,
                alpha: 1,                
            });
        }
    });

    // Shuffle the symbols
    tiles.sort((a, b) => 0.5 - Math.random());    

    return tiles;
}

// Create tiles on the given board rect
function fillBoard(board, tiles, x1, y1, x2, y2, z) {
    for (var y = y1; y <= y2; y += 2) {
        for (var x = x1; x <= x2; x += 2) {
            var tile = tiles.pop();
            tile.x = x;
            tile.y = y;
            tile.z = z;                
            board[z][y][x] = tile;
            board[z][y + 1][x] = tile;
            board[z][y][x + 1] = tile;
            board[z][y + 1][x + 1] = tile;            
        }
    }
}

// Sorts the tiles in rendereing order (top-bottom, left-right, down-up)
function sortTilesInRenderingOrder(tiles) {
    tiles.sort(function (a, b) {
        var rZ = a.z - b.z;
        var rY = b.y - a.y;
        var rX = b.x - a.x;
        return rZ != 0 ? rZ : rX != 0 ? rX : rY
    })      
}

function isTileFree(tile) {
    return tile &&
        !tile.removed &&
        !isTileBelowAnother(tile) &&
        !isTileBetweenOthers(tile);
}

function isTileBelowAnother(tile) {
    var pX = tile.x;
    var pY = tile.y;
    var pZ = tile.z;
    var board = gameState.board;

    return board[pZ + 1] && // the board has a level above        
        ((board[pZ + 1][pY] && // check same line
            (board[pZ + 1][pY][pX] || board[pZ + 1][pY][pX + 1])) ||
        (board[pZ + 1][pY + 1] && // check next line
            (board[pZ + 1][pY + 1][pX] || board[pZ + 1][pY + 1][pX + 1])));
}

function isTileBetweenOthers(tile) {
    var board = gameState.board;
    return (board[tile.z][tile.y][tile.x - 1] || board[tile.z][tile.y + 1][tile.x - 1]) && // tile to the left
        (board[tile.z][tile.y][tile.x + 2] || board[tile.z][tile.y + 1][tile.x + 2]); // tile to right
}

function onMouseMove(e) {
    e.stopPropagation();
    gameState.cursor = {
        x: e.offsetX,
        y: e.offsetY
    };
}

function onMouseOut() {
    gameState.cursor = undefined;
}

function onMouseDown(e) {
    e.stopPropagation();
    updateCursorTile();
    selectCursorTile();
}

// check wich tile is under the cursor in a top-down approach
function updateCursorTile() {
    if (gameState.cursor) {
        for (var cZ = MAX_Z - 1; cZ >= 0; cZ--) {
            // calculate the tile x,y considering the stack level offset
            var cX = Math.floor((gameState.cursor.x - (cZ + 1) * gameState.tileThickness - gameState.tileThickness) / gameState.tileWidth * 2);
            var cY = Math.floor((gameState.cursor.y - (cZ + 1) * gameState.tileThickness - gameState.tileThickness) / gameState.tileHeight * 2);
            if (cX >= 0 && cY >= 0 && cY < MAX_Y && cX <= MAX_X) {
                var tile = gameState.board[cZ][cY][cX];
                if (isTileFree(tile, gameState.board)) {
                    gameState.cursorTile = tile;
                    break;
                } else {
                    gameState.cursorTile = undefined;
                }
            }
        }
    }
}

// try to select the current cursor tile. if there's another tile selected,
// check if they are a pair to be removed from the board.
function selectCursorTile() {    
    // tile pair check
    if(gameState.cursorTile){
        if (gameState.selectedTile &&
            gameState.cursorTile != gameState.selectedTile &&
            gameState.cursorTile.tileType.group == gameState.selectedTile.tileType.group) {
                SOUND_FX["vanish"].play();
                removeFromBoard(gameState.selectedTile, gameState.board);
                removeFromBoard(gameState.cursorTile, gameState.board);                                         
                gameState.selectedTile = undefined;
                calculateMovesLeft();
                return;
            }                 
            
        // if no removal happend, selects the cursor tile
        SOUND_FX["click"].play();
        gameState.selectedTile = gameState.cursorTile; 
    }else{
        gameState.selectedTile = undefined;
    }              
}

// Remove a tile from the board
function removeFromBoard(tile) {    
    var x = tile.x;
    var y = tile.y;
    var z = tile.z;
    gameState.board[z][y][x] = undefined;
    gameState.board[z][y + 1][x] = undefined;
    gameState.board[z][y][x + 1] = undefined;
    gameState.board[z][y + 1][x + 1] = undefined;
    tile.removed = true;
}

function onResize() {
    calculateDimensions();
    updateAndRender();
}

// refresh canvas size and calculate tile dimensions to fit the window
function calculateDimensions(){
    
    var width = window.innerWidth;
    var height = window.innerHeight;
    var ratio = width/height;
    console.log(width, height, ratio);
    if(ratio >= 16/9){
        canvas.height = height;
        canvas.width = height * 16/9;        
    }else{        
        canvas.width = width;
        canvas.height = width * 9/16;        
    }

    gameState.ratio = canvas.height / canvas.width;
    gameState.tileWidth = canvas.width / MAX_X * 1.8;
    gameState.tileHeight = gameState.tileWidth * gameState.ratio * 1.8;
    gameState.tileThickness = gameState.tileWidth / 8 * gameState.ratio;    
}

function calculateMovesLeft(){
    //TODO: improve complexity
    var freeTiles = gameState.tiles.filter((p) => isTileFree(p, gameState.board));        
    var movesCount = 0;
    freeTiles.forEach((current) => {
        movesCount += freeTiles.filter((other) => current != other 
            && other.tileType.group == current.tileType.group).length;
    });
    gameState.movesAvailable = movesCount/2;
}

function updateAndRender() {

    updateCursorTile();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // moves left            
    if(gameState.movesAvailable != undefined){                        
        var size = gameState.tileHeight/4;
        ctx.font = size+"px sans-serif";
        ctx.fillStyle = "black";
        if(gameState.movesAvailable > 0){
            ctx.fillText("Moves available: "+gameState.movesAvailable, size/2, size);
        }else{
            ctx.fillText("Game over! Refresh (F5) to restart the game. ", size/2, size);
        }
    }

    // tiles
    var tileWidth = gameState.tileWidth;
    var tileHeight = gameState.tileHeight;
    var tileThickness = gameState.tileThickness;
    gameState.tiles.forEach((tile) => {        
        if (tile.alpha > 0)

            ctx.lineWidth = 0.1; {

            // tile removal animation
            if (tile.removed) {
                tile.alpha = tile.alpha * 0.8;
                if (tile.alpha < 0.01) {
                    tile.alpha = 0;
                }
            }
            ctx.globalAlpha = tile.alpha;

            // translate to the tile position
            var pZ = (tile.z + 1) * tileThickness;
            var pX = tile.x * tileWidth / 2 + pZ;
            var pY = tile.y * tileHeight / 2 + pZ;
            ctx.translate(pX, pY);

            // shadow
            var shadowColor = "rgb(100,100,100,1)";
            ctx.fillStyle = shadowColor;
            ctx.shadowBlur = tileThickness * 2;
            ctx.shadowColor = shadowColor;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillRect(0, 0, tileWidth, tileHeight);
            ctx.shadowBlur = 0;

            // upper side
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(tileWidth, 0);
            ctx.lineTo(tileWidth + tileThickness, tileThickness);
            ctx.lineTo(tileThickness, tileThickness);
            ctx.lineTo(0, 0);
            var gray = 150 + (tile.z * 5);
            ctx.fillStyle = "rgb(" + gray + "," + gray + "," + gray + ",1)";
            ctx.fill();
            ctx.stroke();

            // left side
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(tileThickness, tileThickness);
            ctx.lineTo(tileThickness, tileHeight + tileThickness);
            ctx.lineTo(0, tileHeight);
            ctx.lineTo(0, 0);
            var gray = 100 + (tile.z * 5);
            ctx.fillStyle = "rgb(" + gray + "," + gray + "," + gray + ",1)";
            ctx.fill();
            ctx.stroke();

            // top
            ctx.beginPath();
            ctx.rect(tileThickness, tileThickness, tileWidth, tileHeight);
            var gray = 255 - (35 / (tile.z + 1)); // diferent shades for every stack level
            if (tile == gameState.selectedTile) {
                ctx.fillStyle = "#7ABA7A";
            } else if (tile == gameState.cursorTile) {
                ctx.fillStyle = "#BDAEC6";
            } else {
                ctx.fillStyle = "rgb(" + gray + "," + gray + "," + gray + ",1)";
            }
            ctx.fill();
            ctx.stroke();
            
            // tile image
            ctx.drawImage(tile.tileType.image, tileWidth/4, tileHeight/4, tileWidth/1.5, tileHeight/1.5);            
            
            // reset global changes
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = 1.0;
        }
    });
}

// hide address bar on mobile
setTimeout(() => window.scrollTo(0, 1), 50);

var gameState = initGameWithClassicDisposition();
calculateMovesLeft();

// canvas
var canvas = document.getElementById("canvas");
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseout", onMouseOut);
window.addEventListener("resize", onResize);
calculateDimensions();

// 2d context
var ctx = canvas.getContext("2d");
ctx.font = "4em sans-serif";
ctx.fillText("Loading...",canvas.width/3, canvas.height/2);

function loadAndRun() {
               
    var loadingTiles = Object.values(TILES_TYPES).filter((t) => t.loaded != true);
    var loadingSoundFxs = Object.values(SOUND_FX).filter((s) => s.loaded != true);
    
    if(loadingTiles.length + loadingSoundFxs.length > 0){
        // keeps loading...
        setTimeout(loadAndRun, 100);        
    }else{
        // update/re-render at 30 fps    
        setInterval(updateAndRender, 1000 / 30);
    }
}

loadAndRun();