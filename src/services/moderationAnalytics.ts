/**
 * Moderation Analytics Service for tracking moderation events
 */

export interface ModerationEvent {
  timestamp: Date;
  user_id?: number;
  thread_id: string;
  message_length: number;
  moderation_status: 'PASS' | 'BLOCK' | 'ERROR';
  processing_time?: number;
  is_emergency_message?: boolean;
  is_retry?: boolean;
  error_message?: string;
  blocked_reasons?: string[];
}

class ModerationAnalyticsService {
  private events: ModerationEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  /**
   * Log a moderation event
   */
  logEvent(event: Omit<ModerationEvent, 'timestamp'>): void {
    const fullEvent: ModerationEvent = {
      ...event,
      timestamp: new Date()
    };

    this.events.push(fullEvent);

    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Moderation Event:', fullEvent);
    }

    // Send to backend analytics (if endpoint exists)
    this.sendToBackend(fullEvent).catch(error => {
      console.warn('Failed to send analytics to backend:', error);
    });
  }

  /**
   * Get moderation statistics
   */
  getStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp >= last24h);

    const total = recentEvents.length;
    const blocked = recentEvents.filter(e => e.moderation_status === 'BLOCK').length;
    const passed = recentEvents.filter(e => e.moderation_status === 'PASS').length;
    const errors = recentEvents.filter(e => e.moderation_status === 'ERROR').length;
    const emergency = recentEvents.filter(e => e.is_emergency_message).length;

    const avgProcessingTime = recentEvents
      .filter(e => e.processing_time)
      .reduce((sum, e) => sum + (e.processing_time || 0), 0) / recentEvents.length;

    return {
      last24Hours: {
        total,
        blocked,
        passed,
        errors,
        emergency,
        blockRate: total > 0 ? (blocked / total) * 100 : 0,
        errorRate: total > 0 ? (errors / total) * 100 : 0,
        avgProcessingTime: avgProcessingTime || 0
      },
      allTime: {
        total: this.events.length,
        blocked: this.events.filter(e => e.moderation_status === 'BLOCK').length,
        passed: this.events.filter(e => e.moderation_status === 'PASS').length,
        errors: this.events.filter(e => e.moderation_status === 'ERROR').length
      }
    };
  }

  /**
   * Get recent blocked messages for debugging
   */
  getRecentBlockedMessages(limit = 10) {
    return this.events
      .filter(e => e.moderation_status === 'BLOCK')
      .slice(-limit)
      .reverse();
  }

  /**
   * Clear analytics data
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Send analytics to backend (if analytics endpoint exists)
   */
  private async sendToBackend(event: ModerationEvent): Promise<void> {
    try {
      // Only send in production or if analytics is enabled
      if (process.env.NODE_ENV !== 'production') {
        return;
      }

      const response = await fetch('/api/analytics/moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`Analytics API returned ${response.status}`);
      }
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug('Analytics error:', error);
    }
  }

  /**
   * Export analytics data for debugging
   */
  exportData(): string {
    return JSON.stringify({
      exportTime: new Date().toISOString(),
      stats: this.getStats(),
      events: this.events
    }, null, 2);
  }
}

export const moderationAnalytics = new ModerationAnalyticsService();