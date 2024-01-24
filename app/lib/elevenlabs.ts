type Synthesizer = {
  wordBoundary: () => void;
  synthesizing: () => void;
  synthesisPaused: () => void;
  synthesisStarted: () => void;
  synthesisCompleted: () => void;
  synthesisCanceled: () => void;
  SynthesisCanceled: () => void;
};

export class Elevenlabs {
  private apiKey: string = '';
  private voiceName: string = '';

  SpeechConfig: {
    speechSynthesisOutputFormat: (outputFormat: string) => void;
    speechSynthesisVoiceName: (voiceName: string) => void;
    fromSubscription: (apiKey: string, region?: string) => Elevenlabs;
  };

  constructor() {
    console.log('Elevenlabs');

    this.SpeechConfig = {
      fromSubscription: (apiKey: string) => {
        this.apiKey = apiKey;
        return this;
      },
      speechSynthesisVoiceName: (voiceName: string) => {
        this.voiceName = voiceName;
      },
      speechSynthesisOutputFormat: (outputFormat: string) => {},
    };
  }

  getSynthesizer(): Synthesizer {
    return {
      wordBoundary: () => {},
      synthesizing: () => {},
      synthesisPaused: () => {},
      synthesisStarted: () => {},
      synthesisCompleted: () => {},
      synthesisCanceled: () => {},
      // to match with Azure's SDK
      SynthesisCanceled: () => {},
    };
  }

  async speakTextAsync(text: string, synthesiser: Synthesizer) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        model_id: 'eleven_monolingual_v1',
        text,
      }),
    };

    // create audio element
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.autoplay = true;
    document.body.appendChild(audio);

    // create a MediaSource object
    const mediaSource = new MediaSource();
    audio.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', () => {
      const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');

      synthesiser.synthesisStarted();
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceName}/stream`, options)
        .then((response) => {
          let count = 0;
          // @ts-ignore
          const reader = response.body.getReader();
          // @ts-ignore
          function pump() {
            return reader.read().then(({ done, value }) => {
              if (done) {
                synthesiser.synthesisCompleted();
                mediaSource.endOfStream();
                return;
              }
              sourceBuffer.appendBuffer(value);
              if (count === 0) {
                synthesiser.synthesizing();
              }
              return pump();
            });
          }
          return pump();
        })
        .catch((err) => {
          console.error(err);
          synthesiser.synthesisCanceled();
          // to match with Azure's SDK
          synthesiser.SynthesisCanceled();
        });
    });
  }
}
