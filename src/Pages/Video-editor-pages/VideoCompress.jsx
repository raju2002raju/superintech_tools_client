import React, { useState, useRef, useEffect } from 'react';
import { Scissors, Maximize2, FileVideo, Download, MinusSquare } from 'lucide-react';

const VideoCompress = () => {
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [croppedVideoUrl, setCroppedVideoUrl] = useState('');
  const [cropDimensions, setCropDimensions] = useState({ width: 320, height: 240, x: 0, y: 0 });
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const [trimRange, setTrimRange] = useState([0, 100]);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Reset the video element when URL changes
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl;
      videoRef.current.onloadedmetadata = () => {
        setDuration(videoRef.current.duration);
      };
    }
  }, [videoUrl]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideo(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setCroppedVideoUrl('');
    }
  };

  const handleCrop = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to our desired crop size
    canvas.width = cropDimensions.width;
    canvas.height = cropDimensions.height;
    
    // Create a temporary canvas for the frame capture
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropDimensions.width;
    tempCanvas.height = cropDimensions.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw the current frame from the specified position
    tempCtx.drawImage(
      video,
      cropDimensions.x, cropDimensions.y,  // Start position in the source video
      cropDimensions.width, cropDimensions.height, // Area to capture
      0, 0,  // Position in the destination canvas
      cropDimensions.width, cropDimensions.height // Size in the destination canvas
    );
    
    // Convert to image and display the cropped frame
    const imgUrl = tempCanvas.toDataURL();
    const img = new Image();
    img.src = imgUrl;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, cropDimensions.width, cropDimensions.height);
    
    // Convert canvas to blob and create URL
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setCroppedVideoUrl(url);
    }, 'image/jpeg');
  };

  const handleCompress = () => {
    if (!videoRef.current) return;
    
    // Use MediaRecorder to create a compressed version of the video
    const chunks = [];
    const stream = videoRef.current.captureStream();
    
    // Configure MediaRecorder with compressed bitrates
    const options = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: Math.floor(1000000 * compressionQuality) // Adjust bitrate based on quality
    };
    
    const recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = e => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      videoRef.current.src = url;
    };
    
    // Start recording the current playing video
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    recorder.start();
    
    // Stop recording after the video duration
    videoRef.current.onended = () => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
        videoRef.current.pause();
      }
    };
  };

  const handleTrim = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const startTime = (trimRange[0] / 100) * duration;
    const endTime = (trimRange[1] / 100) * duration;
    
    // Use MediaRecorder to create a trimmed version
    const stream = video.captureStream();
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    
    recorder.ondataavailable = e => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    };
    
    // Set video to start time and play until end time
    video.currentTime = startTime;
    video.play();
    
    recorder.start();
    
    // Set a timeout to stop recording at the end time
    const recordingDuration = (endTime - startTime) * 1000; // convert to ms
    setTimeout(() => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
        video.pause();
      }
    }, recordingDuration);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Video Editor</h2>

      <div className="flex flex-col gap-4 items-center">
        <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" id="video-upload" />
        <label htmlFor="video-upload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 w-fit">
          <FileVideo className="w-5 h-5" />
          Upload Video
        </label>

        {videoUrl && (
          <>
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video 
                ref={videoRef} 
                src={videoUrl} 
                className="w-full h-full" 
                controls
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            {croppedVideoUrl && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Cropped Preview</h3>
                <div className="bg-gray-100 rounded-lg overflow-hidden inline-block">
                  <img src={croppedVideoUrl} alt="Cropped frame" className="max-w-full h-auto" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Crop Section */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Crop Dimensions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm text-gray-600">X Position</label>
                    <input
                      type="number"
                      value={cropDimensions.x}
                      onChange={(e) => setCropDimensions(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded"
                      placeholder="X Position"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Y Position</label>
                    <input
                      type="number"
                      value={cropDimensions.y}
                      onChange={(e) => setCropDimensions(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded"
                      placeholder="Y Position"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Width</label>
                    <input
                      type="number"
                      value={cropDimensions.width}
                      onChange={(e) => setCropDimensions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded"
                      placeholder="Width"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Height</label>
                    <input
                      type="number"
                      value={cropDimensions.height}
                      onChange={(e) => setCropDimensions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded"
                      placeholder="Height"
                    />
                  </div>
                </div>
                <button onClick={handleCrop} className="bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" />
                  Preview Crop
                </button>
              </div>

              {/* Compression Section */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Compression Quality</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    value={compressionQuality * 100}
                    onChange={(e) => setCompressionQuality(parseInt(e.target.value) / 100)}
                    min="10"
                    max="100"
                    step="5"
                    className="w-full"
                  />
                  <span className="text-sm">{Math.round(compressionQuality * 100)}%</span>
                </div>
                <button onClick={handleCompress} className="bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2">
                  <MinusSquare className="w-4 h-4" />
                  Compress
                </button>
              </div>

              {/* Trim Section */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Trim Video</h3>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Start: {formatTime((trimRange[0] / 100) * duration)}</label>
                  <input
                    type="range"
                    value={trimRange[0]}
                    onChange={(e) => setTrimRange([
                      parseInt(e.target.value),
                      Math.max(parseInt(e.target.value) + 1, trimRange[1])
                    ])}
                    min="0"
                    max="99"
                    step="1"
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">End: {formatTime((trimRange[1] / 100) * duration)}</label>
                  <input
                    type="range"
                    value={trimRange[1]}
                    onChange={(e) => setTrimRange([
                      Math.min(trimRange[0], parseInt(e.target.value) - 1),
                      parseInt(e.target.value)
                    ])}
                    min="1"
                    max="100"
                    step="1"
                    className="w-full"
                  />
                </div>
                <button onClick={handleTrim} className="bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Trim
                </button>
              </div>

              {/* Export Section */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Export</h3>
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = videoUrl;
                    a.download = 'edited-video.webm';
                    a.click();
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Video
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default VideoCompress;