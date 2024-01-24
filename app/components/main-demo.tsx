'use client';

import { useState } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export const SpeechSynthesisDemo = () => {
  const [provider, setProvider] = useState<'azure' | 'elevenlabs'>('azure');
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
  } = useSpeechSynthesis(provider);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl">
      <div className="flex flex-col space-y-6 w-full">
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
              {voicesLoading ? 'Loading...' : 'Update voice list'}
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

        <div className="flex items-center">
          <label htmlFor="synthesisText" className="w-1/6 text-right mr-4">
            Text
          </label>
          <textarea
            value={textToSynthesize}
            onChange={(e) => setTextToSynthesize(e.target.value)}
            className="flex-1 py-2 px-4 border rounded"
            placeholder="Input text or ssml for synthesis."
            style={{ height: '100px' }}
          ></textarea>
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
          <label htmlFor="resultsDiv" className="w-1/6 text-right mr-4 align-top">
            Results
          </label>
          <textarea
            id="resultsDiv"
            className="flex-1 py-2 px-4 border rounded"
            style={{ height: '50px' }}
          ></textarea>
        </div>

        <div className="flex items-start">
          <label htmlFor="eventsDiv" className="w-1/6 text-right mr-4 align-top">
            Events
          </label>
          <textarea
            id="eventsDiv"
            className="flex-1 py-2 px-4 border rounded"
            style={{ height: '50px' }}
          ></textarea>
        </div>

        <div className="flex items-start">
          <label htmlFor="highlightDiv" className="w-1/6 text-right mr-4 align-top">
            Highlight
          </label>
          <div
            id="highlightDiv"
            className="flex-1 py-2 px-4 border rounded"
            style={{ height: '50px' }}
            dangerouslySetInnerHTML={{ __html: highlightDiv }}
          />
        </div>
      </div>
    </div>
  );
};
