
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function analyzeMedia(imageUrl: string, fileName: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          text: `Analise este arquivo de mídia para uso em uma plataforma de sinalização digital (Smart TV). 
          Nome do Arquivo: ${fileName}
          1. Forneça 5 tags descritivas em português.
          2. Dê uma pontuação de legibilidade (0-100) para visualização em TV (distância de 3-5 metros).
          3. Sugira 2-3 dicas de otimização em português para melhor impacto visual.
          Retorne APENAS o JSON conforme o esquema definido.`
        },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: await fetchAsBase64(imageUrl)
          }
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            readabilityScore: { type: Type.NUMBER },
            optimizationTips: { type: Type.STRING }
          },
          required: ['tags', 'readabilityScore', 'optimizationTips']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("A análise da IA falhou:", error);
    return null;
  }
}

async function fetchAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
}

export async function suggestSmartSchedule(playlists: any[], devices: any[]) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Com base nestas playlists: ${JSON.stringify(playlists)} e nestes dispositivos: ${JSON.stringify(devices)}, sugira um padrão de agendamento ideal em PORTUGUÊS para um ambiente corporativo visando maximizar o engajamento em horários de pico. Foque em boas-vindas matinais, especiais de almoço e resumos de fim de dia. Retorne como um resumo em texto simples.`
    });
    return response.text;
  } catch (error) {
    console.error("Falha na sugestão de agendamento:", error);
    return "Não foi possível gerar sugestões de IA no momento.";
  }
}

export async function suggestPlaylistName(assets: any[]) {
  try {
    const assetNames = assets.map(a => a.name).join(", ");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie um nome curto, profissional e impactante em PORTUGUÊS para uma playlist de TV que contém estes arquivos: ${assetNames}. Retorne APENAS o nome sugerido.`
    });
    return response.text.replace(/"/g, '').trim();
  } catch (error) {
    return "Nova Playlist Estratégica";
  }
}
