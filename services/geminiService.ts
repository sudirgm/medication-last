
import { GoogleGenAI, Type } from "@google/genai";
import { Medication } from "../types";

export const queryMedicationStatus = async (
  transcript: string,
  medications: Medication[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a helpful and kind medical assistant for elderly people. 
    A user is asking a question about their medication. 
    Based on the list of medications provided below, answer their question clearly and simply.
    
    Current Medications Data (Frequency is times per day):
    ${JSON.stringify(medications, null, 2)}
    
    Context:
    - "logs" contains timestamps of every time they took the medication.
    - "frequency" is how many times total they should take it each day.
    
    Rules:
    1. If they are asking if they took a medication, look at today's logs.
    2. If they have taken some but not all doses for today, say something like: "You've taken 1 of your 3 doses. You have 2 left for today."
    3. If they've finished all doses for today, congratulate them kindly.
    4. If they haven't started today, tell them when the reminder is set for.
    5. Keep sentences short and use a comforting tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: transcript,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    return response.text || "I'm sorry, I couldn't understand that. Could you please try again?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I am having trouble connecting right now. Please check your list on the screen.";
  }
};
