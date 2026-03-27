$(document).ready(function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;
    
    var x, y, dx, dy, r;
    var paddlex, paddleh, paddlew;
    var rightDown, leftDown;
    var bricks, NROWS, NCOLS, BRICKWIDTH, BRICKHEIGHT, PADDING;
    var rowcolors = ["#FF1C0A", "#FFFD0A", "#00A308", "#00FFEA", "#EB0093"];
    var sekunde, start, timerInterval, intervalId;
    var stOpekZaRazbit;
    
    var igraSeJeZacela; // Spremenljivka, ki pove, če igralec že igra

    function initVariables() {
        r = 8;
        paddleh = 10;
        paddlew = 85;
        paddlex = WIDTH / 2 - paddlew / 2;
        
        // Žogica začne na sredini ploščka
        x = paddlex + paddlew / 2;
        y = HEIGHT - paddleh - r;
        
        dx = 4;
        dy = -4;
        
        sekunde = 0;
        start = false; // Čas se še ne meri
        igraSeJeZacela = false; // Igra čaka na klik/enter
        stOpekZaRazbit = 0;
        rightDown = false;
        leftDown = false;

        NROWS = 5;
        NCOLS = 7;
        PADDING = 2;
        BRICKWIDTH = (WIDTH / NCOLS) - PADDING;
        BRICKHEIGHT = 20;
        
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

    function posodobiCas() {
        if (start == true && igraSeJeZacela == true) {
            sekunde++;
            var sekundeI = sekunde % 60;
            var minuteI = Math.floor(sekunde / 60);
            
            sekundeI = sekundeI > 9 ? sekundeI : "0" + sekundeI;
            minuteI = minuteI > 9 ? minuteI : "0" + minuteI;
            
            $("#cas").html(minuteI + ":" + sekundeI);
        }
    }

    function circle(x, y, r) {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }

    function rect(x, y, w, h) {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.closePath();
        ctx.fill();
    }

    function clear() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }

    // NADZOR TIPKOVNICE (Puščice + A in D)
    function onKeyDown(evt) {
        if (evt.keyCode == 39 || evt.keyCode == 68) rightDown = true; // Desno puščica ali D
        else if (evt.keyCode == 37 || evt.keyCode == 65) leftDown = true; // Levo puščica ali A
        else if (evt.keyCode == 13 && !igraSeJeZacela) pozeniIgro(); // Enter za začetek
    }

    function onKeyUp(evt) {
        if (evt.keyCode == 39 || evt.keyCode == 68) rightDown = false;
        else if (evt.keyCode == 37 || evt.keyCode == 65) leftDown = false;
    }

    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);

    // NADZOR MIŠKE
    $("#canvas").mousemove(function(e) {
        // e.offsetX nam da relativno X koordinato miške na platnu
        var relativniX = e.offsetX;
        if(relativniX > 0 && relativniX < WIDTH) {
            paddlex = relativniX - paddlew / 2;
            
            // Omejitev ploščka znotraj platna
            if (paddlex < 0) paddlex = 0;
            if (paddlex + paddlew > WIDTH) paddlex = WIDTH - paddlew;
        }
    });

    // KLIK ZA ZAČETEK
    $("#canvas").click(function() {
        if (!igraSeJeZacela) {
            pozeniIgro();
        }
    });

    function pozeniIgro() {
        igraSeJeZacela = true;
        start = true; // Poženemo uro
    }

    function konecIgre(zmaga) {
        clearInterval(intervalId);
        clearInterval(timerInterval);
        start = false;
        
        if (zmaga) {
            $("#konec-sporocilo").text("ZMAGAL SI!").css({
                "color": "#00A308",
                "text-shadow": "0 0 15px #00A308"
            });
        } else {
            $("#konec-sporocilo").text("KONEC IGRE!").css({
                "color": "#FF1C0A",
                "text-shadow": "0 0 15px #FF1C0A"
            });
        }
        
        $("#konec-zaslon").fadeIn(400);
    }

    function draw() {
        clear();

        // Premik ploščka (tipkovnica)
        if (rightDown) {
            if ((paddlex + paddlew) < WIDTH) paddlex += 6;
            else paddlex = WIDTH - paddlew;
        } else if (leftDown) {
            if (paddlex > 0) paddlex -= 6;
            else paddlex = 0;
        }

        // Risanje ploščka
        ctx.fillStyle = "#00FFEA";
        rect(paddlex, HEIGHT - paddleh, paddlew, paddleh);

        // Risanje opek
        for (var i = 0; i < NROWS; i++) {
            ctx.fillStyle = rowcolors[i];
            for (var j = 0; j < NCOLS; j++) {
                if (bricks[i][j] == 1) {
                    rect((j * (BRICKWIDTH + PADDING)) + PADDING,
                         (i * (BRICKHEIGHT + PADDING)) + PADDING,
                         BRICKWIDTH, BRICKHEIGHT);
                }
            }
        }

        // Logika žogice
        if (igraSeJeZacela) {
            // Premikanje in trki samo, če se je igra začela
            
            var rowheight = BRICKHEIGHT + PADDING;
            var colwidth = BRICKWIDTH + PADDING;
            var row = Math.floor(y / rowheight);
            var col = Math.floor(x / colwidth);

            if (y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] == 1) {
                dy = -dy; 
                bricks[row][col] = 0;
                stOpekZaRazbit--;
                
                if (stOpekZaRazbit === 0) {
                    konecIgre(true);
                    return;
                }
            }

            // Odboji od sten in ploščka
            if (x + dx > WIDTH - r || x + dx < 0 + r) {
                dx = -dx;
            }
            
            if (y + dy < 0 + r) {
                dy = -dy;
            } else if (y + dy > HEIGHT - r - paddleh) {
                if (x > paddlex && x < paddlex + paddlew) {
                    dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew);
                    dy = -dy;
                    start = true;
                } else if (y + dy > HEIGHT - r) {
                    konecIgre(false);
                    return;
                }
            }

            x += dx;
            y += dy;
        } else {
            // Če igra še stoji, naj žogica sledi ploščku
            x = paddlex + paddlew / 2;
            y = HEIGHT - paddleh - r;

            // Izris besedila za pomoč
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.font = "16px Courier New";
            ctx.textAlign = "center";
            ctx.fillText("Klikni ali Enter za začetek", WIDTH / 2, HEIGHT / 2 + 50);
        }

        // Risanje žogice (izrisana vedno, samo pozicija se spreminja zgoraj)
        circle(x, y, r);
    }

    function zagon() {
        initVariables();
        clearInterval(timerInterval);
        clearInterval(intervalId);
        
        timerInterval = setInterval(posodobiCas, 1000);
        intervalId = setInterval(draw, 15); // Risanje vedno teče, da lahko premikamo plošček
    }

    $("#ponovno-igraj").click(function() {
        zagon();
    });

    zagon();
});