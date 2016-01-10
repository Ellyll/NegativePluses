"use strict";

// Inspired by this tweet: https://twitter.com/CPriestman/status/684874950944100352
// Original image is from Charlie Deck @bigblueboo http://bigblueboo.tumblr.com/post/100910011355/negative-space-crosses

var app = (function circles() {

    function _init() {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        _maximiseCanvas(canvas);

        var crossWidth = Math.min(canvas.height, canvas.width) / 5;

        var rotationSpeed = (Math.PI/2)/500; // radians / ms
        var rotationRepeat = 8000; // ms between rotating
        var initialDelay = 2000;
        var delayBetweenCrosses = 1000; // ms between each cross


        //var cross = new Cross(canvas.width / 2, canvas.height / 2, crossWidth, 0, 'white');

        var blackStartX = crossWidth / 6;
        var blackStartY = canvas.height - 1 - (crossWidth/2);
        var blackCrosses = makeCrosses(canvas, crossWidth, blackStartX, blackStartY, 'black', 'white');


        var whiteStartX = blackStartX + crossWidth*(2/3);
        var whiteStartY = blackStartY + crossWidth/3;
        var whiteCrosses = makeCrosses(canvas, crossWidth, whiteStartX, whiteStartY, 'white', 'black');
        //whiteCrosses = setInitialRotation(whiteCrosses, 4000, delayBetweenCrosses);

        requestAnimationFrame(function (currentTime) {
            draw(context, currentTime, currentTime, whiteCrosses, blackCrosses, rotationSpeed, rotationRepeat, initialDelay, delayBetweenCrosses, true);
        });
    }

    function makeCrosses(canvas, crossWidth, startX, startY, colour, backgroundColour) {
        var radius = (Math.sqrt(10) / 6) * crossWidth;

        var rowStartX = startX;
        var rowStartY = startY;
        var crosses = [];

        while(rowStartY + radius >= 0) {

            var x = rowStartX;
            var y = rowStartY;

            var row = [];
            while (x + radius > 0 && y + radius >= 0) {
                row.push(new Cross(x, y, crossWidth, 0, colour, backgroundColour, false, 0));
                x -= crossWidth/3;
                y -= crossWidth;
            }
            row.reverse().forEach(function (cross) {
                crosses.push(cross);
            });

            rowStartX += (4/3)*crossWidth;
            rowStartY += (2/3)*crossWidth;

            while (rowStartY + radius >= 0 && ((rowStartY - radius >= canvas.height) || (rowStartX - radius >= canvas.width))) {
                rowStartX -= crossWidth/3;
                rowStartY -= crossWidth;
            }
        }

        return crosses;
    }

    function Cross(x, y, width, angle, colour, backgroundColour, isRotating, nextRotateTime) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._angle = angle;
        this._colour = colour;
        this._backgroundColour = backgroundColour;
        this._points = [];
        this._isRotating = isRotating;
        this._nextRotateTime = nextRotateTime;
        var that = this;

        // Generate points
        var radius = (Math.sqrt(10) / 6) * width;
        var a = Math.atan(1 / 3);
        var innerRadius = width / Math.sqrt(18);

        var points = [];
        for (var currentAngle = angle; currentAngle < angle + Math.PI * 2; currentAngle += Math.PI / 2) {
            points.push(getPoint(currentAngle - a, radius));
            points.push(getPoint(currentAngle + a, radius));
            points.push(getPoint(currentAngle + Math.PI / 4, innerRadius));
        }
        this._points = points.map(function (p) {
            return [p[0] + that._x, p[1] + that._y];
        });
    }
    Cross.prototype = {
        get x() { return this._x; },
        get y() { return this._y; },
        get width() { return this._width; },
        get angle() { return this._angle; },
        get colour() { return this._colour; },
        get backgroundColour() { return this._backgroundColour; },
        get points() { return this._points; },
        get isRotating() { return this._isRotating; },
        get nextRotateTime() { return this._nextRotateTime; },
        getInvertedStatic: function() {
            return new Cross(this.x, this.y, this.width, 0, this.backgroundColour, this.colour, false, 0);
        }
    };

    function getPoint(angle, radius) {
        var x = radius * Math.cos(angle);
        var y = radius * Math.sin(angle);

        return [x, y];
    }

    function setInitialRotation(crosses, startDelay, delayBetweenCrosses, currentTime) {
        var time = currentTime + startDelay;

        var newCrosses = [];
        for (var i=0; i < crosses.length; i++) {
            var c = crosses[i];
            newCrosses.push(new Cross(c.x, c.y, c.width, c.angle, c.colour, c.backgroundColour, false, time));
            time += delayBetweenCrosses;
        }

        return newCrosses;
    }

    function applyRotation(crosses, deltaTime, currentTime, rotationSpeed, rotationRepeat, direction) {

        return crosses.map(function (c) {
            var angle = c.angle;
            var isRotating = c.isRotating;
            var nextRotateTime = c.nextRotateTime;

            if (isRotating) {
                angle += (rotationSpeed * deltaTime * direction);
                if (Math.abs(angle) > Math.PI/2) {
                    angle = 0;
                    isRotating = false;
                    nextRotateTime = currentTime + rotationRepeat;
                }
            } else {
                //if (currentTime > nextRotateTime) {
                //    isRotating = true;
                //}
            }

            return new Cross(c.x, c.y, c.width, angle, c.colour, c.backgroundColour, isRotating, nextRotateTime);
        });
    }

    function draw(context, currentTime, lastTime, whiteCrosses, blackCrosses, rotationSpeed, rotationRepeat, initialDelay, delayBetweenCrosses, firstTime) {
        var deltaTime = currentTime - lastTime;

        //if (firstTime) {
        //    blackCrosses = setInitialRotation(blackCrosses, initialDelay, delayBetweenCrosses, currentTime);
        //    whiteCrosses = setInitialRotation(whiteCrosses, 0, delayBetweenCrosses, blackCrosses[blackCrosses.length-1].nextRotateTime);
        //}

        if (!(blackCrosses.some(function (c) { return c.isRotating; }) ||
              whiteCrosses.some(function (c) { return c.isRotating; }))) {
            var i = getRandomIntInclusive(1, blackCrosses.length+whiteCrosses.length);
            if (i < blackCrosses.length) {
                blackCrosses = blackCrosses.map(function(c, idx) {
                    return (idx === i-1) ? new Cross(c.x, c.y, c.width, c.angle, c.colour, c.backgroundColour, true, 0) : c;
                });
            } else {
                whiteCrosses = whiteCrosses.map(function(c, idx) {
                    return (idx === i-1-blackCrosses.length) ? new Cross(c.x, c.y, c.width, c.angle, c.colour, c.backgroundColour, true, 0) : c;
                });
            }
        }

        blackCrosses = applyRotation(blackCrosses, deltaTime, currentTime, rotationSpeed, rotationRepeat, -1);
        whiteCrosses = applyRotation(whiteCrosses, deltaTime, currentTime, rotationSpeed, rotationRepeat, 1);

        var staticCrosses = blackCrosses.filter(function (c) { return !c.isRotating; })
            .concat(whiteCrosses.filter(function (c) { return !c.isRotating; }));

        var rotatingCrosses = blackCrosses.filter(function (c) { return c.isRotating; })
            .concat(whiteCrosses.filter(function (c) { return c.isRotating; }));


        _clearCanvas(context);

        staticCrosses.forEach(function (cross) {
            //drawCross(context, cross.getInvertedStatic());
            drawCross(context, cross);
        });
        rotatingCrosses.forEach(function (cross) {
            //drawCross(context, cross.getInvertedStatic());
            drawCross(context, cross);
        });


        lastTime = currentTime;
        requestAnimationFrame(function (currentTime) {
            draw(context, currentTime, lastTime, whiteCrosses, blackCrosses, rotationSpeed, rotationRepeat, initialDelay, delayBetweenCrosses, false);
        });
    }


    function drawCross(context, cross) {
        //if (cross.colour === 'black') {
            context.fillStyle = cross.backgroundColour;
            context.strokeStyle = cross.backgroundColour;
            context.strokeRect(cross.x - cross.width/2, cross.y - cross.width/2, cross.width, cross.width);
            context.fillRect(cross.x - cross.width/2, cross.y - cross.width/2, cross.width, cross.width);
        //}
        context.beginPath();
        context.fillStyle = cross.colour;
        context.strokeStyle = cross.colour;
        context.strokeWidth = 0;
        context.moveTo(cross.points[0][0], cross.points[0][1]);
        for (var i = 1; i < cross.points.length; i++) {
            var point = cross.points[i];
            context.lineTo(point[0], point[1]);
        }
        context.lineTo(cross.points[0][0], cross.points[0][1]);
        context.fill();
    }

    function getRandomIntInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function _maximiseCanvas(canvas) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
    }

    function _clearCanvas(context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }

    return {
        init: _init
    };
})();
