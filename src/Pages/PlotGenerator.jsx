import React, { useState } from 'react';
import { environment } from '../env/environment';
import { Copy, Download, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlotGenerator = () => {
  const [text, setText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [storyType, setStoryType] = useState('default');
  const [creativity, setCreativity] = useState('standard');
  const [length, setLength] = useState('short');
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();


  const handlePlotGenerator = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${environment.baseUrl}/v1/api/plot-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: text,
          storyType: storyType,
          creativity: creativity,
          length: length,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch generated content');
      }

      const data = await response.json();

      if (data.plot) {
        // Process the content to create proper formatting
        const formattedContent = formatPlotContent(data.plot);
        setOutputText(formattedContent);
        // Maan lijiye data aapka JSON response hai.
        const generatorText = data.plot;
        const titleMatch = generatorText.match(/^Title:\s*(.*)$/m);
        const title = titleMatch ? titleMatch[1] : "Untitled";

        setTitle(title);

      } else {
        console.log('No Generated Content');
      }
    } catch (error) {
      console.error('Error generating plot:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format the plot content with proper HTML structure
  const formatPlotContent = (content) => {
    // Split the content by newlines
    const lines = content.split('\n');
    let formattedHtml = '';

    // Iterate through lines to format them appropriately
    lines.forEach((line, index) => {
      // Skip empty lines
      if (line.trim() === '') {
        formattedHtml += '<br/>';
        return;
      }

      // Format Title
      if (line.startsWith('Title:')) {
        formattedHtml += `<h1 class="plot-title">${line.substring(6).trim()}</h1>`;
      }
      // Format Logline
      else if (line.startsWith('Logline:')) {
        formattedHtml += `<p class="plot-logline"><em>${line.substring(8).trim()}</em></p>`;
      }
      // Format Section Headers
      else if (line.match(/^(Setting|Characters|Plot|Themes):/)) {
        formattedHtml += `<h2 class="plot-section-header">${line}</h2>`;
      }
      // Format Act Headers
      else if (line.match(/^Act (I|II|III|IV|V):/)) {
        formattedHtml += `<h3 class="plot-act-header">${line}</h3>`;
      }
      // Format regular paragraphs
      else {
        formattedHtml += `<p class="plot-paragraph">${line}</p>`;
      }
    });

    return formattedHtml;
  };

  const handleCopy = () => {
    if (outputText) {
      // Convert HTML to formatted plain text
      const tempElement = document.createElement('div');
      tempElement.innerHTML = outputText;

      // Process the HTML to maintain formatting in plain text
      let formattedText = '';

      // Get all elements
      const elements = tempElement.querySelectorAll('h1, h2, h3, p, br');

      elements.forEach((element) => {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent.trim();

        if (tagName === 'h1') {
          formattedText += '# ' + text + '\n\n';
        } else if (tagName === 'h2') {
          formattedText += '## ' + text + '\n\n';
        } else if (tagName === 'h3') {
          formattedText += '### ' + text + '\n\n';
        } else if (tagName === 'p') {
          if (element.classList.contains('plot-logline')) {
            formattedText += '_' + text + '_\n\n';
          } else {
            formattedText += text + '\n\n';
          }
        } else if (tagName === 'br') {
          formattedText += '\n';
        }
      });

      navigator.clipboard.writeText(formattedText);
    }
  };

  const handleDownload = () => {
    if (outputText) {
      // Convert HTML to formatted plain text (same as copy function)
      const tempElement = document.createElement('div');
      tempElement.innerHTML = outputText;

      // Process the HTML to maintain formatting in plain text
      let formattedText = '';

      // Get all elements
      const elements = tempElement.querySelectorAll('h1, h2, h3, p, br');

      elements.forEach((element) => {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent.trim();

        if (tagName === 'h1') {
          formattedText += '# ' + text + '\n\n';
        } else if (tagName === 'h2') {
          formattedText += '## ' + text + '\n\n';
        } else if (tagName === 'h3') {
          formattedText += '### ' + text + '\n\n';
        } else if (tagName === 'p') {
          if (element.classList.contains('plot-logline')) {
            formattedText += '_' + text + '_\n\n';
          } else {
            formattedText += text + '\n\n';
          }
        } else if (tagName === 'br') {
          formattedText += '\n';
        }
      });

      const blob = new Blob([formattedText], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title}.txt` || 'Plot_Generated.txt';
      link.click();
    }
  };
  const handleReset = () => {
    setOutputText('');
    setText('');
    setStoryType('default');
    setCreativity('standard');
    setLength('short');
  };

  return (
    <div className="plot-generator-main-container">
      <button className='py-2 px-4 bg-blue-500 text-white absolute top-2 left-4' onClick={() => navigate('/')}>Back</button>
      <div className="plot-generator-container">
        <textarea
          placeholder="Enter Your Text Here...."
          className="plot-generator-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="type-creativity-div">
          <div className="type">
            <p>Story Type</p>
            <select
              value={storyType}
              onChange={(e) => setStoryType(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="original">Original</option>
              <option value="classic">Classic</option>
              <option value="humor">Humor</option>
              <option value="sciFi">SciFi</option>
              <option value="love">Love</option>
              <option value="thriller">Thriller</option>
              <option value="horror">Horror</option>
              <option value="realism">Realism</option>
            </select>
          </div>

          <div className="creativity">
            <p>Creativity</p>
            <select
              value={creativity}
              onChange={(e) => setCreativity(e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="innovative">Innovative</option>
              <option value="visionary">Visionary</option>
              <option value="conservative">Conservative</option>
              <option value="imaginative">Imaginative</option>
              <option value="inspired">Inspired</option>
            </select>
          </div>
        </div>

        <div className="length-div">
          <p>Length</p>
          <div className="length">
            <input
              type="radio"
              id="short"
              name="length"
              value="short"
              checked={length === 'short'}
              onChange={(e) => setLength(e.target.value)}
            />
            <label htmlFor="short">Short</label>
            <input
              type="radio"
              id="medium"
              name="length"
              value="medium"
              checked={length === 'medium'}
              onChange={(e) => setLength(e.target.value)}
            />
            <label htmlFor="medium">Medium</label>
            <input
              type="radio"
              id="long"
              name="length"
              value="long"
              checked={length === 'long'}
              onChange={(e) => setLength(e.target.value)}
            />
            <label htmlFor="long">Long</label>
          </div>
        </div>

        <button
          className="plot-generator-btn disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={!text || isLoading}
          onClick={handlePlotGenerator}
        >
          {isLoading ? 'Loading...' : 'Generate Plot'}
        </button>

        <div className="plot-generator-result">
          <div className='results-btn'>
            <RefreshCcw onClick={handleReset} className='cursor-pointer' />
            <Copy onClick={handleCopy} className='cursor-pointer' />
            <Download onClick={handleDownload} className='cursor-pointer' />
          </div>
          <p className='text-center font-bold text-xl mb-3'>Result</p>
          <div
            className='result-output formatted-plot'
            dangerouslySetInnerHTML={{ __html: outputText }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PlotGenerator;