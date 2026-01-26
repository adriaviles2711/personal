const sshManager = require('./ssh-manager');
const pingService = require('./ping-service');
const config = require('./config');

class StatsCollector {
    constructor() {
        this.statsCache = new Map(); // serverId -> latest stats
        this.statsHistory = new Map(); // serverId -> array of stats
        this.maxHistorySize = 60; // Keep last 60 readings (5 minutes at 5s intervals)
    }

    /**
     * Collect statistics from a single server
     */
    async collectServerStats(server) {
        try {
            // Get system stats via SSH
            const systemStats = await sshManager.getSystemStats(server);

            // Get ping stats
            const latestPing = pingService.getLatestPing(server.id);
            const pingStats = pingService.getPingStats(server.id);

            const stats = {
                ...systemStats,
                ping: {
                    current: latestPing ? latestPing.time : null,
                    alive: latestPing ? latestPing.alive : false,
                    stats: pingStats
                },
                health: this.calculateHealthScore(systemStats, latestPing),
                timestamp: new Date().toISOString()
            };

            // Cache the latest stats
            this.statsCache.set(server.id, stats);

            // Store in history
            if (!this.statsHistory.has(server.id)) {
                this.statsHistory.set(server.id, []);
            }

            const history = this.statsHistory.get(server.id);
            history.push(stats);

            // Limit history size
            if (history.length > this.maxHistorySize) {
                history.shift();
            }

            return stats;
        } catch (error) {
            console.error(`Error collecting stats for ${server.id}:`, error);
            return {
                success: false,
                serverId: server.id,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Collect statistics from all servers
     */
    async collectAllStats() {
        const statsPromises = config.servers.map(server =>
            this.collectServerStats(server)
        );

        const results = await Promise.allSettled(statsPromises);

        return results.map((result, index) => ({
            serverId: config.servers[index].id,
            success: result.status === 'fulfilled',
            data: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason : null
        }));
    }

    /**
     * Get latest cached stats for a server
     */
    getLatestStats(serverId) {
        return this.statsCache.get(serverId) || null;
    }

    /**
     * Get stats history for a server
     */
    getStatsHistory(serverId, limit = 20) {
        const history = this.statsHistory.get(serverId) || [];
        return history.slice(-limit);
    }

    /**
     * Calculate health score (0-100) based on various metrics
     */
    calculateHealthScore(stats, ping) {
        if (!stats.success) return 0;

        let score = 100;
        const thresholds = config.thresholds;

        // CPU penalty
        if (stats.cpu && stats.cpu.usage) {
            if (stats.cpu.usage > thresholds.cpu.critical) {
                score -= 30;
            } else if (stats.cpu.usage > thresholds.cpu.warning) {
                score -= 15;
            }
        }

        // Memory penalty
        if (stats.memory && stats.memory.usedPercent) {
            if (stats.memory.usedPercent > thresholds.memory.critical) {
                score -= 30;
            } else if (stats.memory.usedPercent > thresholds.memory.warning) {
                score -= 15;
            }
        }

        // Disk penalty
        if (stats.disk && stats.disk.usedPercent) {
            if (stats.disk.usedPercent > thresholds.disk.critical) {
                score -= 20;
            } else if (stats.disk.usedPercent > thresholds.disk.warning) {
                score -= 10;
            }
        }

        // Ping penalty
        if (ping && ping.alive && ping.time) {
            if (ping.time > thresholds.ping.critical) {
                score -= 10;
            } else if (ping.time > thresholds.ping.warning) {
                score -= 5;
            }
        } else if (ping && !ping.alive) {
            score -= 50; // Server not reachable
        }

        return Math.max(0, score);
    }

    /**
     * Start continuous monitoring
     */
    startMonitoring(callback) {
        const interval = config.monitoring.statsInterval;

        setInterval(async () => {
            const stats = await this.collectAllStats();
            if (callback) {
                callback(stats);
            }
        }, interval);

        // Initial collection
        this.collectAllStats().then(stats => {
            if (callback) {
                callback(stats);
            }
        });
    }

    /**
     * Get server alerts based on thresholds
     */
    getServerAlerts(serverId) {
        const stats = this.getLatestStats(serverId);
        if (!stats || !stats.success) return [];

        const alerts = [];
        const thresholds = config.thresholds;

        // CPU alerts
        if (stats.cpu && stats.cpu.usage > thresholds.cpu.critical) {
            alerts.push({
                type: 'critical',
                category: 'cpu',
                message: `CPU usage is critically high: ${stats.cpu.usage.toFixed(2)}%`,
                value: stats.cpu.usage,
                threshold: thresholds.cpu.critical
            });
        } else if (stats.cpu && stats.cpu.usage > thresholds.cpu.warning) {
            alerts.push({
                type: 'warning',
                category: 'cpu',
                message: `CPU usage is high: ${stats.cpu.usage.toFixed(2)}%`,
                value: stats.cpu.usage,
                threshold: thresholds.cpu.warning
            });
        }

        // Memory alerts
        if (stats.memory && stats.memory.usedPercent > thresholds.memory.critical) {
            alerts.push({
                type: 'critical',
                category: 'memory',
                message: `Memory usage is critically high: ${stats.memory.usedPercent}%`,
                value: stats.memory.usedPercent,
                threshold: thresholds.memory.critical
            });
        } else if (stats.memory && stats.memory.usedPercent > thresholds.memory.warning) {
            alerts.push({
                type: 'warning',
                category: 'memory',
                message: `Memory usage is high: ${stats.memory.usedPercent}%`,
                value: stats.memory.usedPercent,
                threshold: thresholds.memory.warning
            });
        }

        // Disk alerts
        if (stats.disk && stats.disk.usedPercent > thresholds.disk.critical) {
            alerts.push({
                type: 'critical',
                category: 'disk',
                message: `Disk usage is critically high: ${stats.disk.usedPercent}%`,
                value: stats.disk.usedPercent,
                threshold: thresholds.disk.critical
            });
        } else if (stats.disk && stats.disk.usedPercent > thresholds.disk.warning) {
            alerts.push({
                type: 'warning',
                category: 'disk',
                message: `Disk usage is high: ${stats.disk.usedPercent}%`,
                value: stats.disk.usedPercent,
                threshold: thresholds.disk.warning
            });
        }

        return alerts;
    }
}

module.exports = new StatsCollector();
