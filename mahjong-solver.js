/**
 * Mahjon Solver
 * 
 * @param {MahjongBoard} mahjongBoard    
 */
function MahjongSolver(mahjongBoard){    

    this.isBoardSolvable = function(){
        console.log("Solving...")        
        return isBoardSolvableRecursive(mahjongBoard)
    }
    
    /**
     * A depth-first search with best-next-moves heuristics and prunes.
     * 
     * @param {MahjongBoard} mahjongBoard      
     * @returns {Boolean}
     */
    function isBoardSolvableRecursive(mahjongBoard, recursionLevel=0, state={undos:0}){            

        if(mahjongBoard.hasFinished()){        
            return true;
        }
        
        if(state.undos > 1000){
            return false;
        }

        var movesLeft = listBestMovesLeft(mahjongBoard);        
        
        if(recursionLevel == 0 && movesLeft.length < 15){
            // rejects boards with less than 10 openings
            return false;
        }

        if(recursionLevel > 0){
            // explore all the openings and then just the next three best moves
            movesLeft = movesLeft.slice(0,10);
        }

        var i=0;
        var newBoard = mahjongBoard.cloneIt();
        while(movesLeft.length > 0){
            console.debug(recursionLevel, i++);            
            var move = movesLeft.pop();
            if(move){                
                newBoard.removeTilesIfMatch(move[0], move[1]);               
                if(isBoardSolvableRecursive(newBoard, recursionLevel+1, state)){                
                    return true;
                }else{                                 
                    newBoard.undoLastMove();
                    state.undos+=1;
                    //console.log(state); 
                    return false;                   
                }
            }
        }

        return false;    
    }

    /**
     * A breadth-first search with some pruning heuristics
     * 
     * @param {MahjongBoard} mahjongBoard      
     * @returns {Boolean}
     */
    function isBoardSolvableStacked(mahjongBoard){

        var stack = [];
        var solved = false;
               
        var movesLeft = listMovesLeft(mahjongBoard);
        movesLeft.forEach((move, i) => stack.push({ 
            mahjongBoard: mahjongBoard,
            move: move,
            level: 0,
            moveIndex: i
        }));                

        while(stack.length > 0 && !solved){
            var step = stack.shift();
            console.info(step);
            var move = step.move;
            if(move){
                var newBoard = step.mahjongBoard.cloneIt();                        
                newBoard.removeTilesIfMatch(move[0], move[1]);
                if(newBoard.hasFinished()){
                    solved = true;
                }else{

                    var newMovesLeft = listMovesLeft(newBoard);
                    if(step.level > 1){
                        newMovesLeft = newMovesLeft.slice(0,1);
                    }
                    newMovesLeft.forEach((move, i) => stack.push({ 
                        mahjongBoard: newBoard,
                        move: move,
                        level: step.level + 1,
                        moveIndex: i
                    }));
                }            
            }
        }
        
        return solved;
    }

    this.getBestNextMove = function(){
        return listBestMovesLeft(mahjongBoard)[0];
    }
    
    function listBestMovesLeft(mahjongBoard){
        
        var movesLeft = listMovesLeft(mahjongBoard);
        var board = mahjongBoard.getBoard();
        
        // sort desceding by move relevance
        movesLeft.sort((m1, m2) => {
            var m1Profit = getMoveProfit(m1, mahjongBoard);
            var m2Profit = getMoveProfit(m2, mahjongBoard);            
            if(m1Profit != m2Profit){
                // prioritize more adjacent future free tiles
                return m2Profit - m1Profit;
            }else{
                var m1Z = m1[0].z + m1[1].z;
                var m2Z = m2[0].z + m2[1].z;                
                if(m1Z != m2Z){
                    // then prioritize unstacking tiles from upper positions
                    return m2Z - m1Z;
                }else{
                    var m1t1RowLength = board[m1[0].z][m1[0].y].filter((t)=>t!=null);
                    var m1t2RowLength = board[m1[1].z][m1[1].y].filter((t)=>t!=null);
                    var m2t1RowLength = board[m2[0].z][m2[0].y].filter((t)=>t!=null);
                    var m2t2RowLength = board[m2[1].z][m2[1].y].filter((t)=>t!=null);
                    var m1RowLength = Math.round(m1t1RowLength + m1t2RowLength / 2);
                    var m2RowLength = Math.round(m2t1RowLength + m2t2RowLength / 2);
                    if(m1RowLength != m2RowLength){
                        // then prioritize larger rows
                        return m2RowLength - m1RowLength;
                    }else{
                        var m1GroupCount = mahjongBoard.getTilesList().filter((t)=>t.removed != true && t.tileType.group == m1[0].tileType.group);
                        var m2GroupCount = mahjongBoard.getTilesList().filter((t)=>t.removed != true && t.tileType.group == m2[0].tileType.group);
                        if(m1GroupCount != m2GroupCount){                    
                            // then prioritize smaller groups                   
                            return m1GroupCount - m2GroupCount;
                        }else{                          
                            // then use tile name sorting, just to keep it idempotent
                            return m1[0].tileType.group.localeCompare(m2[0].tileType.group);
                        }
                    }
                }
            }
        });
        
        return movesLeft;
    }

    this.countMovestLeft = function (){
        return listMovesLeft(mahjongBoard).length;
    }

    function listMovesLeft(mahjongBoard){
        var freeTiles = mahjongBoard.getFreeTilesList();        
        var moves = {};
        freeTiles.forEach((current) => {
            var matches = freeTiles.filter((other) => current != other 
                && other.tileType.group == current.tileType.group);
            matches.forEach((match) => {
                if(!((current.id+"-"+match.id) in moves) &&
                   !((match.id+"-"+current.id) in moves)){
                    moves[current.id+"-"+match.id] = [current, match];
                }
            })
        });        
        return Object.values(moves);
    }

    function getMoveProfit(move, mahjongBoard){
        var t1Adjacents = getAdjacentTiles(move[0], mahjongBoard);
        var t2Adjacents = getAdjacentTiles(move[1], mahjongBoard);    
        var adjacents = t1Adjacents.concat(t2Adjacents);
        
        // remove duplicates
        adjacents = adjacents.filter((a, i) => adjacents.indexOf(a) === i);

        // remove already free tiles
        adjacents = adjacents.filter((a) => !mahjongBoard.isTileFree(mahjongBoard.getTileById(a)));

        // keep future free tiles
        var newBoard = mahjongBoard.cloneIt();        
        newBoard.removeTilesIfMatch(move[0], move[1]);
        adjacents = adjacents.filter((t) => newBoard.isTileFree(newBoard.getTileById(t.id)));                
        return adjacents.length;
    }

    function getAdjacentTiles(tile, mahjongBoard){
        var board = mahjongBoard.getBoard();
        var adjacents = [];        
        var left = board[tile.z][tile.y][tile.x-1];
        if(left) adjacents.push(left);

        var right = board[tile.z][tile.y][tile.x+2];
        if(right) adjacents.push(right);
        
        if(tile.z > 0){
            var belowTopRight = board[tile.z-1][tile.y][tile.x];
            if(belowTopRight) adjacents.push(belowTopRight);

            var belowTopLeft = board[tile.z-1][tile.y][tile.x+1];
            if(belowTopLeft) adjacents.push(belowTopLeft);

            var belowBottomRight = board[tile.z-1][tile.y+1][tile.x];
            if(belowBottomRight) adjacents.push(belowBottomRight);

            var belowBottomLeft = board[tile.z-1][tile.y+1][tile.x+1];
            if(belowBottomLeft) adjacents.push(belowBottomLeft);
        }

        return adjacents;
    }  
}