class WebSocketService {
  private ws: WebSocket | null = null;
  private user_id: number | null = null;
  private messageListeners: ((message: any) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(user_id: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.user_id = user_id;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Use the same base URL as the API for consistency
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const wsBaseUrl = apiBaseUrl.replace('http://', '').replace('https://', '');
    const wsUrl = `${protocol}//${wsBaseUrl}/api/ws`;


    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;

      // Authenticate with the server
      // if (this.ws && this.user_id) {
      //   this.ws.send(JSON.stringify({
      //     type: 'authenticate',
      //     user_id: this.user_id
      //   }));
      // }
      // No need to authenticate - the server uses cookies for authentication      
      this.notifyConnectionListeners(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        if (data.type === 'authenticated') {
          console.log("WebSocket authenticated for user:", data.user_id);
        } else if (data.type === 'new_message') {
          this.notifyMessageListeners(data.message);
        } else if (data.type === 'new_invitation') {
          // Notify all listeners about the new invitation
          this.notifyMessageListeners({ type: 'new_invitation', ...data.data });
        } else if (data.type === 'invitation_accepted') {
          // Notify all listeners about the accepted invitation
          this.notifyMessageListeners({ type: 'invitation_accepted', ...data.data });
        }
      } catch (error) {
      }
    };

    this.ws.onclose = () => {
      this.notifyConnectionListeners(false);
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      this.notifyConnectionListeners(false);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.user_id = null;
    this.reconnectAttempts = 0;
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.user_id) {
      console.log("Max reconnection attempts reached or no user_id");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);


    setTimeout(() => {
      if (this.user_id) {
        this.connect(this.user_id);
      }
    }, delay);
  }

  addMessageListener(callback: (message: any) => void) {
    this.messageListeners.push(callback);
  }

  removeMessageListener(callback: (message: any) => void) {
    this.messageListeners = this.messageListeners.filter(listener => listener !== callback);
  }

  addConnectionListener(callback: (connected: boolean) => void) {
    this.connectionListeners.push(callback);
  }

  removeConnectionListener(callback: (connected: boolean) => void) {
    this.connectionListeners = this.connectionListeners.filter(listener => listener !== callback);
  }

  private notifyMessageListeners(message: any) {
    this.messageListeners.forEach(listener => listener(message));
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
