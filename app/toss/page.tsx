"use client"; // Required for useState and event handlers

import { useState } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown'; // Import react-markdown

const MODEL_NAME = "gemini-1.5-flash"; // Use a recommended model like 1.5 Flash
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export default function TossPage() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uiMode, setUiMode] = useState<'summarize' | 'ask'>('summarize'); // State for UI mode
  const [questionText, setQuestionText] = useState(''); // State for question input
  // Add states for question handling later if needed:
  // const [isAsking, setIsAsking] = useState(false);
  // const [answer, setAnswer] = useState('');
  // const [questionError, setQuestionError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setError("Please paste the Terms of Service text first.");
      return;
    }
    if (!API_KEY) {
        setError("API Key not found. Please check your environment variables (ensure it starts with NEXT_PUBLIC_).");
        return;
    }

    setIsLoading(true);
    setError(null);
    setSummary('');
    // Keep uiMode as 'summarize' during loading

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const generationConfig = {
        temperature: 0.7, // Adjust for creativity vs. factuality
        topK: 1,
        topP: 1,
        maxOutputTokens: 512, // Adjust based on desired summary length
      };

      // Optional: Safety settings configuration
      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ];

      const parts = [
        { text: `Please summarize the following Terms of Service document in simple terms, focusing on key points like data usage, user rights, liability limitations, and termination clauses. Use Markdown for formatting like headings, bold text, and bullet points:\n\n${inputText}` },
      ];

      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
        safetySettings,
      });

       if (result.response) {
         // Check if the response was blocked
         if (result.response.promptFeedback?.blockReason) {
           setError(`Request blocked due to: ${result.response.promptFeedback.blockReason}. Please check the input text.`);
           console.warn("Prompt Feedback:", result.response.promptFeedback);
           // Keep uiMode as 'summarize' on error
         } else {
           const responseText = result.response.text(); // Use .text() for Gemini 1.5 Flash
           setSummary(responseText);
           setUiMode('ask'); // <<< Change UI mode on successful summary
         }
       } else {
         // Handle cases where the response might be missing entirely
         console.error("Gemini API call succeeded but no response object was found.", result);
         setError("Failed to generate summary. An unknown error occurred with the API response.");
         // Keep uiMode as 'summarize' on error
       }

    } catch (e) {
      console.error("Error calling Gemini API:", e);
      setError(`An error occurred: ${e instanceof Error ? e.message : String(e)}`);
      // Keep uiMode as 'summarize' on error
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for question submission logic
  const handleAskQuestion = async () => {
    console.log("Submitting question:", questionText);
    // Implement API call to answer question based on inputText and questionText here
    alert("Question submission functionality not yet implemented.");
  };


  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>Terms of Service Summarizer</h1>

      {/* Only show initial input section in 'summarize' mode */}
      {uiMode === 'summarize' && (
        <>
          <p>Paste the Terms of Service (ToS) below and click "Summarize" to get a simplified overview using Gemini.</p>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste Terms of Service text here..."
            rows={15}
            style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
            disabled={isLoading}
          />
          <button
            onClick={handleSummarize}
            disabled={isLoading || !inputText.trim()}
            style={{
                padding: '0.75rem 1.5rem',
                cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer',
                backgroundColor: isLoading || !inputText.trim() ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                opacity: isLoading || !inputText.trim() ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Summarizing...' : 'Summarize'}
          </button>
        </>
      )}

      {/* Loading indicator - shown during summarization */}
      {isLoading && uiMode === 'summarize' && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p>Loading summary...</p>
            {/* Optional: Add a spinner here */}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div style={{ color: 'red', marginTop: '1rem', border: '1px solid red', padding: '1rem', borderRadius: '4px', backgroundColor: '#ffebee' }}>
          <strong>Error:</strong> {error}
          {/* Optionally add a button here to reset or try again */}
        </div>
      )}

      {/* Summary display - shown when summary exists and not loading */}
      {summary && !isLoading && (
        <div style={{
          marginTop: '2rem',
          border: '1px solid #333',
          padding: '1.5rem',
          borderRadius: '8px',
          backgroundColor: '#1a1a1a',
          color: '#f0f0f0',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          lineHeight: '1.7'
        }}>
          <h2 style={{ color: '#ffffff', borderBottom: '1px solid #444', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Summary:</h2>
          <ReactMarkdown
            components={{
              // a: ({node, ...props}) => <a style={{ color: '#61dafb' }} {...props} />
            }}
          >
            {summary}
          </ReactMarkdown>
        </div>
      )}

      {/* Question section - shown only in 'ask' mode after summary is loaded */}
      {uiMode === 'ask' && summary && !isLoading && (
        <div style={{ marginTop: '2rem' }}>
           <h3 style={{ marginBottom: '1rem' }}>Ask Questions About the Document:</h3>
           <textarea
             value={questionText}
             onChange={(e) => setQuestionText(e.target.value)}
             placeholder="Ask questions based on the text provided..."
             rows={5}
             style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
             // disabled={isAsking} // Enable when implementing question logic
           />
           <button
             onClick={handleAskQuestion} // Connect to the question handler
             // disabled={isAsking || !questionText.trim()} // Enable when implementing question logic
             style={{
                 padding: '0.75rem 1.5rem',
                 cursor: /*isAsking ||*/ !questionText.trim() ? 'not-allowed' : 'pointer', // Adjust cursor based on state
                 backgroundColor: /*isAsking ||*/ !questionText.trim() ? '#ccc' : '#28a745', // Green color for submit
                 color: 'white',
                 border: 'none',
                 borderRadius: '4px',
                 fontSize: '1rem',
                 opacity: /*isAsking ||*/ !questionText.trim() ? 0.6 : 1, // Adjust opacity based on state
             }}
           >
             {/* {isAsking ? 'Asking...' : 'Submit Question'} */}
             Submit Question
           </button>
           {/* Placeholder for displaying the answer */}
           {/* {answer && <div style={{marginTop: '1rem', ...}}> {answer} </div>} */}
           {/* Placeholder for displaying question errors */}
           {/* {questionError && <div style={{color: 'red', ...}}> {questionError} </div>} */}
        </div>
      )}

    </div>
  );
}
