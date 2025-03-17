import { Upload } from 'lucide-react';
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import axios from 'axios';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import {environment} from '../env/environment' 
import { Document, Paragraph, Packer, TextRun } from 'docx';
import { svg2pdf } from 'svg2pdf.js';
import autoTable from "jspdf-autotable";
import Tesseract from 'tesseract.js';

const PdfTools = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fromFormat, setFromFormat] = useState('pdf');
    const [toFormat, setToFormat] = useState('jpg');
    const [convertedFile, setConvertedFile] = useState(null);

    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const conversionOptions = {
        pdf: ['jpg', 'png', 'svg', 'tiff', 'bmp', 'docx'],
        jpg: ['pdf'],
        tiff: ['pdf'],
        svg: ['pdf'],
        png: ['pdf'],
        bmp: ['pdf'],
        xlsx: ['pdf'],
        gif: ['pdf'],
        // docx: ['pdf']
    };

    // PDF to DOCX specific functions
    const convertPdfToImageForWord = async (file) => {
        const reader = new FileReader();
        const fileData = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsArrayBuffer(file);
        });

        const pdf = await pdfjsLib.getDocument(fileData).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        return canvas.toDataURL("image/png");
    };

    const extractTextWithOCR = async (imageData) => {
        const { data: { text } } = await Tesseract.recognize(imageData, "eng");
        return text;
    };

    const generateDocx = async (text) => {
        const paragraphs = text.split("\n").map(
            (line) =>
                new Paragraph({
                    children: [
                        new TextRun({
                            text: line.trim(),
                            font: "Arial",
                            size: 20,
                        }),
                    ],
                    spacing: { after: 200 },
                })
        );

        const doc = new Document({
            sections: [
                {
                    children: paragraphs,
                },
            ],
        });

        return Packer.toBlob(doc);
    };

    const handlePdfToDocx = async () => {
        try {
            const imageData = await convertPdfToImageForWord(selectedFile);
            const text = await extractTextWithOCR(imageData);
            const docxBlob = await generateDocx(text);
            return {
                blob: docxBlob,
                name: `${fileName.split('.')[0]}.docx`
            };
        } catch (error) {
            throw new Error('Failed to convert PDF to DOCX');
        }
    };

    // Modified conversion functions to return blob instead of downloading
    const convertPdfToImage = async (format) => {
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const images = [];

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 2.0 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, `image/${format}`);
                });

                images.push({ blob, name: `page-${pageNum}.${format}` });
            }

            if (images.length === 1) {
                return { blob: images[0].blob, name: images[0].name };
            } else {
                const zip = new JSZip();
                images.forEach(image => {
                    zip.file(image.name, image.blob);
                });
                const content = await zip.generateAsync({ type: 'blob' });
                return { blob: content, name: `converted_images.zip` };
            }
        } catch (error) {
            throw new Error(`Failed to convert PDF to ${format.toUpperCase()}`);
        }
    };

    const convertPdfToSvg = async () => {
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const svgs = [];

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 2.0 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const svgContent = `
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="${viewport.width}" 
                        height="${viewport.height}"
                        viewBox="0 0 ${viewport.width} ${viewport.height}"
                    >
                        <image
                            width="100%"
                            height="100%"
                            preserveAspectRatio="none"
                            href="${canvas.toDataURL('image/png')}"
                        />
                    </svg>
                `;

                const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                svgs.push({ blob, name: `page-${pageNum}.svg` });
            }

            if (svgs.length === 1) {
                return { blob: svgs[0].blob, name: svgs[0].name };
            } else {
                const zip = new JSZip();
                svgs.forEach(svg => {
                    zip.file(svg.name, svg.blob);
                });
                const content = await zip.generateAsync({ type: 'blob' });
                return { blob: content, name: `converted_svgs.zip` };
            }
        } catch (error) {
            throw new Error('Failed to convert PDF to SVG');
        }
    };

    const convertImageToPdf = async () => {
        try {
            const pdf = new jsPDF();
            const imageUrl = URL.createObjectURL(selectedFile);

            if (fromFormat === 'svg') {
                const response = await fetch(imageUrl);
                const svgText = await response.text();
                const parser = new DOMParser();
                const svgElement = parser.parseFromString(svgText, 'image/svg+xml').documentElement;

                await svg2pdf(svgElement, pdf, {
                    x: 0,
                    y: 0,
                    width: pdf.internal.pageSize.getWidth(),
                    height: pdf.internal.pageSize.getHeight(),
                });
            } else {
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = imageUrl;
                });

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgRatio = img.width / img.height;
                // const pageRatio = pageWidth / pageHeight;

                let imgWidth = pageWidth;
                let imgHeight = pageWidth / imgRatio;

                if (imgHeight > pageHeight) {
                    imgHeight = pageHeight;
                    imgWidth = pageHeight * imgRatio;
                }

                const x = (pageWidth - imgWidth) / 2;
                const y = (pageHeight - imgHeight) / 2;

                pdf.addImage(img, fromFormat.toUpperCase(), x, y, imgWidth, imgHeight);
            }

            const pdfBlob = pdf.output('blob');
            return { blob: pdfBlob, name: `${fileName.split('.')[0]}.pdf` };
        } catch (error) {
            throw new Error(`Failed to convert ${fromFormat.toUpperCase()} to PDF`);
        }
    };

    const convertExcelToPdf = async () => {
        try {
            const result = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const workbook = XLSX.read(e.target.result, { type: "binary" });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                        if (data.length === 0) {
                            reject(new Error("Excel file is empty!"));
                            return;
                        }

                        const doc = new jsPDF("landscape");
                        const fileNameWithoutExt = fileName.split(".")[0];

                        doc.setFontSize(14);
                        doc.text(fileNameWithoutExt, 10, 10);

                        autoTable(doc, {
                            head: [data[0]],
                            body: data.slice(1),
                            startY: 20,
                            styles: { fontSize: 10, cellWidth: "auto" },
                            margin: { top: 15 },
                            theme: "grid",
                        });

                        resolve({
                            blob: doc.output('blob'),
                            name: `${fileNameWithoutExt}.pdf`
                        });
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = reject;
                reader.readAsBinaryString(selectedFile);
            });

            return result;
        } catch (error) {
            throw new Error('Failed to convert Excel to PDF');
        }
    };

    // const convertDocxToPdf = async () => {
    //     try {
    //         const formData = new FormData();
    //         formData.append("file", selectedFile);

    //         const response = await axios.post(`${environment.baseUrl}/v1/api/word-to-pdf`, formData, {
    //             headers: {
    //                 "Content-Type": "multipart/form-data",
    //             },
    //             responseType: "blob"
    //         });

    //         return {
    //             blob: new Blob([response.data], { type: "application/pdf" }),
    //             name: `${fileName.split('.')[0]}.pdf`
    //         };
    //     } catch (error) {
    //         throw new Error('Failed to convert Word to PDF');
    //     }
    // };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const validExtensions = {
                'pdf': ['pdf'],
                // 'docx': ['doc', 'docx'],
                'xlsx': ['xls', 'xlsx'],
                'jpg': ['jpg', 'jpeg'],
                'png': ['png'],
                'svg': ['svg'],
                'tiff': ['tiff', 'tif'],
                'bmp': ['bmp'],
                'gif': ['gif']
            };

            if (!validExtensions[fromFormat].includes(fileExtension)) {
                setError(`Please select a valid ${fromFormat.toUpperCase()} file`);
                return;
            }
            setSelectedFile(file);
            setFileName(file.name);
            setError(null);
            setConvertedFile(null);
        }
    };

    const handleRemove = () => {
        setSelectedFile(null);
        setFileName('');
        setError(null);
        setConvertedFile(null);
    };

    const handleConversion = async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!selectedFile) {
                setError('Please select a file first');
                return;
            }

            let result;

            if (fromFormat === 'pdf') {
                switch (toFormat) {
                    case 'jpg':
                    case 'png':
                    case 'bmp':
                    case 'tiff':
                        result = await convertPdfToImage(toFormat);
                        break;
                    case 'svg':
                        result = await convertPdfToSvg();
                        break;
                    case 'docx':
                        result = await handlePdfToDocx();
                        break;
                    default:
                        throw new Error(`Conversion from ${fromFormat} to ${toFormat} is not supported`);
                }
            } else if (toFormat === 'pdf') {
                switch (fromFormat) {
                    case 'jpg':
                    case 'png':
                    case 'bmp':
                    case 'gif':
                    case 'tiff':
                    case 'svg':
                        result = await convertImageToPdf();
                        break;
                    case 'xlsx':
                        result = await convertExcelToPdf();
                        break;
                    // case 'docx':
                    //     result = await convertDocxToPdf();
                    //     break;
                    default:
                        throw new Error(`Conversion from ${fromFormat} to ${toFormat} is not supported`);
                }
            }

            setConvertedFile(result);
        } catch (error) {
            console.error('Conversion error:', error);
            setError(error.message || 'Failed to convert file. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (convertedFile) {
            saveAs(convertedFile.blob, convertedFile.name);
        }
    };

    return (
        <div>
            <div className="max-w-2xl mx-auto shadow-lg p-5 flex flex-col gap-5">
                <h1 className="text-center font-bold text-xl">PDF Tools</h1>
                <div className="flex justify-center gap-2 items-center">
                    <p>Convert</p>
                    <select
                        name="fromFormat"
                        className="p-3 outline-none border"
                        value={fromFormat}
                        onChange={(e) => {
                                setFromFormat(e.target.value);
                            setToFormat(conversionOptions[e.target.value][0]);
                            setSelectedFile(null);
                            setFileName('');
                            setError(null);
                            setConvertedFile(null);
                        }}
                    >
                        {Object.keys(conversionOptions).map((format) => (
                            <option key={format} value={format}>
                                {format.toUpperCase()}
                            </option>
                        ))}
                    </select>
                    <p>to</p>
                    <select
                        name="toFormat"
                        className="p-3 outline-none border"
                        value={toFormat}
                        onChange={(e) => {
                            setToFormat(e.target.value);
                            setError(null);
                            setConvertedFile(null);
                        }}
                    >
                        {conversionOptions[fromFormat].map((format) => (
                            <option key={format} value={format}>
                                {format.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="border-2 border-dashed border-blue-500 p-5 rounded-lg">
                    <input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        onChange={handleFileChange}
                        accept={`.${fromFormat === 'docx' ? 'doc,.docx' : fromFormat}`}
                    />
                    <label
                        htmlFor="file-upload"
                        className="flex items-center flex-col cursor-pointer"
                    >
                        <Upload size={48} className="text-blue-500 mb-2" />
                        <p className="text-gray-600">Click to upload a {fromFormat.toUpperCase()} file</p>
                    </label>
                </div>
                {selectedFile && (
                    <div className="flex justify-between p-5">
                        <p>File: {fileName}</p>
                        <p className="text-red-500 cursor-pointer" onClick={handleRemove}>
                            Remove
                        </p>
                    </div>
                )}
                <div className="flex gap-4">
                    <button
                        className="bg-blue-500 text-white p-3 flex-1 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        disabled={!selectedFile || isLoading}
                        onClick={handleConversion}
                    >
                        {isLoading ? 'Converting...' : 'Convert'}
                    </button>
                    
                    {convertedFile && (
                        <button
                            className="bg-green-500 text-white p-3 flex-1"
                            onClick={handleDownload}
                        >
                            Download
                        </button>
                    )}
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
            </div>
        </div>
    );
};

export default PdfTools;