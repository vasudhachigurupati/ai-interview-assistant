
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

function ResumeUpload({ onDataExtracted }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);



const extractContactInfo = (text) => {
  
  const nameRegex = /^([A-Z][a-z]+(?:\s[A-Z][a-z'-]+){1,2})$/m;

  // The other regex patterns should still be there
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;

  const nameMatch = text.match(nameRegex);
  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
    
  const extractedData = {
    name: nameMatch ? nameMatch[0] : null,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0]?.replace(/\D/g, '') : null,
  };

  console.log("1. Resume parsed. Sending this data to the main page:", extractedData);
  onDataExtracted(extractedData);
};
  

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleParseResume = async () => {
    if (!selectedFile) return;
    setIsParsing(true);

    const fileReader = new FileReader();
    fileReader.onload = async function() {
      const arrayBuffer = this.result;
      let text = '';
      try {
        if (selectedFile.type === "application/pdf") {
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                text += textContent.items.map((s) => s.str).join('\n'); // Use newline for better regex matching
            }
        } else if (selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const result = await mammoth.extractRawText({ arrayBuffer });
            text = result.value;
        } else {
            alert("Unsupported file type.");
            setIsParsing(false);
            return;
        }
        extractContactInfo(text);
      } catch (error) {
        console.error("Detailed parsing error:", error); 
        alert("There was an error parsing your resume. Please check the console for details.");
      } finally {
        setIsParsing(false);
      }
    };
    fileReader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div>
      <h2>Upload Your Resume</h2>
      <p>Please upload your resume in PDF or DOCX format to begin.</p>
      <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      <button className="button" onClick={handleParseResume} disabled={!selectedFile || isParsing}>
        {isParsing ? 'Parsing...' : 'Upload and Start'}
      </button>
    </div>
  );
}

export default ResumeUpload;