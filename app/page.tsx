import { Metadata } from 'next';
import { SpeechSynthesisDemo } from './components/main-demo';

export const metadata: Metadata = {
  title: 'Speech Synthesis Demo',
  description: 'A demo of the Speech Synthesis API',
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-24">
      <SpeechSynthesisDemo />
    </main>
  );
}
