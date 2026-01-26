/**
 * Dashboard Module
 * Handles server grid rendering and updates
 */

const dashboard = {
    servers: [],
    statsData: {},
    pingData: {},

    /**
     * Initialize dashboard
     */
    async init() {
        try {
            await this.loadServers();
            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            utils.showNotification('Error al cargar el dashboard', 'danger');
        }
    },

    /**
     * Load servers from API
     */
    async loadServers() {
        try {
            const response = await api.getServers();
            if (response.success) {
                this.servers = response.servers;
                return this.servers;
            }
        } catch (error) {
            console.error('Error loading serv servers:', error);
            throw error;
        }
    },

    /**
     * Render server grid
     */
    render() {
        const grid = document.getElementById('serversGrid');
        if (!grid) return;

        grid.innerHTML = '';

        this.servers.forEach(server => {
            const card = this.createServerCard(server);
            grid.appendChild(card);
        });
    },

    /**
     * Create server card element
     */
    createServerCard(server) {
        const card = document.createElement('div');
        card.className = 'server-card';
        card.id = `server-card-${server.id}`;
        card.dataset.serverId = server.id;

        const statusClass = server.running ? 'status-success' : 'status-offline';
        const statusBadge = server.running ? 'status-badge-running' : 'status-badge-stopped';
        const statusText = server.running ? 'Running' : 'Stopped';

        card.innerHTML = `
      <div class="server-header">
        <div>
          <div class="server-name">${server.name}</div>
          <div class="server-description">${server.description}</div>
        </div>
        <span class="server-status-badge ${statusBadge}">${statusText}</span>
      </div>

      <div class="server-metrics">
        <div class="metric">
          <div class="metric-label">CPU</div>
          <div class="metric-value" id="cpu-${server.id}">--</div>
          <div class="metric-bar">
            <div class="metric-bar-fill" id="cpu-bar-${server.id}" style="width: 0%"></div>
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">Memoria</div>
          <div class="metric-value" id="memory-${server.id}">--</div>
          <div class="metric-bar">
            <div class="metric-bar-fill" id="memory-bar-${server.id}" style="width: 0%"></div>
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">Disco</div>
          <div class="metric-value" id="disk-${server.id}">--</div>
          <div class="metric-bar">
            <div class="metric-bar-fill" id="disk-bar-${server.id}" style="width: 0%"></div>
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">Ping</div>
          <div class="metric-value" id="ping-${server.id}">--</div>
        </div>
      </div>

      <div class="server-actions">
        <button class="btn-success btn-action" data-action="start" data-server="${server.id}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 3l8 5-8 5V3z"/>
          </svg>
          Iniciar
        </button>
        <button class="btn-danger btn-action" data-action="stop" data-server="${server.id}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="4" y="4" width="8" height="8"/>
          </svg>
          Detener
        </button>
        <button class="btn-secondary btn-action" data-action="restart" data-server="${server.id}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3a5 5 0 100 10 5 5 0 000-10zm0 1a4 4 0 110 8 4 4 0 010-8z"/>
            <path d="M8 2L6 4h4L8 2z"/>
          </svg>
          Reiniciar
        </button>
      </div>
    `;

        card.classList.add(statusClass);
        return card;
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Server action buttons
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('.btn-action');
            if (!btn) return;

            const action = btn.dataset.action;
            const serverId = btn.dataset.server;

            if (action && serverId) {
                await this.handleServerAction(serverId, action);
            }
        });

        // Server card click (show details)
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.server-card');
            if (card && !e.target.closest('.btn-action')) {
                const serverId = card.dataset.serverId;
                this.showServerDetails(serverId);
            }
        });
    },

    /**
     * Handle server actions (start, stop, restart)
     */
    async handleServerAction(serverId, action) {
        try {
            let response;
            const server = this.servers.find(s => s.id === serverId);
            const serverName = server ? server.name : serverId;

            switch (action) {
                case 'start':
                    response = await api.startServer(serverId);
                    utils.showNotification(`Iniciando ${serverName}...`, 'info');
                    break;
                case 'stop':
                    response = await api.stopServer(serverId);
                    utils.showNotification(`Deteniendo ${serverName}...`, 'warning');
                    break;
                case 'restart':
                    response = await api.restartServer(serverId);
                    utils.showNotification(`Reiniciando ${serverName}...`, 'info');
                    break;
            }

            if (response && response.success) {
                setTimeout(() => {
                    this.refresh();
                }, 2000);
            } else {
                utils.showNotification(`Error: ${response.error}`, 'danger');
            }
        } catch (error) {
            console.error('Server action error:', error);
            utils.showNotification('Error al ejecutar la acción', 'danger');
        }
    },

    /**
     * Update dashboard with new stats
     */
    updateStats(stats) {
        if (!stats.serverId) return;

        this.statsData[stats.serverId] = stats;

        // Update CPU
        if (stats.cpu) {
            const cpuValue = document.getElementById(`cpu-${stats.serverId}`);
            const cpuBar = document.getElementById(`cpu-bar-${stats.serverId}`);

            if (cpuValue) {
                cpuValue.textContent = stats.cpu.usage.toFixed(1) + '%';
            }

            if (cpuBar) {
                cpuBar.style.width = stats.cpu.usage + '%';
                cpuBar.className = 'metric-bar-fill ' + utils.getStatusColor(stats.cpu.usage, 70, 90);
            }
        }

        // Update Memory
        if (stats.memory) {
            const memoryValue = document.getElementById(`memory-${stats.serverId}`);
            const memoryBar = document.getElementById(`memory-bar-${stats.serverId}`);

            if (memoryValue) {
                memoryValue.textContent = stats.memory.usedPercent + '%';
            }

            if (memoryBar) {
                memoryBar.style.width = stats.memory.usedPercent + '%';
                memoryBar.className = 'metric-bar-fill ' + utils.getStatusColor(stats.memory.usedPercent, 75, 90);
            }
        }

        // Update Disk
        if (stats.disk) {
            const diskValue = document.getElementById(`disk-${stats.serverId}`);
            const diskBar = document.getElementById(`disk-bar-${stats.serverId}`);

            if (diskValue) {
                diskValue.textContent = stats.disk.usedPercent + '%';
            }

            if (diskBar) {
                diskBar.style.width = stats.disk.usedPercent + '%';
                diskBar.className = 'metric-bar-fill ' + utils.getStatusColor(stats.disk.usedPercent, 80, 95);
            }
        }

        // Update card status class
        const card = document.getElementById(`server-card-${stats.serverId}`);
        if (card && stats.health !== undefined) {
            card.className = 'server-card';
            if (stats.health >= 80) {
                card.classList.add('status-success');
            } else if (stats.health >= 50) {
                card.classList.add('status-warning');
            } else {
                card.classList.add('status-danger');
            }
        }
    },

    /**
     * Update ping data
     */
    updatePing(ping) {
        if (!ping.serverId) return;

        this.pingData[ping.serverId] = ping;

        const pingValue = document.getElementById(`ping-${ping.serverId}`);
        if (pingValue) {
            if (ping.alive && ping.time !== null) {
                pingValue.textContent = ping.time.toFixed(1) + ' ms';
                pingValue.className = 'metric-value ' + utils.getStatusColor(ping.time, 100, 500);
            } else {
                pingValue.textContent = 'Offline';
                pingValue.className = 'metric-value text-danger';
            }
        }
    },

    /**
     * Show server details modal
     */
    async showServerDetails(serverId) {
        try {
            const response = await api.getServer(serverId);

            if (response.success) {
                const server = response.server;
                const modal = document.getElementById('serverModal');
                const modalBody = document.getElementById('modalBody');
                const modalTitle = document.getElementById('modalServerName');

                modalTitle.textContent = server.name;

                modalBody.innerHTML = `
          <div style="display: grid; gap: 1.5rem;">
            <div>
              <h3 style="margin-bottom: 0.5rem;">Información General</h3>
              <p><strong>ID:</strong> ${server.id}</p>
              <p><strong>Hostname:</strong> ${server.hostname}</p>
              <p><strong>Estado:</strong> ${server.running ? 'En ejecución' : 'Detenido'}</p>
              <p><strong>Health Score:</strong> ${server.stats ? server.stats.health : 'N/A'}</p>
            </div>

            <div>
              <h3 style="margin-bottom: 0.5rem;">Estadísticas Actuales</h3>
              ${server.stats && server.stats.cpu ? `
                <p><strong>CPU:</strong> ${server.stats.cpu.usage.toFixed(2)}%</p>
                <p><strong>Load Average:</strong> ${server.stats.cpu.load1}, ${server.stats.cpu.load5}, ${server.stats.cpu.load15}</p>
              ` : '<p>No disponible</p>'}
              
              ${server.stats && server.stats.memory ? `
                <p><strong>Memoria:</strong> ${server.stats.memory.used} MB / ${server.stats.memory.total} MB (${server.stats.memory.usedPercent}%)</p>
              ` : ''}
              
              ${server.stats && server.stats.disk ? `
                <p><strong>Disco:</strong> ${server.stats.disk.used} / ${server.stats.disk.total} (${server.stats.disk.usedPercent}%)</p>
              ` : ''}
              
              ${server.stats && server.stats.uptime ? `
                <p><strong>Uptime:</strong> ${server.stats.uptime}</p>
              ` : ''}
            </div>

            <div>
              <h3 style="margin-bottom: 0.5rem;">Red</h3>
              ${server.ping ? `
                <p><strong>Ping Average:</strong> ${server.ping.avg} ms</p>
                <p><strong>Packet Loss:</strong> ${server.ping.packetLoss}%</p>
              ` : '<p>No disponible</p>'}
            </div>

            <div>
              <h3 style="margin-bottom: 0.5rem;">Alertas</h3>
              ${server.alerts && server.alerts.length > 0 ?
                        server.alerts.map(alert => `
                  <div class="alert alert-${alert.type}" style="margin-bottom: 0.5rem;">
                    ${alert.message}
                  </div>
                `).join('') :
                        '<p>No hay alertas activas</p>'
                    }
            </div>
          </div>
        `;

                modal.classList.add('active');
            }
        } catch (error) {
            console.error('Error loading server details:', error);
            utils.showNotification('Error al cargar detalles del servidor', 'danger');
        }
    },

    /**
     * Refresh dashboard
     */
    async refresh() {
        await this.loadServers();
        this.render();
        utils.showNotification('Dashboard actualizado', 'info', 2000);
    }
};

// Export for use in other modules
window.dashboard = dashboard;
