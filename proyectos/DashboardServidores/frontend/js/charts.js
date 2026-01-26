/**
 * Charts Module
 * Handles all Chart.js visualizations
 */

const charts = {
    instances: {},
    colors: {
        primary: '#6366f1',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6'
    },

    /**
     * Initialize all charts
     */
    init() {
        this.createCPUChart();
        this.createMemoryChart();
        this.createDiskChart();
        this.createPingChart();
    },

    /**
     * Create CPU usage chart
     */
    createCPUChart() {
        const ctx = document.getElementById('cpuChart');
        if (!ctx) return;

        this.instances.cpu = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#94a3b8',
                            callback: (value) => value + '%'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#94a3b8',
                            maxRotation: 0
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    },

    /**
     * Create memory usage chart
     */
    createMemoryChart() {
        const ctx = document.getElementById('memoryChart');
        if (!ctx) return;

        this.instances.memory = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Memoria Usada (%)',
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                return `Uso: ${context.parsed.y.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#94a3b8',
                            callback: (value) => value + '%'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    /**
     * Create disk usage chart
     */
    createDiskChart() {
        const ctx = document.getElementById('diskChart');
        if (!ctx) return;

        this.instances.disk = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderColor: '#1e293b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: '#cbd5e1',
                            usePointStyle: true,
                            padding: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${context.parsed.toFixed(2)}%`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Create ping/latency chart
     */
    createPingChart() {
        const ctx = document.getElementById('pingChart');
        if (!ctx) return;

        this.instances.ping = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} ms`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#94a3b8',
                            callback: (value) => value + ' ms'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#94a3b8',
                            maxRotation: 0
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    }
                }
            }
        });
    },

    /**
     * Update CPU chart with new data
     */
    updateCPUChart(servers, statsData) {
        if (!this.instances.cpu) return;

        const chart = this.instances.cpu;
        const maxDataPoints = 10;

        // Initialize datasets if needed
        if (chart.data.datasets.length === 0) {
            servers.forEach((server, index) => {
                const color = this.getColorForIndex(index);
                chart.data.datasets.push({
                    label: server.name,
                    data: [],
                    borderColor: color,
                    backgroundColor: color + '33',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 5
                });
            });
        }

        // Update data
        servers.forEach((server, index) => {
            const stats = statsData[server.id];
            if (stats && stats.cpu) {
                const dataset = chart.data.datasets[index];
                dataset.data.push(stats.cpu.usage || 0);

                // Limit data points
                if (dataset.data.length > maxDataPoints) {
                    dataset.data.shift();
                }
            }
        });

        // Update labels
        if (chart.data.labels.length < maxDataPoints) {
            chart.data.labels.push('');
        } else {
            chart.data.labels.shift();
            chart.data.labels.push('');
        }

        chart.update('none');
    },

    /**
     * Update memory chart with new data
     */
    updateMemoryChart(servers, statsData) {
        if (!this.instances.memory) return;

        const chart = this.instances.memory;
        const labels = [];
        const data = [];
        const backgroundColors = [];
        const borderColors = [];

        servers.forEach((server) => {
            const stats = statsData[server.id];
            if (stats && stats.memory) {
                labels.push(server.name);
                const memPercent = parseFloat(stats.memory.usedPercent) || 0;
                data.push(memPercent);

                const color = this.getColorForValue(memPercent, 75, 90);
                backgroundColors.push(color + '80');
                borderColors.push(color);
            }
        });

        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].backgroundColor = backgroundColors;
        chart.data.datasets[0].borderColor = borderColors;

        chart.update('none');
    },

    /**
     * Update disk chart with new data
     */
    updateDiskChart(servers, statsData) {
        if (!this.instances.disk) return;

        const chart = this.instances.disk;
        const labels = [];
        const data = [];
        const backgroundColors = [];

        servers.forEach((server, index) => {
            const stats = statsData[server.id];
            if (stats && stats.disk) {
                labels.push(server.name);
                const diskPercent = parseFloat(stats.disk.usedPercent) || 0;
                data.push(diskPercent);

                const color = this.getColorForIndex(index);
                backgroundColors.push(color);
            }
        });

        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].backgroundColor = backgroundColors;

        chart.update('none');
    },

    /**
     * Update ping chart with new data
     */
    updatePingChart(servers, pingData) {
        if (!this.instances.ping) return;

        const chart = this.instances.ping;
        const maxDataPoints = 10;

        // Initialize datasets if needed
        if (chart.data.datasets.length === 0) {
            servers.forEach((server, index) => {
                const color = this.getColorForIndex(index);
                chart.data.datasets.push({
                    label: server.name,
                    data: [],
                    borderColor: color,
                    backgroundColor: color + '33',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 5
                });
            });
        }

        // Update data
        servers.forEach((server, index) => {
            const ping = pingData[server.id];
            if (ping) {
                const dataset = chart.data.datasets[index];
                dataset.data.push(ping.time || 0);

                // Limit data points
                if (dataset.data.length > maxDataPoints) {
                    dataset.data.shift();
                }
            }
        });

        // Update labels
        if (chart.data.labels.length < maxDataPoints) {
            chart.data.labels.push('');
        } else {
            chart.data.labels.shift();
            chart.data.labels.push('');
        }

        chart.update('none');
    },

    /**
     * Get color for value based on thresholds
     */
    getColorForValue(value, warningThreshold, criticalThreshold) {
        if (value >= criticalThreshold) return this.colors.danger;
        if (value >= warningThreshold) return this.colors.warning;
        return this.colors.success;
    },

    /**
     * Get color for index
     */
    getColorForIndex(index) {
        const colorPalette = [
            this.colors.primary,
            this.colors.success,
            this.colors.warning,
            this.colors.info,
            '#8b5cf6',
            '#ec4899'
        ];
        return colorPalette[index % colorPalette.length];
    }
};

// Export for use in other modules
window.charts = charts;
