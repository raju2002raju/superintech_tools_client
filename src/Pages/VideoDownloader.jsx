import { useState } from "react";
import axios from "axios";
import { environment } from '../env/environment';
import { AlertCircle } from "lucide-react";

export default function VideoDownloader() {
    const [url, setUrl] = useState("");
    const [platform, setPlatform] = useState("youtube");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [downloadType, setDownloadType] = useState(null);

    const standardizeResponse = (response, platform) => {
        if (!response?.data) return null;

        switch (platform) {
            case 'instagram':
                if (response.data[0]) {
                    return {
                        title: response.data[0].wm || "Instagram Media",
                        thumbnail: response.data[0].thumbnail,
                        url: response.data[0].url,
                        audio_url: null 
                    };
                }
                break;

            case 'tiktok':
                if (response.data) {
                    return {
                        title: response.data.title || "TikTok Video",
                        thumbnail: response.data.thumbnail,
                        url: response.data.video[0],
                        // audio_url: response.data.audio[0]
                    };
                }
                break;

            case 'twitter':
                if (response.data) {
                    return {
                        title: response.data.title || "Twitter Video",
                        thumbnail: null, // Twitter doesn't provide thumbnail
                        url: response.data.url[0]?.hd || response.data.url[0]?.sd,
                        audio_url: null // Twitter doesn't provide separate audio
                    };
                }
                break;

            case 'facebook':
                if (response.data) {
                    return {
                        title: "Facebook Video",
                        thumbnail: response.data.thumbnail || null,
                        url: response.data.sd || null,
                        audio_url: null
                    };
                }
                break;

            case 'youtube':
                if (response.data.data && !response.data.message) {
                    return {
                        title: response.data.data.title || "YouTube Video",
                        thumbnail: response.data.data.thumbnail,
                        url: response.data.data.videoUrl,
                        audio_url: response.data.data.audio_url
                    };
                }
                break;
          
            default:
                return null;
        }
    };

 
  // Modified handleDownload function with better debugging
  const handleDownload = async () => {
      setError("");
      setData(null);
  
      if (!url.trim()) {
          setError("Please enter a valid URL");
          return;
      }
  
      try {
          setLoading(true);
          const response = await axios.post(`${environment.baseUrl}/v1/api/video-downloader`, { 
              url: url.trim(), 
              platform 
          });
                    
          // For Reddit, handle the response differently
          if (platform === 'reddit') {
              if (response.data.data && response.data.data.success) {
                  setData({
                      title: "Reddit Video",
                      thumbnail: null,
                      url: response.data.data.videoUrl,
                      width: response.data.width,
                      height: response.data.height,
                      duration: response.data.duration
                  });
              } else {
                  throw new Error("Failed to process Reddit video data");
              }
          } else if (platform === 'snapchat') {       
            if (response.data && response.data.data && response.data.data.videoUrl) {  
                setData({
                    title: 'Snapchat Video',
                    url: response.data.data.videoUrl  
                });
            } else {
                console.error("Snapchat videoUrl not found in response:", response.data);
            }
        }
        
         else if (platform === 'pinterest') {
            if (response.data && response.data.data && response.data.data.videoUrl) {
                setData({
                    title: response.data.data.title || 'Pinterest Video',
                    url: response.data.data.videoUrl  
                });
            }
            
          } else {
              // Use standardizeResponse for other platforms
              const standardizedData = standardizeResponse(response.data, platform);
              
              if (standardizedData) {
                  setData(standardizedData);
              } else {
                  throw new Error(`No download data available for this ${platform} content`);
              }
          }
      } catch (err) {
          console.error('Download error:', err);
          console.error('Error response:', err.response);
          setError(err.response?.data?.message || "Failed to fetch download link. Please try again.");
      } finally {
          setLoading(false);
      }
  };
  
    const proxyDownload = async (fileUrl, fileType) => {
        if (!fileUrl) {
            setError("Invalid download URL");
            return;
        }

        try {
            setDownloadType(fileType);
            const downloadUrl = `${environment.baseUrl}/v1/api/proxy-download?url=${encodeURIComponent(fileUrl)}&fileType=${fileType}&fileName=${fileType === 'video' ? 'video.mp4' : 'audio.mp3'}`;
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.target = '_blank';
            link.download = fileType === 'video' ? 'video.mp4' : 'audio.mp3';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => setDownloadType(null), 3000);
        } catch (error) {
            setError("Download failed. Please try again.");
            setDownloadType(null);
        }
    };

    const isDownloading = (type) => downloadType === type;

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Social Media Video Downloader</h2>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Enter video URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <select 
                    value={platform} 
                    onChange={(e) => setPlatform(e.target.value)}
                    className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>    
                    <option value='reddit'>Reddit</option>
                    <option value="snapchat">Snapchat</option>
                    <option value="pinterest">Pinterest</option>
                    
                </select>

                <button 
                    onClick={handleDownload} 
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                    {loading ? "Fetching..." : "Fetch Download Link"}
                </button>
            </div>

            {error && (
                <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                </div>
            )}

            {data && (
                <div className="p-6 border rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">{data.title || "Downloaded Media"}</h3>
                    
                    {data.thumbnail && (
                        <img 
                            src={data.thumbnail} 
                            alt="Media thumbnail" 
                            className="w-full max-w-md rounded-lg mb-6 mx-auto"
                        />
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        {data.url && (
                            <button
                                onClick={() => proxyDownload(data.url, 'video')}
                                disabled={isDownloading('video')}
                                className="flex-1 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300 transition-colors"
                            >
                                {isDownloading('video') ? "Starting Download..." : "Download Video (MP4)"}
                            </button>
                        )}
                        
                    </div>
                </div>
            )}
        </div>
    );
}