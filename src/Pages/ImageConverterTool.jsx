import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const ImageConverterTool = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedFile, setConvertedFile] = useState(null);
  const [fromFormat, setFromFormat] = useState('png');
  const [toFormat, setToFormat] = useState('svg');
  const [isConverting, setIsConverting] = useState(false);
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    // Check if the file type matches the selected format
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== fromFormat.toLowerCase()) {
      setError(`Please select a ${fromFormat.toUpperCase()} file. Current file is ${fileExtension.toUpperCase()}`);
      event.target.value = ''; // Reset input
      return;
    }

    setFileName(file.name)
    setSelectedFile(file);
    setError('');
    setConvertedFile(null);
  };

  const convertToSVG = async (imageFile) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">
            <image
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              href="${canvas.toDataURL('image/png')}"
            />
          </svg>
        `;
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        resolve(blob);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError('Please select a file to convert.');
      return;
    }

    setIsConverting(true);
    setError('');

    try {
      let convertedBlob;
      
      if (toFormat === 'svg') {
        convertedBlob = await convertToSVG(selectedFile);
      } else {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          fileType: `image/${toFormat}`,
        };
        convertedBlob = await imageCompression(selectedFile, options);
      }
      
      setConvertedFile(convertedBlob);
    } catch (error) {
      console.error('Error converting image:', error);
      setError('Failed to convert image. Please try a different format or file.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (convertedFile) {
      const url = URL.createObjectURL(convertedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted.${toFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const removeFile = () => {
    setFileName('');
    setError('');
    setIsConverting(false);
    setConvertedFile(null);
    setSelectedFile(null);
    setFromFormat('png');
    setToFormat('svg')
  }

  // Generate accept attribute based on selected format
  const getAcceptAttribute = () => {
    const mimeTypes = {
      png: 'image/png',
      svg: 'image/svg+xml',
      avif: 'image/avif',
      bmp: 'image/bmp',
      tiff: 'image/tiff',
      jpeg: 'image/jpeg',
      heic: 'image/heic',
      webp: 'image/webp',
      jpg: 'image/jpeg',
      ico: 'image/x-icon'
    };
    return mimeTypes[fromFormat] || 'image/*';
  };

  return (
    <div>
      <div className="max-w-2xl mx-auto shadow-lg flex flex-col gap-5 p-5">
        <p className="text-center font-bold text-xl">Images Converter</p>
        <p className='text-gray-400 text-center'>Amongst many others, we support PNG, JPG, SVG, BMP, WEBP and HEIC. You can use the option to Convert images </p>
        <p className="text-center font-bold text-gray-400 uppercase">{fromFormat} to {toFormat} Converter </p>
        <div className="flex justify-center gap-1 items-center">
          <p>Convert</p>
          <select 
            value={fromFormat} 
            onChange={(e) => {
              setFromFormat(e.target.value);
              setSelectedFile(null);
              setFileName('');
              setConvertedFile(null);
              setError('');
            }} 
            className='border outline-none p-3'
          >
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
            <option value="avif">AVIF</option>
            <option value="bmp">BMP</option>
            <option value="tiff">TIFF</option>
            <option value="jpeg">JPEG</option>
            <option value="heic">HEIC</option>
            <option value="webp">WEBP</option>
            <option value="jpg">JPG</option>
            <option value="ico">ICO</option>
          </select>
          <p>to</p>
          <select value={toFormat} onChange={(e) => setToFormat(e.target.value)} className='border outline-none p-3'>
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
            <option value="avif">AVIF</option>
            <option value="bmp">BMP</option>
            <option value="tiff">TIFF</option>
            <option value="jpeg">JPEG</option>
            <option value="heic">HEIC</option>
            <option value="webp">WEBP</option>
            <option value="jpg">JPG</option>
            <option value="ico">ICO</option>
          </select>
        </div>
        
        <div className="border-2 border-dashed border-blue-500 p-5 rounded-lg">
          <input 
            type="file" 
            className="hidden" 
            accept={getAcceptAttribute()}
            id="file-upload" 
            onChange={handleFileChange} 
          />
          <label 
            htmlFor="file-upload" 
            className="flex items-center flex-col cursor-pointer"
          >
            <Upload size={48} className="text-blue-500 mb-2" />
            <span className="text-gray-600">Click to select a {fromFormat.toUpperCase()} file</span>
          </label>
        </div>
        
        {selectedFile && (
          <div className='flex justify-between'>
            <p>File: {fileName}</p>
            <p className='text-red-500 cursor-pointer' onClick={removeFile}>Remove</p>
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-center">{error}</div>
        )}
        
        {selectedFile && (
          <div className="flex justify-center">
            <button 
              onClick={handleConvert} 
              disabled={isConverting} 
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isConverting ? 'Converting...' : 'Convert'}
            </button>
          </div>
        )}
        
        {convertedFile && (
          <div className="flex justify-center">
            <button 
              onClick={handleDownload} 
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Download Converted File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageConverterTool;
