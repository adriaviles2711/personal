const express = require('express');
const router = express.Router();
const config = require('../config');
const sshManager = require('../ssh-manager');

// Command history storage
const commandHistory = [];
const MAX_HISTORY = 100;

/**
 * POST /api/commands/execute
 * Execute a command on a server
 */
router.post('/execute', async (req, res) => {
    try {
        const { serverId, command } = req.body;

        if (!serverId || !command) {
            return res.status(400).json({
                success: false,
                error: 'serverId and command are required'
            });
        }

        const server = config.servers.find(s => s.id === serverId);

        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found'
            });
        }

        // Execute command
        const result = await sshManager.executeCommand(server, command);

        // Add to history
        const historyEntry = {
            id: Date.now(),
            serverId: serverId,
            serverName: server.name,
            command: command,
            result: result,
            timestamp: new Date().toISOString()
        };

        commandHistory.unshift(historyEntry);

        // Limit history size
        if (commandHistory.length > MAX_HISTORY) {
            commandHistory.pop();
        }

        res.json({
            success: true,
            result: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/commands/script
 * Execute multiple commands (script) on a server
 */
router.post('/script', async (req, res) => {
    try {
        const { serverId, commands } = req.body;

        if (!serverId || !commands || !Array.isArray(commands)) {
            return res.status(400).json({
                success: false,
                error: 'serverId and commands array are required'
            });
        }

        const server = config.servers.find(s => s.id === serverId);

        if (!server) {
            return res.status(404).json({
                success: false,
                error: 'Server not found'
            });
        }

        // Execute commands sequentially
        const results = [];
        for (const command of commands) {
            const result = await sshManager.executeCommand(server, command);
            results.push({
                command: command,
                result: result
            });

            // Stop if a command fails
            if (!result.success) {
                break;
            }
        }

        res.json({
            success: true,
            results: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/commands/history
 * Get command execution history
 */
router.get('/history', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const serverId = req.query.serverId;

        let history = commandHistory;

        // Filter by server if specified
        if (serverId) {
            history = history.filter(h => h.serverId === serverId);
        }

        // Apply limit
        history = history.slice(0, limit);

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
 * GET /api/commands/templates
 * Get predefined command templates
 */
router.get('/templates', (req, res) => {
    const templates = [
        {
            category: 'System Info',
            commands: [
                { name: 'Hostname', command: 'hostname' },
                { name: 'OS Info', command: 'cat /etc/os-release | head -5' },
                { name: 'Kernel Version', command: 'uname -r' },
                { name: 'CPU Info', command: 'lscpu | grep -E "Model name|CPU\\(s\\)|Thread"' },
                { name: 'Memory Info', command: 'free -h' },
                { name: 'Disk Usage', command: 'df -h' }
            ]
        },
        {
            category: 'Processes',
            commands: [
                { name: 'Top Processes by CPU', command: 'ps aux --sort=-%cpu | head -10' },
                { name: 'Top Processes by Memory', command: 'ps aux --sort=-%mem | head -10' },
                { name: 'Process Count', command: 'ps aux | wc -l' },
                { name: 'Running Services', command: 'systemctl list-units --type=service --state=running' }
            ]
        },
        {
            category: 'Network',
            commands: [
                { name: 'Network Interfaces', command: 'ip addr show' },
                { name: 'Network Connections', command: 'ss -tuln' },
                { name: 'Routing Table', command: 'ip route' },
                { name: 'DNS Configuration', command: 'cat /etc/resolv.conf' }
            ]
        },
        {
            category: 'Logs',
            commands: [
                { name: 'System Logs (last 20)', command: 'journalctl -n 20 --no-pager' },
                { name: 'Auth Logs', command: 'tail -20 /var/log/auth.log 2>/dev/null || echo "Log file not accessible"' },
                { name: 'Kernel Messages', command: 'dmesg | tail -20' }
            ]
        },
        {
            category: 'Disk & Storage',
            commands: [
                { name: 'Disk I/O Stats', command: 'iostat -x 1 2 | tail -n +4' },
                { name: 'Large Files (Top 10)', command: 'du -ah /var | sort -rh | head -10' },
                { name: 'Inode Usage', command: 'df -i' }
            ]
        }
    ];

    res.json({
        success: true,
        templates: templates
    });
});

module.exports = router;
