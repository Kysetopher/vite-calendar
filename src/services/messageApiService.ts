/**
 * Message API Service for Chat Moderation Integration
 */

import { apiRequest } from '@/lib/queryClient';

export interface MessageCreate {
  recipient_id: number;
  content: string;
  thread_id?: string;
}

export interface MessageResponse {
  status: 'sent' | 'blocked';
  message_id?: string;
  thread_id?: string;
  content?: string;
  created_at?: string;
}

export interface BlockedMessageResponse {
  detail: {
    error: 'message_blocked';
    message: string;
    explanation: string;
    alternatives: string[];
  };
}

export interface ThreadMessage {
  id: string;
  sender_id: number;
  sender_name: string;
  recipient_id: number;
  content: string;
  status: string;
  created_at: string;
  is_read?: boolean;
  moderation_status?: string;
}

export interface ThreadMessagesResponse {
  thread_id: string;
  messages: ThreadMessage[];
  count: number;
  has_more: boolean;
}

export interface ConversationThread {
  thread_id: string;
  other_participant_id: number;
  other_participant_name: string;
  last_message_at: string;
  last_message_preview: string;
  unread_count: number;
}

export interface ThreadsResponse {
  threads: ConversationThread[];
  total: number;
}

export interface ModerationFeedback {
  message_id: string;
  feedback_type: 'helpful' | 'too_strict' | 'missed_issue';
  feedback_text: string;
}

export interface FeedbackResponse {
  status: string;
  feedback_id: string;
  message: string;
}

class MessageApiService {
  /**
   * Send a message with moderation
   */
  async sendMessage(data: MessageCreate): Promise<MessageResponse | BlockedMessageResponse> {
    try {
      const response = await apiRequest('POST', '/api/messages/send', data);
      return response;
    } catch (error: any) {
      // Handle blocked message error
      if (error.status === 400 && error.detail?.error === 'message_blocked') {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Get messages from a thread
   */
  async getThreadMessages(
    threadId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<ThreadMessagesResponse> {
    const response = await apiRequest(
      'GET', 
      `/api/messages/thread/${threadId}?limit=${limit}&offset=${offset}`
    );
    return response;
  }

  /**
   * Get user's conversation threads
   */
  async getUserThreads(): Promise<ThreadsResponse> {
    const response = await apiRequest('GET', '/api/messages/threads');
    return response;
  }

  /**
   * Submit moderation feedback
   */
  async submitFeedback(feedback: ModerationFeedback): Promise<FeedbackResponse> {
    const response = await apiRequest('POST', '/api/messages/feedback', feedback);
    return response;
  }

  /**
   * Mark a message as read
   */
  async markMessageRead(messageId: string): Promise<{ message: string; message_id: string }> {
    const response = await apiRequest('PATCH', `/api/messages/${messageId}/read`);
    return response;
  }

  /**
   * Get thread ID for a conversation with a specific user
   */
  async getThreadForUser(otherUserId: number): Promise<string | null> {
    try {
      const threads = await this.getUserThreads();
      const thread = threads.threads.find(t => t.other_participant_id === otherUserId);
      return thread?.thread_id || null;
    } catch (error) {
      console.error('Error getting thread for user:', error);
      return null;
    }
  }
}

export const messageApiService = new MessageApiService();