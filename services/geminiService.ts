
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptOutput, VocabItem } from "../types";

const SYSTEM_INSTRUCTION_BASE = `BẠN LÀ “PROMPT ENGINEER” CHUYÊN TẠO PROMPT ẢNH + PROMPT VIDEO + LỜI THOẠI CHO KÊNH “HỌC TIẾNG ANH CÙNG BÉ”.

# QUY TẮC CỐT LÕI (BẮT BUỘC TUYỆT ĐỐI)
1. ĐỊNH DANH NHÂN VẬT (SPEAKER):
   - MẸ (MOTHER): Luôn nói tiếng Việt 100%. Phải gắn nhãn là 'MOTHER'. 
   - BÉ (CHILD): Luôn nói tiếng Anh 100%. Phải gắn nhãn là 'CHILD'.
   - TUYỆT ĐỐI KHÔNG NHẦM LẪN: Không được gắn nhãn 'CHILD' cho lời thoại tiếng Việt của Mẹ.

2. CẤU TRÚC LỜI THOẠI (DIALOGUE):
   - Dưới 30 từ mỗi cảnh.
   - Mẹ hỏi: "Từ [X] tiếng Anh nói thế nào?" hoặc dẫn dắt bằng tiếng Việt.
   - Bé trả lời: [Từ vựng] + [IPA] + [Câu mẫu ngắn] bằng tiếng Anh.
   - Mẹ khen: "Giỏi quá!" hoặc "Đúng rồi!" bằng tiếng Việt.

3. PROMPTS:
   - Image Prompt: Mô tả chi tiết để tạo ảnh, có câu "Keep mother and child faces exactly as in the reference photo".
   - Video Prompt: Mô tả chuyển động cinematic 4k. Bao gồm cả kịch bản hội thoại ở cuối prompt.
`;

export interface ThemeSuggestion {
  title: string;
  context: string;
}

export const analyzeImageThemes = async (base64Image: string): Promise<ThemeSuggestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `Phân tích ảnh mẹ và bé này và đề xuất 3 chủ đề sáng tạo (title, context) để dạy tiếng Anh. Trả về JSON list.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [
        { text: prompt }, 
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } }
      ] 
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            context: { type: Type.STRING }
          },
          required: ["title", "context"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const generateVocabFromContext = async (context: string, base64Image?: string): Promise<VocabItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `Dựa trên bối cảnh: "${context}", hãy tạo 5 mục từ vựng tiếng Anh phù hợp nhất để mẹ dạy bé. Trả về JSON list gồm: vi, en, ipa, sentence.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: base64Image 
      ? { parts: [{ text: prompt }, { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } }] }
      : prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            vi: { type: Type.STRING },
            en: { type: Type.STRING },
            ipa: { type: Type.STRING },
            sentence: { type: Type.STRING }
          },
          required: ["vi", "en", "ipa", "sentence"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const generateVideoScript = async (
  vocabList: VocabItem[],
  context: string,
  base64Image?: string
): Promise<ScriptOutput> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const prompt = `
INPUT:
- 5 từ vựng: ${vocabList.map(v => `${v.en} (${v.vi})`).join(', ')}
- Bối cảnh: ${context}

YÊU CẦU:
1. Tạo 5 cảnh phim cinematic.
2. LỜI THOẠI (<30 từ/cảnh): MẸ (MOTHER) nói tiếng Việt, BÉ (CHILD) nói tiếng Anh.
3. PHẢI ĐỊNH DANH ĐÚNG: 'MOTHER' cho người hỏi tiếng Việt, 'CHILD' cho người trả lời tiếng Anh.
4. IMAGE PROMPT: Phải yêu cầu giữ khuôn mặt nhân vật đồng nhất (consistent faces).
5. VIDEO PROMPT: Bao quát cả kịch bản lời thoại ở cuối để dễ copy.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: base64Image 
      ? { parts: [{ text: prompt }, { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } }] }
      : prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          project_title: { type: Type.STRING },
          global_visual_style: {
            type: Type.OBJECT,
            properties: {
              look: { type: Type.STRING },
              character_consistency_rule: { type: Type.STRING }
            }
          },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scene_number: { type: Type.NUMBER },
                vocab: { type: Type.OBJECT, properties: { vi: { type: Type.STRING }, en: { type: Type.STRING }, ipa: { type: Type.STRING }, sentence: { type: Type.STRING } } },
                image_prompt: { type: Type.STRING },
                video_prompt: { type: Type.STRING },
                dialogue: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { speaker: { type: Type.STRING }, text: { type: Type.STRING } },
                    required: ["speaker", "text"]
                  }
                },
                sfx_ambience: { type: Type.STRING },
                camera: { type: Type.STRING },
                action: { type: Type.STRING },
                duration_seconds: { type: Type.NUMBER }
              },
              required: ["scene_number", "vocab", "image_prompt", "video_prompt", "dialogue"]
            }
          },
          final_notes: { type: Type.ARRAY, items: { type: Type.STRING } },
          related_suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                context: { type: Type.STRING },
                suggested_vocab: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        },
        required: ["project_title", "global_visual_style", "scenes", "final_notes", "related_suggestions"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
