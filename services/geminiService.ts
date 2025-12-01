import { GoogleGenAI, Modality } from "@google/genai";
import { AgentVoice, Message } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. Text-to-Speech (The "Female Voice" Agent)
export const speakText = async (text: string, voiceName: AgentVoice = AgentVoice.Kore): Promise<string | null> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioData || null;

  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

// 2. Vision: Detect Message from Screen
export const detectMessageFromScreen = async (base64Image: string): Promise<{ sender: string, content: string } | null> => {
    const ai = getAIClient();
    
    // We remove the data:image/png;base64, prefix if present for the API call
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const prompt = `
      You are a visual assistant reading a WhatsApp screen.
      Look at the image. Focus on the MOST RECENT message bubble at the bottom of the conversation.
      
      Rules:
      1. Ignore green bubbles (messages sent by 'Me').
      2. Look for white or gray bubbles (incoming messages) on the left side.
      3. Extract the Sender Name (if visible above the bubble) and the Message Content.
      4. If the most recent message is from 'Me', return null.
      5. If there are no clear messages, return null.

      Output JSON ONLY: { "sender": "Name", "content": "Message Text" }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) return null;
        
        return JSON.parse(text);
    } catch (error) {
        console.error("Vision analysis failed", error);
        return null;
    }
};

// 3. Agentic Analysis (Analyze individual message for tone)
export const analyzeAndFormatForSpeech = async (sender: string, message: string): Promise<string> => {
    const ai = getAIClient();
    const prompt = `
      You are a helpful personal assistant named Sarah.
      Sender: ${sender || "Unknown"}
      Message: "${message}"

      Output a natural spoken string. Introduce the sender and read the message.
      If the message is short, just say "Message from [Name]: [Message]".
      If it's long, summarize the intent first.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text || `New message from ${sender}: ${message}`;
    } catch (error) {
        return `Message from ${sender}: ${message}`;
    }
}
