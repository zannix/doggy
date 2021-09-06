let last_value = 0;
let last_timer_second = 0;
let timer_seconds = 0;

let sensitivity_diff = 10;

let audio = null;

let cried_count = 0;

function playComfortingSound() {
    audio = new Audio('sounds/1.mp3');
    audio.play();
}

function increaseCriedCount()
{
    cried_count++;
    document.getElementById('cried-count').innerHTML = cried_count.toString();
}

function audioIsPlaying()
{
    if(audio){
        return audio.duration > 0 && !audio.paused
    }

    return false;
}

setInterval(function incrementSeconds() {
    timer_seconds += 1;
}, 1000);

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;
if (navigator.getUserMedia) {
    navigator.getUserMedia({
            audio: true
        },
        function(stream) {
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(stream);
            javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;

            microphone.connect(analyser);
            analyser.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);

            javascriptNode.onaudioprocess = function() {
                let array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                let values = 0;

                let length = array.length;
                for (var i = 0; i < length; i++) {
                    values += (array[i]);
                }

                let average = values / length;
                let new_value = Math.round(average);

                if((timer_seconds - last_timer_second) >= 1) {

                    if(!audioIsPlaying() && Math.abs(new_value - last_value) > sensitivity_diff){
                        playComfortingSound();
                        increaseCriedCount();
                    }

                    last_value = new_value;
                    last_timer_second = timer_seconds;
                }
            } // end fn stream
        },
        function(err) {
            console.log("The following error occured: " + err.name)
        });
} else {
    console.log("getUserMedia not supported");
}