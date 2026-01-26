const express = require('express');
const router = express.Router();
const config = require('../config');
const dockerManager = require('../docker-manager');
const statsCollector = require('../stats-collector');
const pingService = require('../ping-service');

/**
 * GET /api/servers
 * Get list of all monitored servers
 */
router.get('/', async (req, res) => {
    try {
        const serversWithStatus = await Promise.all(
            config.servers.map(async (server) => {
                const containerStatus = await dockerManager.getContainerStatus(server.container);
                const latestStats = statsCollector.getLatestStats(server.id);
                const latestPing = pingService.getLatestPing(server.id);
                const alerts = statsCollector.getServerAlerts(server.id);

                return {
                    ...server,
                    status: containerStatus.status,
                    running: containerStatus.running,
                    health: latestStats ? latestStats.health : 0,
                    ping: latestPing ? latestPing.time : null,
                    alive: latestPing ? latestPing.alive : false,
                    alerts: alerts.length,
                    lastUpdate: latestStats ? latestStats.timestamp : null
                };
            })
        );

        res.json({
            success: true,
            servers: serversWithStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/servers/:id
 * Get detailed information about a specific server
 */
router.get('/:id', async (req, res) => {
    try {
        const server = config.servers.find(s => s.id === req.params.id);

        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found'
            });
        }

        const containerStatus = await dockerManager.getContainerStatus(server.container);
        const latestStats = statsCollector.getLatestStats(server.id);
        const pingStats = pingService.getPingStats(server.id);
        const alerts = statsCollector.getServerAlerts(server.id);

        res.json({
            success: true,
            server: {
                ...server,
                status: containerStatus.status,
                running: containerStatus.running,
                stats: latestStats,
                ping: pingStats,
                alerts: alerts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/servers/:id/start
 * Start a server container
 */
router.post('/:id/start', async (req, res) => {
    try {
        const server = config.servers.find(s => s.id === req.params.id);

        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found'
            });
        }

        const result = await dockerManager.startContainer(server.container);

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/servers/:id/stop
 * Stop a server container
 */
router.post('/:id/stop', async (req, res) => {
    try {
        const server = config.servers.find(s => s.id === req.params.id);

        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found'
            });
        }

        const result = await dockerManager.stopContainer(server.container);

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/servers/:id/restart
 * Restart a server container
 */
router.post('/:id/restart', async (req, res) => {
    try {
        const server = config.servers.find(s => s.id === req.params.id);

        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found'
            });
        }

        const result = await dockerManager.restartContainer(server.container);

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/servers/:id/stats
 * Get current statistics for a server
 */
router.get('/:id/stats', async (req, res) => {
    try {
        const server = config.servers.find(s => s.id === req.params.id);

        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found'
            });
        }

        const stats = statsCollector.getLatestStats(server.id);

        res.json({
            success: true,
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
 * GET /api/servers/:id/stats/history
 * Get statistics history for a server
 */
router.get('/:id/stats/history', async (req, res) => {
    try {
        const server = config.servers.find(s => s.id === req.params.id);

        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found'
            });
        }

        const limit = parseInt(req.query.limit) || 20;
        const history = statsCollector.getStatsHistory(server.id, limit);

        res.json({
            success: true,
            history: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/servers/:id/logs
 * Get container logs
 */
router.get('/:id/logs', async (req, res) => {
    try {
        const server = config.servers.find(s => s.id === req.params.id);

        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found'
            });
        }

        const tail = parseInt(req.query.tail) || 100;
        const logs = await dockerManager.getContainerLogs(server.container, tail);

        res.json(logs);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
