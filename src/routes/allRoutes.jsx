import React from "react"
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Home from "../Pages/Home"
import Layout from "../Pages/Layout"
import Compress_image from "../Pages/Compress_image"
import ResizeImagesTool from "../Pages/Resize_image"
import ImageConverterTool from "../Pages/ImageConverterTool"
import PdfTools from "../Pages/PdfTools"
import TextToSpeech from "../Pages/TextToSpeech"
import SpeechToText from "../Pages/SpeechToText"
import VideoEditorComponent from "../Pages/VideoEdit&Compress"
import WordCounter from "../Pages/WordCounter"
import PlotGenerator from "../Pages/PlotGenerator"
import VideoDownloader from "../Pages/VideoDownloader"
const AllRoutes = () => {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/"  element={<Layout/>} >
                            <Route path="/" element={<Home/>} />
                            <Route path="/compress-images" element={<Compress_image/>} />
                            <Route path="/resize-images" element={<ResizeImagesTool/>} />
                            <Route path="/image-converter-tools" element={<ImageConverterTool/>} />
                            <Route path="/pdf-converter" element={<PdfTools/>} />
                            <Route path="/text-to-speech" element={<TextToSpeech/>} />
                            <Route path="/speech-to-text" element={<SpeechToText/>} />
                            <Route path="/video-editor" element={<VideoEditorComponent/>} />
                            <Route path="/word-counter" element={<WordCounter/>} />
                            <Route path="/plot-generator" element={<PlotGenerator/>} />
                            <Route path="/video-downloader" element={<VideoDownloader/>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default AllRoutes