import { useEffect, useRef, useState } from 'react';
import { isKeyAutomaticallyPopulated } from '@/config/constants';
import { Elevenlabs } from '@/lib/elevenlabs';

declare global {
  interface Window {
    SpeechSDK: any;
  }
}

type Voice = {
  Name: string;
  ShortName: string;
};

type ElevenlabsVoice = {
  voice_id: string;
  name: string;
};

export const useSpeechSynthesis = (provider: 'azure' | 'elevenlabs') => {
  const [subscriptionKey, setSubscriptionKey] = useState('');
  const [region, setRegion] = useState('eastus');
  const [voiceList, setVoiceList] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [formatOptions, setFormatOptions] = useState([]);
  const [isSSML, setIsSSML] = useState(false);
  const [textToSynthesize, setTextToSynthesize] = useState('');
  const [results, setResults] = useState('');
  const [wordBoundaryList, setWordBoundaryList] = useState<any[]>([]);
  const [events, setEvents] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [highlightDiv, setHighlightDiv] = useState('');
  const [sdkInitialized, setSdkInitialized] = useState(false);

  const [startBtnDisabled, setStartBtnDisabled] = useState(false);
  const [pauseBtnDisabled, setPauseBtnDisabled] = useState(true);
  const [resumeBtnDisabled, setResumeBtnDisabled] = useState(true);
  const [downloadBtnDisabled, setDownloadBtnDisabled] = useState(true);

  const player = useRef<any>(null);
  const lastProvider = useRef(provider);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // initialize the Speech SDK
    const script = document.createElement('script');
    script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
    script.onload = () => {
      setSdkInitialized(true);
      setFormatOptions(
        // @ts-ignore
        Object.entries(SpeechSDK.SpeechSynthesisOutputFormat)
          .filter(([key, value]) => isNaN(+key) && !key.includes('Siren'))
          .map(([key, value]) => ({ key, value }))
      );
    };
    document.body.appendChild(script);

    const interval = setInterval(function () {
      if (player.current) {
        const currentTime = player.current.currentTime;
        let wordBoundary;
        for (const e of wordBoundaryList) {
          if (currentTime * 1000 > e.audioOffset / 10000) {
            wordBoundary = e;
          } else {
            break;
          }
        }
        if (wordBoundary) {
          setHighlightDiv(
            textToSynthesize.substr(0, wordBoundary.textOffset) +
              "<span class='bg-slate-500'>" +
              wordBoundary.text +
              '</span>' +
              textToSynthesize.substr(wordBoundary.textOffset + wordBoundary.wordLength)
          );
        }
      }
    }, 50);

    return () => {
      clearInterval(interval);
      document.body.removeChild(script);
    };
  }, [textToSynthesize, wordBoundaryList]);

  useEffect(() => {
    if (provider !== lastProvider.current) {
      lastProvider.current = provider;
      setVoiceList([]);
    }
  }, [provider]);

  const updateVoiceList = () => {
    if (provider === 'azure') {
      updateVoiceListAzure();
    } else {
      updateVoiceListElevenLabs();
    }
  };

  const updateVoiceListAzure = () => {
    setVoicesLoading(true);
    fetch('/api/tts/azure/voices')
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then((data: Voice[]) => {
        const defaultVoice = 'AndrewNeural';
        const selected = data.find((voice) => voice.ShortName.includes(defaultVoice));
        setSelectedVoice(selected ? selected.ShortName : '');
        setVoiceList(
          data.filter(
            (voice) => voice.ShortName.startsWith('en-US') || voice.ShortName.startsWith('en-GB')
          )
        );
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setVoicesLoading(false);
      });
  };

  const updateVoiceListElevenLabs = () => {
    setVoicesLoading(true);
    fetch('/api/tts/elevenlabs/voices')
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(({ voices }: { voices: ElevenlabsVoice[] }) => {
        setSelectedVoice(voices[0].voice_id);
        setVoiceList(
          voices.map((voice) => ({
            Name: voice.voice_id,
            ShortName: voice.name,
          }))
        );
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setVoicesLoading(false);
      });
  };

  const startSynthesis = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!subscriptionKey || !region) {
      alert('Please enter your Microsoft Cognitive Services Speech subscription key!');
      return;
    }

    setLogs([]);
    setHighlightDiv('');
    setWordBoundaryList([]);

    const timeStart = performance.now();

    const SpeechSDK = provider === 'azure' ? window.SpeechSDK || {} : new Elevenlabs();
    let speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);

    if (provider === 'azure' && isKeyAutomaticallyPopulated) {
      speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(subscriptionKey, region);
    }

    let synthesizer: any;

    if (provider === 'azure') {
      speechConfig.speechSynthesisVoiceName =
        voiceList.length > 0
          ? voiceList.find((voice) => voice.ShortName === selectedVoice)?.Name ?? ''
          : '';

      speechConfig.speechSynthesisOutputFormat =
        SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

      player.current = new SpeechSDK.SpeakerAudioDestination();

      if (player.current) {
        player.current.onAudioStart = function (_: any) {
          console.log('playback started');
        };
        player.current.onAudioEnd = function (_: any) {
          setPauseBtnDisabled(true);
          setResumeBtnDisabled(true);
          setStartBtnDisabled(false);
          setDownloadBtnDisabled(false);
          console.log('playback finished');
          player.current = null;
        };
      }

      const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player.current);
      synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
    } else {
      SpeechSDK.SpeechConfig.speechSynthesisVoiceName(selectedVoice);
      synthesizer = SpeechSDK.getSynthesizer();

      synthesizer.playbackEnded = function () {
        setPauseBtnDisabled(true);
        setResumeBtnDisabled(true);
        setStartBtnDisabled(false);
        setDownloadBtnDisabled(false);
        console.log('playback finished');
      };
    }

    synthesizer.synthesizing = function (_: any, e: any) {
      if (provider !== 'azure') {
        return;
      }

      setEvents((prevEvents) => {
        return (
          prevEvents +
          '(synthesizing) Reason: ' +
          SpeechSDK.ResultReason[e.result.reason] +
          'Audio chunk length: ' +
          e.result.audioData.byteLength +
          '\r\n'
        );
      });
    };

    // The synthesis started event signals that the synthesis is started.
    synthesizer.synthesisStarted = function (_: any, e: any) {
      const timeEnd = performance.now();
      const elapsed = timeEnd - timeStart;
      console.log('first audio chunk received after: ' + elapsed / 1e3 + 's');
      setLogs((prevLogs) => {
        return [
          ...prevLogs,
          'first audio chunk received after: ' + Math.round(elapsed * 1e3) / 1e6 + 's',
        ];
      });
      setEvents((prevEvents) => {
        return prevEvents + '(synthesis started)' + '\r\n';
      });
      setPauseBtnDisabled(false);
      setResumeBtnDisabled(true);
      setStartBtnDisabled(true);
      setDownloadBtnDisabled(true);
    };

    // The event synthesis completed signals that the synthesis is completed.
    synthesizer.synthesisCompleted = function (_: any, e: any) {
      const timeEnd = performance.now();
      const elapsed = timeEnd - timeStart;
      console.log('last audio chunk received after: ' + elapsed / 1e3 + 's');
      setLogs((prevLogs) => {
        return [
          ...prevLogs,
          'last audio chunk received after: ' + Math.round(elapsed * 1e3) / 1e6 + 's',
        ];
      });

      if (provider !== 'azure') {
        return;
      }

      setEvents((prevEvents) => {
        return (
          prevEvents +
          '(synthesized)  Reason: ' +
          SpeechSDK.ResultReason[e.result.reason] +
          ' Audio length: ' +
          e.result.audioData.byteLength +
          '\r\n'
        );
      });
    };

    // The event signals that the service has stopped processing speech.
    // This can happen when an error is encountered.
    synthesizer.SynthesisCanceled = function (_: any, e: any) {
      setPauseBtnDisabled(true);
      setResumeBtnDisabled(true);
      setStartBtnDisabled(false);
      setDownloadBtnDisabled(false);

      if (provider !== 'azure') {
        return;
      }

      const cancellationDetails = SpeechSDK.CancellationDetails.fromResult(e.result);
      let str = '(cancel) Reason: ' + SpeechSDK.CancellationReason[cancellationDetails.reason];
      if (cancellationDetails.reason === SpeechSDK.CancellationReason.Error) {
        str += ': ' + e.result.errorDetails;
      }
      setEvents((prevEvents) => {
        return prevEvents + str + '\r\n';
      });
    };

    // This event signals that word boundary is received. This indicates the audio boundary of each word.
    // The unit of e.audioOffset is tick (1 tick = 100 nanoseconds), divide by 10,000 to convert to milliseconds.
    synthesizer.wordBoundary = function (_: any, e: any) {
      if (provider !== 'azure') {
        return;
      }

      setEvents((prevEvents) => {
        return (
          prevEvents +
          '(WordBoundary), Text: ' +
          e.text +
          ', Audio offset: ' +
          e.audioOffset / 10000 +
          'ms.' +
          '\r\n'
        );
      });
      setWordBoundaryList((prevWordBoundaryList) => {
        return [...prevWordBoundaryList, e];
      });
    };

    if (!textToSynthesize) {
      alert('Please enter synthesis content.');
      return;
    }

    if (provider === 'azure') {
      const complete_cb = function (result: any) {
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          // resultsDiv.innerHTML += 'synthesis finished';
          setResults((prevResults) => {
            return prevResults + 'synthesis finished';
          });
        } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
          // resultsDiv.innerHTML += 'synthesis failed. Error detail: ' + result.errorDetails;
          setResults((prevResults) => {
            return prevResults + 'synthesis failed. Error detail: ' + result.errorDetails;
          });
        }
        console.log(result);
        synthesizer.close();
        synthesizer = undefined;
      };

      const err_cb = function (err: any) {
        setStartBtnDisabled(false);
        setDownloadBtnDisabled(false);
        console.log(err);
        synthesizer.close();
        synthesizer = undefined;
      };

      if (isSSML) {
        synthesizer.speakSsmlAsync(textToSynthesize, complete_cb, err_cb);
      } else {
        synthesizer.speakTextAsync(textToSynthesize, complete_cb, err_cb);
      }
    } else {
      SpeechSDK.speakTextAsync(textToSynthesize, synthesizer);
    }
  };

  const pauseSynthesis = () => {
    player.current.pause();
    setPauseBtnDisabled(true);
    setResumeBtnDisabled(false);
  };

  const resumeSynthesis = () => {
    player.current.resume();
    setPauseBtnDisabled(false);
    setResumeBtnDisabled(true);
  };

  const downloadSynthesis = () => {
    alert('Not implemented yet');
  };

  return {
    sdkInitialized,
    formatOptions,
    subscriptionKey,
    setSubscriptionKey,
    region,
    setRegion,
    voiceList,
    voicesLoading,
    selectedVoice,
    setSelectedVoice,
    updateVoiceList,
    textToSynthesize,
    setTextToSynthesize,
    isSSML,
    setIsSSML,
    startSynthesis,
    pauseSynthesis,
    resumeSynthesis,
    downloadSynthesis,
    startBtnDisabled,
    pauseBtnDisabled,
    resumeBtnDisabled,
    downloadBtnDisabled,
    logs,
    events,
    results,
    wordBoundaryList,
    highlightDiv,
  };
};
