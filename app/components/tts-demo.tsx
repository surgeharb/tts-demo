'use client';

export const TtsDemo = () => {
  const runDemo = () => {
    const voiceID = '21m00Tcm4TlvDq8ikWAM';

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': '3b5ebabdd4f743ef9266250211c26333',
      },
      body: JSON.stringify({
        model_id: 'eleven_monolingual_v1',
        text: 'Hello, what is your name? I am new here and I want to know you better. Tell me about yourself. This is a demo text, I am trying to figure out the latency. This is a sunny day, I enjoy having a walk in the park. I have two dogs, they are very cute. I like to play with them. I also like to play video games. I am a big fan of the Witcher. I am also a developer. Nice to meet you!',
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
    mediaSource.addEventListener('sourceopen', sourceOpen);

    function sourceOpen() {
      const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');

      // measure the time it takes to fetch the audio
      const start = performance.now();
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceID}/stream`, options)
        .then((response) => {
          let count = 0;
          // @ts-ignore
          const reader = response.body.getReader();
          // @ts-ignore
          function pump() {
            return reader.read().then(({ done, value }) => {
              if (done) {
                mediaSource.endOfStream();
                return;
              }
              sourceBuffer.appendBuffer(value);
              if (count === 0) {
                const firstByte = performance.now();
                console.log('first byte', firstByte / 1000, 's');
                console.log('time to first byte', (firstByte - start) / 1000, 's');
              }
              return pump();
            });
          }
          return pump();
        })
        .catch((err) => console.error(err));
    }
  };

  return <button onClick={runDemo}>CLICK ME!</button>;
};
