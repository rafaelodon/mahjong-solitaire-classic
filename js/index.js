/* 
 * Mahjong Solitaire Classic
 *
 * By Rafael Odon (2022)
 * odon.rafael@gmail.com
 * 
 */

// board matrix dimension constants
var MAX_Z = 5; // the number of tiles levels + 1
var MAX_Y = 17; // twice the number of rows + 1
var MAX_X = 30; // twice the number of cols

var PIXEL_RATIO = Math.ceil(window.devicePixelRatio);
var gameState = {}

// version info from manifest
var version = "---"
fetch('manifest.json').then((response) => {    
    response.json().then((manifest) => {
        document.getElementById("version").innerText = "v"+manifest.version;
    });
})

window.onload = () => {

    gameState = {};
    modal = new Modal();
    timer = new Timer();
    mahjongData = new MahjongData();
    lastGameData = {};
    lastWinData = undefined;

    function clearGameState(){
        Object.assign(gameState, {            
            board: undefined,        
            tiles: [],
            solver: undefined,            
            movesAvailable: 0,
            cursor: undefined,
            cursorTile: undefined,
            selectedTile: undefined,
            undos: 0,
            topBarMessage: "",
            hint: [],            
            soundOn: true,   
            isRunning: false,
            hasWon: false
        });
    }

    function distributeTilesClassicBoard() {
        
        var tilesMap = generateTilesMap();    
        var board = MahjongUtils.generateEmptyMatrix(MAX_X, MAX_Y, MAX_Z);

        // a random stack of tiles to be unstacked while filling the board
        var tilesStack = Object.values(tilesMap)
        tilesStack.sort((a, b) => 0.5 - Math.random());    

        //central stacked rectangles
        MahjongUtils.fillBoard(board, tilesStack, 7, 1, 21, 15, 0);
        MahjongUtils.fillBoard(board, tilesStack, 9, 3, 19, 13, 1);
        MahjongUtils.fillBoard(board, tilesStack, 11, 5, 17, 11, 2);
        MahjongUtils.fillBoard(board, tilesStack, 13, 7, 15, 9, 3);
        MahjongUtils.fillBoard(board, tilesStack, 14, 8, 14, 8, 4);

        //1st line extra tiles
        MahjongUtils.fillBoard(board, tilesStack, 3, 1, 5, 1, 0);
        MahjongUtils.fillBoard(board, tilesStack, 23, 1, 25, 1, 0);

        //3nd line extra tiles
        MahjongUtils.fillBoard(board, tilesStack, 5, 5, 5, 5, 0);
        MahjongUtils.fillBoard(board, tilesStack, 23, 5, 23, 5, 0);

        //4th and 5th lines extra tiles
        MahjongUtils.fillBoard(board, tilesStack, 3, 7, 5, 9, 0);
        MahjongUtils.fillBoard(board, tilesStack, 23, 7, 25, 9, 0);

        //4th and 5th lines blocking mid tiles
        MahjongUtils.fillBoard(board, tilesStack, 1, 8, 1, 8, 0);
        MahjongUtils.fillBoard(board, tilesStack, 27, 8, 29, 8, 0);

        //6th line extra tiles
        MahjongUtils.fillBoard(board, tilesStack, 5, 11, 5, 11, 0);
        MahjongUtils.fillBoard(board, tilesStack, 23, 11, 23, 11, 0);

        //8th line extra tiles
        MahjongUtils.fillBoard(board, tilesStack, 3, 15, 5, 15, 0);
        MahjongUtils.fillBoard(board, tilesStack, 23, 15, 25, 15, 0);

        return new MahjongBoard(tilesMap, board);
    }

    function initGameWithClassicDisposition() {              
        
        console.log("INIT");

        clearGameState();
        
        // generate a solvable board of stacked tiles
        var newBoard = [];
        var solver = undefined;
        do{        
            console.log("Trying to generate a solvable board...")
            newBoard = distributeTilesClassicBoard();
            solver = new MahjongSolver(newBoard);
            solvable = solver.isBoardSolvable();        
        }while(solvable != true);
        
        // // fast forward 70 moves
        // var moves = solver.getMoves();        
        // for(var i=0; i<68; i++){
        //     var move = moves.shift();
        //     if(move){
        //         newBoard.removeTilesIfMatch(newBoard.getTileById(move[0]),newBoard.getTileById(move[1]));
        //     }
        // }
        
        gameState.board = newBoard;
        gameState.tiles = newBoard.getTilesList().sort(MahjongUtils.compareTilesByRenderOrder);
        gameState.solver = new MahjongSolver(newBoard);                
        updateMovesLeft();
        timer.stop();      
        gameState.isRunning = true;
        lastWinData = undefined;
    }

    function onMouseMove(e) {
        e.stopPropagation();
        gameState.cursor = {
            x: e.offsetX * PIXEL_RATIO,
            y: e.offsetY * PIXEL_RATIO 
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
                    var tile = gameState.board.getTileAt(cX, cY, cZ);
                    if (gameState.board.isTileFree(tile)) {                                        
                        gameState.cursorTile = tile;
                        break;
                    } else {
                        gameState.cursorTile = undefined;
                    }
                }
            }
        }
    }
    
    function playSoundFx(key){
        if(gameState.soundOn){
            SOUND_FX[key].play(); 
        }
    }

    // try to select the current cursor tile.
    // if there's another tile selected, try a game move;
    function selectCursorTile() {    
        
        if(gameState.movesAvailable > 0 && gameState.cursorTile){

            // starts timing
            if(!timer.isRunning()){
                timer.reset();                
            }   

            gameState.board.removeTilesIfMatch(
                gameState.selectedTile,
                gameState.cursorTile,
                () => {
                    // success
                    playSoundFx("vanish");
                    clearSelected();
                    updateMovesLeft();
                                                                 
                    if(gameState.board.hasFinished()){
                        onWinGame();
                    }else if(gameState.board.movesAvailable == 0) {
                        onGameOver();
                    }
                },
                () => {
                    // if no removal happend, selects the cursor tile
                    playSoundFx("click");
                    clearSelected();
                    gameState.selectedTile = gameState.cursorTile;                 
                }
            );
        }else{
            // outside clicks unselect things
            clearSelected();
        }              
    }

    function updateMovesLeft(){
        gameState.movesAvailable = gameState.solver.countMovestLeft();
        gameState.topBarMessage = "Free tiles: "+gameState.movesAvailable;    
    }

    function onWinGame(){        
        if(gameState.hasWon == false){
            gameState.hasWon = true;  
            gameState.topBarMessage = "🏆 Congratulations!";
            timer.pause();    
            playSoundFx("victory");
            updateStats();
            mahjongData.clearGameData();
            disableButtons();
            setTimeout(() => {                                                            
                var count=0;
                var inverval=30;
                for(var aZ=0; aZ<MAX_Z; aZ++){                
                    winAnimationArray = gameState.tiles.filter((t)=>t.z==aZ);                                                                                
                    var tile1,tile2=undefined;
                    while(winAnimationArray.length > 0){                        
                        tile1 = winAnimationArray.shift();                       
                        if(tile1){                            
                            setTimeout(setupTileForWinAnimation, (count++)*inverval, tile1)                        
                        }

                        tile2 = winAnimationArray.pop();                    
                        if(tile2){                            
                            setTimeout(setupTileForWinAnimation, (count++)*inverval, tile2, false)
                        }                    
                    }   
                    inverval+=2;
                }                
                // show ranking modal with a start-new-game callback on the ok button
                setTimeout(showRanking,count*inverval+500,(modal)=>{                    
                    modal.hide();                    
                    startNewGame();                    
                });
            },500);
        }
    }

    function showRanking(okCallback=undefined){
        var stats = mahjongData.loadGameStats();
        var ranking = document.getElementById("ranking"); 
        var rankingTable = document.getElementById("rankingTable");   
        
        //generates a ranking table form the stats
        if(stats && stats.ranking && stats.ranking.length > 0){
            stats.ranking.sort((a,b) => a.ellapsedMillliseconds - b.ellapsedMillliseconds);
            rankingTable.innerHTML = "";
            stats.ranking.forEach((stat,i)=>{
                var tr = document.createElement("tr")
                if(lastWinData && stat.date == lastWinData.date){
                    tr.className = "lastVictory";
                }
                var date = new Date(stat.date);
                var dateString = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
                tr.innerHTML = "<td>"+(i+1)+"</td>";
                tr.innerHTML += "<td>"+dateString+"</td>";
                tr.innerHTML += "<td>"+stat.ellapsedMillliseconds/1000+" s</td>";
                tr.innerHTML += "<td>"+stat.undos+" undos</td>";
                rankingTable.appendChild(tr);
            });            
        }else{
            rankingTable.innerHTML = "(empty)";
        }                    
                
        // scrolls to the last win row
        var lastWinIndex = stats.ranking.findIndex((s)=>s.date == lastWinData.date);        
        ranking.scrollTop = lastWinIndex * 20;

        modal.show({
            headerContent: "Ranking",
            bodyContent: ranking.outerHTML,
            cancelButtonText: false,
            okCallback: okCallback
        }); 
    }
    
    function updateStats(){        
        var stats = mahjongData.loadGameStats();        
        lastWinData = {
            date: Date.now(),
            ellapsedMillliseconds: timer.getEllapsedMillliseconds(),
            undos: gameState.undos
        };
        stats.ranking.push(lastWinData);
        mahjongData.saveGameStats(stats);
    }

    function onGameOver() {
        gameState.topBarMessage = "💀 Game Over...";
        timer.pause();
        playSoundFx("death");
    }

    function onResize() {
        calculateDimensions();
        draw();
    }

    // refresh canvas size and calculate tile dimensions to fit the window
    function calculateDimensions(){
        
        // resize canvas to fit width/height keeping the 16/9 ratio    
        var width = window.innerWidth;
        var height = window.innerHeight;
        var ratio = width/height;    

        if(ratio >= 16/9){        
            canvas.height = height * PIXEL_RATIO;
            canvas.width = height * 16/9 * PIXEL_RATIO;        
            canvas.style.height = (height)+"px"
            canvas.style.width = (height * 16/9)+"px";
        }else{                       
            canvas.width = width * PIXEL_RATIO;
            canvas.height = width * 9/16 * PIXEL_RATIO;        
            canvas.style.width = (width)+"px"
            canvas.style.height = (width * 9/16)+"px";
        }

        gameState.ratio = canvas.height / canvas.width;
        gameState.tileWidth = canvas.width / MAX_X * 1.8;
        gameState.tileHeight = gameState.tileWidth * gameState.ratio * 1.8;
        gameState.tileThickness = gameState.tileWidth / 8 * gameState.ratio;    
    }

    function update() {        

        if(gameState && gameState.isRunning){

            updateCursorTile();           
            
            // tile removal animation            
            gameState.tiles.filter((t) => t.removed && t.alpha > 0).forEach((tile) => {
                tile.alpha = tile.alpha - 0.1;
                if (tile.alpha < 0.01) {
                    tile.alpha = 0;
                }        
            });            

            TweenManager.update();
        }
    }

    function setupTileForWinAnimation(tile,down=true){
        tile.removed = false;
        tile.alpha = 1.0;        
        TweenManager.addTween(new Tween({
            obj:tile,
            key:"y",
            initialValue: down ? 0 : MAX_Y+1,
            endValue: tile.y,
            durationMs: 400*(down ? 1-(tile.y/MAX_Y) : tile.y/MAX_Y),
            type: TweenType.EASE_LOG            
        }).start());   
    }

    function draw() {    

        if(gameState && gameState.isRunning){

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = 1.0;
            ctx.clearRect(0, 0, canvas.width, canvas.height);            

            // ellapsed time        
            var secs = Math.round(timer.getEllapsedMillliseconds()/1000);
            document.getElementById("time").innerText = "🕑 "+secs+" s";        

            // moves left / congrats / gameover
            document.getElementById("moves").innerText = gameState.topBarMessage;
            
            // tiles
            var tileWidth = gameState.tileWidth;
            var tileHeight = gameState.tileHeight;
            var tileThickness = gameState.tileThickness;
            gameState.tiles.forEach((tile) => {                        
                if (tile.alpha > 0) {

                    ctx.setTransform(1, 0, 0, 1, 0, 0);            
                    ctx.globalAlpha = tile.alpha;
                    ctx.lineWidth = 0.1;
                
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
                    } else if (gameState.hint && gameState.hint.includes(tile)) {
                        ctx.fillStyle = "#FFCF79";
                    }else {
                        ctx.fillStyle = "rgb(" + gray + "," + gray + "," + gray + ",1)";
                    }
                    ctx.fill();
                    ctx.stroke();
                    
                    // tile image
                    ctx.drawImage(TILES_TYPES[tile.tileType].image, tileWidth/4, tileHeight/4, tileWidth/1.5, tileHeight/1.5);                                    
                }
            });
        }
    }

    function clearSelected() {
        gameState.selectedTile = undefined;    
        gameState.hint = [];    
    }

    // hide address bar on mobile
    setTimeout(() => window.scrollTo(0, 1), 50);

    // canvas
    var canvas = document.getElementById("canvas");
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseout", onMouseOut);
    canvas.addEventListener("touchstart", onMouseMove);
    canvas.addEventListener("touchend", onMouseDown);
    window.addEventListener("resize", onResize);
    calculateDimensions();    

    // 2d context
    var ctx = canvas.getContext("2d");

    var loader = document.getElementById("loader");
    var container = document.getElementById("container")

    var btnNewGame = document.getElementById("btnNewGame");
    btnNewGame.addEventListener("click", () => {    
        modal.show({
            headerContent: "New Game",
            bodyContent: "Restart the game and shuffe the tiles?",
            okCallback: (modal) => {                
                modal.hide(); 
                startNewGame();
            }
        });
    });

    var btnUndo = document.getElementById("btnUndo");
    btnUndo.addEventListener("click", () => {    
        if(!gameState.hasWon && gameState.board.undoLastMove()){                    
            timer.startOrResume();
            gameState.undos += 1;
            playSoundFx("horn");    
            clearSelected();
            updateMovesLeft();
        }
    });
    
    var btnHint = document.getElementById("btnHint");
    btnHint.addEventListener("click", () => {                    
        gameState.hint = gameState.solver.getBestNextMove();        
        if(gameState.hint){
            playSoundFx("ah");
        }        
    });

    var btnSound = document.getElementById("btnSound")
    btnSound.addEventListener("click", () => {                    
        gameState.soundOn = !gameState.soundOn;        
        document.getElementById("btnSound").innerText = gameState.soundOn ? "Sound Off" : "Sound On";
        if(gameState.soundOn){
            playSoundFx("click");
        }
    });

    var btnRanking = document.getElementById("btnRanking");
    btnRanking.addEventListener("click", () => {                                    
        showRanking();       
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            timer.pause();
            console.log("Pausing...");
            if(!gameState.hasWon){
                lastGameData.gameState = gameState;
                lastGameData.ellapsedMillliseconds = timer.getEllapsedMillliseconds();                        
                mahjongData.saveGameData(lastGameData);
            }
        } else {
            timer.startOrResume();
            console.log("Resuming...");
        }
    });
    
    function startNewGame() {
        showLoader();
        setTimeout(() => {            
            initGameWithClassicDisposition();
            hideLoader(); 
            enableButtons();           
        },50);        
    }

    function disableButtons() {
        var buttons = [btnHint, btnNewGame, btnRanking, btnSound, btnUndo];
        buttons.forEach((button) => button.disabled = true);
    }

    function enableButtons() {
        var buttons = [btnHint, btnNewGame, btnRanking, btnSound, btnUndo];
        buttons.forEach((button) => button.disabled = false);
    }

    function showLoader() {
        loader.className = "animatedVisible";
        container.className = "animatedHidden";
    }

    function hideLoader() {
        loader.className = "animatedHidden";
        container.className = "animatedVisible";
    }

    function loadAndRun() {
               
        var loadingTiles = Object.values(TILES_TYPES).filter((t) => t.loaded != true);
        var loadingSoundFxs = Object.values(SOUND_FX).filter((s) => s.loaded != true);
        
        if(loadingTiles.length + loadingSoundFxs.length > 0){
            // keeps loading...
            setTimeout(loadAndRun, 100);        
        }else{
            Loop.run({ draw: draw, update: update });
            // check if there's a ongoing game to be resumed                               
            lastGameData = mahjongData.loadGameData();    
            if(lastGameData.gameState && lastGameData.gameState.board 
                && !lastGameData.gameState.board.hasFinished()){                
                hideLoader();
                modal.show({
                    headerContent: "Resume",
                    bodyContent: "Do you want to resume the last game?",
                    okCallback: () => {                                    
                        gameState = lastGameData.gameState;
                        gameState.isRunning = true;  
                        calculateDimensions();
                        timer.startOrResume(lastGameData.ellapsedMillliseconds)                                        
                    },
                    cancelCallback: () => {
                        startNewGame();                    
                    }
                });
            }else{                
                startNewGame();        
            }            
        }
    }
        
    loadAndRun();
}

