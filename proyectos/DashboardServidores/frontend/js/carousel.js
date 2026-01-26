/**
 * Carousel Module
 * Handles server overview carousel functionality
 */

const carousel = {
    currentIndex: 0,
    servers: [],
    autoRotateInterval: null,
    autoRotateDelay: 5000,

    /**
     * Initialize carousel
     */
    init(servers) {
        this.servers = servers;
        this.render();
        this.setupEventListeners();
        this.startAutoRotate();
    },

    /**
     * Render carousel items
     */
    render() {
        const track = document.getElementById('carouselTrack');
        const indicators = document.getElementById('carouselIndicators');

        if (!track || !indicators) return;

        // Clear existing content
        track.innerHTML = '';
        indicators.innerHTML = '';

        // Create carousel items
        this.servers.forEach((server, index) => {
            // Create item
            const item = document.createElement('div');
            item.className = 'carousel-item';
            item.innerHTML = `
        <div class="carousel-card">
          <div class="carousel-stat">
            <div class="carousel-stat-value" id="carousel-health-${server.id}">--</div>
            <div class="carousel-stat-label">Health Score</div>
          </div>
          <div class="carousel-stat">
            <div class="carousel-stat-value" id="carousel-cpu-${server.id}">--</div>
            <div class="carousel-stat-label">CPU Usage</div>
          </div>
          <div class="carousel-stat">
            <div class="carousel-stat-value" id="carousel-memory-${server.id}">--</div>
            <div class="carousel-stat-label">Memory Usage</div>
          </div>
        </div>
        <h3 style="text-align: center; margin-top: 1rem; color: var(--text-secondary);">${server.name}</h3>
      `;
            track.appendChild(item);

            // Create indicator
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.goToSlide(index));
            indicators.appendChild(indicator);
        });

        this.updatePosition();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        const carousel = document.querySelector('.carousel');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previous());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }

        // Pause on hover
        if (carousel) {
            carousel.addEventListener('mouseenter', () => this.stopAutoRotate());
            carousel.addEventListener('mouseleave', () => this.startAutoRotate());
        }

        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;

        if (carousel) {
            carousel.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });

            carousel.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            });
        }

        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) {
                this.next();
            }
            if (touchEndX > touchStartX + 50) {
                this.previous();
            }
        };

        this.handleSwipe = handleSwipe;
    },

    /**
     * Go to specific slide
     */
    goToSlide(index) {
        this.currentIndex = index;
        this.updatePosition();
        this.updateIndicators();
        this.resetAutoRotate();
    },

    /**
     * Go to next slide
     */
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.servers.length;
        this.updatePosition();
        this.updateIndicators();
        this.resetAutoRotate();
    },

    /**
     * Go to previous slide
     */
    previous() {
        this.currentIndex = (this.currentIndex - 1 + this.servers.length) % this.servers.length;
        this.updatePosition();
        this.updateIndicators();
        this.resetAutoRotate();
    },

    /**
     * Update carousel position
     */
    updatePosition() {
        const track = document.getElementById('carouselTrack');
        if (track) {
            track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        }
    },

    /**
     * Update indicators
     */
    updateIndicators() {
        const indicators = document.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            if (index === this.currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    },

    /**
     * Start auto-rotation
     */
    startAutoRotate() {
        this.stopAutoRotate();
        this.autoRotateInterval = setInterval(() => {
            this.next();
        }, this.autoRotateDelay);
    },

    /**
     * Stop auto-rotation
     */
    stopAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    },

    /**
     * Reset auto-rotation
     */
    resetAutoRotate() {
        this.stopAutoRotate();
        this.startAutoRotate();
    },

    /**
     * Update carousel data
     */
    updateData(statsData) {
        this.servers.forEach(server => {
            const stats = statsData[server.id];
            if (stats) {
                // Update health
                const healthEl = document.getElementById(`carousel-health-${server.id}`);
                if (healthEl) {
                    healthEl.textContent = stats.health ? stats.health.toFixed(0) : '--';
                }

                // Update CPU
                const cpuEl = document.getElementById(`carousel-cpu-${server.id}`);
                if (cpuEl && stats.cpu) {
                    cpuEl.textContent = stats.cpu.usage ? stats.cpu.usage.toFixed(1) + '%' : '--';
                }

                // Update Memory
                const memoryEl = document.getElementById(`carousel-memory-${server.id}`);
                if (memoryEl && stats.memory) {
                    memoryEl.textContent = stats.memory.usedPercent ? stats.memory.usedPercent + '%' : '--';
                }
            }
        });
    }
};

// Export for use in other modules
window.carousel = carousel;
