export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isMe: boolean;
  read: boolean;
  type: 'text' | 'image';
}

export enum AgentVoice {
  Kore = 'Kore',
  Puck = 'Puck', 
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
  Charon = 'Charon'
}

export interface AgentState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
}