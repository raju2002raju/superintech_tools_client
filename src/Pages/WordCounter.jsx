import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WordCounter = () => {
  const [text, setText] = useState('');
  const [showCount, setShowCount] = useState(false);
  const navigate = useNavigate();

  const wordCount = text
    .split(/\s+/)
    .filter(Boolean).length;
  
  const letterCount = text.length;

  // Estimate syllables (basic method)
  const countSyllables = (text) => {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').match(/[aeiouy]{1,2}/g)?.length || 1)
      .reduce((acc, count) => acc + count, 0);
  };

  // Count sentences
  const sentenceCount = (text.match(/[.!?]+/g) || []).length;

// Calculate read time (approx 275 words per minute)
const readTimeInSeconds = wordCount > 0 ? Math.ceil((wordCount / 275) * 60) : 0;
const readMinutes = Math.floor(readTimeInSeconds / 60);
const readSeconds = readTimeInSeconds % 60;

// Calculate speak time (approx 180 words per minute)
const speakTimeInSeconds = wordCount > 0 ? Math.ceil((wordCount / 180) * 60) : 0;
const speakMinutes = Math.floor(speakTimeInSeconds / 60);
const speakSeconds = speakTimeInSeconds % 60;

  // Function to handle button click
  const handleClick = () => {
    setShowCount(true);
  };

  return (
    <div className=' flex justify-center items-center '>
      <button className='py-2 px-4 bg-blue-500 text-white absolute top-2 left-4' onClick={() => navigate('/')}>Back</button>
      
      <div className='flex flex-col gap-5 items-center max-w-xl w-full '>
        <textarea
          placeholder="Enter Your Text Here...."
          className="w-full h-52 outline-none border"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          onClick={handleClick}
        >
          Count Words
        </button>

        {/* Conditionally show counts based on button click */}
        {showCount && (
          <div className='grid grid-cols-6 gap-5 mt-5'>
            <p className='flex flex-col items-center border p-6 text-center'><span className='bg-green-400 p-4'>{wordCount} </span>Word Count</p>
            <p className='flex flex-col items-center border p-6 text-center'> <span className='bg-blue-400 p-4'>{letterCount}</span> Character Count</p>
            <p className='flex flex-col items-center border p-6 text-center'><span className='bg-red-400 p-4'>{countSyllables(text)}</span> Syllables </p>
            <p className='flex flex-col items-center border p-6 text-center'><span className='bg-green-600 p-4'>{sentenceCount}</span> Sentences</p>
          
<p className='flex flex-col items-center border p-6 text-center'>
  <span className='bg-red-500 p-4'>
    {readMinutes} min {readSeconds} sec
  </span>
  Read Time 
  <span title='Approx 275 words per minute' className='hover:bg-black hover:text-white rounded-full w-5 h-5 text-center cursor-pointer bg-gray-300'>
    ?
  </span>
</p>

<p className='flex flex-col items-center border p-6 text-center'>
  <span className='bg-blue-600 p-4'>
    {speakMinutes} min {speakSeconds} sec
  </span>
  Speak Time 
  <span title='Approx 180 words per minute' className='hover:bg-black hover:text-white rounded-full w-5 h-5 text-center cursor-pointer bg-gray-300'>
    ?
  </span>
</p>

          </div> 
        )}
      </div>
    </div>
  );
};

export default WordCounter;
