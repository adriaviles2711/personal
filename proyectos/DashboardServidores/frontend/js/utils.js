/**
 * Utility Functions
 * Helper functions for formatting and common operations
 */

const utils = {
    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    /**
     * Format percentage
     */
    formatPercent(value, decimals = 1) {
        return parseFloat(value).toFixed(decimals) + '%';
    },

    /**
     * Format timestamp to relative time
     */
    formatRelativeTime(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'hace ' + diffSecs + 's';
        if (diffMins < 60) return 'hace ' + diffMins + 'm';
        if (diffHours < 24) return 'hace ' + diffHours + 'h';
        return 'hace ' + diffDays + 'd';
    },

    /**
     * Format timestamp to readable date
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Get status color based on value and thresholds
     */
    getStatusColor(value, warningThreshold, criticalThreshold) {
        if (value >= criticalThreshold) return 'danger';
        if (value >= warningThreshold) return 'warning';
        return 'success';
    },

    /**
     * Get health score color
     */
    getHealthColor(health) {
        if (health >= 80) return 'success';
        if (health >= 50) return 'warning';
        return 'danger';
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Create DOM element with attributes
     */
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);

        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });

        return element;
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = utils.createElement('div', {
            className: `alert alert-${type}`,
            innerHTML: `
        <span class="alert-content">${message}</span>
        <button class="alert-close">&times;</button>
      `
        });

        const container = document.getElementById('alertsContainer');
        container.appendChild(notification);

        notification.querySelector('.alert-close').addEventListener('click', () => {
            notification.remove();
        });

        if (duration > 0) {
            setTimeout(() => {
                notification.remove();
            }, duration);
        }
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    /**
     * Copy to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            utils.showNotification('Copiado al portapapeles', 'info');
        } catch (err) {
            console.error('Error copying to clipboard:', err);
        }
    }
};

// Export for use in other modules
window.utils = utils;
