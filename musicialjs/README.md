Web audio API and [musicial.js](https://github.com/PencilCode/musical.js) experiments.

The original musical.js sample is in the [index.html](./index.html).
The [web-audio.html](./web-audio.html) and [web-audio-test.js](./web-audio-test.js) - here there is a reduced example of code extracted from musical.js.

The audio nodes setup for musicial.js is includes two parts: there is a "tail" part, which is common for all nodes and stays permanently and "head" - the set of nodes created to play each note.

```
| ------ HEAD (for each note)------ | --- TAIL (for all notes)----------- |
|                                   |                                     |
[ |Oscillator|->|Biquad|->|Gain|-> ] [|Gain|->|Dynamics  |->|Destination| ]
  | Periodic |  |Filter|  |ADSR|              |Compressor|
  | Wave     |
```

Note: The first oscillator can be doubled by another one to play note frequency + timbre detune.

So we create an oscillator (or two) + filter + ADSR (attack / decay / sustain / release) gain to play each note. This way we create a lot of audio nodes. Musicial.js handles this by creating a queue of notes and passed only a limited set of notes to web audio API.

Original musicial.js has only piano sample, I tried to add more instruments using [wave tables examples](https://github.com/GoogleChrome/web-audio-samples/tree/gh-pages/samples/audio/wave-tables) from the google chrome web audio samples repository, but still all the instruments sound like a piano.

There is also another example of guitar, getinstinct's [guitar-synth](https://github.com/getinstinct/guitar-synth/blob/master/build/gsynth.js).
The guitar-synth setup looks much easier and it is just a `|Script Processor| -> | Output |`. The guitar sound sample is generated from code and fed into the ScriptProcessor node which acts as a sound source (like if you loaded a sample from the file).
