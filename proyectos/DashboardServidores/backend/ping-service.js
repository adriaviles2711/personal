const ping = require('ping');
const config = require('./config');

class PingService {
    constructor() {
        this.pingHistory = new Map(); // serverId -> array of ping results
        this.maxHistorySize = 100; // Keep last 100 pings per server
    }

    /**
     * Ping a server and store the result
     */
    async pingServer(server) {
        try {
            const result = await ping.promise.probe(server.hostname, {
                timeout: 10,
                extra: ['-c', '1']
            });

            const pingResult = {
                alive: result.alive,
                time: result.alive ? parseFloat(result.time) : null,
                timestamp: new Date().toISOString(),
                serverId: server.id
            };

            // Store in history
            if (!this.pingHistory.has(server.id)) {
                this.pingHistory.set(server.id, []);
            }

            const history = this.pingHistory.get(server.id);
            history.push(pingResult);

            // Limit history size
            if (history.length > this.maxHistorySize) {
                history.shift();
            }

            return pingResult;
        } catch (error) {
            return {
                alive: false,
                time: null,
                error: error.message,
                timestamp: new Date().toISOString(),
                serverId: server.id
            };
        }
    }

    /**
     * Get ping history for a server
     */
    getPingHistory(serverId, limit = 20) {
        const history = this.pingHistory.get(serverId) || [];
        return history.slice(-limit);
    }

    /**
     * Get latest ping for a server
     */
    getLatestPing(serverId) {
        const history = this.pingHistory.get(serverId) || [];
        return history[history.length - 1] || null;
    }

    /**
     * Calculate ping statistics
     */
    getPingStats(serverId) {
        const history = this.pingHistory.get(serverId) || [];

        if (history.length === 0) {
            return {
                avg: 0,
                min: 0,
                max: 0,
                packetLoss: 100
            };
        }

        const alivePings = history.filter(p => p.alive && p.time !== null);
        const times = alivePings.map(p => p.time);

        const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
        const min = times.length > 0 ? Math.min(...times) : 0;
        const max = times.length > 0 ? Math.max(...times) : 0;
        const packetLoss = ((history.length - alivePings.length) / history.length) * 100;

        return {
            avg: parseFloat(avg.toFixed(2)),
            min: parseFloat(min.toFixed(2)),
            max: parseFloat(max.toFixed(2)),
            packetLoss: parseFloat(packetLoss.toFixed(2)),
            total: history.length,
            successful: alivePings.length
        };
    }

    /**
     * Start continuous ping monitoring for all servers
     */
    startMonitoring(servers, callback) {
        const interval = config.monitoring.pingInterval;

        setInterval(async () => {
            for (const server of servers) {
                const pingResult = await this.pingServer(server);
                if (callback) {
                    callback(pingResult);
                }
            }
        }, interval);

        // Initial ping
        servers.forEach(async (server) => {
            const pingResult = await this.pingServer(server);
            if (callback) {
                callback(pingResult);
            }
        });
    }
}

module.exports = new PingService();
