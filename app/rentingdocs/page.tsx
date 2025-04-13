"use client";

import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export default function RentingDocsPage() {
    const [uiMode, setUiMode] = useState<'tenantOrLandlord' | 'location' | 'issueCategory' | 'userLeasingContract' | 'generalRights' | 'specificQuestion' | 'specificRights'>('tenantOrLandlord');
    const [inputText, setInputText] = useState('');
    const [GRisLoading, setGRIsLoading] = useState(false);
    const [userZipCode, setUserZipCode] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [issueCategory, setIssueCategory] = useState('');
    const [generalRights, setGeneralRights] = useState('');
    const [specificQuestion, setSpecificQuestion] = useState('');
    const [specificRights, setSpecificRights] = useState('');
    const [SRisLoading, setSRIsLoading] = useState(false);
    const [userLeasingContract, setUserLeasingContract] = useState('');
    const [question, setQuestion] = useState('');
   
    const handleInitAssessment = () => {
        setUiMode('location');
    }

    const handleLocation = () => {
        setUiMode('issueCategory');
    }

    const handleIssueCategory = () => {
        setUiMode('userLeasingContract');
    }

    const handleUserLeasingContract = async () => {
        if (!API_KEY) {
            setError("API Key not found. Please check your environment variables (ensure it starts with NEXT_PUBLIC_).");
            return;
        }

        setUiMode('generalRights');
        setGRIsLoading(true);
        setError(null);
        setGeneralRights('');

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
                const model = genAI.getGenerativeModel({ model: MODEL_NAME });
            
                const generationConfig = {
                    temperature: 0.7, // Adjust for creativity vs. factuality
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 512, // Adjust based on desired summary length
                };
            
            const parts = [
                { text: `You are a legal assistant specializing in landlord-tenant laws.
                            Given the following inputs:
                            - User ZIP code: ${userZipCode}
                            - User role: ${inputText}
                            - Issue category: ${issueCategory}
                            - User's leasing contract: ${userLeasingContract}


                            Provide a detailed but easy-to-understand summary of their legal rights and responsibilities. Your response should include:

                            1. Legal Framework Overview:
                            2. Specific Rights & Responsibilities:
                            3. Time Limitations & Notice Requirements:
                            4. Documentation Recommendations:

                            The tone should be clear, supportive, and professional, similar to a legal help website. Only include information that is applicable to their role and location.
                `},
            ];

            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
            });

            if (result.response) {
                // Check if the response was blocked
                if (result.response.promptFeedback?.blockReason) {
                  setError(`Request blocked due to: ${result.response.promptFeedback.blockReason}. Please check the input text.`);
                  console.warn("Prompt Feedback:", result.response.promptFeedback);
                  // Keep uiMode as 'summarize' on error
                } else {
                  const responseText = result.response.text(); // Use .text() for Gemini 1.5 Flash
                  setGeneralRights(responseText);
                //   setUiMode('ask'); // <<< Change UI mode on successful summary
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
            setGRIsLoading(false);
        }
    }

    const handleSpecificQuestion = async () => {
        if (!API_KEY) {
            setError("API key not found.");
            return;
        }

        setSRIsLoading(true);
        setError(null);

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
                const model = genAI.getGenerativeModel({ model: MODEL_NAME });
            
                const generationConfig = {
                    temperature: 0.7, // Adjust for creativity vs. factuality
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 512, // Adjust based on desired summary length
                };
            
            const parts = [
                { text: `Answer this specific law question: ${specificQuestion}, based on a ${inputText} in zip code:
                ${userZipCode} and issue category: ${issueCategory}. Here is some or all of the users's leasing contract: ${userLeasingContract}.
                `},
            ];

            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
            });

            if (result.response) {
                // Check if the response was blocked
                if (result.response.promptFeedback?.blockReason) {
                  setError(`Request blocked due to: ${result.response.promptFeedback.blockReason}. Please check the input text.`);
                  console.warn("Prompt Feedback:", result.response.promptFeedback);
                  // Keep uiMode as 'summarize' on error
                } else {
                  const responseText = result.response.text(); // Use .text() for Gemini 1.5 Flash
                  setSpecificRights(responseText);
                //   setUiMode('ask'); // <<< Change UI mode on successful summary
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
            setSRIsLoading(false);
            setQuestion(specificQuestion);
            setSpecificQuestion('');
        }
        
    }
    
    const issueScenarios = [
        "Repairs and habitability issues","Security deposit rules and timelines","Eviction processes and protections",
        "Privacy and landlord entry requirements","Lease termination procedures","Rent increase limitations",
        "Discrimination protections","Subletting and guest policies"
    ]

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
            {uiMode === 'tenantOrLandlord' && (
                <>
                    <p>Are you a tenant or a landlord?</p>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Put if you are a tenant or a landlord..."
                        rows={1}
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                    <button
                        onClick={handleInitAssessment}
                        style={{
                            padding: '0.75rem 1.5rem',
                            cursor: GRisLoading || !inputText.trim() ? 'not-allowed' : 'pointer',
                            backgroundColor: GRisLoading || !inputText.trim() ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            opacity: GRisLoading || !inputText.trim() ? 0.6 : 1,
                        }}
                    >
                        Next
                    </button>
                </>
            )}

            {uiMode === 'location' && (
                <>
                    <p>Zip code: </p>
                    <textarea
                        value={userZipCode === 0 ? '' : userZipCode.toString()} // Handle initial 0 state better
                        onChange={(e) => {
                            const val = e.target.value;
                            // Allow empty input or only digits, max 5 chars
                            if (val === '' || (/^\d+$/.test(val) && val.length <= 5)) {
                                setUserZipCode(val === '' ? 0 : parseInt(val));
                                setError(null); // Clear error on valid input change
                            }
                        }}
                        placeholder="Zip code..."
                        rows={1}
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} // Added missing styles
                        maxLength={5} // Add maxLength attribute
                    />
                    {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>} {/* Display error message */}
                    <button
                        onClick={(e) => {
                            if (userZipCode.toString().length === 5) {
                                setError(null); // Clear error on success
                                handleLocation();
                                console.log(e);
                            } else {
                                setError("Please enter a valid 5-digit zip code.");
                            }
                        }}
                        disabled={GRisLoading || userZipCode.toString().length !== 5} // Disable condition
                        style={{
                            padding: '0.75rem 1.5rem',
                            // Conditional styling based on disabled state
                            cursor: GRisLoading || userZipCode.toString().length !== 5 ? 'not-allowed' : 'pointer',
                            backgroundColor: GRisLoading || userZipCode.toString().length !== 5 ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            opacity: GRisLoading || userZipCode.toString().length !== 5 ? 0.6 : 1,
                        }}
                    >
                        Next
                    </button>

                </>
            )}

            {uiMode === 'issueCategory' && (
                <>
                    <p>Issue category</p>
                    <select
                        value={issueCategory}
                        onChange={(e) => setIssueCategory(e.target.value)}
                        style={{ marginLeft: '1rem'}}
                    >
                        <option value="">-- Select Issue Category --</option>
                        {issueScenarios.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <button
                        onClick={handleIssueCategory}
                        style={{
                            padding: '0.75rem 1.5rem',
                            cursor: !issueCategory ? 'not-allowed' : 'pointer',
                            backgroundColor: !issueCategory ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            opacity: !issueCategory ? 0.6 : 1,
                        }}
                    >
                        Next
                    </button>
                </>
            )}

            {uiMode === 'userLeasingContract' && (
                <>
                    <p>Put in your your leasing contract</p>
                    <textarea
                        value={userLeasingContract}
                        onChange={(e) => setUserLeasingContract(e.target.value)}
                        placeholder="Put in your leasing contract or na if unavailable..."
                        rows={15}
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                    <button
                        onClick={handleUserLeasingContract}
                        disabled={GRisLoading || !userLeasingContract.trim()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            cursor: GRisLoading || !userLeasingContract.trim() ? 'not-allowed' : 'pointer',
                            backgroundColor: GRisLoading || !userLeasingContract.trim() ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            opacity: GRisLoading || !userLeasingContract.trim() ? 0.6 : 1,
                        }}
                    >
                        Get General summary
                    </button>
                </>
                )}

            {GRisLoading && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <p>Loading summary...</p>
                </div>
            )}
            
            {uiMode === 'generalRights' && !GRisLoading && (
                <>
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
                            <h2 style={{ color: '#ffffff', borderBottom: '1px solid #444', paddingBottom: '0.5rem', marginBottom: '1rem' }}>General Rights:</h2>
                            <ReactMarkdown>
                                {generalRights}
                            </ReactMarkdown>
                    </div>
                    
                    {!SRisLoading && specificRights && (
                    <>
                        <h1>Specific Questions</h1>
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
                            <h2 style={{ color: '#ffffff', borderBottom: '1px solid #444', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Question: {question}<br></br>Answer:</h2>
                            <ReactMarkdown>
                                {specificRights}
                            </ReactMarkdown>
                    </div>
                    </>
                    )}

                    {!SRisLoading && (
                        <>
                            <p>Put specific questions below</p>
                            <textarea
                                value={specificQuestion}
                                onChange={(e) => setSpecificQuestion(e.target.value)}
                                placeholder="Put specific questions here..."
                                rows={5}
                                style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                disabled={SRisLoading}
                            />
                            <button
                            onClick={handleSpecificQuestion}
                            disabled={SRisLoading || !specificQuestion.trim()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                cursor: SRisLoading || !specificQuestion.trim() ? 'not-allowed' : 'pointer',
                                backgroundColor: SRisLoading || !specificQuestion.trim() ? '#ccc' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                opacity: SRisLoading || !specificQuestion.trim() ? 0.6 : 1,
                            }}
                            >
                            Submit Question
                            </button>
                        </>
                    )}
                </>
            )}

        </div>
    )
}