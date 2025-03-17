import React, { useState } from 'react';
import CompressImage from './Compress-image-Pages/CompressImage'
import CompressImage20Kb from './Compress-image-Pages/CompressImage20Kb'
import CompressImage30Kb from './Compress-image-Pages/CompressImage30Kb'
import CompressImage50Kb from './Compress-image-Pages/CompressImage50Kb'
import CompressImage100Kb from './Compress-image-Pages/CompressImage100Kb'
import CompressImage200Kb from './Compress-image-Pages/CompressImage200Kb'
import CompressImages1Mb from './Compress-image-Pages/CompressImages1Mb'
import CompressImageTo10KB from './Compress-image-Pages/CompressImage10Kb';



const CompressImageTool = () => {
    const [selectedTool, setSelectedTool] = useState('compress');

    const buttons = [
        { id: 'compress', label: 'Compress Image' },
        { id: 'compress10', label: 'Compress Image to 10KB' },
        { id: 'compress20', label: 'Compress Image to 20KB' },
        { id: 'compress30', label: 'Compress Image to 30KB' },
        { id: 'compress50', label: 'Compress Image to 50KB' },
        { id: 'compress100', label: 'Compress Image to 100KB' },
        { id: 'compress200', label: 'Compress Image to 200KB' },
        { id: 'compress1', label: 'Compress Image to 1MB' },
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
                {selectedTool === 'compress' && <CompressImage />}
                {selectedTool === 'compress100' && <CompressImage100Kb />}
                {selectedTool === 'compress20' && <CompressImage20Kb />}
                {selectedTool === 'compress50' && <CompressImage50Kb />}
                {selectedTool === 'compress200' && <CompressImage200Kb />}
                {selectedTool === 'compress10' && <CompressImageTo10KB />}
                {selectedTool === 'compress30' && <CompressImage30Kb />}
                {selectedTool === 'compress1' && <CompressImages1Mb />}
            </div>
        </div>
    );
};

export default CompressImageTool;