const Docker = require('dockerode');
const config = require('./config');

class DockerManager {
    constructor() {
        this.docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });
    }

    /**
     * Get container by name
     */
    getContainer(containerName) {
        return this.docker.getContainer(containerName);
    }

    /**
     * Start a container
     */
    async startContainer(containerName) {
        try {
            const container = this.getContainer(containerName);
            await container.start();
            return { success: true, message: `Container ${containerName} started` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Stop a container
     */
    async stopContainer(containerName) {
        try {
            const container = this.getContainer(containerName);
            await container.stop();
            return { success: true, message: `Container ${containerName} stopped` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Restart a container
     */
    async restartContainer(containerName) {
        try {
            const container = this.getContainer(containerName);
            await container.restart();
            return { success: true, message: `Container ${containerName} restarted` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get container status
     */
    async getContainerStatus(containerName) {
        try {
            const container = this.getContainer(containerName);
            const info = await container.inspect();

            return {
                success: true,
                status: info.State.Status,
                running: info.State.Running,
                startedAt: info.State.StartedAt,
                finishedAt: info.State.FinishedAt
            };
        } catch (error) {
            return { success: false, error: error.message, status: 'not_found', running: false };
        }
    }

    /**
     * Get container stats (CPU, memory, network)
     */
    async getContainerStats(containerName) {
        try {
            const container = this.getContainer(containerName);
            const stats = await container.stats({ stream: false });

            // Calculate CPU percentage
            const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
            const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
            const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;

            // Calculate memory percentage
            const memoryUsage = stats.memory_stats.usage;
            const memoryLimit = stats.memory_stats.limit;
            const memoryPercent = (memoryUsage / memoryLimit) * 100;

            // Network stats
            let networkRx = 0;
            let networkTx = 0;
            if (stats.networks) {
                const netKeys = Object.keys(stats.networks);
                if (netKeys.length > 0) {
                    networkRx = stats.networks[netKeys[0]].rx_bytes;
                    networkTx = stats.networks[netKeys[0]].tx_bytes;
                }
            }

            return {
                success: true,
                cpu: cpuPercent.toFixed(2),
                memory: {
                    usage: memoryUsage,
                    limit: memoryLimit,
                    percent: memoryPercent.toFixed(2)
                },
                network: {
                    rx: networkRx,
                    tx: networkTx
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * List all containers
     */
    async listContainers() {
        try {
            const containers = await this.docker.listContainers({ all: true });
            return containers.map(c => ({
                id: c.Id.substring(0, 12),
                name: c.Names[0].replace('/', ''),
                image: c.Image,
                status: c.State,
                running: c.State === 'running'
            }));
        } catch (error) {
            console.error('Error listing containers:', error);
            return [];
        }
    }

    /**
     * Get container logs
     */
    async getContainerLogs(containerName, tail = 100) {
        try {
            const container = this.getContainer(containerName);
            const logs = await container.logs({
                stdout: true,
                stderr: true,
                tail: tail,
                timestamps: true
            });

            return {
                success: true,
                logs: logs.toString('utf-8')
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new DockerManager();
