/**
 * Main Application Controller
 * Initializes and coordinates all modules
 */

const app = {
    /**
     * Initialize application
     */
    async init() {
        console.log('Initializing Server Monitoring Dashboard...');

        try {
            // Initialize WebSocket connection
            websocket.init();

            // Initialize dashboard
            await dashboard.init();

            // Initialize carousel
            carousel.init(dashboard.servers);

            // Initialize charts
            charts.init();

            // Initialize commands module
            await commands.init();

            // Populate server select for commands
            commands.populateServerSelect(dashboard.servers);

            // Setup WebSocket event listeners
            this.setupWebSocketListeners();

            // Setup UI event listeners
            this.setupUIListeners();

            // Initial data load
            await this.loadInitialData();

            console.log('Dashboard initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            utils.showNotification('Error al inicializar el dashboard', 'danger');
        }
    },

    /**
     * Setup WebSocket event listeners
     */
    setupWebSocketListeners() {
        // Stats updates
        websocket.on('stats', (stats) => {
            dashboard.updateStats(stats);
            carousel.updateData(dashboard.statsData);
            charts.updateCPUChart(dashboard.servers, dashboard.statsData);
            charts.updateMemoryChart(dashboard.servers, dashboard.statsData);
            charts.updateDiskChart(dashboard.servers, dashboard.statsData);
        });

        // Ping updates
        websocket.on('ping', (ping) => {
            dashboard.updatePing(ping);
            charts.updatePingChart(dashboard.servers, dashboard.pingData);
        });

        // Alert updates
        websocket.on('alert', (alert) => {
            this.showAlert(alert);
        });

        // Status changes
        websocket.on('status', (status) => {
            console.log('Server status changed:', status);
            dashboard.refresh();
        });
    },

    /**
     * Setup UI event listeners
     */
    setupUIListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }

        // Modal close buttons
        const modalClose = document.getElementById('modalClose');
        const serverModal = document.getElementById('serverModal');

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                serverModal.classList.remove('active');
            });
        }

        if (serverModal) {
            const overlay = serverModal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => {
                    serverModal.classList.remove('active');
                });
            }
        }
    },

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            // Load stats for all servers
            for (const server of dashboard.servers) {
                try {
                    const statsResponse = await api.getServerStats(server.id);
                    if (statsResponse.success && statsResponse.stats) {
                        dashboard.updateStats(statsResponse.stats);
                    }

                    const pingResponse = await api.getPingHistory(server.id, 1);
                    if (pingResponse.success && pingResponse.history.length > 0) {
                        dashboard.updatePing(pingResponse.history[0]);
                    }
                } catch (error) {
                    console.error(`Error loading data for ${server.id}:`, error);
                }
            }

            // Update carousel
            carousel.updateData(dashboard.statsData);

            // Update charts
            charts.updateCPUChart(dashboard.servers, dashboard.statsData);
            charts.updateMemoryChart(dashboard.servers, dashboard.statsData);
            charts.updateDiskChart(dashboard.servers, dashboard.statsData);
            charts.updatePingChart(dashboard.servers, dashboard.pingData);

            // Load alerts
            await this.loadAlerts();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    },

    /**
     * Load and display alerts
     */
    async loadAlerts() {
        try {
            const response = await api.getAllAlerts();
            if (response.success && response.alerts) {
                response.alerts.forEach(alert => {
                    this.showAlert(alert);
                });
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    },

    /**
     * Show alert notification
     */
    showAlert(alert) {
        const alertClass = alert.type === 'critical' ? 'alert-critical' : 'alert-warning';
        const icon = alert.type === 'critical' ? '⚠️' : '⚡';

        const alertEl = utils.createElement('div', {
            className: `alert ${alertClass}`
        });

        alertEl.innerHTML = `
      <span class="alert-icon">${icon}</span>
      <div class="alert-content">
        <strong>${alert.serverName}:</strong> ${alert.message}
      </div>
      <button class="alert-close">&times;</button>
    `;

        const container = document.getElementById('alertsContainer');
        if (container) {
            container.appendChild(alertEl);

            alertEl.querySelector('.alert-close').addEventListener('click', () => {
                alertEl.remove();
            });

            // Auto-remove after 10 seconds for warnings, keep critical
            if (alert.type !== 'critical') {
                setTimeout(() => {
                    alertEl.remove();
                }, 10000);
            }
        }
    },

    /**
     * Refresh all data
     */
    async refresh() {
        try {
            utils.showNotification('Actualizando...', 'info', 1000);
            await dashboard.refresh();
            await this.loadInitialData();
            await commands.loadHistory();
        } catch (error) {
            console.error('Refresh error:', error);
            utils.showNotification('Error al actualizar', 'danger');
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init();
    });
} else {
    app.init();
}

// Export for debugging
window.app = app;
