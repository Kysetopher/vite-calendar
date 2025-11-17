/**
 * Chat Moderation Service for AI-powered message moderation
 */

import { apiRequest } from '@/lib/queryClient';
import { moderationAnalytics } from './moderationAnalytics';

export interface ChatModerationRequest {
  message: string;
  sender_name: string;
  thread_id: string;
  user_id?: number;
}

export interface ChatModerationResponse {
  response: string;
  thread_id: string;
  moderation_status?: string; // "PASS" or "BLOCK"
  explanation?: string;
  tips?: string[];
  selections?: Record<string, string>;
}

export interface ModerationFeedback {
  id: string;
  type: 'blocked' | 'suggestion' | 'tips' | 'alternatives' | 'pattern_warning';
  content: string;
  timestamp: Date;
  communicationTips?: string[];
  alternatives?: string[];
  patternAnalysis?: {
    detectedPatterns: string[];
    escalationRisk: string;
    communicationTrend: string;
  };
}

class ChatModerationService {
  private maxRetries = 2;
  private retryDelay = 1000; // 1 second

  /**
   * Send a message through the moderation system with retry logic
   */
  async moderateMessage(data: ChatModerationRequest): Promise<ChatModerationResponse> {
    const startTime = Date.now();
    let lastError: any;
    let isRetry = false;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await apiRequest('POST', '/api/v1/chat-moderation/', data);
        const processingTime = Date.now() - startTime;
        
        // Log successful moderation event
        moderationAnalytics.logEvent({
          user_id: data.user_id,
          thread_id: data.thread_id,
          message_length: data.message.length,
          moderation_status: response.moderation_status === 'BLOCK' ? 'BLOCK' : 'PASS',
          processing_time: processingTime,
          is_retry: isRetry,
          blocked_reasons: response.moderation_status === 'BLOCK' ? [response.explanation || 'Unknown'] : undefined
        });
        
        return response;
      } catch (error: any) {
        lastError = error;
        console.warn(`Chat moderation attempt ${attempt + 1} failed:`, error);
        isRetry = attempt > 0;
        
        // Don't retry for client errors (4xx)
        if (error.message?.includes('400') || error.message?.includes('401') || 
            error.message?.includes('403') || error.message?.includes('404')) {
          break;
        }
        
        // Wait before retrying (except on last attempt)
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * (attempt + 1));
        }
      }
    }
    
    // If all retries failed, log error and return fallback response
    const processingTime = Date.now() - startTime;
    moderationAnalytics.logEvent({
      user_id: data.user_id,
      thread_id: data.thread_id,
      message_length: data.message.length,
      moderation_status: 'ERROR',
      processing_time: processingTime,
      is_retry: isRetry,
      error_message: lastError?.message || 'Unknown error'
    });
    
    console.error('Chat moderation failed after all retries:', lastError);
    return this.getFallbackResponse(data, lastError);
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Provide fallback response when moderation service is unavailable
   */
  private getFallbackResponse(data: ChatModerationRequest, error: any): ChatModerationResponse {
    // For safety, if moderation service is down, allow message but log it
    console.error('Using fallback moderation response due to service failure');
    
    return {
      response: "Message sent (moderation service temporarily unavailable)",
      thread_id: data.thread_id,
      moderation_status: "PASS",
      explanation: "Your message was sent. Our moderation service is temporarily unavailable, but your message has been delivered.",
      tips: [],
      selections: null
    };
  }

  /**
   * Transform moderation response into feedback messages
   */
  transformToFeedback(response: ChatModerationResponse, originalMessage: string): ModerationFeedback[] {
    const feedbackMessages: ModerationFeedback[] = [];
    
    if (response.moderation_status === 'BLOCK') {
      // Main blocked message feedback
      feedbackMessages.push({
        id: `block-${Date.now()}`,
        type: 'blocked',
        content: response.explanation || 'Your message was blocked to maintain respectful communication.',
        timestamp: new Date()
      });

      // Add tips if available
      if (response.tips && response.tips.length > 0) {
        feedbackMessages.push({
          id: `tips-${Date.now()}`,
          type: 'tips',
          content: 'Here are some tips for more effective co-parenting communication:',
          communicationTips: response.tips,
          timestamp: new Date()
        });
      }

      // Add alternatives based on selections
      if (response.selections && Object.keys(response.selections).length > 0) {
        const alternatives = Object.values(response.selections).filter(Boolean);
        if (alternatives.length > 0) {
          feedbackMessages.push({
            id: `alternatives-${Date.now()}`,
            type: 'alternatives',
            content: 'Try rephrasing your message:',
            alternatives: alternatives,
            timestamp: new Date()
          });
        }
      }
    }

    return feedbackMessages;
  }

  /**
   * Check if a message was blocked
   */
  isMessageBlocked(response: ChatModerationResponse): boolean {
    return response.moderation_status === 'BLOCK';
  }

  /**
   * Check if a message passed moderation
   */
  isMessagePassed(response: ChatModerationResponse): boolean {
    return response.moderation_status === 'PASS';
  }

  /**
   * Check if message contains emergency keywords that should bypass moderation
   */
  isEmergencyMessage(message: string): boolean {
    const emergencyKeywords = [
      'emergency', 'urgent', '911', 'hospital', 'ambulance', 'police',
      'fire', 'accident', 'injury', 'medical', 'doctor', 'hurt',
      'danger', 'help', 'crisis', 'abuse', 'threat'
    ];
    
    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Enhanced moderation with emergency bypass
   */
  async moderateMessageWithEmergencyBypass(data: ChatModerationRequest): Promise<ChatModerationResponse> {
    // Check for emergency content first
    if (this.isEmergencyMessage(data.message)) {
      console.log('Emergency message detected, bypassing moderation');
      
      // Log emergency bypass event
      moderationAnalytics.logEvent({
        user_id: data.user_id,
        thread_id: data.thread_id,
        message_length: data.message.length,
        moderation_status: 'PASS',
        processing_time: 0,
        is_emergency_message: true,
        is_retry: false
      });
      
      return {
        response: "Emergency message sent immediately",
        thread_id: data.thread_id,
        moderation_status: "PASS",
        explanation: "Message marked as urgent and sent immediately.",
        tips: [],
        selections: null
      };
    }
    
    // Use normal moderation flow
    return this.moderateMessage(data);
  }

  /**
   * Generate enhanced feedback with context-aware suggestions
   */
  generateEnhancedFeedback(response: ChatModerationResponse, originalMessage: string): ModerationFeedback[] {
    const feedbackMessages = this.transformToFeedback(response, originalMessage);
    
    if (response.moderation_status === 'BLOCK') {
      // Add context-aware suggestions based on message content
      const contextualSuggestions = this.getContextualSuggestions(originalMessage);
      if (contextualSuggestions.length > 0) {
        feedbackMessages.push({
          id: `contextual-${Date.now()}`,
          type: 'suggestion',
          content: 'Try focusing on these approaches:',
          alternatives: contextualSuggestions,
          timestamp: new Date()
        });
      }
    }
    
    return feedbackMessages;
  }

  /**
   * Get contextual suggestions based on message content
   */
  private getContextualSuggestions(message: string): string[] {
    const suggestions: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('never') || lowerMessage.includes('always')) {
      suggestions.push("Use specific examples instead of 'never' or 'always'");
    }
    
    if (lowerMessage.includes('you') && (lowerMessage.includes('wrong') || lowerMessage.includes('fault'))) {
      suggestions.push("Try using 'I feel' statements to express your perspective");
    }
    
    if (lowerMessage.includes('schedule') || lowerMessage.includes('pickup') || lowerMessage.includes('drop')) {
      suggestions.push("Focus on specific times and logistics rather than emotions");
    }
    
    if (lowerMessage.includes('money') || lowerMessage.includes('support') || lowerMessage.includes('pay')) {
      suggestions.push("Stick to facts and amounts rather than judgments about spending");
    }
    
    return suggestions;
  }

  /**
   * Get moderation analytics and statistics
   */
  getAnalytics() {
    return moderationAnalytics.getStats();
  }

  /**
   * Get recent blocked messages for review
   */
  getRecentBlockedMessages(limit = 10) {
    return moderationAnalytics.getRecentBlockedMessages(limit);
  }

  /**
   * Clear analytics data
   */
  clearAnalytics() {
    moderationAnalytics.clearEvents();
  }

  /**
   * Export analytics data for debugging
   */
  exportAnalytics() {
    return moderationAnalytics.exportData();
  }
}

export const chatModerationService = new ChatModerationService();