'use client';

export const TtsDemoBasic = () => {
  const runDemo = () => {
    const voiceID = '21m00Tcm4TlvDq8ikWAM';

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': '-old-',
      },
      body: JSON.stringify({
        model_id: 'eleven_monolingual_v1',
        text: 'Hello, what is your name? I am new here and I want to know you better. Tell me about yourself. This is a demo text, I am trying to figure out the latency. This is a sunny day, I enjoy having a walk in the park. I have two dogs, they are very cute. I like to play with them. I also like to play video games. I am a big fan of the Witcher. I am also a developer. Nice to meet you!',
      }),
    };

    // create audio element
    const audio = document.createElement('audio');
    audio.controls = true;
    document.body.appendChild(audio);

    // measure the time it takes to fetch the audio
    const start = performance.now();
    fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceID}`, options)
      .then((response) => {
        // read audio from response
        return response.blob();
      })
      .then((blob) => {
        // create object URL from blob
        const audioURL = URL.createObjectURL(blob);
        // set audio source
        audio.src = audioURL;
        audio.play();
      })
      .catch((err) => console.error(err));
  };

  return <button onClick={runDemo}>CLICK ME BASIC!</button>;
};
