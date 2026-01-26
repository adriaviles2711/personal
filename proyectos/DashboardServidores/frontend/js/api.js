/**
 * API Communication Layer
 * Handles all HTTP requests to the backend API
 */

const api = {
    baseURL: window.location.origin,

    /**
     * Generic fetch wrapper with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // ==================== Server Endpoints ====================

    /**
     * Get all servers
     */
    async getServers() {
        return this.get('/api/servers');
    },

    /**
     * Get server details
     */
    async getServer(serverId) {
        return this.get(`/api/servers/${serverId}`);
    },

    /**
     * Start server
     */
    async startServer(serverId) {
        return this.post(`/api/servers/${serverId}/start`);
    },

    /**
     * Stop server
     */
    async stopServer(serverId) {
        return this.post(`/api/servers/${serverId}/stop`);
    },

    /**
     * Restart server
     */
    async restartServer(serverId) {
        return this.post(`/api/servers/${serverId}/restart`);
    },

    /**
     * Get server statistics
     */
    async getServerStats(serverId) {
        return this.get(`/api/servers/${serverId}/stats`);
    },

    /**
     * Get server statistics history
     */
    async getServerStatsHistory(serverId, limit = 20) {
        return this.get(`/api/servers/${serverId}/stats/history?limit=${limit}`);
    },

    /**
     * Get server logs
     */
    async getServerLogs(serverId, tail = 100) {
        return this.get(`/api/servers/${serverId}/logs?tail=${tail}`);
    },

    // ==================== Command Endpoints ====================

    /**
     * Execute command
     */
    async executeCommand(serverId, command) {
        return this.post('/api/commands/execute', { serverId, command });
    },

    /**
     * Execute script (multiple commands)
     */
    async executeScript(serverId, commands) {
        return this.post('/api/commands/script', { serverId, commands });
    },

    /**
     * Get command history
     */
    async getCommandHistory(limit = 20, serverId = null) {
        let url = `/api/commands/history?limit=${limit}`;
        if (serverId) {
            url += `&serverId=${serverId}`;
        }
        return this.get(url);
    },

    /**
     * Get command templates
     */
    async getCommandTemplates() {
        return this.get('/api/commands/templates');
    },

    // ==================== Monitoring Endpoints ====================

    /**
     * Get ping history
     */
    async getPingHistory(serverId, limit = 20) {
        return this.get(`/api/monitoring/ping/${serverId}?limit=${limit}`);
    },

    /**
     * Get all alerts
     */
    async getAllAlerts() {
        return this.get('/api/monitoring/alerts');
    },

    /**
     * Get server alerts
     */
    async getServerAlerts(serverId) {
        return this.get(`/api/monitoring/alerts/${serverId}`);
    },

    /**
     * Get thresholds
     */
    async getThresholds() {
        return this.get('/api/monitoring/thresholds');
    },

    /**
     * Update threshold
     */
    async updateThreshold(category, type, value) {
        return this.post('/api/monitoring/thresholds', { category, type, value });
    },

    /**
     * Get monitoring overview
     */
    async getMonitoringOverview() {
        return this.get('/api/monitoring/overview');
    },

    /**
     * Health check
     */
    async healthCheck() {
        return this.get('/api/health');
    }
};

// Export for use in other modules
window.api = api;
