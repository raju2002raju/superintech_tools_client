import React, { useState } from 'react';
import VideoCompress from './Video-editor-pages/VideoCompress';
import VideoToGIF from './Video-editor-pages/VideoToGIF'

const VideoEditorComponent = () => {  // Renamed component to avoid naming conflict
    const [active, setActive] = useState('Video Editor');  // Track active tab

    return (
        <div className='max-w-2xl mx-auto shadow-lg flex flex-col gap-5 p-5'>
            {/* Tab buttons */}
            <div className='flex'>
                <div 
                    className={`border p-3 w-full text-center cursor-pointer ${active === 'Video Editor' ? 'bg-blue-500 text-white' : ''}`}
                    onClick={() => setActive('Video Editor')}  // Update active tab
                >
                    Video Editor
                </div>
                <div 
                    className={`border p-3 w-full text-center cursor-pointer ${active === 'Video To GIF' ? 'bg-blue-500 text-white' : ''}`}
                    onClick={() => setActive('Video To GIF')}  // Update active tab
                >
                    Video To GIF
                </div>
            </div>

            {/* Conditional Rendering */}
            {active === 'Video Editor' ? <VideoCompress /> : <VideoToGIF />}
        </div>
    );
}

export default VideoEditorComponent;
