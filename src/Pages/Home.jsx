import React from 'react'
import { useNavigate } from 'react-router-dom'
import Compress_Image from '../assets/Compress_Image.png'
import Resize_Image from '../assets/Resize_Image.png'
import Image_converter_Tools from '../assets/Image_converter_Tools.png'
import pdf_tool_image from '../assets/pdf_tool_image.png'
import Text_To_Speech from '../assets/Text_To_Speech.png'
import Speech_To_Text from '../assets/Speech_To_Text.png'
import video_editor from '../assets/Video_editor.png'
import Word_Counter from '../assets/Word_Counter.png'
import video_downloader from '../assets/video_downloader.svg'
import Plot_Generator from '../assets/Plot_Generator.png'


const Home = () => {
    const navigate = useNavigate();
  return (
    <div className=' flex flex-col items-center gap-10 main-container h-screen'>
        <div className='w-3/5'>
      <h1 className='text-center font-bold text-2xl py-6'>Top 10 Tools</h1>
    </div>
    <div className='home-main-container'>
        <div className='home-container'>
        <div className="spell-container">
        <div className="spell-checker" onClick={() => {navigate('/compress-images')}}>
            <img alt='compress_image' src={Compress_Image}/> 
        </div>
          <p className="spell-checker-title">Compress Image</p> 
        </div>
        <div className="spell-container">
        <div className="spell-checker" onClick={() => {navigate('/resize-images')}}>
            <img alt='resize_image' src={Resize_Image}/> 
        </div>
          <p className="spell-checker-title">Resize Image</p> 
        </div>
        <div className="spell-container">
        <div className="spell-checker" onClick={() => {navigate('/image-converter-tools')}}>
            <img alt='converter_image' src={Image_converter_Tools}/> 
        </div>
          <p className="spell-checker-title">Image Converter Tools</p> 
        </div>
        <div className="spell-container">
        <div className="spell-checker" onClick={() => {navigate('/pdf-converter')}}>
            <img alt='pdf_image' src={pdf_tool_image}/> 
        </div>
          <p className="spell-checker-title">PDF Tools</p> 
        </div>
        <div className="spell-container">
        <div className="spell-checker" onClick={() => {navigate('/text-to-speech')}}>
            <img alt='text_image' src={Text_To_Speech}/> 
        </div>
          <p className="spell-checker-title">Text To Speech</p> 
        </div>
        <div className="spell-container">
        <div className="spell-checker" onClick={() => {navigate('/speech-to-text')}}>
            <img alt='speech_image' src={Speech_To_Text}/> 
        </div>
          <p className="spell-checker-title">Speech To Text</p> 
        </div>
                <div className="spell-container">
        <div className="spell-checker" onClick={() => {navigate('/video-editor')}}>
            <img alt='video_image' src={video_editor}/> 
        </div>
          <p className="spell-checker-title">Video Edit & Compress</p> 
        </div>
        <div className="spell-container">
        <div className="spell-checker" onClick={() => {navigate('/word-counter')}}>
            <img alt='word_image' src={Word_Counter}/> 
        </div>
          <p className="spell-checker-title">Word Counter</p> 
        </div>
        <div className="spell-container">
        <div className="spell-checker" onClick={() => {navigate('/plot-generator')}}>
        <img alt='plot_image' src={Plot_Generator}/> 
        </div>
          <p className="spell-checker-title">Plot Generator</p> 
        </div>
        <div className="spell-container">
        <div className="spell-checker" onClick={() => {navigate('/video-downloader')}}>
        <img alt='video_image' src={video_downloader}/> 
        </div>
          <p className="spell-checker-title">Video Downloader</p> 
        </div>
        </div>
    </div>
    </div>
  )
}

export default Home;
