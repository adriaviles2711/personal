const express = require('express');
const router = express.Router();
const config = require('../config');
const pingService = require('../ping-service');
const statsCollector = require('../stats-collector');

/**
 * GET /api/monitoring/ping/:id
 * Get ping history for a server
 */
router.get('/ping/:id', (req, res) => {
    try {
        const server = config.servers.find(s => s.id === req.params.id);

        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found'
            });
        }

        const limit = parseInt(req.query.limit) || 20;
        const history = pingService.getPingHistory(server.id, limit);
        const stats = pingService.getPingStats(server.id);

        res.json({
            success: true,
            serverId: server.id,
            history: history,
            stats: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/monitoring/alerts
 * Get all active alerts
 */
router.get('/alerts', (req, res) => {
    try {
        const allAlerts = [];

        config.servers.forEach(server => {
            const serverAlerts = statsCollector.getServerAlerts(server.id);

            serverAlerts.forEach(alert => {
                allAlerts.push({
                    serverId: server.id,
                    serverName: server.name,
                    ...alert,
                    timestamp: new Date().toISOString()
                });
            });
        });

        res.json({
            success: true,
            alerts: allAlerts,
            count: allAlerts.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/monitoring/alerts/:id
 * Get alerts for a specific server
 */
router.get('/alerts/:id', (req, res) => {
    try {
        const server = config.servers.find(s => s.id === req.params.id);

        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found'
            });
        }

        const alerts = statsCollector.getServerAlerts(server.id);

        res.json({
            success: true,
            serverId: server.id,
            serverName: server.name,
            alerts: alerts,
            count: alerts.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/monitoring/thresholds
 * Get current alert thresholds
 */
router.get('/thresholds', (req, res) => {
    try {
        res.json({
            success: true,
            thresholds: config.thresholds
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/monitoring/thresholds
 * Update alert thresholds
 */
router.post('/thresholds', (req, res) => {
    try {
        const { category, type, value } = req.body;

        if (!category || !type || value === undefined) {
            return res.status(400).json({
                success: false,
                error: 'category, type, and value are required'
            });
        }

        if (!config.thresholds[category]) {
            return res.status(404).json({
                success: false,
                error: 'Invalid category'
            });
        }

        if (!config.thresholds[category][type]) {
            return res.status(404).json({
                success: false,
                error: 'Invalid threshold type'
            });
        }

        // Update threshold
        config.thresholds[category][type] = value;

        res.json({
            success: true,
            thresholds: config.thresholds
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/monitoring/overview
 * Get monitoring overview for all servers
 */
router.get('/overview', (req, res) => {
    try {
        const overview = config.servers.map(server => {
            const stats = statsCollector.getLatestStats(server.id);
            const ping = pingService.getLatestPing(server.id);
            const pingStats = pingService.getPingStats(server.id);
            const alerts = statsCollector.getServerAlerts(server.id);

            return {
                serverId: server.id,
                serverName: server.name,
                health: stats ? stats.health : 0,
                cpu: stats && stats.cpu ? stats.cpu.usage : 0,
                memory: stats && stats.memory ? stats.memory.usedPercent : 0,
                disk: stats && stats.disk ? stats.disk.usedPercent : 0,
                ping: ping ? ping.time : null,
                pingAvg: pingStats.avg,
                alive: ping ? ping.alive : false,
                alerts: alerts.length,
                criticalAlerts: alerts.filter(a => a.type === 'critical').length,
                lastUpdate: stats ? stats.timestamp : null
            };
        });

        res.json({
            success: true,
            overview: overview
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
