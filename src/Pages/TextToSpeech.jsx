import React, { useState, useEffect } from 'react';
import { Download, Play, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const navigate = useNavigate();

  // Initialize speech synthesis and get available voices
  useEffect(() => {
    const getVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      setSelectedVoice(availableVoices[0]?.name || '');
    };

    getVoices();
    window.speechSynthesis.onvoiceschanged = getVoices;
  }, []);

  const handleSpeak = () => {
    if (text.trim() !== '') {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = pitch;
      utterance.rate = rate;
      
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleReset = () => {
    setText('');
    setPitch(1);
    setRate(1);
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const handleDownload = () => {
    if (text.trim() !== '') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = pitch;
      utterance.rate = rate;
      
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;

      // Convert speech to audio blob
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const mediaStreamDest = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(mediaStreamDest.stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'speech.wav';
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      window.speechSynthesis.speak(utterance);
      
      utterance.onend = () => {
        mediaRecorder.stop();
      };
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
       <button className='py-2 px-4 bg-blue-500 text-white absolute top-2 left-4 ' onClick={() => navigate('/')}>Back</button>
      <div className="space-y-4">
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
          className="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Voice</label>
            <select 
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Speed: {rate}x</label>
            <input 
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Pitch: {pitch}</label>
          <input 
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleSpeak}
            disabled={speaking || !text.trim()}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Play className="w-5 h-5 mr-2" />
            {speaking ? 'Speaking...' : 'Speak'}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </button>

          <button
            onClick={handleDownload}
            disabled={!text.trim()}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            <Download className="w-5 h-5 mr-2" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;