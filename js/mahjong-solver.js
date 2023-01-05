/**
 * Mahjong Solitaire Solver
 *
 * @author Rafael Odon <odon.rafael@gmail.com>
 * @param {MahjongBoard} mahjongBoard    
 */
function MahjongSolver(mahjongBoard){
    
    var moves = [];

    this.getMoves = () => {
        return moves;
    }

    /**     
     * @returns {Boolean}
     */
    this.isBoardSolvable = function(){            
                
        if(isBoardMalformedSamePiecesStacked(mahjongBoard)){
             return false;
        }

        if(isBoardMalformedSamePiecesSequenced(mahjongBoard)){
             return false;
        }

        return isBoardSolvableStacked(mahjongBoard)
    } 

    /**
     * Rejects boards with pieces of the same type stacked one another        
     *      
     * @param {MahjongBoard} mahjongBoard      
     * @returns {Boolean}
     */
    function isBoardMalformedSamePiecesStacked(mahjongBoard){
        for(var x=0; x<MAX_X; x+=2){
            for(var y=0; y<MAX_Y; y+=2){
                for(var z=2; z<MAX_Z; z++){
                    var t1 = mahjongBoard.getTileAt(x, y, z);
                    var t2 = mahjongBoard.getTileAt(x, y, z-1);
                    var t3 = mahjongBoard.getTileAt(x, y, z-2);
                    if(t1 && t2 && t3 && t1.tileType == t2.tileType && t1.tileType == t3.tileType){
                        console.info("Bad tiles stack");
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Rejects boards with three pieces of the same type sequenced in a row     
     *      
     * @param {MahjongBoard} mahjongBoard      
     * @returns {Boolean}
     */
    function isBoardMalformedSamePiecesSequenced(mahjongBoard){
        // 
        for(var z=1; z<MAX_Z; z++){
            for(var y=0; y<MAX_Y; y+=2){
                for(var x=0; x<MAX_X-5; x+=2){   
                    var t1 = mahjongBoard.getTileAt(x, y, z);
                    var t2 = mahjongBoard.getTileAt(x+2, y, z);                        
                    var t3 = mahjongBoard.getTileAt(x+4, y, z);
                    if(t1 && t2 && t3 && t1.tileType == t2.tileType && t1.tileType == t3.tileType){
                        console.info("Bad tiles sequence");
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * A depth/breadht-first-search with some pruning heuristics
     * 
     * @param {MahjongBoard} mahjongBoard      
     * @returns {Boolean}
     */
    function isBoardSolvableStacked(mahjongBoard, depth=true){

        var stack = [];
        var solved = false;
               
        var movesLeft = listMovesLeft(mahjongBoard);
        movesLeft.forEach((move, i) => stack.push({ 
            mahjongBoard: mahjongBoard.cloneIt(),
            move: move,
            level: 0,
            moveIndex: i
        }));                

        while(stack.length > 0 && !solved){
            var step = stack.shift();            
            var move = step.move;
            if(move){
                var newBoard = step.mahjongBoard;                        
                newBoard.removeTilesIfMatch(move[0], move[1]);
                if(newBoard.hasFinished()){
                    moves = newBoard.getMovesStack();
                    solved = true;
                }else{

                    mahjongBoard.undoLastMove();

                    var newMovesLeft = listBestMovesLeft(newBoard);
                    if(step.level > 1){
                        newMovesLeft = newMovesLeft.slice(0,1);
                    }

                    newMovesLeft.forEach((move, i) => {
                        var newStep = { 
                            mahjongBoard: newBoard,
                            move: move,
                            level: step.level + 1,
                            moveIndex: i
                        }
                        if(depth){
                            stack.unshift(newStep);
                        }else{
                            stack.push(newStep);
                        }
                    });
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
        
        // pre calcuate the profit of each next movement
        var movesProfit = {}
        movesLeft.forEach((move)=> movesProfit[move] = getMoveProfit(move, mahjongBoard));

        // sort desceding by the move relevance
        movesLeft.sort((m1, m2) => {
            var m1Profit = movesProfit[m1];
            var m2Profit = movesProfit[m2];            
            if(m1Profit != m2Profit){
                // prioritize moves that free more tiles
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
                        var m1GroupCount = mahjongBoard.getTilesList().filter((t)=>t.removed != true && t.group == m1[0].group);
                        var m2GroupCount = mahjongBoard.getTilesList().filter((t)=>t.removed != true && t.group == m2[0].group);
                        if(m1GroupCount != m2GroupCount){                    
                            // then prioritize smaller tyle groups
                            return m1GroupCount - m2GroupCount;
                        }else{                          
                            // then use tile group name sorting, just to keep it idempotent
                            return m1[0].group.localeCompare(m2[0].group);
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
                && other.group == current.group);
            matches.forEach((match) => {
                if(!((current.id+"-"+match.id) in moves) &&
                   !((match.id+"-"+current.id) in moves)){
                    moves[current.id+"-"+match.id] = [current, match];
                }
            })
        });        
        return Object.values(moves);
    }

    /**
     * Execute the move on the given board to get to know how
     * many free tiles does that move will generate.
     * 
     * @param {Array} move 
     * @param {MahjongBoard} mahjongBoard 
     * @returns {Number}
     */
    function getMoveProfit(move, mahjongBoard){                        
        mahjongBoard.removeTilesIfMatch(move[0], move[1]);
        var profit = mahjongBoard.getFreeTilesList().length;
        mahjongBoard.undoLastMove();
        return profit;
    }
}