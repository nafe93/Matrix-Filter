/**
 * Created by nafe on 25.02.2017.
 */
//1000/30 == 30FPS
function video() {
    // Кнопки фильтров
    var v = document.getElementById('v');
    // canvas 0-5
    var canvas0 = document.getElementById("canvas0");
    var canvas1 = document.getElementById("canvas1");
    var canvas2 = document.getElementById("canvas2");
    var canvas3 = document.getElementById("canvas3");
    var canvas4 = document.getElementById("canvas4");
    var canvas5 = document.getElementById("canvas5");
    // ctx 0-5
    var ctx0 = canvas0.getContext("2d");
    var ctx1 = canvas1.getContext("2d");
    var ctx2 = canvas2.getContext("2d");
    var ctx3 = canvas3.getContext("2d");
    var ctx4 = canvas4.getContext("2d");
    var ctx5 = canvas5.getContext("2d");
    // подключение камеры через getUserMedia
    navigator.getUserMedia = (  navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);
    if (navigator.getUserMedia) {
        // Request access to video only
        navigator.getUserMedia(
            {
                //video: true,
                video: {
                    mandatory: {
                        maxWidth: 1920,
                        maxHeight: 1080,
                        minWidth: 64,
                        minHeight: 64
                    }
                },
                optional: [
                    { minFrameRate: 60 }
                ],
                audio: false
            },
            function (stream) {
                var url = window.URL || window.webkitURL;
                v.src = url.createObjectURL(stream);
                v.play();
            },
            function (error) {
                alert('Что-то пошло не так. (номер ощибки ' + error.code + ')');
                return 0;
            }
        );
    }
    else {
        alert('Извените, браузер не подерживает\'t getUserMedia');
        return 0;
    }
    //события
    v.addEventListener("playing", function () {
        setTimeout(function () {
            console.log("Stream dimensions : " + v.videoWidth + " X " + v.videoHeight );
        }, 1000/30);
    });
    v.addEventListener("playing", function () {
        setTimeout(function () {
            noise(ctx0);
        }, 1000/30);
    });
    v.addEventListener('play', function () {
        (function loop() {
            ctx1.drawImage(canvas0, 0, 0, 300, 150);
            Gaus(ctx1,300,150,1);
            setTimeout(loop, 1000 / 60);
        })();
    }, 0);
    v.addEventListener('play', function () {
        (function loop() {
            ctx2.drawImage(canvas0, 0, 0, 300, 150);
            Laplas(ctx2,300,150,1);
            setTimeout(loop, 1000 / 60);
        })();
    }, 0);
    v.addEventListener('play', function () {
        (function loop() {
            ctx3.drawImage(canvas0, 0, 0, 300, 150);
            sobel(ctx3,300,150,1);
            setTimeout(loop, 1000 / 60);
        })();
    }, 0);
    v.addEventListener('play', function () {
        (function loop() {
            ctx5.drawImage(canvas0, 0, 0, 300, 150);
            roberts(ctx5,300,150,1);
            setTimeout(loop, 1000 / 60);
        })();
    }, 0);
    v.addEventListener('play', function () {
        (function loop() {
            ctx4.drawImage(canvas0, 0, 0, 300, 150);
            D_OP(ctx4,300,150,1);
            setTimeout(loop, 1000 / 60);
        })();
    }, 0);
    //фильтры + шумы
    function noise(bcv) {
        //Подключение видео
        bcv.drawImage(v, 0, 0, bcv.canvas.width, bcv.canvas.height);
        var apx = bcv.getImageData(0, 0, bcv.canvas.width, bcv.canvas.height);
        var data = apx.data;
        var number;
        //Алгоритм добавление шума
        for (var i = 0; i < data.length; i += 4) {
            number = Math.floor( Math.random() * 60 );
            //number = 0;
            data[i] = data[i] + number;
            data[i + 1] = data[i + 1]+ number ;
            data[i + 2] = data[i + 2]+ number;
            data[i + 3] = 255;
        }
        //Присваеваем новую data
        apx.data = data;
        //выводим в поток
        bcv.putImageData(apx, 0, 0);

        if (v.paused || v.ended) {
            return;
        }
        setTimeout(function () {
            noise(bcv);
        }, 0);
    }
    // функции матричных фильтров
    function Gaus(ctx, w, h, mix) {

        var weights = [1,4,7,4,1,
        4,16,26,16,4,
        7,26,41,26,7,
        4,16,26,16,4,
        1,4,7,4,1],
            katet = Math.round(Math.sqrt(weights.length)),
            half = (katet * 0.5) | 0,
            dstData = ctx.createImageData(w, h),
            dstBuff = dstData.data,
            srcBuff = ctx.getImageData(0, 0, w, h).data,
            y = h;
        for(var i = 0; i< weights.length;i++){
            weights[i] = weights[i] *  (1/274);
        }
        while (y--) {

            x = w;

            while (x--) {

                var sy = y,
                    sx = x,
                    dstOff = (y * w + x) * 4,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0;

                for (var cy = 0; cy < katet; cy++) {
                    for (var cx = 0; cx < katet; cx++) {

                        var scy = sy + cy - half;
                        var scx = sx + cx - half;

                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {

                            var srcOff = (scy * w + scx) * 4;
                            var wt = weights[cy * katet + cx];

                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }

                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }

        ctx.putImageData(dstData, 0, 0);
    }

    function Laplas(ctx, w, h, mix) {

        var weights = [-1, -1, -1, -1, 8, -1, -1, -1, -1],
            katet = Math.round(Math.sqrt(weights.length)),
            half = (katet * 0.5) | 0,
            dstData = ctx.createImageData(w, h),
            dstBuff = dstData.data,
            srcBuff = ctx.getImageData(0, 0, w, h).data,
            y = h;

        while (y--) {

            x = w;

            while (x--) {

                var sy = y,
                    sx = x,
                    dstOff = (y * w + x) * 4,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0;

                for (var cy = 0; cy < katet; cy++) {
                    for (var cx = 0; cx < katet; cx++) {

                        var scy = sy + cy - half;
                        var scx = sx + cx - half;

                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {

                            var srcOff = (scy * w + scx) * 4;
                            var wt = weights[cy * katet + cx];

                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }

                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }

        ctx.putImageData(dstData, 0, 0);
    }
    function sobel(ctx, w, h, mix) {

        var weights = [-1, 0, 1, -2, 0, 2, -1, 0, 1],
            katet = Math.round(Math.sqrt(weights.length)),
            half = (katet * 0.5) | 0,
            dstData = ctx.createImageData(w, h),
            dstBuff = dstData.data,
            srcBuff = ctx.getImageData(0, 0, w, h).data,
            y = h;

        while (y--) {

            x = w;

            while (x--) {

                var sy = y,
                    sx = x,
                    dstOff = (y * w + x) * 4,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0;

                for (var cy = 0; cy < katet; cy++) {
                    for (var cx = 0; cx < katet; cx++) {

                        var scy = sy + cy - half;
                        var scx = sx + cx - half;

                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {

                            var srcOff = (scy * w + scx) * 4;
                            var wt = weights[cy * katet + cx];

                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }

                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }

        ctx.putImageData(dstData, 0, 0);
    }

    function D_OP(ctx, w, h, mix) {

        var weights = [-1, -1, -1, 0, 0, 0, 1, 1, 1],
            katet = Math.round(Math.sqrt(weights.length)),
            half = (katet * 0.5) | 0,
            dstData = ctx.createImageData(w, h),
            dstBuff = dstData.data,
            srcBuff = ctx.getImageData(0, 0, w, h).data,
            y = h;

        while (y--) {

            x = w;

            while (x--) {

                var sy = y,
                    sx = x,
                    dstOff = (y * w + x) * 4,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0;

                for (var cy = 0; cy < katet; cy++) {
                    for (var cx = 0; cx < katet; cx++) {

                        var scy = sy + cy - half;
                        var scx = sx + cx - half;

                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {

                            var srcOff = (scy * w + scx) * 4;
                            var wt = weights[cy * katet + cx];

                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }

                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }

        ctx.putImageData(dstData, 0, 0);
    }

    function roberts(ctx, w, h, mix) {

        var weights = [0,1,-1,0],
            //[1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25],//[1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9] [0, 0, 0, -1, 0, 1, 0, 0, 0],[-1, -1, -1, -1, 8, -1, -1, -1, -1] [1/16, 1/8, 1/16, 1/8, 1/4, 1/8, 1/16, 1/8, 1/16]
            katet = Math.round(Math.sqrt(weights.length)),
            half = (katet * 0.5) | 0,
            dstData = ctx.createImageData(w, h),
            dstBuff = dstData.data,
            srcBuff = ctx.getImageData(0, 0, w, h).data,
            y = h;

        while (y--) {

            x = w;

            while (x--) {

                var sy = y,
                    sx = x,
                    dstOff = (y * w + x) * 4,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0;

                for (var cy = 0; cy < katet; cy++) {
                    for (var cx = 0; cx < katet; cx++) {

                        var scy = sy + cy - half;
                        var scx = sx + cx - half;

                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {

                            var srcOff = (scy * w + scx) * 4;
                            var wt = weights[cy * katet + cx];

                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }

                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }

        ctx.putImageData(dstData, 0, 0);
    }

    $('.clicker').click(function(){
        var clickedID = this.id;
        var click = document.getElementById(clickedID);
        var data =  click.toDataURL();
        this.href = data;
        window.open(this.href);
    });
}
window.addEventListener('load',video);

