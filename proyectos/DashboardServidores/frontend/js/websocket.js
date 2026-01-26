/**
 * WebSocket Client
 * Real-time communication with the backend
 */

const websocket = {
    ws: null,
    reconnectInterval: 5000,
    reconnectAttempts: 0,
    maxReconnectAttempts: 10,
    listeners: {},

    /**
     * Initialize WebSocket connection
     */
    init() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsURL = `${protocol}//${window.location.hostname}:3001`;

        try {
            this.ws = new WebSocket(wsURL);
            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.handleReconnect();
        }
    },

    /**
     * Setup WebSocket event handlers
     */
    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.updateConnectionStatus('connected');
            this.emit('connected');
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateConnectionStatus('error');
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.updateConnectionStatus('disconnected');
            this.handleReconnect();
        };
    },

    /**
     * Handle incoming messages
     */
    handleMessage(data) {
        const { type, ...payload } = data;

        switch (type) {
            case 'connected':
                console.log('Server connection established');
                break;

            case 'stats_update':
                this.emit('stats', payload.data);
                break;

            case 'ping_update':
                this.emit('ping', payload.data);
                break;

            case 'alert':
                this.emit('alert', payload.data);
                break;

            case 'status_change':
                this.emit('status', payload);
                break;

            case 'pong':
                // Heartbeat response
                break;

            default:
                console.log('Unknown message type:', type, payload);
        }
    },

    /**
     * Send message to server
     */
    send(action, data = {}) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ action, ...data }));
        } else {
            console.warn('WebSocket not connected');
        }
    },

    /**
     * Subscribe to server updates
     */
    subscribe(serverId) {
        this.send('subscribe', { serverId });
    },

    /**
     * Unsubscribe from server updates
     */
    unsubscribe(serverId) {
        this.send('unsubscribe', { serverId });
    },

    /**
     * Handle reconnection
     */
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

            setTimeout(() => {
                this.init();
            }, this.reconnectInterval);
        } else {
            console.error('Max reconnection attempts reached');
            this.updateConnectionStatus('failed');
        }
    },

    /**
     * Update connection status in UI
     */
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        const statusText = statusElement.querySelector('.status-text');

        statusElement.className = 'connection-status';

        switch (status) {
            case 'connected':
                statusElement.classList.add('connected');
                statusText.textContent = 'Conectado';
                break;
            case 'disconnected':
                statusElement.classList.add('disconnected');
                statusText.textContent = 'Desconectado';
                break;
            case 'error':
            case 'failed':
                statusElement.classList.add('disconnected');
                statusText.textContent = 'Error de conexión';
                break;
            default:
                statusText.textContent = 'Conectando...';
        }
    },

    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    },

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }
    },

    /**
     * Close connection
     */
    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
};

// Export for use in other modules
window.websocket = websocket;
