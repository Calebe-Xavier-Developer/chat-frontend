export type MessageType = 'text' | 'image' | 'audio';

export type MessageStatus = 'sent' | 'received' | 'read';

export interface Message {
  id: string;
  user_id: string;
  content: string;
  type: MessageType;
  timestamp?: string;
  status?: MessageStatus;
}

export type Chat = {
  chat_id: string;
  chat_name?: string;
  color?: string;
  participants: string[];
  isTyping?: boolean;
};