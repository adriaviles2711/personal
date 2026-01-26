const { Client } = require('ssh2');
const config = require('./config');

class SSHManager {
    constructor() {
        this.connections = new Map();
    }

    /**
     * Execute a command on a remote server
     * @param {Object} server - Server configuration
     * @param {string} command - Command to execute
     * @returns {Promise<Object>} - Command output
     */
    async executeCommand(server, command) {
        return new Promise((resolve, reject) => {
            const conn = new Client();
            let output = '';
            let errorOutput = '';

            conn.on('ready', () => {
                conn.exec(command, (err, stream) => {
                    if (err) {
                        conn.end();
                        return reject(err);
                    }

                    stream.on('close', (code, signal) => {
                        conn.end();
                        resolve({
                            success: code === 0,
                            code,
                            output: output.trim(),
                            error: errorOutput.trim(),
                            timestamp: new Date().toISOString()
                        });
                    });

                    stream.on('data', (data) => {
                        output += data.toString();
                    });

                    stream.stderr.on('data', (data) => {
                        errorOutput += data.toString();
                    });
                });
            });

            conn.on('error', (err) => {
                reject({
                    success: false,
                    error: err.message,
                    timestamp: new Date().toISOString()
                });
            });

            conn.connect({
                host: server.hostname,
                port: config.ssh.port,
                username: config.ssh.username,
                password: config.ssh.password,
                readyTimeout: config.ssh.readyTimeout,
                keepaliveInterval: config.ssh.keepaliveInterval
            });
        });
    }

    /**
     * Get system statistics from a server
     * @param {Object} server - Server configuration
     * @returns {Promise<Object>} - System statistics
     */
    async getSystemStats(server) {
        try {
            // Get multiple stats in parallel
            const [cpuInfo, memInfo, diskInfo, networkInfo, uptime, processes] = await Promise.all([
                this.getCPUStats(server),
                this.getMemoryStats(server),
                this.getDiskStats(server),
                this.getNetworkStats(server),
                this.getUptime(server),
                this.getTopProcesses(server)
            ]);

            return {
                success: true,
                serverId: server.id,
                timestamp: new Date().toISOString(),
                cpu: cpuInfo,
                memory: memInfo,
                disk: diskInfo,
                network: networkInfo,
                uptime: uptime,
                processes: processes
            };
        } catch (error) {
            return {
                success: false,
                serverId: server.id,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get CPU statistics
     */
    async getCPUStats(server) {
        const command = `top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1`;
        const result = await this.executeCommand(server, command);

        const cpuUsage = parseFloat(result.output) || 0;

        // Get CPU load averages
        const loadCommand = `uptime | awk -F'load average:' '{print $2}'`;
        const loadResult = await this.executeCommand(server, loadCommand);
        const loads = loadResult.output.split(',').map(l => parseFloat(l.trim()));

        return {
            usage: cpuUsage,
            load1: loads[0] || 0,
            load5: loads[1] || 0,
            load15: loads[2] || 0
        };
    }

    /**
     * Get memory statistics
     */
    async getMemoryStats(server) {
        const command = `free -m | awk 'NR==2{printf "{\\"total\\":%s,\\"used\\":%s,\\"free\\":%s,\\"available\\":%s}", $2,$3,$4,$7}'`;
        const result = await this.executeCommand(server, command);

        try {
            const memData = JSON.parse(result.output);
            return {
                total: memData.total,
                used: memData.used,
                free: memData.free,
                available: memData.available,
                usedPercent: ((memData.used / memData.total) * 100).toFixed(2)
            };
        } catch (e) {
            return { total: 0, used: 0, free: 0, available: 0, usedPercent: 0 };
        }
    }

    /**
     * Get disk statistics
     */
    async getDiskStats(server) {
        const command = `df -h / | awk 'NR==2{printf "{\\"total\\":\\"%s\\",\\"used\\":\\"%s\\",\\"available\\":\\"%s\\",\\"usedPercent\\":\\"%s\\"}", $2,$3,$4,$5}'`;
        const result = await this.executeCommand(server, command);

        try {
            const diskData = JSON.parse(result.output);
            return {
                total: diskData.total,
                used: diskData.used,
                available: diskData.available,
                usedPercent: parseFloat(diskData.usedPercent)
            };
        } catch (e) {
            return { total: '0G', used: '0G', available: '0G', usedPercent: 0 };
        }
    }

    /**
     * Get network statistics
     */
    async getNetworkStats(server) {
        const command = `cat /proc/net/dev | grep -E "eth0|ens|enp" | head -1 | awk '{printf "{\\"rx\\":%s,\\"tx\\":%s}", $2,$10}'`;
        const result = await this.executeCommand(server, command);

        try {
            const netData = JSON.parse(result.output);
            return {
                rxBytes: parseInt(netData.rx) || 0,
                txBytes: parseInt(netData.tx) || 0
            };
        } catch (e) {
            return { rxBytes: 0, txBytes: 0 };
        }
    }

    /**
     * Get system uptime
     */
    async getUptime(server) {
        const command = `uptime -p`;
        const result = await this.executeCommand(server, command);
        return result.output || 'Unknown';
    }

    /**
     * Get top processes by CPU usage
     */
    async getTopProcesses(server) {
        const command = `ps aux --sort=-%cpu | head -6 | tail -5 | awk '{printf "%s|%s|%s|%s\\n", $2,$3,$4,$11}'`;
        const result = await this.executeCommand(server, command);

        const processes = [];
        const lines = result.output.split('\n').filter(l => l.trim());

        for (const line of lines) {
            const [pid, cpu, mem, name] = line.split('|');
            processes.push({
                pid: parseInt(pid),
                cpu: parseFloat(cpu),
                memory: parseFloat(mem),
                name: name
            });
        }

        return processes;
    }

    /**
     * Test SSH connection to a server
     */
    async testConnection(server) {
        try {
            const result = await this.executeCommand(server, 'echo "Connection successful"');
            return result.success;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new SSHManager();
