
import { GoogleGenAI } from "@google/genai";

export async function generatePresentationVideo(): Promise<string | null> {
  // Check for API Key selection (Required for Veo)
  // @ts-ignore
  if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
     // @ts-ignore
     await window.aistudio.openSelectKey();
     // If still no key after dialog, return null or handle error
     // @ts-ignore
     if (!await window.aistudio.hasSelectedApiKey()) return null;
  }

  // Always create a new instance to get the latest key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: 'A cinematic video showing a modern house with solar panels in a sunny garden, transitioning to a close-up of a happy person looking at a smartphone app showing crypto coins and rewards accumulating. High quality, photorealistic, bright lighting, eco-friendly atmosphere.',
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (downloadLink) {
        // Append API key for access
        return `${downloadLink}&key=${process.env.API_KEY}`;
    }
    return null;

  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
}
