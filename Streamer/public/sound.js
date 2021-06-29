var progressBar = document.getElementById("progressBar");
var volumeMinLimit = document.getElementById("volumeMinLimit");

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

socket.emit("joinRoom", "sound");

navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(stream => {
        var context = new AudioContext();
        var source = context.createMediaStreamSource(stream);
        var processor = context.createScriptProcessor(1024, 1, 1);

        source.connect(processor);
        processor.connect(context.destination);
        processor.onaudioprocess = function (e) {
            var channelData = e.inputBuffer.getChannelData(0);

            var avg = 0;

            channelData.forEach(f => { avg += Math.abs(f); });
            avg = (avg / 1024) * 1000;

            progressBar.style.width = avg + "%";
            if (avg > (100 - volumeMinLimit.value))
                socket.emit("sendSound", channelData);
        };
    });


socket.on("comingsound", (channelData) => {
    var myArrayBuffer = audioCtx.createBuffer(2, 1024, audioCtx.sampleRate);
    for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
        var nowBuffering = myArrayBuffer.getChannelData(channel);
        for (var i = 0; i < 1024; i++) {
            nowBuffering[i] = channelData[i];

        }
    }
    var source = audioCtx.createBufferSource();
    source.buffer = myArrayBuffer;
    source.connect(audioCtx.destination);
    source.start();
});

