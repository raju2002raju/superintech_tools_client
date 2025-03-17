import React, { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';

const VideoToGIF = () => {
  const [ffmpeg, setFFmpeg] = useState(null);
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState();
  const [converting, setConverting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpegInstance = new FFmpeg();
      await ffmpegInstance.load();
      setFFmpeg(ffmpegInstance);
      setReady(true);
    };
    loadFFmpeg();
  }, []);

  const convertToGif = async () => {
    if (!ffmpeg || !video) return;

    setConverting(true);
    
    await ffmpeg.writeFile('test.mp4', await fetchFile(video));
    await ffmpeg.exec(['-i', 'test.mp4', '-t', '2.5', '-ss', '2.0', '-f', 'gif', 'out.gif']);
    const data = await ffmpeg.readFile('out.gif');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
    setGif(url);
    setConverting(false);
  };

  return ready ? (
    <div className='video-to-gif-main-container'>
      <button className='py-2 px-4 bg-blue-500 text-white absolute top-2 left-4 ' onClick={() => navigate('/')}>Back</button>
      <h1 className='video-to-gif-h2'>Video to GIF Converter</h1>
      
      {video && (
        <video
          controls
          width="250"
          src={URL.createObjectURL(video)}
          style={{ display: 'block', margin: '0 auto 20px' }}
        ></video>
      )}
      
     <div className='border-2 border-dashed p-2 w-full flex justify-center mb-2'>
     <input
        type="file"
        accept="video/*"
        id='file-upload'
        onChange={(e) => setVideo(e.target.files?.item(0))}
        className='mb-5 w-full hidden'

      />

      <label htmlFor="file-upload" className='cursor-pointer'>
        <Upload size={48} className='text-blue-500 '/>
      </label>
      
     </div>
      <button
        onClick={convertToGif}
        disabled={!video || converting}
        className='convert-to-gif-btn'
        style={{
          backgroundColor: video && !converting ? '#4CAF50' : '#ccc',
          cursor: video && !converting ? 'pointer' : 'not-allowed',
        }}
      >
        {converting ? 'Converting...' : 'Convert to GIF'}
      </button>
      
      {gif && (
        <div style={{ textAlign: 'center' }}>
          <h3>Result:</h3>
          <img src={gif} alt="Generated GIF" style={{ maxWidth: '100%', height: 'auto' }} />
          <a
            href={gif}
            download="converted.gif"
            className='download-gif-btn'
          >
            Download GIF
          </a>
        </div>
      )}
    </div>
  ) : (
    <p className='text-center text-sm'>Loading...</p>
  );
};

export default VideoToGIF;