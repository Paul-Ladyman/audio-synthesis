define(['./Toolkit'], function (Toolkit) {

    var synthesis = {};

    var output = new Toolkit.AudioManager(1, 44100),
        sinWave = new Toolkit.SinOscillator(440.0);

    var amplitudeEnvelopePoints = [

        {'start' : 0.0, 'end' : 1.0, 'time' : 0.1},
        {'start' : 1.0, 'end' : 0.8, 'time' : 0.2},
        {'start' : 0.8, 'end' : 0.8, 'time' : 0.5},
        {'start' : 0.8, 'end' : 0.0, 'time' : 0.2},
    ];

    var amplitudeEnvelope = new Toolkit.Envelope(amplitudeEnvelopePoints, sinWave);

    sinWave.connectOutputTo(amplitudeEnvelope);
    amplitudeEnvelope.connectOutputTo(output);

    synthesis.playToneTwo = function () {

        sinWave.start();
    };

    synthesis.playTone = function () {

        var output = new Audio(),
            sampleSize = 44100;

        output.mozSetup(1, 44100);

        var out = new Float32Array(sampleSize),
            one = new Float32Array(sampleSize),
            two = new Float32Array(sampleSize),
            three = new Float32Array(sampleSize),
            amplitudeEnvelope = new Float32Array(sampleSize);
            frequencyEnvelope = new Float32Array(sampleSize);

        var amplitudeEnvelopeValue = 0.0,
            amplitudeMin = 0.0,
            amplitudeMax = 1.0,
            attackValue = 1.0,
            attackEnd = 10000.0,
            decayValue = 0.8,
            decayEnd = 14000.0,
            sustainValue = 0.8,
            sustainEnd = 36000,
            releaseValue = 0.0,
            releaseEnd = sampleSize,
            rootFrequencyOne = 220.0,
            rootFrequencyTwo = 329.628,
            rootFrequencyThree = 440.0,
            frequencyEnvelopeStart = 1.0,
            frequencyEnvelopeEnd = 2.0,
            hz;

        var attackIncrement = attackValue/attackEnd,
            decayDecrement = (decayValue - attackValue)/(decayEnd-attackEnd),
            releaseDecrement = (releaseValue - sustainValue)/(releaseEnd - sustainEnd),
            frequencyStep = (frequencyEnvelopeEnd - frequencyEnvelopeStart)/sampleSize;

        for (var i = 0; i < sampleSize; i++) {

            if (i <= attackEnd) {

                amplitudeEnvelopeValue += attackIncrement;
            }
            else if (i > attackEnd && i <= decayEnd) {

                amplitudeEnvelopeValue += decayDecrement;
            }
            else if (i > decayEnd && i <= sustainEnd) {

                amplitudeEnvelopeValue = sustainValue;
            }
            else if (i > sustainEnd && i <= releaseEnd) {

                amplitudeEnvelopeValue += releaseDecrement;
            }
            
            hz = (2.0 * Math.PI * i) / sampleSize;

            frequencyEnvelopeValue = (frequencyStep * i) + frequencyEnvelopeStart;
            frequencyEnvelope[i] = frequencyEnvelopeValue;
            amplitudeEnvelope[i] = amplitudeEnvelopeValue;

            one[i] = Math.sin(rootFrequencyOne * hz * frequencyEnvelope[i]) * amplitudeEnvelope[i];
            two[i] = Math.sin(rootFrequencyTwo * hz * frequencyEnvelope[i]) * amplitudeEnvelope[i];
            three[i] = Math.sin(rootFrequencyThree * hz * frequencyEnvelope[i]) * amplitudeEnvelope[i];

            out[i] = one[i] + two[i] + three[i];
        }

        output.mozWriteAudio(out);
    }

    return synthesis;

});
