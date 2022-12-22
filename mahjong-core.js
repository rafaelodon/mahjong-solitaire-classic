/** 
 * A board of stacked tiles: 
 * - There are 2 main structures: a list of tiles and a board.
 * - The board is a 3d matrix where tiles are placed and stacked.
 * - A tile is placed at [z][y][x] board coordinate and has a 2x2 size.
 * - Every board cell that owns a tile has a reference to its id. 
 * - When tiles are matched, their references are removed from the board but they
 *   keep existing on the tiles list and marked as 'removed'.
 * - A moves stack keep track of the pair removals, and they can be undone.
 */
 function MahjongBoard(givenTilesMap, givenBoard){

    this.movesStack = [];
    this.tilesMap = givenTilesMap;
    this.board = givenBoard;
    
    this.getTilesList = function (){
        return Object.values(this.tilesMap);        
    }

    this.getFreeTilesList = function(){
        return this.getTilesList().filter((t) => this.isTileFree(t));
    }
    
    this.getTileAt = function(x, y, z){
        return this.tilesMap[this.board[z][y][x]];
    }

    this.getMovesStack = function(){
        return this.movesStack;
    }

    this.getBoard = function(){
        return this.board;
    }
   
    this.removeTilesIfMatch = function(tile1, tile2, successCallback, failCallBack) {
        if (tile1 && tile2 &&
            tile1.id != tile2.id &&
            tile1.tileType.group == tile2.tileType.group) {

            // get a fresh tile refrence from the current tiles map to avoid
            // working with a wrong tile state (important for solver)
            var thisTile1 = this.getTileById(tile1.id);
            var thisTile2 = this.getTileById(tile2.id);

            this.removeFromBoard(thisTile1);
            this.removeFromBoard(thisTile2);
            
            thisTile1.removed = true;
            thisTile2.removed = true;

            this.movesStack.push([thisTile1,thisTile2]);

            if(successCallback){
                successCallback();
            }
        }else{
            if(failCallBack){
                failCallBack();
            }
        }
    }

    this.getTileById = function(id){
        return this.tilesMap[id];
    }

    this.cloneIt = function(){        
        return new MahjongBoard(
            MahjongUtils.deepClone(this.tilesMap),
            MahjongUtils.deepClone(this.board));
    }    

    this.hasFinished = function (){       
        return this.getTilesList().filter((t) => t.removed != true).length == 0;
    }

    this.isTileFree = function(tile) {
        return tile &&
            !tile.removed &&
            !this.isTileBelowAnother(tile) &&
            !this.isTileBetweenOthers(tile);
    }

    this.undoLastMove = function(){
        var lastMove = this.movesStack.pop();    
        if(lastMove){
            lastMove.forEach((tile) => {                                
                tile.removed = false;                
                tile.alpha = 1.0; // TODO: alpha animation shuld be a wrapper
                MahjongUtils.addTileToBoard(tile, this.board, tile.x, tile.y, tile.z);
            });
            return true;
        }
        return false;
    }
    
    this.isTileBelowAnother = function(tile) {
        var pX = tile.x;
        var pY = tile.y;
        var pZ = tile.z;   
        var board = this.board; 
    
        return board[pZ + 1] && // the board has a level above        
            ((board[pZ + 1][pY] && // check same line
                (board[pZ + 1][pY][pX] || board[pZ + 1][pY][pX + 1])) ||
            (board[pZ + 1][pY + 1] && // check next line
                (board[pZ + 1][pY + 1][pX] || board[pZ + 1][pY + 1][pX + 1])));
    }
    
    this.isTileBetweenOthers = function(tile){    
        var board = this.board; 
        return (board[tile.z][tile.y][tile.x - 1] || board[tile.z][tile.y + 1][tile.x - 1]) && // tile to the left
            (board[tile.z][tile.y][tile.x + 2] || board[tile.z][tile.y + 1][tile.x + 2]); // tile to right
    }  
    
    this.removeFromBoard = function(tile) {    
        var x = tile.x;
        var y = tile.y;
        var z = tile.z;
        var board = this.board; 
        board[z][y][x] = undefined;
        board[z][y + 1][x] = undefined;
        board[z][y][x + 1] = undefined;
        board[z][y + 1][x + 1] = undefined;    
    }
}