let mediaRecorder;
var videos = document.getElementById("videos");
socket.emit("joinRoom", room);

var mediaSorces = [];

var displayMediaOptions = {
    video: {
        cursor: "always",
        width: 1280, height: 720
    },
    audio: false
};
navigator.mediaDevices.getDisplayMedia(displayMediaOptions).then(mediaStream => {
    var options = { mimeType: "video/webm; codecs=vp9" };
    mediaRecorder = new MediaRecorder(mediaStream, options);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            socket.emit("sendVideo", { room: room, meta: event.data })
        } else {
        }
    };
    mediaRecorder.onstop = () => {
        mediaRecorder.start();
    }
    mediaRecorder.start();
    setInterval(() => {
        mediaRecorder.stop();
    }, 300);
});

socket.on("joinedPerson", (jonied) => {
    console.log(jonied);
    if (jonied == "sound") return;
    videoElem = document.createElement('video');
    videoElem.setAttribute("id", jonied);
    videoElem.setAttribute("width", "300");
    videoElem.setAttribute("height", "200");

    var mimeCodec = 'video/webm; codecs="vp9"';

    if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
        var mediaSource = new MediaSource;
        //console.log(mediaSource.readyState); // closed

    } else {
        console.error('Unsupported MIME type or codec: ', mimeCodec);
    }
    mediaSorces[jonied] = (mediaSource);
    videoElem.src = URL.createObjectURL(mediaSorces[jonied]);
    mediaSorces[jonied].addEventListener('sourceopen', sourceOpen);
    function sourceOpen(_) {
        // open
        var mediaSource = this;
        if (mediaSorces[jonied].sourceBuffers.length < 1)
            var sourceBuffer = mediaSorces[jonied].addSourceBuffer(mimeCodec);
        else
            var sourceBuffer = mediaSorces[jonied].sourceBuffers[0];
        socket.on(jonied + "comingvideo", (mediaStream) => {
            sourceBuffer.addEventListener('updateend', function (_) {
                if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
                    mediaSource.endOfStream();
                }
                var isPlaying = videoElem.currentTime > 0 && !videoElem.paused && !videoElem.ended
                    && videoElem.readyState > videoElem.HAVE_CURRENT_DATA;

                if (!isPlaying) {
                    var playPromise = videoElem.play();
                    if (playPromise !== undefined) {
                        playPromise.then(_ => {
                            // Automatic playback started!
                            // Show playing UI.
                        })
                            .catch(error => {
                                // Auto-play was prevented
                                // Show paused UI.
                            });
                    }
                }
                //console.log(mediaSource.readyState); // ended
            });
            // if (
            //     mediaSource.readyState === "open" &&
            //     sourceBuffer &&
            //     sourceBuffer.updating === false &&
            //     mediaStream.length > 0
            // ) {
            try {

                sourceBuffer.appendBuffer(mediaStream);
            } catch (e) { }
            // }

            // console.log(new Blob([mediaStream], { type: 'video/webm; codecs=vp9' }));
            // videoElem.src = URL.createObjectURL(new Blob([mediaStream], { type: 'video/webm; codecs=vp9' }));
        });

    };
    videos.appendChild(videoElem);
});



// try {
//     videoElem.src = URL.createObjectURL(builder.getBlob());
// } catch (error) {
//     videoElem.src = URL.createObjectURL(builder.getBlob());
// }
// videoElem.onloadedmetadata = function (e) {
//     videoElem.play();
// };