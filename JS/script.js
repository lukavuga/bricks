$(document).ready(function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;
    
    var x, y, dx, dy, r;
    var paddlex, paddleh, paddlew;
    var rightDown, leftDown;
    var bricks, NROWS, NCOLS, BRICKWIDTH, BRICKHEIGHT, PADDING;
    
    // POSODOBLJENA BARVNA PALETA: Neon Pink in Neon Blue
    var rowcolors = ["#FF00E4", "#00FFEA", "#FF00E4", "#00FFEA", "#FF00E4"];
    
    var sekunde, start, timerInterval, intervalId;
    var stOpekZaRazbit, igraSeJeZacela;

    function initVariables() {
        r = 7;
        paddleh = 12;
        paddlew = 90;
        paddlex = WIDTH / 2 - paddlew / 2;
        x = paddlex + paddlew / 2;
        y = HEIGHT - paddleh - r - 10;
        dx = 4; dy = -4;
        sekunde = 0;
        start = false;
        igraSeJeZacela = false;
        rightDown = false;
        leftDown = false;

        NROWS = 5;
        NCOLS = 8;
        PADDING = 6; 
        BRICKWIDTH = (WIDTH / NCOLS) - PADDING;
        BRICKHEIGHT = 20;
        stOpekZaRazbit = 0;

        bricks = new Array(NROWS);
        for (var i = 0; i < NROWS; i++) {
            bricks[i] = new Array(NCOLS);
            for (var j = 0; j < NCOLS; j++) {
                bricks[i][j] = 1;
                stOpekZaRazbit++;
            }
        }
        $("#cas").html("00:00");
        $("#konec-zaslon").hide();
    }

    // Funkcija za risanje opek z barvno obrobo in POVEČANIM sijem
    function drawNeonRect(x, y, w, h, color, radius) {
        ctx.save();
        // POVEČAN SIJAJ za ujem s sliko (image_0.png)
        ctx.shadowBlur = 18; 
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fill();
        
        // Obroba je sedaj enake barve kot brick, le malo svetlejša/vidnejša
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    function circle(x, y, r) {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "white";
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();
    }

    $(document).keydown(function(evt) {
        if (evt.keyCode == 39 || evt.keyCode == 68) rightDown = true;
        else if (evt.keyCode == 37 || evt.keyCode == 65) leftDown = true;
        else if (evt.keyCode == 13 && !igraSeJeZacela) pozeniIgro();
    });

    $(document).keyup(function(evt) {
        if (evt.keyCode == 39 || evt.keyCode == 68) rightDown = false;
        else if (evt.keyCode == 37 || evt.keyCode == 65) leftDown = false;
    });

    $("#canvas").click(function() { if (!igraSeJeZacela) pozeniIgro(); });

    function pozeniIgro() { igraSeJeZacela = true; start = true; }

    function konecIgre(zmaga) {
        clearInterval(intervalId); clearInterval(timerInterval);
        if (zmaga) {
            $("#konec-sporocilo").text("ZMAGAL SI!").css("color", "#00FFEA");
        } else {
            $("#konec-sporocilo").text("KONEC IGRE").css("color", "#FF1C0A");
        }
        $("#konec-zaslon").fadeIn(400);
    }

    function draw() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // Plošček (Neon Cyan)
        if (rightDown && (paddlex + paddlew) < WIDTH) paddlex += 7;
        else if (leftDown && paddlex > 0) paddlex -= 7;
        drawNeonRect(paddlex, HEIGHT - paddleh - 5, paddlew, paddleh, "#00FFEA", 5);

        // Opeke (Neon Pink in Neon Blue izmenično)
        for (var i = 0; i < NROWS; i++) {
            for (var j = 0; j < NCOLS; j++) {
                if (bricks[i][j] == 1) {
                    var bx = (j * (BRICKWIDTH + PADDING)) + PADDING / 2;
                    var by = (i * (BRICKHEIGHT + PADDING)) + PADDING + 30;
                    drawNeonRect(bx, by, BRICKWIDTH, BRICKHEIGHT, rowcolors[i], 4);
                }
            }
        }

        if (igraSeJeZacela) {
            // Logika trkov
            var brickTotalH = BRICKHEIGHT + PADDING;
            var brickTotalW = BRICKWIDTH + PADDING;
            var row = Math.floor((y - 30 - PADDING) / brickTotalH);
            var col = Math.floor(x / brickTotalW);

            if (row >= 0 && row < NROWS && col >= 0 && col < NCOLS && bricks[row][col] == 1) {
                dy = -dy; bricks[row][col] = 0; stOpekZaRazbit--;
                if (stOpekZaRazbit === 0) { konecIgre(true); return; }
            }

            if (x + dx > WIDTH - r || x + dx < r) dx = -dx;
            if (y + dy < r) dy = -dy;
            else if (y + dy > HEIGHT - r - paddleh - 5) {
                if (x > paddlex && x < paddlex + paddlew) {
                    dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew);
                    dy = -dy;
                } else if (y + dy > HEIGHT - r) { konecIgre(false); return; }
            }
            x += dx; y += dy;
        } else {
            x = paddlex + paddlew / 2;
            y = HEIGHT - paddleh - r - 10;
            ctx.fillStyle = "white"; ctx.textAlign = "center";
            ctx.font = "16px Courier New";
            ctx.fillText("ENTER ZA ZAČETEK", WIDTH/2, HEIGHT/2 + 50);
        }
        circle(x, y, r);
    }

    function zagon() {
        initVariables();
        clearInterval(timerInterval); clearInterval(intervalId);
        timerInterval = setInterval(() => { 
            if (start) {
                sekunde++; 
                var s = sekunde % 60; var m = Math.floor(sekunde / 60);
                $("#cas").html((m < 10 ? "0"+m : m) + ":" + (s < 10 ? "0"+s : s));
            }
        }, 1000);
        intervalId = setInterval(draw, 10);
    }

    $("#ponovno-igraj").click(zagon);
    zagon();
});
