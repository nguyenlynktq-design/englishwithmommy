
export interface VocabItem {
  vi: string;
  en: string;
  ipa: string;
  sentence: string;
}

export interface DialoguePart {
  speaker: 'MOTHER' | 'CHILD';
  text: string;
}

export interface Scene {
  scene_number: number;
  duration_seconds: number;
  vocab: VocabItem;
  image_prompt: string;
  video_prompt: string;
  camera: string;
  action: string;
  dialogue: DialoguePart[];
  sfx_ambience: string;
}

export interface RelatedSuggestion {
  title: string;
  description: string;
  context: string;
  suggested_vocab: string[];
}

export interface ScriptOutput {
  project_title: string;
  global_visual_style: {
    look: string;
    character_consistency_rule: string;
  };
  audio: {
    music: string;
    voiceover: Array<{
      role: string;
      language: string;
      accent: string;
      gender: string;
    }>;
    subtitles: boolean;
  };
  scenes: Scene[];
  final_notes: string[];
  related_suggestions: RelatedSuggestion[];
}

export interface SuggestionData {
  suggested_context: string;
  suggested_vocab: VocabItem[];
}
