/**
 * Loop: A fixed FPS browser game loop. 
 * 
 * Usage:
 *    Loop.run(yourgame);
 * 
 * 'yourgame' must define update() and draw() members.
 * 
 * @author Rafael Odon <odon.rafael@gmail.com>
 */
 var Loop = {
    fps: 30,
    paused: false,
    lastTime: 0,
    ellapsedTime: 0,
    lag: 0,
    animationFrame: undefined,
    game: undefined
}

Loop.run = function (game) {
    this.game = game;
    this.animationFrame = window.requestAnimationFrame(Loop.loop);
}

Loop.loop = function (time) {

    var intTime = parseInt(time);

    if (!Loop.lastTime) {
        Loop.lastTime = intTime;
    }

    Loop.ellapsedTime = intTime - Loop.lastTime;
    Loop.lastTime = intTime;
    Loop.lag += Loop.ellapsedTime;

    while (Loop.lag > 1000 / Loop.fps) {
        Loop.update();
        Loop.lag -= 1000 / Loop.fps;
    }

    Loop.draw();

    if (!Loop.paused) {
        Loop.animationFrame = window.requestAnimationFrame(Loop.loop);
    }
}

Loop.update = function () {
    if (this.game) {
        this.game.update();
    }
}

Loop.draw = function () {
    if (this.game) {
        this.game.draw();
    }
}

Loop.togglePausePlay = function () {
    this.paused = !this.paused;

    if (this.paused) {
        window.cancelAnimationFrame(Loop.animationFrame);
        console.log("pausing...")
    } else {
        console.log("resuming...")
        Loop.run(this.game);
    }
}