
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateReferralPitch(userName: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rédige un message court et enthousiaste que ${userName} peut envoyer à ses proches pour leur proposer de passer à l'autonomie énergétique (pompes à chaleur ou panneaux solaires) avec MyLight. Mentionne que c'est une solution durable et qu'il y a un avantage parrainage. Le ton doit être amical et professionnel. Maximum 3 phrases.`,
    });
    return response.text || "Passez à l'autonomie énergétique avec MyLight ! C'est bon pour la planète et votre portefeuille. Contactez-moi pour en savoir plus.";
  } catch (error) {
    console.error("Error generating pitch:", error);
    return "Passez à l'autonomie énergétique avec MyLight ! C'est bon pour la planète et votre portefeuille.";
  }
}
