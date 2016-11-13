function periodicWaveTest(name, notes) {
  // Original source is from musicial.js
  // https://github.com/PencilCode/musical.js
  //
  // Call this function to play notes with selected instrument:
  //   periodicWaveTest('piano', notes);
  //
  // Where `notes` is an array of objects like this:
  // {"frequency":415.3,"duration":0.71875,"velocity":1,"time":20.811,"cleanuptime":21.692}
  // Test arrays of notes can be got from few functions at the end of
  // file (like getMoonlightNotesShort()), these were stolen also from
  // musicial.js (just recorded into the array when musicial parsed them
  // from the abc notation)
  //
  name = name || 'piano';
  notes = notes || getMoonlightNotesShort();
  var ac = new AudioContext();

  var waves = createWaves(ac);
  var wave = waves[name];

  var dcn = ac.createDynamicsCompressor();
  dcn.ratio = 16;
  dcn.attack = 0.0005;
  dcn.connect(ac.destination);
  var out = ac.createGain();
  out.connect(dcn);


  // The setup includes tail part, which is common for all nodes
  // And head - set of nodes added for each note
  // It looks like this:
  //
  // ------------- HEAD ---------------- | --------- TAIL --------------------
  //                                     |
  // [ |Oscillator|->|Biquad|->|Gain|-> ][ |Gain|->|Dynamics  |->|Destination| ]
  //   |Periodic  |  |Filter|  |ADSR|              |Compressor|
  //   |Wave      |
  //
  // The first oscillator can be doubled by another one to play
  // at note frequency + timbre detune (if detune is set for the timbre)
  //
  // So we crate an oscillator (or two) + filter + ADSR gain to play each note.
  // This way we create a lot of audio nodes.
  // Musicial.js handles this by creating a queue of notes and passed only a limited set of notes to web audio API.
  //
  for (var idx in notes) {
    var note = notes[idx];
    var timbre = wave.defs;
    var startTime = note.time;
    var releaseTime = startTime + note.duration;
    var attackTime = Math.min(releaseTime, startTime + timbre.attack);
    var decayTime = timbre.decay *
          Math.pow(440 / note.frequency, timbre.decayfollow);
    var decayStartTime = attackTime;
    var stopTime = releaseTime + timbre.release;
    var doubled = timbre.detune && timbre.detune != 1.0;
    var amp = timbre.gain * note.velocity * (doubled ? 0.5 : 1.0);

    var g = ac.createGain();
    g.connect(out);
    g.gain.setValueAtTime(0, startTime);
    // ATTACK
    g.gain.linearRampToValueAtTime(amp, attackTime);
    // DECAY
    //   For the beginning of the decay, use linearRampToValue instead
    //   of setTargetAtTime, because it avoids http://crbug.com/254942.
    while (decayStartTime < attackTime + 1/32 &&
           decayStartTime + 1/256 < releaseTime) {
      // Just trace out the curve in increments of 1/256 sec
      // for up to 1/32 seconds.
      decayStartTime += 1/256;
      g.gain.linearRampToValueAtTime(
          amp * (timbre.sustain + (1 - timbre.sustain) *
              Math.exp((attackTime - decayStartTime) / decayTime)),
          decayStartTime);
    }
    // SUSTAIN
    //   For the rest of the decay, use setTargetAtTime.
    g.gain.setTargetAtTime(amp * timbre.sustain,
        decayStartTime, decayTime);
    // RELEASE
    //   Then at release time, mark the value and ramp to zero.
    g.gain.setValueAtTime(amp * (timbre.sustain + (1 - timbre.sustain) *
        Math.exp((attackTime - releaseTime) / decayTime)), releaseTime);
    g.gain.linearRampToValueAtTime(0, stopTime);

    //var f = g;
    var f = ac.createBiquadFilter();
    f.frequency.value =
        wave.defs.cutoff + note.frequency * wave.defs.cutfollow;
    f.Q.value = wave.defs.resonance;
    f.connect(g);

    var osc = ac.createOscillator();
    // Configure periodic wave
    osc.frequency.value = note.frequency;
    var pwave = wave.wave;
    // Check the note frequency and if it is greater than wave frequency
    // then switch to another wave for higher frequency
    // Waves for different frequences are pre-created in createWaves()
    if (wave.freq) {
      var bwf = 0;
      // Look for a higher-frequency variant.
      for (var k in wave.freq) {
        wf = Number(k);
        if (note.frequency > wf && wf > bwf) {
          bwf = wf;
          pwave = wave.freq[bwf];
        }
      }
    }
    osc.setPeriodicWave(pwave);
    osc.connect(f);
    osc.start(startTime);
    osc.stop(stopTime);

    if (doubled) {
      var o2 = ac.createOscillator();
      o2.frequency.value = note.frequency * timbre.detune;
      o2.setPeriodicWave(wave.wave);
      o2.connect(f);
      o2.start(startTime);
      o2.stop(stopTime);
    }
    startTime += note.duration*1;
  }
}

function createWaves(ac) {
  return (function(wavedata) {
    function makePeriodicWave(data) {
      var n = data.real.length,
          real = new Float32Array(n),
          imag = new Float32Array(n),
          j;
      for (j = 0; j < n; ++j) {
        real[j] = data.real[j];
        imag[j] = data.imag[j];
      }
      try {
        // Latest API naming.
        return ac.createPeriodicWave(real, imag);
      } catch (e) { }
      try {
        // Earlier API naming.
        return ac.createWaveTable(real, imag);
      } catch (e) { }
      return null;
    }
    function makeMultiple(data, mult, amt) {
      var result = { real: [], imag: [] }, j, n = data.real.length, m;
      for (j = 0; j < n; ++j) {
        m = Math.log(mult[Math.min(j, mult.length - 1)]);
        result.real.push(data.real[j] * Math.exp(amt * m));
        result.imag.push(data.imag[j] * Math.exp(amt * m));
      }
      return result;
    }
    var result = {}, k, d, n, j, ff, record, wave, pw;
    for (k in wavedata) {
      d = wavedata[k];
      wave = makePeriodicWave(d);
      if (!wave) { continue; }
      record = { wave: wave };
      // A strategy for computing higher frequency waveforms: apply
      // multipliers to each harmonic according to d.mult.  These
      // multipliers can be interpolated and applied at any number
      // of transition frequencies.
      if (d.mult) {
        ff = wavedata[k].freq;
        record.freq = {};
        for (j = 0; j < ff.length; ++j) {
          wave =
            makePeriodicWave(makeMultiple(d, d.mult, (j + 1) / ff.length));
          if (wave) { record.freq[ff[j]] = wave; }
        }
      }
      // This wave has some default filter settings.
      if (d.defs) {
        record.defs = d.defs;
      }
      result[k] = record;
    }
    return result;
  })({
    // Currently the only nonstandard waveform is "piano".
    // It is based on the first 32 harmonics from the example:
    // https://github.com/GoogleChrome/web-audio-samples
    // /blob/gh-pages/samples/audio/wave-tables/Piano
    // That is a terrific sound for the lowest piano tones.
    // For higher tones, interpolate to a customzed wave
    // shape created by hand, and apply a lowpass filter.
    piano: {
      real: [0, 0, -0.203569, 0.5, -0.401676, 0.137128, -0.104117, 0.115965,
             -0.004413, 0.067884, -0.00888, 0.0793, -0.038756, 0.011882,
             -0.030883, 0.027608, -0.013429, 0.00393, -0.014029, 0.00972,
             -0.007653, 0.007866, -0.032029, 0.046127, -0.024155, 0.023095,
             -0.005522, 0.004511, -0.003593, 0.011248, -0.004919, 0.008505],
      imag: [0, 0.147621, 0, 0.000007, -0.00001, 0.000005, -0.000006, 0.000009,
             0, 0.000008, -0.000001, 0.000014, -0.000008, 0.000003,
             -0.000009, 0.000009, -0.000005, 0.000002, -0.000007, 0.000005,
             -0.000005, 0.000005, -0.000023, 0.000037, -0.000021, 0.000022,
             -0.000006, 0.000005, -0.000004, 0.000014, -0.000007, 0.000012],
      // How to adjust the harmonics for the higest notes.
      mult: [1, 1, 0.18, 0.016, 0.01, 0.01, 0.01, 0.004,
                0.014, 0.02, 0.014, 0.004, 0.002, 0.00001],
      // The frequencies at which to interpolate the harmonics.
      freq: [65, 80, 100, 135, 180, 240, 620, 1360],
      // The default filter settings to use for the piano wave.
      // TODO: this approach attenuates low notes too much -
      // this should be fixed.
      defs: { wave: 'piano', gain: 0.5,
              attack: 0.002, decay: 0.25, sustain: 0.03, release: 0.1,
              decayfollow: 0.7,
              cutoff: 800, cutfollow: 0.1, resonance: 1, detune: 0.9994 }
    },
    bass: {
       real: [
         0.000000, -0.000001, -0.085652, 0.034718, -0.036957, 0.014576,
-0.005792, 0.003677, -0.002998, 0.001556, -0.000486, 0.001500,
-0.000809, 0.000955, -0.000169, 0.000636, -0.000682, 0.000663,
-0.000166, 0.000509, -0.000420, 0.000194, -0.000025, 0.000267,
-0.000299, 0.000226, -0.000038, 0.000163, -0.000273, 0.000141,
-0.000047, 0.000109],
       imag: [
        0.000000, 0.500000, -0.000001, 0.000000, -0.000001, 0.000001,
        -0.000000, 0.000000, -0.000000, 0.000000, -0.000000, 0.000000,
        -0.000000, 0.000000, -0.000000, 0.000000, -0.000000, 0.000000,
        -0.000000, 0.000000, -0.000000, 0.000000, -0.000000, 0.000000,
        -0.000000, 0.000000, -0.000000, 0.000000, -0.000000, 0.000000,
        -0.000000, 0.000000],
      // How to adjust the harmonics for the higest notes.
      mult: [1, 1, 0.18, 0.016, 0.01, 0.01, 0.01, 0.004,
                0.014, 0.02, 0.014, 0.004, 0.002, 0.00001],
      // The frequencies at which to interpolate the harmonics.
      freq: [65, 80, 100, 135, 180, 240, 620, 1360],
      // The default filter settings to use for the piano wave.
      // TODO: this approach attenuates low notes too much -
      // this should be fixed.
      defs: { wave: 'bass', gain: 0.5,
              attack: 0.002, decay: 0.25, sustain: 0.03, release: 0.1,
              decayfollow: 0.7,
              cutoff: 800, cutfollow: 0.1, resonance: 1, detune: 0.9994 }
    },
    guitar: {
       real: [
          0.000000, -0.000000, -0.179748, 0.252497, -0.212162, 0.069443,
          -0.067304, 0.006291, -0.063344, 0.007604, -0.069661, 0.004429,
          -0.019030, 0.000601, -0.001895, 0.000841, -0.009026, 0.001311,
          -0.024059, 0.002217, -0.019063, 0.002118, -0.048490, 0.000659,
          -0.007014, 0.000529, -0.003632, 0.000157, -0.000265, 0.000046,
          -0.000325, 0.000503],
       imag: [
          0.000000, 0.208930, -0.000001, 0.000004, -0.000005, 0.000003,
          -0.000004, 0.000000, -0.000006, 0.000001, -0.000010, 0.000001,
          -0.000004, 0.000000, -0.000001, 0.000000, -0.000003, 0.000001,
          -0.000012, 0.000001, -0.000011, 0.000001, -0.000035, 0.000001,
          -0.000006, 0.000000, -0.000004, 0.000000, 0.000000, 0.000000,
          0.000000, 0.000001],
      // How to adjust the harmonics for the higest notes.
      mult: [1, 1, 0.18, 0.016, 0.01, 0.01, 0.01, 0.004,
                0.014, 0.02, 0.014, 0.004, 0.002, 0.00001],
      // The frequencies at which to interpolate the harmonics.
      freq: [65, 80, 100, 135, 180, 240, 620, 1360],
      // The default filter settings to use for the piano wave.
      // TODO: this approach attenuates low notes too much -
      // this should be fixed.
      defs: { wave: 'guitar', gain: 0.5,
              attack: 0.002, decay: 0.25, sustain: 0.03, release: 0.1,
              decayfollow: 0.7,
              cutoff: 800, cutfollow: 0.1, resonance: 1, detune: 0.9994 }
    },
    trombone: {
       real: [
0.000000, 0.171738, 0.131907, -0.194800, -0.129913, -0.081043,
0.049213, 0.027828, -0.008357, -0.005044, 0.002145, 0.000773,
-0.001392, -0.000916, -0.000012, 0.000323, -0.000003, 0.000127,
-0.000135, -0.000029, -0.000031, 0.000087, -0.000091, 0.000005,
-0.000026, 0.000027, -0.000062, -0.000017, -0.000002, 0.000002,
0.000012, -0.000024
       ],
       imag: [
 0.000000, -0.090905, 0.482287, 0.259485, 0.009402, -0.125271,
-0.046816, 0.007872, 0.001762, -0.010488, -0.002305, 0.001791,
0.001101, -0.000303, -0.000064, 0.000143, 0.000059, 0.000116,
0.000120, -0.000011, -0.000066, -0.000019, 0.000024, 0.000014,
0.000069, 0.000056, 0.000005, 0.000002, -0.000026, -0.000015,
0.000055, 0.000012
],
      // How to adjust the harmonics for the higest notes.
      mult: [1, 1, 0.18, 0.016, 0.01, 0.01, 0.01, 0.004,
                0.014, 0.02, 0.014, 0.004, 0.002, 0.00001],
      // The frequencies at which to interpolate the harmonics.
      freq: [65, 80, 100, 135, 180, 240, 620, 1360],
      // The default filter settings to use for the piano wave.
      // TODO: this approach attenuates low notes too much -
      // this should be fixed.
      defs: { wave: 'trombone', gain: 0.5,
              attack: 0.002, decay: 0.25, sustain: 0.03, release: 0.1,
              decayfollow: 0.7,
              cutoff: 800, cutfollow: 0.1, resonance: 1, detune: 0.9994 }
    },
  });
}

function tremoloTest() {
  var audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Low frequency oscillator to create a periodic change in
  // sound's gain, tremolo effect
  var LFO = audioContext.createOscillator();
  var VCA = audioContext.createGain();
  var oscillator = audioContext.createOscillator();

  //connections
  LFO.connect(VCA.gain);
  oscillator.connect(VCA);
  VCA.connect(audioContext.destination);

  // LFO -> VCA.gain
  // osc -> VCA      -> dest

  LFO.frequency.value = 4;

  LFO.start(0);
  oscillator.start(0);
}


function getMoonlightNotesShort() {
  return [{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":1.811156462585034,"cleanuptime":2.2757397959183674},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":2.1444897959183673,"cleanuptime":2.609073129251701},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":2.477823129251701,"cleanuptime":2.9424064625850344},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":2.811156462585034,"cleanuptime":3.2757397959183674},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":3.1444897959183673,"cleanuptime":3.609073129251701},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":3.477823129251701,"cleanuptime":3.9424064625850344},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":3.811156462585034,"cleanuptime":4.2757397959183665},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":4.144489795918367,"cleanuptime":4.6090731292516995},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":4.477823129251701,"cleanuptime":4.9424064625850335},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":4.811156462585034,"cleanuptime":5.2757397959183665},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":5.144489795918368,"cleanuptime":5.6090731292517},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":5.477823129251701,"cleanuptime":5.9424064625850335},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":5.811156462585034,"cleanuptime":6.2757397959183665},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":6.144489795918367,"cleanuptime":6.6090731292516995},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":6.4778231292517,"cleanuptime":6.942406462585033},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":6.811156462585033,"cleanuptime":7.275739795918366},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":7.144489795918366,"cleanuptime":7.609073129251699},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":7.477823129251699,"cleanuptime":7.942406462585032},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":7.811156462585032,"cleanuptime":8.275739795918366},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":8.144489795918366,"cleanuptime":8.6090731292517},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":8.477823129251698,"cleanuptime":8.942406462585032},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":8.811156462585032,"cleanuptime":9.275739795918366},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":9.144489795918364,"cleanuptime":9.609073129251698},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":9.477823129251698,"cleanuptime":9.942406462585032},{"frequency":220,"duration":0.3020833333333333,"velocity":0.4,"time":9.81115646258503,"cleanuptime":10.275739795918364},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":10.144489795918364,"cleanuptime":10.609073129251698},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":10.477823129251698,"cleanuptime":10.942406462585032},{"frequency":220,"duration":0.3020833333333333,"velocity":0.4,"time":10.811156462585032,"cleanuptime":11.275739795918366},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":11.144489795918366,"cleanuptime":11.6090731292517},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":11.4778231292517,"cleanuptime":11.942406462585033},{"frequency":220,"duration":0.3020833333333333,"velocity":0.4,"time":11.811156462585034,"cleanuptime":12.275739795918367}];
}

function getMoonlightNotes() {
  return [{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":1.811156462585034,"cleanuptime":2.2757397959183674},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":2.1444897959183673,"cleanuptime":2.609073129251701},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":2.477823129251701,"cleanuptime":2.9424064625850344},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":2.811156462585034,"cleanuptime":3.2757397959183674},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":3.1444897959183673,"cleanuptime":3.609073129251701},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":3.477823129251701,"cleanuptime":3.9424064625850344},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":3.811156462585034,"cleanuptime":4.2757397959183665},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":4.144489795918367,"cleanuptime":4.6090731292516995},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":4.477823129251701,"cleanuptime":4.9424064625850335},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":4.811156462585034,"cleanuptime":5.2757397959183665},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":5.144489795918368,"cleanuptime":5.6090731292517},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":5.477823129251701,"cleanuptime":5.9424064625850335},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":5.811156462585034,"cleanuptime":6.2757397959183665},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":6.144489795918367,"cleanuptime":6.6090731292516995},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":6.4778231292517,"cleanuptime":6.942406462585033},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":6.811156462585033,"cleanuptime":7.275739795918366},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":7.144489795918366,"cleanuptime":7.609073129251699},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":7.477823129251699,"cleanuptime":7.942406462585032},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":7.811156462585032,"cleanuptime":8.275739795918366},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":8.144489795918366,"cleanuptime":8.6090731292517},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":8.477823129251698,"cleanuptime":8.942406462585032},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":8.811156462585032,"cleanuptime":9.275739795918366},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":9.144489795918364,"cleanuptime":9.609073129251698},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":9.477823129251698,"cleanuptime":9.942406462585032},{"frequency":220,"duration":0.3020833333333333,"velocity":0.4,"time":9.81115646258503,"cleanuptime":10.275739795918364},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":10.144489795918364,"cleanuptime":10.609073129251698},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":10.477823129251698,"cleanuptime":10.942406462585032},{"frequency":220,"duration":0.3020833333333333,"velocity":0.4,"time":10.811156462585032,"cleanuptime":11.275739795918366},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":11.144489795918366,"cleanuptime":11.6090731292517},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":11.4778231292517,"cleanuptime":11.942406462585033},{"frequency":220,"duration":0.3020833333333333,"velocity":0.4,"time":11.811156462585034,"cleanuptime":12.275739795918367},{"frequency":293.6647679174076,"duration":0.3020833333333333,"velocity":0.4,"time":12.144489795918368,"cleanuptime":12.609073129251701},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":12.477823129251702,"cleanuptime":12.942406462585035},{"frequency":220,"duration":0.3020833333333333,"velocity":0.4,"time":12.811156462585036,"cleanuptime":13.27573979591837},{"frequency":293.6647679174076,"duration":0.3020833333333333,"velocity":0.4,"time":13.14448979591837,"cleanuptime":13.609073129251703},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":13.477823129251703,"cleanuptime":13.942406462585037},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":13.811156462585037,"cleanuptime":14.275739795918371},{"frequency":261.6255653005986,"duration":0.3020833333333333,"velocity":0.4,"time":14.144489795918371,"cleanuptime":14.609073129251705},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":14.477823129251705,"cleanuptime":14.942406462585039},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":14.81115646258504,"cleanuptime":15.275739795918373},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":15.144489795918373,"cleanuptime":15.609073129251707},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":15.477823129251707,"cleanuptime":15.94240646258504},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":15.811156462585041,"cleanuptime":16.275739795918376},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":16.144489795918375,"cleanuptime":16.60907312925171},{"frequency":311.1269837220809,"duration":0.3020833333333333,"velocity":0.4,"time":16.47782312925171,"cleanuptime":16.942406462585044},{"frequency":184.9972113558172,"duration":0.3020833333333333,"velocity":0.4,"time":16.811156462585043,"cleanuptime":17.275739795918376},{"frequency":261.6255653005986,"duration":0.3020833333333333,"velocity":0.4,"time":17.14448979591838,"cleanuptime":17.609073129251712},{"frequency":311.1269837220809,"duration":0.3020833333333333,"velocity":0.4,"time":17.47782312925171,"cleanuptime":17.942406462585044},{"frequency":164.81377845643496,"duration":0.3020833333333333,"velocity":0.4,"time":17.811156462585046,"cleanuptime":18.27573979591838},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":18.14448979591838,"cleanuptime":18.609073129251712},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":18.47782312925171,"cleanuptime":18.942406462585044},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":18.811156462585043,"cleanuptime":19.275739795918376},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":19.144489795918375,"cleanuptime":19.60907312925171},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":19.477823129251707,"cleanuptime":19.94240646258504},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":19.81115646258504,"cleanuptime":20.275739795918373},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":20.14448979591837,"cleanuptime":20.609073129251705},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":20.477823129251703,"cleanuptime":20.942406462585037},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":20.811156462585036,"cleanuptime":21.27573979591837},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":21.144489795918368,"cleanuptime":21.6090731292517},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":21.4778231292517,"cleanuptime":21.942406462585033},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":21.811156462585032,"cleanuptime":22.275739795918366},{"frequency":311.1269837220809,"duration":0.3020833333333333,"velocity":0.4,"time":22.144489795918364,"cleanuptime":22.609073129251698},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":22.477823129251696,"cleanuptime":22.94240646258503},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":22.81115646258503,"cleanuptime":23.275739795918362},{"frequency":311.1269837220809,"duration":0.3020833333333333,"velocity":0.4,"time":23.14448979591836,"cleanuptime":23.609073129251694},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":23.477823129251693,"cleanuptime":23.942406462585026},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":23.811156462585025,"cleanuptime":24.27573979591836},{"frequency":311.1269837220809,"duration":0.3020833333333333,"velocity":0.4,"time":24.144489795918357,"cleanuptime":24.60907312925169},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":24.47782312925169,"cleanuptime":24.942406462585023},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":24.81115646258502,"cleanuptime":25.275739795918355},{"frequency":311.1269837220809,"duration":0.3020833333333333,"velocity":0.4,"time":25.144489795918354,"cleanuptime":25.609073129251687},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":25.477823129251686,"cleanuptime":25.94240646258502},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":25.811156462585018,"cleanuptime":26.27573979591835},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":26.14448979591835,"cleanuptime":26.609073129251684},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":26.477823129251682,"cleanuptime":26.942406462585016},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":26.811156462585014,"cleanuptime":27.275739795918348},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":27.144489795918346,"cleanuptime":27.60907312925168},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":27.47782312925168,"cleanuptime":27.942406462585012},{"frequency":220,"duration":0.3020833333333333,"velocity":0.4,"time":27.81115646258501,"cleanuptime":28.275739795918344},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":28.144489795918343,"cleanuptime":28.609073129251676},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":28.477823129251675,"cleanuptime":28.94240646258501},{"frequency":220,"duration":0.3020833333333333,"velocity":0.4,"time":28.811156462585007,"cleanuptime":29.27573979591834},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":29.14448979591834,"cleanuptime":29.609073129251673},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":29.47782312925167,"cleanuptime":29.942406462585005},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":29.811156462585004,"cleanuptime":30.275739795918337},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":30.144489795918336,"cleanuptime":30.60907312925167},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":30.477823129251668,"cleanuptime":30.942406462585},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":30.811156462585,"cleanuptime":31.275739795918334},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":31.144489795918332,"cleanuptime":31.609073129251666},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":31.477823129251664,"cleanuptime":31.942406462584998},{"frequency":220,"duration":0.3020833333333333,"velocity":0.4,"time":31.811156462584997,"cleanuptime":32.275739795918334},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":32.144489795918325,"cleanuptime":32.60907312925166},{"frequency":311.1269837220809,"duration":0.3020833333333333,"velocity":0.4,"time":32.47782312925166,"cleanuptime":32.942406462585},{"frequency":220,"duration":0.3020833333333333,"velocity":0.4,"time":32.81115646258499,"cleanuptime":33.27573979591833},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":33.144489795918325,"cleanuptime":33.60907312925166},{"frequency":311.1269837220809,"duration":0.3020833333333333,"velocity":0.4,"time":33.477823129251654,"cleanuptime":33.94240646258499},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":33.81115646258499,"cleanuptime":34.27573979591833},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":34.14448979591832,"cleanuptime":34.609073129251655},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":34.477823129251654,"cleanuptime":34.94240646258499},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":34.81115646258499,"cleanuptime":35.27573979591833},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":35.144489795918325,"cleanuptime":35.60907312925166},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":35.47782312925166,"cleanuptime":35.942406462585},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":35.811156462585,"cleanuptime":36.275739795918334},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":36.14448979591833,"cleanuptime":36.60907312925167},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":36.47782312925167,"cleanuptime":36.942406462585005},{"frequency":207.65234878997256,"duration":0.3020833333333333,"velocity":0.4,"time":36.811156462585004,"cleanuptime":37.27573979591834},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":37.14448979591834,"cleanuptime":37.60907312925168},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":37.477823129251675,"cleanuptime":37.94240646258501},{"frequency":195.99771799087463,"duration":0.3020833333333333,"velocity":0.4,"time":37.81115646258501,"cleanuptime":38.27573979591835},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":38.144489795918346,"cleanuptime":38.609073129251684},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":38.47782312925168,"cleanuptime":38.94240646258502},{"frequency":195.99771799087463,"duration":0.3020833333333333,"velocity":0.4,"time":38.81115646258502,"cleanuptime":39.275739795918355},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":39.14448979591835,"cleanuptime":39.60907312925169},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":39.47782312925169,"cleanuptime":39.942406462585026},{"frequency":195.99771799087463,"duration":0.3020833333333333,"velocity":0.4,"time":39.811156462585025,"cleanuptime":40.27573979591836},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":40.14448979591836,"cleanuptime":40.6090731292517},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":40.477823129251696,"cleanuptime":40.94240646258503},{"frequency":195.99771799087463,"duration":0.3020833333333333,"velocity":0.4,"time":40.81115646258503,"cleanuptime":41.27573979591837},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":41.14448979591837,"cleanuptime":41.609073129251705},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":41.4778231292517,"cleanuptime":41.94240646258504},{"frequency":195.99771799087463,"duration":0.3020833333333333,"velocity":0.4,"time":41.81115646258504,"cleanuptime":42.275739795918376},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":42.144489795918375,"cleanuptime":42.60907312925171},{"frequency":349.2282314330039,"duration":0.3020833333333333,"velocity":0.4,"time":42.47782312925171,"cleanuptime":42.94240646258505},{"frequency":195.99771799087463,"duration":0.3020833333333333,"velocity":0.4,"time":42.811156462585046,"cleanuptime":43.27573979591838},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":43.14448979591838,"cleanuptime":43.60907312925172},{"frequency":349.2282314330039,"duration":0.3020833333333333,"velocity":0.4,"time":43.47782312925172,"cleanuptime":43.942406462585055},{"frequency":195.99771799087463,"duration":0.3020833333333333,"velocity":0.4,"time":43.81115646258505,"cleanuptime":44.27573979591839},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":44.14448979591839,"cleanuptime":44.609073129251726},{"frequency":349.2282314330039,"duration":0.3020833333333333,"velocity":0.4,"time":44.477823129251725,"cleanuptime":44.94240646258506},{"frequency":195.99771799087463,"duration":0.3020833333333333,"velocity":0.4,"time":44.81115646258506,"cleanuptime":45.2757397959184},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":45.144489795918396,"cleanuptime":45.60907312925173},{"frequency":349.2282314330039,"duration":0.3020833333333333,"velocity":0.4,"time":45.47782312925173,"cleanuptime":45.94240646258507},{"frequency":195.99771799087463,"duration":0.3020833333333333,"velocity":0.4,"time":45.81115646258507,"cleanuptime":46.275739795918405},{"frequency":261.6255653005986,"duration":0.3020833333333333,"velocity":0.4,"time":46.1444897959184,"cleanuptime":46.60907312925174},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":46.47782312925174,"cleanuptime":46.942406462585076},{"frequency":195.99771799087463,"duration":0.3020833333333333,"velocity":0.4,"time":46.811156462585075,"cleanuptime":47.27573979591841},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":47.14448979591841,"cleanuptime":47.60907312925175},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":47.477823129251746,"cleanuptime":47.94240646258508},{"frequency":195.99771799087463,"duration":0.3020833333333333,"velocity":0.4,"time":47.81115646258508,"cleanuptime":48.27573979591842},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":48.14448979591842,"cleanuptime":48.609073129251755},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":48.47782312925175,"cleanuptime":48.94240646258509},{"frequency":155.56349186104046,"duration":0.3020833333333333,"velocity":0.4,"time":48.81115646258509,"cleanuptime":49.275739795918426},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":49.144489795918425,"cleanuptime":49.60907312925176},{"frequency":329.6275569128699,"duration":0.3020833333333333,"velocity":0.4,"time":49.47782312925176,"cleanuptime":49.9424064625851},{"frequency":184.9972113558172,"duration":0.3020833333333333,"velocity":0.4,"time":49.811156462585096,"cleanuptime":50.27573979591843},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":50.14448979591843,"cleanuptime":50.60907312925177},{"frequency":293.6647679174076,"duration":0.3020833333333333,"velocity":0.4,"time":50.47782312925177,"cleanuptime":50.942406462585105},{"frequency":184.9972113558172,"duration":0.3020833333333333,"velocity":0.4,"time":50.8111564625851,"cleanuptime":51.27573979591844},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":51.14448979591844,"cleanuptime":51.609073129251776},{"frequency":293.6647679174076,"duration":0.3020833333333333,"velocity":0.4,"time":51.477823129251775,"cleanuptime":51.94240646258511},{"frequency":195.99771799087463,"duration":0.3020833333333333,"velocity":0.4,"time":51.81115646258511,"cleanuptime":52.27573979591845},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":52.144489795918446,"cleanuptime":52.60907312925178},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":52.47782312925178,"cleanuptime":52.94240646258512},{"frequency":164.81377845643496,"duration":0.3020833333333333,"velocity":0.4,"time":52.81115646258512,"cleanuptime":53.275739795918454},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":53.14448979591845,"cleanuptime":53.60907312925179},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":53.47782312925179,"cleanuptime":53.942406462585126},{"frequency":184.9972113558172,"duration":0.3020833333333333,"velocity":0.4,"time":53.811156462585124,"cleanuptime":54.27573979591846},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":54.14448979591846,"cleanuptime":54.6090731292518},{"frequency":293.6647679174076,"duration":0.3020833333333333,"velocity":0.4,"time":54.477823129251796,"cleanuptime":54.94240646258513},{"frequency":184.9972113558172,"duration":0.3020833333333333,"velocity":0.4,"time":54.81115646258513,"cleanuptime":55.27573979591847},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":55.14448979591847,"cleanuptime":55.609073129251804},{"frequency":293.6647679174076,"duration":0.3020833333333333,"velocity":0.4,"time":55.4778231292518,"cleanuptime":55.94240646258514},{"frequency":184.9972113558172,"duration":0.3020833333333333,"velocity":0.4,"time":55.81115646258514,"cleanuptime":56.275739795918476},{"frequency":233.08188075904496,"duration":0.3020833333333333,"velocity":0.4,"time":56.144489795918474,"cleanuptime":56.60907312925181},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":56.47782312925181,"cleanuptime":56.94240646258515},{"frequency":184.9972113558172,"duration":0.3020833333333333,"velocity":0.4,"time":56.811156462585146,"cleanuptime":57.27573979591848},{"frequency":233.08188075904496,"duration":0.3020833333333333,"velocity":0.4,"time":57.14448979591848,"cleanuptime":57.60907312925182},{"frequency":277.1826309768721,"duration":0.3020833333333333,"velocity":0.4,"time":57.47782312925182,"cleanuptime":57.942406462585154},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":57.81115646258515,"cleanuptime":58.27573979591849},{"frequency":293.6647679174076,"duration":0.3020833333333333,"velocity":0.4,"time":58.14448979591849,"cleanuptime":58.609073129251826},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":58.477823129251824,"cleanuptime":58.94240646258516},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":58.81115646258516,"cleanuptime":59.2757397959185},{"frequency":293.6647679174076,"duration":0.3020833333333333,"velocity":0.4,"time":59.144489795918496,"cleanuptime":59.60907312925183},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":59.47782312925183,"cleanuptime":59.94240646258517},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":59.81115646258517,"cleanuptime":60.275739795918504},{"frequency":311.1269837220809,"duration":0.3020833333333333,"velocity":0.4,"time":60.1444897959185,"cleanuptime":60.60907312925184},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":60.47782312925184,"cleanuptime":60.942406462585176},{"frequency":246.94165062806206,"duration":0.3020833333333333,"velocity":0.4,"time":60.811156462585174,"cleanuptime":61.27573979591851},{"frequency":311.1269837220809,"duration":0.3020833333333333,"velocity":0.4,"time":61.14448979591851,"cleanuptime":61.60907312925185},{"frequency":369.9944227116344,"duration":0.3020833333333333,"velocity":0.4,"time":61.477823129251846,"cleanuptime":61.94240646258518},{"frequency":69.29565774421802,"duration":3.96875,"velocity":0.7071067811865475,"time":1.811156462585034,"cleanuptime":5.9424064625850335},{"frequency":138.59131548843604,"duration":3.96875,"velocity":0.7071067811865475,"time":1.811156462585034,"cleanuptime":5.9424064625850335},{"frequency":61.7354126570155,"duration":3.96875,"velocity":0.7071067811865475,"time":5.811156462585034,"cleanuptime":9.942406462585033},{"frequency":123.47082531403103,"duration":3.96875,"velocity":0.7071067811865475,"time":5.811156462585034,"cleanuptime":9.942406462585033},{"frequency":55,"duration":1.96875,"velocity":0.7071067811865475,"time":9.811156462585034,"cleanuptime":11.942406462585033},{"frequency":110,"duration":1.96875,"velocity":0.7071067811865475,"time":9.811156462585034,"cleanuptime":11.942406462585033},{"frequency":92.4986056779086,"duration":1.96875,"velocity":0.7071067811865475,"time":11.811156462585034,"cleanuptime":13.942406462585033},{"frequency":46.2493028389543,"duration":1.96875,"velocity":0.7071067811865475,"time":11.811156462585034,"cleanuptime":13.942406462585033},{"frequency":51.91308719749314,"duration":1.96875,"velocity":0.7071067811865475,"time":13.811156462585034,"cleanuptime":15.942406462585033},{"frequency":103.82617439498628,"duration":1.96875,"velocity":0.7071067811865475,"time":13.811156462585034,"cleanuptime":15.942406462585033},{"frequency":103.82617439498628,"duration":1.96875,"velocity":0.7071067811865475,"time":15.811156462585034,"cleanuptime":17.942406462585033},{"frequency":51.91308719749314,"duration":1.96875,"velocity":0.7071067811865475,"time":15.811156462585034,"cleanuptime":17.942406462585033},{"frequency":69.29565774421802,"duration":3.96875,"velocity":0.5773502691896258,"time":17.811156462585036,"cleanuptime":21.942406462585037},{"frequency":103.82617439498628,"duration":3.96875,"velocity":0.5773502691896258,"time":17.811156462585036,"cleanuptime":21.942406462585037},{"frequency":138.59131548843604,"duration":3.96875,"velocity":0.5773502691896258,"time":17.811156462585036,"cleanuptime":21.942406462585037},{"frequency":65.40639132514966,"duration":3.96875,"velocity":0.5773502691896258,"time":21.811156462585036,"cleanuptime":25.942406462585037},{"frequency":103.82617439498628,"duration":3.96875,"velocity":0.5773502691896258,"time":21.811156462585036,"cleanuptime":25.942406462585037},{"frequency":130.8127826502993,"duration":3.96875,"velocity":0.5773502691896258,"time":21.811156462585036,"cleanuptime":25.942406462585037},{"frequency":69.29565774421802,"duration":1.96875,"velocity":0.7071067811865475,"time":25.811156462585036,"cleanuptime":27.942406462585037},{"frequency":138.59131548843604,"duration":1.96875,"velocity":0.7071067811865475,"time":25.811156462585036,"cleanuptime":27.942406462585037},{"frequency":46.2493028389543,"duration":1.96875,"velocity":0.7071067811865475,"time":27.811156462585036,"cleanuptime":29.942406462585037},{"frequency":92.4986056779086,"duration":1.96875,"velocity":0.7071067811865475,"time":27.811156462585036,"cleanuptime":29.942406462585037},{"frequency":61.7354126570155,"duration":1.96875,"velocity":0.7071067811865475,"time":29.811156462585036,"cleanuptime":31.942406462585037},{"frequency":123.47082531403103,"duration":1.96875,"velocity":0.7071067811865475,"time":29.811156462585036,"cleanuptime":31.942406462585037},{"frequency":61.7354126570155,"duration":1.96875,"velocity":0.7071067811865475,"time":31.811156462585036,"cleanuptime":33.94240646258503},{"frequency":123.47082531403103,"duration":1.96875,"velocity":0.7071067811865475,"time":31.811156462585036,"cleanuptime":33.94240646258503},{"frequency":82.4068892282175,"duration":3.96875,"velocity":0.7071067811865475,"time":33.81115646258503,"cleanuptime":37.94240646258503},{"frequency":164.81377845643496,"duration":3.96875,"velocity":0.7071067811865475,"time":33.81115646258503,"cleanuptime":37.94240646258503},{"frequency":82.4068892282175,"duration":3.96875,"velocity":0.7071067811865475,"time":37.81115646258503,"cleanuptime":41.94240646258503},{"frequency":164.81377845643496,"duration":3.96875,"velocity":0.7071067811865475,"time":37.81115646258503,"cleanuptime":41.94240646258503},{"frequency":73.41619197935188,"duration":3.96875,"velocity":0.7071067811865475,"time":41.81115646258503,"cleanuptime":45.94240646258503},{"frequency":146.8323839587038,"duration":3.96875,"velocity":0.7071067811865475,"time":41.81115646258503,"cleanuptime":45.94240646258503},{"frequency":65.40639132514966,"duration":0.96875,"velocity":0.7071067811865475,"time":45.81115646258503,"cleanuptime":46.94240646258503},{"frequency":130.8127826502993,"duration":0.96875,"velocity":0.7071067811865475,"time":45.81115646258503,"cleanuptime":46.94240646258503},{"frequency":61.7354126570155,"duration":0.96875,"velocity":0.7071067811865475,"time":46.81115646258503,"cleanuptime":47.94240646258503},{"frequency":123.47082531403103,"duration":0.96875,"velocity":0.7071067811865475,"time":46.81115646258503,"cleanuptime":47.94240646258503},{"frequency":58.27047018976124,"duration":1.96875,"velocity":0.7071067811865475,"time":47.81115646258503,"cleanuptime":49.94240646258503},{"frequency":116.54094037952248,"duration":1.96875,"velocity":0.7071067811865475,"time":47.81115646258503,"cleanuptime":49.94240646258503},{"frequency":61.7354126570155,"duration":1.96875,"velocity":0.7071067811865475,"time":49.81115646258503,"cleanuptime":51.94240646258503},{"frequency":123.47082531403103,"duration":1.96875,"velocity":0.7071067811865475,"time":49.81115646258503,"cleanuptime":51.94240646258503},{"frequency":82.4068892282175,"duration":0.96875,"velocity":1,"time":51.81115646258503,"cleanuptime":52.94240646258503},{"frequency":97.99885899543733,"duration":0.96875,"velocity":1,"time":52.81115646258503,"cleanuptime":53.94240646258503},{"frequency":92.4986056779086,"duration":1.96875,"velocity":1,"time":53.81115646258503,"cleanuptime":55.94240646258503},{"frequency":46.2493028389543,"duration":1.96875,"velocity":0.7071067811865475,"time":55.81115646258503,"cleanuptime":57.94240646258503},{"frequency":92.4986056779086,"duration":1.96875,"velocity":0.7071067811865475,"time":55.81115646258503,"cleanuptime":57.94240646258503},{"frequency":61.7354126570155,"duration":3.96875,"velocity":0.7071067811865475,"time":57.81115646258503,"cleanuptime":61.94240646258503},{"frequency":123.47082531403103,"duration":3.96875,"velocity":0.7071067811865475,"time":57.81115646258503,"cleanuptime":61.94240646258503}];
}

function getTrainingNotes() {
  return [{"frequency":415.3046975799451,"duration":0.71875,"velocity":1,"time":20.811156462585036,"cleanuptime":21.692406462585037},{"frequency":415.3046975799451,"duration":0.21875,"velocity":1,"time":21.561156462585036,"cleanuptime":21.942406462585037},{"frequency":415.3046975799451,"duration":2.96875,"velocity":1,"time":21.811156462585036,"cleanuptime":24.942406462585037},{"frequency":415.3046975799451,"duration":0.71875,"velocity":1,"time":24.811156462585036,"cleanuptime":25.692406462585037},{"frequency":415.3046975799451,"duration":0.21875,"velocity":1,"time":25.561156462585036,"cleanuptime":25.942406462585037},{"frequency":415.3046975799451,"duration":1.96875,"velocity":1,"time":25.811156462585036,"cleanuptime":27.942406462585037},{"frequency":440,"duration":1.96875,"velocity":1,"time":27.811156462585036,"cleanuptime":29.942406462585037},{"frequency":415.3046975799451,"duration":1.96875,"velocity":1,"time":29.811156462585036,"cleanuptime":31.942406462585037},{"frequency":369.9944227116344,"duration":0.96875,"velocity":1,"time":31.811156462585036,"cleanuptime":32.94240646258503},{"frequency":493.8833012561241,"duration":0.96875,"velocity":1,"time":32.81115646258503,"cleanuptime":33.94240646258503},{"frequency":329.6275569128699,"duration":0.6666666666666217,"velocity":1,"time":33.81115646258503,"cleanuptime":34.74032312925166},{"frequency":391.99543598174927,"duration":0.71875,"velocity":1,"time":40.81115646258503,"cleanuptime":41.69240646258503},{"frequency":391.99543598174927,"duration":0.21875,"velocity":1,"time":41.56115646258503,"cleanuptime":41.94240646258503},{"frequency":391.99543598174927,"duration":2.96875,"velocity":1,"time":41.81115646258503,"cleanuptime":44.94240646258503},{"frequency":391.99543598174927,"duration":0.71875,"velocity":1,"time":44.81115646258503,"cleanuptime":45.69240646258503},{"frequency":391.99543598174927,"duration":0.21875,"velocity":1,"time":45.56115646258503,"cleanuptime":45.94240646258503},{"frequency":391.99543598174927,"duration":2.96875,"velocity":1,"time":45.81115646258503,"cleanuptime":48.94240646258503},{"frequency":369.9944227116344,"duration":0.96875,"velocity":1,"time":48.81115646258503,"cleanuptime":49.94240646258503},{"frequency":369.9944227116344,"duration":1.96875,"velocity":1,"time":49.81115646258503,"cleanuptime":51.94240646258503},{"frequency":391.99543598174927,"duration":0.96875,"velocity":1,"time":51.81115646258503,"cleanuptime":52.94240646258503},{"frequency":329.6275569128699,"duration":0.96875,"velocity":1,"time":52.81115646258503,"cleanuptime":53.94240646258503},{"frequency":369.9944227116344,"duration":1.96875,"velocity":1,"time":53.81115646258503,"cleanuptime":55.94240646258503},{"frequency":369.9944227116344,"duration":1.96875,"velocity":1,"time":55.81115646258503,"cleanuptime":57.94240646258503},{"frequency":493.8833012561241,"duration":0.96875,"velocity":1,"time":60.81115646258503,"cleanuptime":61.94240646258503}];
}
