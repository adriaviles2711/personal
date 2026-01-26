const WebSocket = require('ws');
const config = require('./config');

class WebSocketHandler {
    constructor() {
        this.wss = null;
        this.clients = new Set();
    }

    /**
     * Initialize WebSocket server
     */
    initialize(server) {
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', (ws) => {
            console.log('New WebSocket client connected');
            this.clients.add(ws);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connected',
                message: 'Connected to server monitoring dashboard',
                timestamp: new Date().toISOString()
            }));

            // Handle incoming messages
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleClientMessage(ws, data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });

            // Handle client disconnect
            ws.on('close', () => {
                console.log('WebSocket client disconnected');
                this.clients.delete(ws);
            });

            // Handle errors
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });

            // Heartbeat
            ws.isAlive = true;
            ws.on('pong', () => {
                ws.isAlive = true;
            });
        });

        // Start heartbeat interval
        this.startHeartbeat();

        console.log(`WebSocket server initialized on port ${config.wsPort}`);
    }

    /**
     * Handle messages from clients
     */
    handleClientMessage(ws, data) {
        console.log('Received message from client:', data);

        switch (data.action) {
            case 'subscribe':
                ws.subscriptions = ws.subscriptions || new Set();
                ws.subscriptions.add(data.serverId);
                break;
            case 'unsubscribe':
                if (ws.subscriptions) {
                    ws.subscriptions.delete(data.serverId);
                }
                break;
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
                break;
        }
    }

    /**
     * Broadcast message to all connected clients
     */
    broadcast(message) {
        const data = JSON.stringify(message);

        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }

    /**
     * Send message to specific clients subscribed to a server
     */
    sendToSubscribers(serverId, message) {
        const data = JSON.stringify(message);

        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                // Send to all clients if no subscriptions, or if subscribed to this server
                if (!client.subscriptions || client.subscriptions.size === 0 || client.subscriptions.has(serverId)) {
                    client.send(data);
                }
            }
        });
    }

    /**
     * Broadcast server statistics update
     */
    broadcastStats(stats) {
        this.broadcast({
            type: 'stats_update',
            data: stats,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Broadcast ping update
     */
    broadcastPing(pingResult) {
        this.broadcast({
            type: 'ping_update',
            data: pingResult,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Broadcast alert
     */
    broadcastAlert(alert) {
        this.broadcast({
            type: 'alert',
            data: alert,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Broadcast server status change
     */
    broadcastStatusChange(serverId, status) {
        this.broadcast({
            type: 'status_change',
            serverId: serverId,
            status: status,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Start heartbeat to detect dead connections
     */
    startHeartbeat() {
        setInterval(() => {
            this.clients.forEach((ws) => {
                if (ws.isAlive === false) {
                    this.clients.delete(ws);
                    return ws.terminate();
                }

                ws.isAlive = false;
                ws.ping();
            });
        }, config.websocket.heartbeatInterval);
    }

    /**
     * Get number of connected clients
     */
    getClientCount() {
        return this.clients.size;
    }
}

module.exports = new WebSocketHandler();
