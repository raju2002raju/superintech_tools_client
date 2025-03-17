import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Image as ImageIcon, FlipHorizontal, FlipVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const ResizeImage50KB = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [resizedImage, setResizedImage] = useState(null);
  const [resizeMethod, setResizeMethod] = useState('percentage');
  const [percentage, setPercentage] = useState(70);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activeTab, setActiveTab] = useState('resize');
  const [showMessage, setShowMessage] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const navigate = useNavigate();
  const [transforms, setTransforms] = useState({
    flipH: false,
    flipV: false,
    rotation: 0
  });
  const canvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setDimensions({
          width: img.width,
          height: img.height
        });
        setOriginalImage(img.src);
        setPreviewImage(img.src);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    setIsGenerated(true)
  };

  const applyTransformations = (showDownload = false) => {
    if (!originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let targetWidth = dimensions.width;
      let targetHeight = dimensions.height;

      if (resizeMethod === 'percentage') {
        targetWidth = img.width * (percentage / 100);
        targetHeight = img.height * (percentage / 100);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((transforms.rotation * Math.PI) / 180);
      ctx.scale(
        transforms.flipH ? -1 : 1,
        transforms.flipV ? -1 : 1
      );
      
      ctx.drawImage(
        img,
        -targetWidth / 2,
        -targetHeight / 2,
        targetWidth,
        targetHeight
      );
      
      ctx.restore();
      const result = canvas.toDataURL('image/png');
      setPreviewImage(result);
      if (showDownload) {
        setResizedImage(result);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    };
    img.src = originalImage;
  };

  useEffect(() => {
    if (originalImage) {
      applyTransformations();
    }
  }, [transforms, percentage, dimensions, resizeMethod]);

  const handleDownload = () => {
    if (resizedImage) {
      const link = document.createElement('a');
      link.download = 'resized-image.png';
      link.href = resizedImage;
      link.click();
    }
  };

  const TabContent = () => {
    switch(activeTab) {
      case 'rotate':
        return (
          <div className="p-4 bg-gray-100 space-y-2">
            <button
              onClick={() => {
                setTransforms(prev => ({
                  ...prev,
                  rotation: (prev.rotation + 45) % 360
                }));
              }}
              className="w-full p-2 bg-white rounded flex items-center gap-2"
            >
              <RotateCw size={16} /> Rotate 45°
            </button>
            <button
              onClick={() => {
                setTransforms(prev => ({
                  ...prev,
                  rotation: (prev.rotation - 45 + 360) % 360
                }));
              }}
              className="w-full p-2 bg-white rounded flex items-center gap-2"
            >
              <RotateCw className="transform -scale-x-100" size={16} /> Rotate -45°
            </button>
          </div>
        );
      case 'flip':
        return (
          <div className="p-4 bg-gray-100 space-y-2">
            <button
              onClick={() => {
                setTransforms(prev => ({
                  ...prev,
                  flipH: !prev.flipH
                }));
              }}
              className="w-full p-2 bg-white rounded flex items-center gap-2"
            >
              <FlipHorizontal size={16} /> Flip Horizontally
            </button>
            <button
              onClick={() => {
                setTransforms(prev => ({
                  ...prev,
                  flipV: !prev.flipV
                }));
              }}
              className="w-full p-2 bg-white rounded flex items-center gap-2"
            >
              <FlipVertical size={16} /> Flip Vertically
            </button>
          </div>
        );
        case 'resize':
            return(
                <div className="p-6 space-y-6">
          <div className="flex justify-center gap-8">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={resizeMethod === 'percentage'}
                onChange={() => setResizeMethod('percentage')}
                className="w-4 h-4"
              />
              <span>As a Percentage (%)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={resizeMethod === 'dimensions'}
                onChange={() => setResizeMethod('dimensions')}
                className="w-4 h-4"
              />
              <span>By Dimensions</span>
            </label>
          </div>

          {resizeMethod === 'percentage' ? (
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-center">
                Make my image {percentage}% of original size 
                {dimensions.width > 0 && ` (${dimensions.width}x${dimensions.height})`}
              </p>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1">Width</label>
                <input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(prev => ({
                    ...prev,
                    width: Number(e.target.value)
                  }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">Height</label>
                <input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({
                    ...prev,
                    height: Number(e.target.value)
                  }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          )}
        </div>
            );
      default:
        return null;
    }
  };

  return (
  <>
  {isGenerated ? (
    <div className="max-w-6xl mx-auto p-6 flex flex-row-reverse gap-10">
<div className="bg-white rounded-lg shadow w-full">
  <div className="grid grid-cols-3 border-b">
    <button 
      onClick={() => setActiveTab(activeTab === 'resize' ? null : 'resize')}
      className={`p-4 flex justify-center items-center gap-2 ${activeTab === 'resize' ? 'bg-red-500 text-white' : ''}`}
    >
      <ImageIcon size={20} />
      <span>Resize</span>
    </button>
    <button 
      onClick={() => setActiveTab(activeTab === 'flip' ? null : 'flip')}
      className={`p-4 flex justify-center items-center gap-2 ${activeTab === 'flip' ? 'bg-red-500 text-white' : ''}`}
    >
      <FlipHorizontal size={20} />
      <span>Flip</span>
    </button>
    <button 
      onClick={() => setActiveTab(activeTab === 'rotate' ? null : 'rotate')}
      className={`p-4 flex justify-center items-center gap-2 ${activeTab === 'rotate' ? 'bg-red-500 text-white' : ''}`}
    >
      <RotateCw size={20} />
      <span>Rotate</span>
    </button>
  </div>

  <TabContent />

</div>
      {/* Preview Area */}
      {previewImage && (
      <div className="space-y-4 w-6xl">
        <div className="border rounded-lg p-2">
          <img
            src={previewImage}
            alt="Preview"
            className="w-6xl h-auto mx-auto"
          />
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => applyTransformations(true)}
            className="w-full bg-blue-600 text-white rounded-lg p-3"
          >
            Resize Image to 50KB
          </button>
          
          {resizedImage && (
            <button
              onClick={handleDownload}
              className="w-full bg-green-600 text-white rounded-lg p-3"
            >
              Download Resized Image
            </button>
          )}
        </div>
      </div>
    )}
{/* Success Message */}
{showMessage && (
  <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
    Your image was successfully resized!
  </div>
)}

<canvas ref={canvasRef} className="hidden" />
</div>

  ) : (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-5">
       <button className='py-2 px-4 bg-blue-500 text-white absolute top-2 left-4' onClick={() => navigate('/')} >Back</button>
    <div className="text-center mb-6">
      <img src="./Images/upload_image.svg" alt="Upload Icon" className="mx-auto mb-4 w-52" />
      <h2 className="text-xl font-semibold mb-2">Resize JPG .JPEG .PNG .GIF by defining</h2>
      <p className="text-gray-600">new height and width pixels. Change image dimensions in bulk.</p>
    </div>
    <label className="block w-full py-3 px-4 bg-black text-white text-center rounded-lg cursor-pointer hover:bg-gray-800 transition">
      Upload
      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
    </label>

  </div>
  )}
  </>
  );
};

export default ResizeImage50KB;