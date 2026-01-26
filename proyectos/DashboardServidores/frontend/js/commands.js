/**
 * Commands Module
 * Handles command execution interface
 */

const commands = {
    selectedServer: null,
    commandHistory: [],
    templates: [],

    /**
     * Initialize commands module
     */
    async init() {
        this.setupEventListeners();
        await this.loadTemplates();
        await this.loadHistory();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const serverSelect = document.getElementById('commandServerSelect');
        const executeBtn = document.getElementById('executeBtn');
        const commandInput = document.getElementById('commandInput');
        const templatesBtn = document.getElementById('templatesBtn');

        if (serverSelect) {
            serverSelect.addEventListener('change', (e) => {
                this.selectedServer = e.target.value;
            });
        }

        if (executeBtn) {
            executeBtn.addEventListener('click', () => this.executeCommand());
        }

        if (commandInput) {
            commandInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.executeCommand();
                }
            });
        }

        if (templatesBtn) {
            templatesBtn.addEventListener('click', () => this.showTemplates());
        }

        // History item click
        document.addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                const command = historyItem.dataset.command;
                if (command && commandInput) {
                    commandInput.value = command;
                }
            }
        });

        // Modal close
        const templatesModalClose = document.getElementById('templatesModalClose');
        const templatesModal = document.getElementById('templatesModal');

        if (templatesModalClose) {
            templatesModalClose.addEventListener('click', () => {
                templatesModal.classList.remove('active');
            });
        }

        if (templatesModal) {
            templatesModal.querySelector('.modal-overlay')?.addEventListener('click', () => {
                templatesModal.classList.remove('active');
            });
        }
    },

    /**
     * Populate server select
     */
    populateServerSelect(servers) {
        const select = document.getElementById('commandServerSelect');
        if (!select) return;

        select.innerHTML = '<option value="">Selecciona un servidor</option>';

        servers.forEach(server => {
            const option = document.createElement('option');
            option.value = server.id;
            option.textContent = server.name;
            select.appendChild(option);
        });
    },

    /**
     * Execute command
     */
    async executeCommand() {
        const commandInput = document.getElementById('commandInput');
        const command = commandInput?.value.trim();

        if (!command) {
            utils.showNotification('Ingrese un comando', 'warning');
            return;
        }

        if (!this.selectedServer) {
            utils.showNotification('Seleccione un servidor', 'warning');
            return;
        }

        try {
            this.showOutput(`> ${command}`, true);

            const response = await api.executeCommand(this.selectedServer, command);

            if (response.success && response.result) {
                if (response.result.success) {
                    this.showOutput(response.result.output, false);
                } else {
                    this.showOutput(response.result.error || 'Error desconocido', true);
                }

                // Add to history
                await this.loadHistory();
            } else {
                this.showOutput('Error ejecutando comando', true);
            }

            // Clear input
            if (commandInput) {
                commandInput.value = '';
            }
        } catch (error) {
            console.error('Command execution error:', error);
            this.showOutput('Error: ' + error.message, true);
        }
    },

    /**
     * Show command output
     */
    showOutput(text, isCommand = false) {
        const output = document.getElementById('commandOutput');
        if (!output) return;

        // Remove placeholder if exists
        const placeholder = output.querySelector('.output-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        const entry = document.createElement('div');
        entry.className = 'output-entry';

        if (isCommand) {
            entry.innerHTML = `<div class="output-command">${utils.escapeHtml(text)}</div>`;
        } else {
            entry.innerHTML = `<div class="output-result">${utils.escapeHtml(text)}</div>`;
        }

        output.appendChild(entry);
        output.scrollTop = output.scrollHeight;
    },

    /**
     * Load command templates
     */
    async loadTemplates() {
        try {
            const response = await api.getCommandTemplates();
            if (response.success) {
                this.templates = response.templates;
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    },

    /**
     * Show templates modal
     */
    showTemplates() {
        const modal = document.getElementById('templatesModal');
        const modalBody = document.getElementById('templatesModalBody');

        if (!modal || !modalBody) return;

        modalBody.innerHTML = '';

        this.templates.forEach(category => {
            const section = document.createElement('div');
            section.style.marginBottom = '1.5rem';

            const title = document.createElement('h3');
            title.textContent = category.category;
            title.style.marginBottom = '0.75rem';
            title.style.color = 'var(--color-primary-light)';
            section.appendChild(title);

            const list = document.createElement('div');
            list.style.display = 'grid';
            list.style.gap = '0.5rem';

            category.commands.forEach(cmd => {
                const btn = document.createElement('button');
                btn.className = 'btn-secondary';
                btn.style.textAlign = 'left';
                btn.style.justifyContent = 'flex-start';
                btn.innerHTML = `
          <strong>${cmd.name}</strong><br>
          <code style="font-size: 0.75rem; opacity: 0.8;">${cmd.command}</code>
        `;
                btn.addEventListener('click', () => {
                    const commandInput = document.getElementById('commandInput');
                    if (commandInput) {
                        commandInput.value = cmd.command;
                    }
                    modal.classList.remove('active');
                });
                list.appendChild(btn);
            });

            section.appendChild(list);
            modalBody.appendChild(section);
        });

        modal.classList.add('active');
    },

    /**
     * Load command history
     */
    async loadHistory() {
        try {
            const response = await api.getCommandHistory(10);
            if (response.success) {
                this.commandHistory = response.history;
                this.renderHistory();
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    },

    /**
     * Render command history
     */
    renderHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        historyList.innerHTML = '';

        if (this.commandHistory.length === 0) {
            historyList.innerHTML = '<div style="color: var(--text-muted); font-style: italic;">No hay comandos en el historial</div>';
            return;
        }

        this.commandHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.command = item.command;

            historyItem.innerHTML = `
        <div class="history-command">${utils.escapeHtml(item.command)}</div>
        <div class="history-meta">
          ${item.serverName} • ${utils.formatRelativeTime(item.timestamp)}
        </div>
      `;

            historyList.appendChild(historyItem);
        });
    }
};

// Export for use in other modules
window.commands = commands;
