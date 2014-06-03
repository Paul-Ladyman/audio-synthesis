define(function () {

    var toolkit = {},
        _sampleSize = 44100;

    toolkit.AudioManager = function (channels, samplingFrequency) {

        var output = new Audio(),
            audioOut = new Float32Array(_sampleSize),
            audioStream,
            bufferSize = _sampleSize,
            bufferPos = 0;

        _sampleSize = samplingFrequency;
        output.mozSetup(channels, samplingFrequency);

        function writeAudio (buffer) {

            output.mozWriteAudio(buffer);
        }

        this.receiveSample = function (sample) {

            audioOut[bufferPos] = sample;
            bufferPos++;

            if (bufferPos >= bufferSize) {

                writeAudio(audioOut);
                bufferPos = 0;
            }

        };
    };

    toolkit.SinOscillator = function (frequency) {

        var oscillator = new Float32Array(_sampleSize),
            connectedTo,
            stop;

        function sendStream () {

            var hz,
                sample;

            for (var i = 0.0; i < _sampleSize; i++) {

                hz = (2.0 * Math.PI * i) / _sampleSize;

                sample = Math.sin(frequency * hz);

                connectedTo.receiveSample(sample);
            }
        }

        this.connectOutputTo = function (connector) {

            connectedTo = connector;
        };

        this.start = function () {

            console.log('start');
            stop = false;


            setInterval(function() {

                if (!stop) {
                    sendStream();
                }
            }, 100);
        };

        this.stop = function () {

            console.log('stop');
            stop = true;
        };
    };

    toolkit.Envelope = function (breakPoints, oscillator) {

        var connectedTo,
            envelope = new Float32Array(_sampleSize),
            envelopePos = 0,
            envelopeValue = 0.0,
            range = 0;

        for (var index in breakPoints) {

            var breakPointSamples = breakPoints[index]['time'] * _sampleSize;

            range += breakPointSamples;
            breakPoints[index]['range'] = range;

            breakPoints[index]['gradient'] = (breakPoints[index]['end'] - breakPoints[index]['start']) / breakPointSamples;
        }

        this.connectOutputTo = function (connector) {

            connectedTo = connector;
        };

        this.receiveSample = function (sample) {

            for (var index in breakPoints) {

                if (envelopePos < breakPoints[index]['range']) {

                    envelopeValue += breakPoints[index]['gradient'];
                    break;
                }
            }

            sample *= envelopeValue;
            connectedTo.receiveSample(sample);

            envelopePos++;

            if (envelopePos > range) {

                envelopePos = 0;
                oscillator.stop();
            }
        };
    };

    return toolkit;

});
