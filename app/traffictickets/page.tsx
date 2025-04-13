"use client";

import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";


export default function TrafficTickets() {
    const [uiMode, setUiMode] = useState<'citationNumber'|'county'|'details'|'generalResponse'|'loading'>('citationNumber');
    const [extraQuestionStatus, setExtraQuestionStatus] = useState<'none'|'ready'|'loading'|'response'>('none');
    const [citationNumber, setCitationNumber] = useState('');
    const [county, setCounty] = useState('');
    const [details, setDetails] = useState('');
    const [generalResponse, setGeneralResponse] = useState('');
    const [questionText, setQuestionText] = useState('');
    const [answer, setAnswer] = useState('');
    const [question, setQuestion] = useState('');
    
    
    const handleAskQuestion = async () => {
        if (!API_KEY) {
            console.log("apikey");
            return;
        }
        
        setExtraQuestionStatus('loading');
        
        
        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
            const generationConfig = {
                temperature: 0.7,
                topK: 1,
                topP: 1,
                maxOutputTokens: 4096,
            };
    
            const parts = [
                {text: answer},
                {text: `Based on the previous information about your traffic citation:
                    - Citation Number: ${citationNumber}
                    - County: ${county} 

                    You asked: "${questionText}"

                    Please provide a detailed answer to this specific question about your citation, including any relevant legal information, procedural guidance, or practical advice applicable to ${county} County. Consider the context from your additional details: "${details}"

                    Offer concrete next steps when appropriate and clarify any jurisdiction-specific requirements or deadlines relevant to this question.
                `}
            ];
    
            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
            });
    
            if (result.response) {
                if (result.response.promptFeedback?.blockReason) {
                    console.warn("Prompt Feedback:", result.response.promptFeedback);
                } else {
                    const responseText = result.response.text();
                    setAnswer(responseText);
                    setQuestion(questionText);
                    setQuestionText('');
                }
            } else {
                console.error("Gemini API call succeeded but no response object was found.", result);
                
            }
        
        } catch (e) {
            console.error("Error calling Gemini API:", e);
            
        } finally {
            // setIsLoading(false);
            // setUiMode('generalResponse');
            setExtraQuestionStatus('response');
        }
    }

    const handleGeneralResponse = async () => {
        if (!API_KEY) {
            console.log("apikey");
            return;
        }

        setUiMode('loading');
        
        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
            const generationConfig = {
                temperature: 0.7,
                topK: 1,
                topP: 1,
                maxOutputTokens: 4096,
            };
    
            const parts = [
                { text: `Analyze the following traffic citation and provide detailed guidance:
                        Citation Number: ${citationNumber}
                        County: ${county}
                        Additional Details: ${details}
                        Please provide:
                        1. An explanation of the likely violation based on the citation number format and county
                        2. Typical fines and penalties for this type of citation in ${county} County
                        3. All available options for the recipient (paying, contesting, traffic school, etc.)
                        4. Step-by-step procedures for each option in ${county} County
                        5. Important deadlines and requirements specific to this jurisdiction
                        6. Potential impacts on driving record and insurance
                        7. Any county-specific programs or alternatives that might be available
                        Include any insights based on the additional details provided
                        Please provide comprehensive yet clear guidance that someone without legal training can understand.
`},
            ];
    
            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
            });
    
            if (result.response) {
                if (result.response.promptFeedback?.blockReason) {
                    console.warn("Prompt Feedback:", result.response.promptFeedback);
                } else {
                    const responseText = result.response.text();
                    setGeneralResponse(responseText);
                }
            } else {
                console.error("Gemini API call succeeded but no response object was found.", result);
            }
        
        } catch (e) {
            console.error("Error calling Gemini API:", e);
        } finally {
            // setIsLoading(false);
            setUiMode('generalResponse');
            setExtraQuestionStatus('ready');
        }

    }

    return (
        <div>
            <h1>Traffic Tickets</h1>
            
            {uiMode=== 'citationNumber' && (
                <>
                    <p>Citation Number (located in top right corner):</p>
                    <textarea
                        value={citationNumber}
                        onChange={(e) => setCitationNumber(e.target.value)}
                        placeholder="This is located in the top right of the ticket..."
                        rows={1}
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                    <button
                        onClick={() => setUiMode('county')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            cursor: !citationNumber.trim() ? 'not-allowed' : 'pointer',
                            backgroundColor: !citationNumber.trim() ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            opacity: !citationNumber.trim() ? 0.6 : 1,
                        }}
                    >
                        Next
                    </button>
                </>
            )}

            {uiMode === 'county' && (
                <>
                    <p>What county was the ticket issued in:</p>
                    <textarea
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    placeholder="Enter the county the ticket was issued in..."
                    rows={1}
                    style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                    <button
                        onClick={() => setUiMode('details')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            cursor: !county.trim() ? 'not-allowed' : 'pointer',
                            backgroundColor: !county.trim() ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            opacity: !county.trim() ? 0.6 : 1,
                        }}
                    >
                    Next
                    </button>
                </>
            )}

            {uiMode==='details' && (
                <>
                    <p>details</p>
                    <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Add some details regarding your case for better responses..."
                        rows={15}
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                    <button
                        onClick={handleGeneralResponse}
                        disabled={!details.trim()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            cursor: !details.trim() ? 'not-allowed' : 'pointer',
                            backgroundColor: !details.trim() ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            opacity: !details.trim() ? 0.6 : 1,
                        }}
                    >
                        Get General summary
                    </button>
                </>
            )}

            {uiMode === 'generalResponse' && (
                <>
                <p>Here is what you need to know</p>
                <ReactMarkdown>
                    {generalResponse}
                </ReactMarkdown>
                </>
            )}

            {uiMode === 'loading' && (
                <>
                    <p>LOADING...</p>
                </>
            )}

            {(extraQuestionStatus === 'ready' || extraQuestionStatus === 'response') && (
                <>
                    <p>Enter specific questions:</p>
                    <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Ask questions based on the text provided..."
                        rows={5}
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
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
                        Submit Question
                    </button>
                </>
            )}

            {extraQuestionStatus === 'loading' && (
                <>
                    <p>LOADING...</p>
                </>
            )}

            {extraQuestionStatus === 'response' && (
                <>
                    <p>Answer</p>
                    <p>Question: {question}</p>
                    <ReactMarkdown>
                        {answer}
                    </ReactMarkdown>
                </>
            )}

        </div>
    );
}