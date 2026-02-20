import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  replaceable: boolean;
  explanation: string;
  imagePrompt: string;
}

export async function analyzeProfession(profession: string): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Проанализируй профессию: "${profession}". 
    Может ли искусственный интеллект заменить эту профессию полностью или частично в ближайшем будущем?
    
    Если может (полностью или значительно):
    - replaceable: true
    - explanation: Объясни, как именно ИИ заменит эту работу.
    - imagePrompt: Описание картинки, показывающей робота или ИИ, выполняющего эту работу.
    
    Если не может (или это очень сложно):
    - replaceable: false
    - explanation: Объясни, почему ИИ сложно заменить эту работу (человеческий фактор, эмпатия, креативность и т.д.).
    - imagePrompt: Описание смешной картинки, где робот пытается выполнить эту работу, но у него не получается или он выглядит глупо.
    
    Ответь ТОЛЬКО в формате JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          replaceable: { type: Type.BOOLEAN },
          explanation: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
        },
        required: ["replaceable", "explanation", "imagePrompt"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
}

export async function generateImage(prompt: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
            aspectRatio: "1:1",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
}
