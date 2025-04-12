"use client";

import { useState } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';


const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export default function SmallClaimsPage() {

    const [typeOfCase, setTypeOfCase] = useState('');
    const [userLocation, setUserLocation] = useState('');

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
        "Breach of Contract",
        "Property Damage",
        "Personal Injury",
        "Debt Collection",
        "Landlord/Tenant Disputes",
        "Other"
    ];

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
            <h1>Small Court Claims Preparation Assistant</h1>

            <div>
                <label htmlFor="stateSelect">Select Your State:</label>
                <select
                    id="stateSelect"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
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
        </div>
    );
}
