import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { useNavigate } from 'react-router-dom';


const CompressImageTo20KB = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState('');
  const [isCompressed, setIsCompressed] = useState(false);
  const [originalSize, setOriginalSize] = useState('');
  const [compressedSize, setCompressedSize] = useState('');
  const [fileTypeIcon, setFileTypeIcon] = useState();
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCompressedFile(null);
      setCompressedPreviewUrl('');
      setIsCompressed(false);
      setOriginalSize((file.size / 1024).toFixed(2) + 'KB')


      const extension = file.name.split('.').pop().toLowerCase();
      let iconPath = '';
      if (extension === 'png'){
        iconPath = '/Images/imgc_2 1.png';
      } else if (extension === 'jpg' || extension === 'jpeg') {
        iconPath = '/Images/imgc_1 1.png';
      } else {
        iconPath = '/Images/Group 3239.png';
      }
      setFileTypeIcon(iconPath);
    }
  };



  const handleCompress = async () => {
    if (!selectedFile) {
      alert('Please upload an image first.');
      return;
    }

    // Options for compression
    const options = {
      maxSizeMB: 0.02, // Approx 20KB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      // Compress the image
      const compressedBlob = await imageCompression(selectedFile, options);
      setCompressedFile(compressedBlob);
      setCompressedPreviewUrl(URL.createObjectURL(compressedBlob));
      setIsCompressed(true);
      setCompressedSize((compressedBlob.size / 1024).toFixed(2) + 'KB')
    } catch (error) {
      console.error('Error compressing the image:', error);
    }
  };

  const handleDownload = () => {
    if (compressedFile) {
      const link = document.createElement('a');
      link.href = compressedPreviewUrl;
      link.download = 'compressed-image.jpg';
      link.click();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-5">
      <button className='py-2 px-4 bg-blue-500 text-white absolute top-2 left-4 ' onClick={() => navigate('/')}>Back</button>
      <h2 className="text-center text-2xl font-bold mb-4">Compress Image to 20KB</h2>
      
      {/* Upload Section */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
      />

      {/* Original Image Preview */}
      {selectedFile && (
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold mb-2">Original Image Preview</h3>
          <img src={previewUrl} alt="Original" className="w-80 h-auto mb-4 mx-auto" />
        </div>
      )}

      {/* Generate Button */}
      {selectedFile && !isCompressed && (
        <div className="text-center">
          <button
            onClick={handleCompress}
            className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Generate Compressed Image
          </button>
        </div>
      )}

      {/* Compressed Image Preview and Download */}
      {compressedFile && (
         <div className="mt-4 text-center flex items-center gap-5 py-4 px-3 border">
         <img src={fileTypeIcon} alt="" className='w-10' />
       <p>{selectedFile.name}</p>
       <div>
         <span className="font-semibold"></span> {originalSize} to {compressedSize} <br />
 
       </div>
       <button
         onClick={handleDownload}
         className="py-1 px-4 bg-green-500 text-white hover:bg-green-600 transition  outline-none"
       >
         Download
       </button>
     </div>
      )}
    </div>
  );
};

export default CompressImageTo20KB;
