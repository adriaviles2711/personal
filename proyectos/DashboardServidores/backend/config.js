require('dotenv').config();

const config = {
    // Server configuration
    port: process.env.PORT || 3000,
    wsPort: process.env.WS_PORT || 3001,

    // SSH configuration
    ssh: {
        username: process.env.SSH_USER || 'monitor',
        password: process.env.SSH_PASSWORD || 'monitor123',
        port: 22,
        readyTimeout: 20000,
        keepaliveInterval: 10000
    },

    // Monitored servers
    servers: [
        {
            id: 'server1',
            name: 'Web Server 01',
            hostname: process.env.SERVER1_HOST || 'server1',
            description: 'Production Web Server',
            container: 'server1',
            tags: ['web', 'production']
        },
        {
            id: 'server2',
            name: 'Database Server',
            hostname: process.env.SERVER2_HOST || 'server2',
            description: 'MySQL Database Server',
            container: 'server2',
            tags: ['database', 'production']
        },
        {
            id: 'server3',
            name: 'App Server',
            hostname: process.env.SERVER3_HOST || 'server3',
            description: 'Application Server',
            container: 'server3',
            tags: ['app', 'staging']
        }
    ],

    // Monitoring intervals (in milliseconds)
    monitoring: {
        statsInterval: 5000,        // 5 seconds
        pingInterval: 10000,        // 10 seconds
        healthCheckInterval: 30000  // 30 seconds
    },

    // Alert thresholds
    thresholds: {
        cpu: {
            warning: 70,
            critical: 90
        },
        memory: {
            warning: 75,
            critical: 90
        },
        disk: {
            warning: 80,
            critical: 95
        },
        ping: {
            warning: 100,  // ms
            critical: 500  // ms
        }
    },

    // WebSocket configuration
    websocket: {
        heartbeatInterval: 30000,
        reconnectInterval: 5000
    }
};

module.exports = config;
