const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const websocketHandler = require('./websocket-handler');
const statsCollector = require('./stats-collector');
const pingService = require('./ping-service');
const dockerManager = require('./docker-manager');

// Import routes
const serversRouter = require('./routes/servers');
const commandsRouter = require('./routes/commands');
const monitoringRouter = require('./routes/monitoring');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/servers', serversRouter);
app.use('/api/commands', commandsRouter);
app.use('/api/monitoring', monitoringRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        connections: websocketHandler.getClientCount()
    });
});

// Serve frontend for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Create HTTP server
const server = http.createServer(app);

// Create separate WebSocket server
const wsServer = http.createServer();
websocketHandler.initialize(wsServer);

// Start monitoring services
console.log('Starting monitoring services...');

// Start stats collection
statsCollector.startMonitoring((stats) => {
    // Broadcast stats to all connected WebSocket clients
    stats.forEach(stat => {
        if (stat.success && stat.data) {
            websocketHandler.broadcastStats(stat.data);

            // Check for alerts
            const alerts = statsCollector.getServerAlerts(stat.data.serverId);
            alerts.forEach(alert => {
                websocketHandler.broadcastAlert({
                    serverId: stat.data.serverId,
                    ...alert
                });
            });
        }
    });
});

// Start ping monitoring
pingService.startMonitoring(config.servers, (pingResult) => {
    // Broadcast ping results to WebSocket clients
    websocketHandler.broadcastPing(pingResult);
});

// Start HTTP server
server.listen(config.port, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🖥️  Server Monitoring Dashboard                          ║
║                                                            ║
║   HTTP Server:      http://localhost:${config.port}              ║
║   WebSocket Server: ws://localhost:${config.wsPort}              ║
║                                                            ║
║   📊 Monitoring ${config.servers.length} servers                              ║
║   ⚡ Stats update interval: ${config.monitoring.statsInterval / 1000}s                    ║
║   📡 Ping interval: ${config.monitoring.pingInterval / 1000}s                           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Start WebSocket server
wsServer.listen(config.wsPort, () => {
    console.log(`WebSocket server listening on port ${config.wsPort}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
    wsServer.close(() => {
        console.log('WebSocket server closed');
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing servers');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
    wsServer.close(() => {
        console.log('WebSocket server closed');
    });
});

module.exports = { app, server, wsServer };
