
export interface Message {
  id: number;
  sender_id: number;
  sender_name?: string;
  recipient_id: number;
  content: string;
  status: string;
  created_at: string;
  is_read?: boolean;
  is_blocked?: boolean;
  
  // Additional fields for blocked messages (only visible to sender)
  moderation_status?: string;
  original_content?: string;
}



export interface AIMessage {
  id: string;
  message: string;
  response: string;
  user_id: number;
  coparent_id?: number;
  timestamp: Date;
}

