'use client';

import { useMemo, useState, Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  isSSMLToggleEnabled,
  isRegionPickerEnabled,
  isKeyAutomaticallyPopulated,
} from '@/config/constants';
import { useKey } from '@/hooks/useKey';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

const SpeechSynthesis = () => {
  const params = useSearchParams();
  const sdk = (params.get('sdk') as 'azure' | 'elevenlabs') || 'azure';

  const [provider, setProvider] = useState<'azure' | 'elevenlabs'>(
    ['azure', 'elevenlabs'].includes(sdk) ? sdk : 'azure'
  );

  const {
    subscriptionKey,
    setSubscriptionKey,
    region,
    setRegion,
    voiceList,
    voicesLoading,
    updateVoiceList,
    selectedVoice,
    setSelectedVoice,
    isSSML,
    setIsSSML,
    textToSynthesize,
    setTextToSynthesize,
    startSynthesis,
    pauseSynthesis,
    resumeSynthesis,
    downloadSynthesis,
    startBtnDisabled,
    pauseBtnDisabled,
    resumeBtnDisabled,
    downloadBtnDisabled,
    highlightDiv,
    logs,
  } = useSpeechSynthesis(provider);

  const { loading } = useKey(
    provider,
    useMemo(
      () => ({
        skip: !isKeyAutomaticallyPopulated,
        onKeyUpdated: setSubscriptionKey,
        onRegionUpdated: setRegion,
      }),
      [setRegion, setSubscriptionKey]
    )
  );

  if (loading) {
    console.info('Loading keys...');
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl">
      <div className="flex flex-col space-y-6 w-full">
        <div className="flex items-center">
          <label htmlFor="providerOptions" className="w-1/6 text-right mr-4">
            Provider
          </label>
          <select
            id="providerOptions"
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'azure' | 'elevenlabs')}
            className="flex-1 py-2 px-4 border rounded"
          >
            <option value="azure">Azure</option>
            <option value="elevenlabs">Eleven Labs</option>
          </select>
        </div>

        {!isKeyAutomaticallyPopulated && (
          <div className="flex items-center">
            <label htmlFor="subscriptionKey" className="w-1/6 text-right mr-4">
              Subscription Key
            </label>
            <input
              id="subscriptionKey"
              type="text"
              value={subscriptionKey}
              onChange={(e) => setSubscriptionKey(e.target.value)}
              placeholder="YourSubscriptionKey"
              className="flex-1 py-2 px-4 border rounded"
            />
          </div>
        )}

        {isRegionPickerEnabled && (
          <div className="flex items-center">
            <label htmlFor="regionOptions" className="w-1/6 text-right mr-4">
              Region
            </label>
            <select
              id="regionOptions"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="flex-1 py-2 px-4 border rounded"
            >
              <option value="westus">West US</option>
              <option value="westus2">West US2</option>
              <option value="eastus">East US</option>
              <option value="eastus2">East US2</option>
              <option value="centralus">Central US</option>
              <option value="northcentralus">North Central US</option>
              <option value="southcentralus">South Central US</option>
              <option value="westcentralus">West Central US</option>
              <option value="canadacentral">Canada Central</option>
              <option value="brazilsouth">Brazil South</option>
              <option value="eastasia">East Asia</option>
              <option value="southeastasia">South East Asia</option>
              <option value="australiaeast">Australia East</option>
              <option value="centralindia">Central India</option>
              <option value="japaneast">Japan East</option>
              <option value="japanwest">Japan West</option>
              <option value="koreacentral">Korea Central</option>
              <option value="northeurope">North Europe</option>
              <option value="westeurope">West Europe</option>
              <option value="francecentral">France Central</option>
              <option value="switzerlandnorth">Switzerland North</option>
              <option value="uksouth">UK South</option>
              <option value="chinaeast2">China East2 (azure.cn)</option>
              <option value="chinanorth2">China North2 (azure.cn)</option>
            </select>
          </div>
        )}

        <div className="flex items-center">
          <label htmlFor="voiceOptions" className="w-1/6 text-right mr-4">
            Voice
          </label>
          <div className="flex flex-1 flex-nowrap">
            <button
              id="updateVoiceListButton"
              onClick={updateVoiceList}
              disabled={!subscriptionKey || !region || voicesLoading}
              className="py-2 px-4 border rounded mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update voice list
            </button>
            <select
              disabled={voiceList.length === 0}
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="py-2 px-4 border rounded"
            >
              {voiceList.length === 0 ? (
                <option>Please update voice list first</option>
              ) : (
                voiceList.map((voice: any) => {
                  return <option key={voice.ShortName}>{voice.ShortName}</option>;
                })
              )}
            </select>
          </div>
        </div>

        {isSSMLToggleEnabled && (
          <div className="flex items-center">
            <label htmlFor="isSSML" className="w-1/6 text-right mr-4">
              Is SSML
            </label>
            <input
              type="checkbox"
              id="isSSML"
              name="isSSML"
              checked={isSSML}
              onChange={(e) => setIsSSML(e.target.checked)}
              className="transform scale-125"
            />
          </div>
        )}

        <div className="flex items-center">
          <label htmlFor="synthesisText" className="w-1/6 text-right mr-4">
            Text
          </label>
          <textarea
            id="synthesisText"
            value={textToSynthesize}
            onChange={(e) => setTextToSynthesize(e.target.value)}
            className="flex-1 py-2 px-4 border rounded"
            placeholder="Input text or ssml for synthesis."
            style={{ height: '100px' }}
          />
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={startSynthesis}
            disabled={startBtnDisabled}
            className="py-2 px-4 border rounded disabled:opacity-50"
          >
            Start synthesis
          </button>
          <button
            onClick={pauseSynthesis}
            disabled={pauseBtnDisabled}
            className="py-2 px-4 border rounded disabled:opacity-50"
          >
            Pause
          </button>
          <button
            onClick={resumeSynthesis}
            disabled={resumeBtnDisabled}
            className="py-2 px-4 border rounded disabled:opacity-50"
          >
            Resume
          </button>
          <button
            onClick={downloadSynthesis}
            disabled={downloadBtnDisabled}
            className="py-2 px-4 border rounded disabled:opacity-50"
          >
            Download
          </button>
        </div>

        <div className="flex items-start">
          <label className="w-1/6 text-right mr-4 align-top">Logs</label>
          <textarea className="flex-1 py-2 px-4 border rounded" defaultValue={logs.join('\n')} />
        </div>

        <div className="flex items-start">
          <label className="w-1/6 text-right mr-4 align-top">Highlight</label>
          <div
            className="flex-1 py-2 px-4 border rounded min-h-10"
            dangerouslySetInnerHTML={{ __html: highlightDiv }}
          />
          <span className="bg-slate-500" />
        </div>
      </div>
    </div>
  );
};

export const SpeechSynthesisDemo = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SpeechSynthesis />
    </Suspense>
  );
};
