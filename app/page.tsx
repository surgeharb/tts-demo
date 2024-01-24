import { TtsDemo } from './components/tts-demo';
import { TtsDemoBasic } from './components/tts-demo-basic';
import { SpeechSynthesisDemo } from './components/main-demo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <TtsDemo />
      <TtsDemoBasic />
      <SpeechSynthesisDemo />
    </main>
  );
}
