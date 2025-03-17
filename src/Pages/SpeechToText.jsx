import React, { useState, useRef } from 'react';
import { Mic, MicOff, Copy, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const startListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError('Error occurred in recognition');
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setError('Speech recognition is not supported in this browser.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      alert('Transcript copied to clipboard!');
    } catch (err) {
      setError('Failed to copy text');
    }
  };

  const handleDownload = () => {
    try {
      const element = document.createElement('a');
      const file = new Blob([transcript], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = 'transcript.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      setError('Failed to download transcript');
    }
  };

  const handleReset = () => {
    setTranscript('');
    setError('');
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 max-w-2xl mx-auto">
       <button className='py-2 px-4 bg-blue-500 text-white absolute top-2 left-4 ' onClick={() => navigate('/')}>Back</button>
      {error && (
        <div className="w-full p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex gap-2 flex-wrap justify-center">
          <button 
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Start Recording
              </>
            )}
          </button>

          {transcript && !isListening && (
            <>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600"
              >
                <Copy className="h-5 w-5" />
                Copy
              </button>

              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-purple-500 hover:bg-purple-600"
              >
                <Download className="h-5 w-5" />
                Download
              </button>

              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gray-500 hover:bg-gray-600"
              >
                Reset
              </button>
            </>
          )}
        </div>

        <div className="w-full min-h-[200px] p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Transcript:</h3>
          <div className="whitespace-pre-wrap">
            {isListening ? (
              <p className="text-gray-600">Recording... Speak now</p>
            ) : transcript ? (
              transcript
            ) : (
              <p className="text-gray-500">Click 'Start Recording' to begin</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;