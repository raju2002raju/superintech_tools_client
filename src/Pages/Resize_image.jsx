import React, { useState } from 'react';
import ResizeImage20Kb from '../Pages/Resize-Image-Pages/ResizeImage20Kb'
import ResizeImage50Kb from '../Pages/Resize-Image-Pages/ResizeImage50Kb'
import ResizeImage100Kb from '../Pages/Resize-Image-Pages/ResizeImage100Kb'



const ResizeImagesTool = () => {
    const [selectedTool, setSelectedTool] = useState('resize20');


    const buttons = [
        { id: 'resize20', label: 'Resize 20kb' },
        { id: 'resize50', label: 'Resize 50kb' },
        { id: 'resize100', label: 'Resize 100kb' },
  
    ];

    return (
        <div className='max-w-3xl mx-auto flex flex-col items-center gap-6'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                {buttons.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setSelectedTool(id)}
                        className={`p-3 rounded-lg transition-all duration-300 ${selectedTool === id ? 'bg-blue-600 text-white ' : 'border-2 bg-gray-100 '}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="w-full flex justify-center items-center border p-4 rounded-lg shadow-lg">
                {selectedTool === 'resize20' && <ResizeImage20Kb/>}
                {selectedTool === 'resize50' && <ResizeImage50Kb />}
                {selectedTool === 'resize100' && <ResizeImage100Kb />}
       
            </div>
        </div>
    );
};

export default ResizeImagesTool;