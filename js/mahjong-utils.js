var MahjongUtils = {

    generateEmptyMatrix : (xMax,yMax,zMax) => {
        var board = new Array(zMax);
        for (var z = 0; z < board.length; z++) {
            board[z] = new Array(yMax);
            for (var y = 0; y < board[z].length; y++) {
                board[z][y] = new Array(xMax);
            }
        }
        return board;
    },

    // Create tiles on the given board rect
    fillBoard : (board, tiles, x1, y1, x2, y2, z) => {
        for (var y = y1; y <= y2; y += 2) {
            for (var x = x1; x <= x2; x += 2) {                                
                if(Array.isArray(tiles)){
                    var tile =  tiles.pop;
                    MahjongUtils.addTileToBoard(tile, board, x, y, z);
                }else{
                    board[z][y][x] = null;                    
                }
            }
        }
    },

    // Add a 2x2 tile to the x,y,z board coordinate
    addTileToBoard : (tile, board, x, y, z) => {        
        tile.x = x;
        tile.y = y;
        tile.z = z;                
        board[z][y][x] = tile.id;
        board[z][y + 1][x] = tile.id;
        board[z][y][x + 1] = tile.id;
        board[z][y + 1][x + 1] = tile.id; 
    },

    // deep clone an object (arry/map/etc)
    deepClone : (obj) => {
        if(Array.isArray(obj)){
            return obj.map(item => Array.isArray(item) ? MahjongUtils.deepClone(item) : item);
        }else{
            return Object.keys(obj).reduce((v, d) => Object.assign(v, {
                [d]: (obj[d].constructor === Object) ? MahjongUtils.deepClone(obj[d]) : obj[d]
            }), {});              
        }        
    },

    // Sorts the tiles in rendereing order (bottom-top, left-right)
    compareTilesByRenderOrder : (a,b) => {    
        var rZ = a.z - b.z;
        var rY = b.y - a.y;
        var rX = b.x - a.x;
        return rZ != 0 ? rZ : rX != 0 ? rX : rY;          
    },

    // Shuffle an array
    shuffleArray: (array) => {
        array.sort((a, b) => 0.5 - Math.random())
    }
}
