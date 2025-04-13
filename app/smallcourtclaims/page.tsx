"use client";

import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';


const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export default function SmallClaimsPage() {

    const [typeOfCase, setTypeOfCase] = useState('');
    const [userState, setUserState] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [processWalkThrough, setProcessWalkThrough] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [issueDescription, setIssueDescription] = useState('');
    const [claimAmount, setClaimAmount] = useState(25);
    const [incidentYear, setIncidentYear] = useState(2000);
    const [incidentMonth, setIncidentMonth] = useState('');
    const [incidentDay, setIncidentDay] = useState<number>(1)
    const [opposingPartyInfo, setOpposingPartyInfo] = useState('');
    const [evidence, setEvidence] = useState('');
    const [questionStatus, setQuestionStatus] = useState<'notReady'|'ready'|'loading'|'returned'>('notReady');
    const [question, setQuestion] = useState('');
    const [specificQuestion, setSpecificQuestion] = useState('');
    const [SRisLoading, setSRIsLoading] = useState(false);
    const [specificRights, setSpecificRights] = useState('');


    const states = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
        "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
        "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
        "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
        "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
        "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
        "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
        "Wisconsin", "Wyoming"
    ];

    const caseTypes = [
        "Security deposit disputes","Landlord/tenant issues (non-deposit)","Consumer complaints",
        "Minor property damage","Unpaid personal loans or debts","Breach of contract",
        "Auto accident/repair disputes","Contractor/home repair disputes","Wage/employment disputes",
        "Returned check/payment issues","Homeowner association disputes","Professional service disputes",
        "Personal injury (minor)","Property recovery","Other"
    ];

    const months = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September",
        "October", "November", "December"
    ]

    const handleProcessWalkthrough = async () => {
        if (!typeOfCase || !userState || !issueDescription || !claimAmount || !incidentYear || !incidentMonth || !incidentDay || !opposingPartyInfo || !evidence) {
            setError("Please enter all data.");
            console.log(error)
            return;
        }
        if (!API_KEY) {
            setError("API Key not found. Please check your environment variables (ensure it starts with NEXT_PUBLIC_).");
            return;
        }

        setIsTyping(true);
        setError(null);
        setProcessWalkThrough('');

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
                { text: `
    Based on the user being located in ${userState} and filing a ${typeOfCase} small claims case, please help generate appropriate documentation for their case.

    Case details provided by user:
    - Description of issue: ${issueDescription}
    - Amount seeking: ${claimAmount}
    - Date(s) of incident: ${incidentDay} ${incidentMonth}, ${incidentYear}
    - Opposing party information: ${opposingPartyInfo}
    - Evidence available: ${evidence}

    Please provide:
    1. A properly formatted draft complaint for ${userState} small claims court
    2. A demand letter template that could be sent before filing
    3. Instructions for completing any required forms specific to ${userState}
    4. A checklist of what documentation to bring to court
    5. Any jurisdiction-specific requirements or limitations for this type of case in ${userState}

    Include appropriate legal language while keeping everything understandable to someone without legal training.
    `},
            ];

            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
            });

            if (result.response) {
                if (result.response.promptFeedback?.blockReason) {
                    setError(`Request blocked due to: ${result.response.promptFeedback.blockReason}. Please check the input text.`);
                    console.warn("Prompt Feedback:", result.response.promptFeedback);
                } else {
                    const responseText = result.response.text();
                    setProcessWalkThrough(responseText);
                }
            } else {
                console.error("Gemini API call succeeded but no response object was found.", result);
                setError("Failed to generate process walkthroug");
            }
        
        } catch (e) {
            console.error("Error calling Gemini API:", e);
            setError(`An error occurred: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsTyping(false);
            setQuestionStatus('ready');
        }
    }

    const handleSpecificQuestion = async () => {
        if (!API_KEY) {
            setError("API key not found.");
            return;
        }

        setQuestionStatus('loading');
        setError(null);

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
                { text: `
You are a legal expert helping someone understand their small claims court options.
Given the following inputs:
- Type of case: ${typeOfCase}
- Date of incident: ${incidentDay} ${incidentMonth}, ${incidentYear}
- Opposing party information: ${opposingPartyInfo}
- Evidence provided: ${evidence}
- Claim amount: ${claimAmount}
- Issue description: ${issueDescription}
- User state: ${userState}


This person asked you this specific question: ${specificQuestion}

Use plain, helpful language.
                    `},
            ];

            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
            });

            if (result.response) {
                if (result.response.promptFeedback?.blockReason) {
                    setError(`Request blocked due to: ${result.response.promptFeedback.blockReason}. Please check the input text.`);
                    console.warn("Prompt Feedback:", result.response.promptFeedback);
                } else {
                    const responseText = result.response.text();
                    setSpecificRights(responseText);
                }
            } else {
                console.error("Gemini API call succeeded but no response object was found.", result);
                setError("Failed to generate process walkthroug");
            }
        
        } catch (e) {
            console.error("Error calling Gemini API:", e);
            setError(`An error occurred: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsTyping(false);
            setQuestionStatus('returned');
            setQuestion(specificQuestion);
            setSpecificQuestion('')
            setSRIsLoading(false);
        }

    }



    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
            <h1>Small Court Claims Preparation Assistant</h1>

            <div>
                <label htmlFor="stateSelect">Select Your State:</label>
                <select
                    id="stateSelect"
                    value={userState}
                    onChange={(e) => setUserState(e.target.value)}
                    style={{ marginLeft: '1rem' }}
                >
                    <option value="">-- Select a State --</option>
                    {states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <label htmlFor="caseTypeSelect">Type of Case:</label>
                <select
                    id="caseTypeSelect"
                    value={typeOfCase}
                    onChange={(e) => setTypeOfCase(e.target.value)}
                    style={{ marginLeft: '1rem' }}
                >
                    <option value="">-- Select Case Type --</option>
                    {caseTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Give a general description of the case:</h3>
                    <textarea
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                        placeholder="Give a general description of the case..."
                        rows={5}
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                />
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Give the claim amount:</h3>
                    $USD<textarea
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value === '' ? 0 : parseInt(e.target.value))}
                        placeholder="Give the claim amount..."
                        rows={1}
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}   
                />
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Give info on opposing party:</h3>
                    <textarea
                        value={opposingPartyInfo}
                        onChange={(e) => setOpposingPartyInfo(e.target.value)}
                        placeholder="Opposing party info..."
                        rows={5}
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}   
                />
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Give evidence of the case you want to use:</h3>
                    <textarea
                        value={evidence}
                        onChange={(e) => setEvidence(e.target.value)}
                        placeholder="Evidence..."
                        rows={5}
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}   
                />
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Give the incident year:</h3>
                    <textarea
                        value={incidentYear}
                        onChange={(e) => setIncidentYear(e.target.value === '' ? 2000 : parseInt(e.target.value))}
                        placeholder="Give the claim amount..."
                        rows={1}
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}   
                    />

                    <label htmlFor="caseTypeSelect">Give the incident month:</label>            
                    <select
                        value={incidentMonth}
                        onChange={(e) => setIncidentMonth(e.target.value)}
                        style={{ marginLeft: '1rem' }}
                    >
                        <option value="">-- Select Month --</option>
                        {months.map((month) => <option key={month} value={month}>{month}</option>)}
                    </select>

                    <br></br>

                    <label htmlFor="caseTypeSelect">Give the incident day:</label>            
                    <select

                        value={incidentDay}
                        onChange={(e) => setIncidentDay(parseInt(e.target.value))}
                        style={{ marginLeft: '1rem' }}
                    >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => <option key={day} value={day}>{day}</option>)}
                    </select>
            </div>

            <div>
                <button 
                onClick={handleProcessWalkthrough} 
                style={{
                 padding: '0.75rem 1.5rem',
                 cursor: /*isAsking ||*/ !typeOfCase || !userState || !issueDescription || !claimAmount || !incidentYear || !incidentMonth || !incidentDay || !opposingPartyInfo || !evidence ? 'not-allowed' : 'pointer', // Adjust cursor based on state
                 backgroundColor: /*isAsking ||*/ !typeOfCase || !userState || !issueDescription || !claimAmount || !incidentYear || !incidentMonth || !incidentDay || !opposingPartyInfo || !evidence ? '#ccc' : '#28a745', // Green color for submit
                 color: 'white',
                 border: 'none',
                 borderRadius: '4px',
                 fontSize: '1rem',
                 opacity: /*isAsking ||*/ !typeOfCase || !userState || !issueDescription || !claimAmount || !incidentYear || !incidentMonth || !incidentDay || !opposingPartyInfo || !evidence ? 0.6 : 1, // Adjust opacity based on state
             }}>
                Submit
             </button>

            {isTyping && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <p>Loading process walkthrough...</p>
                    {/* Optional: Add a spinner here */}
                </div>
            )}

             {processWalkThrough && !isTyping && (
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
                    <h2 style={{ color: '#ffffff', borderBottom: '1px solid #444', paddingBottom: '0.5rem', marginBottom: '1rem' }}>State: {userState} <br></br>Case Type: {typeOfCase} <br></br>Process Walkthrough: </h2>
                    <ReactMarkdown>
                        {processWalkThrough}
                    </ReactMarkdown>
                </div>
             )}

             {(questionStatus === 'ready' || questionStatus === 'returned') && (
                <>
                    <p>Put qpecific questions below</p>
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
                        cursor: (specificQuestion.trim().length ===0) ? 'not-allowed' : 'pointer',
                        backgroundColor: (specificQuestion.trim().length ===0) ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        opacity: (specificQuestion.trim().length ===0) ? 0.6 : 1,
                    }}
                    >
                    Submit Question
                    </button>
                </>
             )}

            {questionStatus === 'loading' && (
                <>
                    <p>Loading question...</p>
                </>
            )}

            {questionStatus === 'returned' && (
                <>
                    <p>Question: {question}<br></br>Answer:</p>
                    <ReactMarkdown>
                        {specificRights}
                    </ReactMarkdown>
                </>
            )}
            </div>
        </div>
    );
}
