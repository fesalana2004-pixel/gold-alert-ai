// Gold Alert AI - Main Application
class GoldAlertApp {
    constructor() {
        this.api = window.goldAPI;
        this.notifications = window.notificationManager;
        this.i18n = window.i18n;
        this.currentPage = 'home';
        this.chart = null;
        this.currentPeriod = '1h';
        this.newsFilter = 'all';
        this.priceUpdateInterval = null;
        this.activeNewsFilters = new Set(['interest-rates', 'cpi', 'nfp', 'central-banks', 'geopolitical']);

        this.init();
    }

    async init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.startPriceUpdates();
        this.loadNews();
        this.setupChart();
        this.loadAlertHistory();
        this.updateSettingsUI();
        this.setupServiceWorker();

        // الاستماع للإشارات الجديدة
        this.api.addListener((signal, event) => {
            if (event === 'new') {
                this.notifications.sendSignalNotification(signal);
                this.updateLatestSignal(signal);
                this.addAlertToHistory(signal);
                this.updateAlertSummary();
            } else if (event === 'result') {
                this.updateAlertResult(signal);
                this.updateAlertSummary();
            }
        });

        // تحديث ملخص التنبيهات
        this.updateAlertSummary();

        console.log('✅ Gold Alert AI initialized successfully');
        console.log(`🌍 Language: ${this.i18n.getCurrentLanguage()}`);
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });

        // دعم التنقل عبر الهاش
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '') || 'home';
            this.navigateTo(hash);
        });

        // التنقل الأولي
        const initialHash = window.location.hash.replace('#', '') || 'home';
        if (initialHash !== 'home') {
            this.navigateTo(initialHash);
        }
    }

    navigateTo(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        const pageElement = document.getElementById(page);
        const navItem = document.querySelector(`[data-page="${page}"]`);

        if (pageElement) pageElement.classList.add('active');
        if (navItem) navItem.classList.add('active');

        this.currentPage = page;
        window.location.hash = page;

        // تحديث المحتوى عند التنقل
        if (page === 'news') this.loadNews();
        if (page === 'alerts') this.updateAlertSummary();
    }

    setupEventListeners() {
        // أزرار الفترات الزمنية
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                this.updateChart();
            });
        });

        // فلتر الأخبار
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.newsFilter = btn.dataset.filter;
                this.filterNews();
            });
        });

        // إعدادات الإشعارات
        const notifToggle = document.getElementById('notifications-toggle');
        if (notifToggle) {
            notifToggle.addEventListener('change', (e) => {
                this.notifications.setEnabled(e.target.checked);
            });
        }

        const vibrationToggle = document.getElementById('vibration-toggle');
        if (vibrationToggle) {
            vibrationToggle.addEventListener('change', (e) => {
                this.notifications.setVibration(e.target.checked);
            });
        }

        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                this.notifications.setSound(e.target.checked);
            });
        }

        // الحد الأدنى للثقة
        const minConfidence = document.getElementById('min-confidence');
        if (minConfidence) {
            minConfidence.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.notifications.setMinConfidence(value);
                document.getElementById('confidence-display').textContent = value + '%';
            });
        }

        // فلاتر الأخبار
        document.querySelectorAll('.news-filter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const filter = e.target.dataset.filter;
                if (e.target.checked) {
                    this.activeNewsFilters.add(filter);
                } else {
                    this.activeNewsFilters.delete(filter);
                }
                this.loadNews();
            });
        });

        // زر تحديث الأخبار
        const refreshNewsBtn = document.getElementById('refresh-news');
        if (refreshNewsBtn) {
            refreshNewsBtn.addEventListener('click', () => {
                refreshNewsBtn.classList.add('fa-spin');
                this.loadNews();
                setTimeout(() => refreshNewsBtn.classList.remove('fa-spin'), 1000);
            });
        }

        // زر مسح التنبيهات
        const clearAlertsBtn = document.getElementById('clear-alerts');
        if (clearAlertsBtn) {
            clearAlertsBtn.addEventListener('click', () => {
                if (confirm(this.i18n.translate('actions.confirm') || 'هل أنت متأكد؟')) {
                    this.api.clearSignals();
                    this.loadAlertHistory();
                    this.updateAlertSummary();
                    this.showToast('تم مسح جميع التنبيهات');
                }
            });
        }
    }

    startPriceUpdates() {
        const updatePrice = () => {
            const data = this.api.getCurrentPrice();
            const priceEl = document.getElementById('current-price');
            const changeEl = document.getElementById('price-change');

            if (priceEl) {
                // تأثير تغيير السعر
                const oldPrice = priceEl.textContent.replace('$', '');
                const newPrice = `$${data.price}`;
                
                if (oldPrice !== newPrice && oldPrice !== '--') {
                    priceEl.style.transform = 'scale(1.05)';
                    setTimeout(() => priceEl.style.transform = 'scale(1)', 200);
                }
                
                priceEl.textContent = newPrice;
            }

            if (changeEl) {
                const change = data.change;
                const sign = change >= 0 ? '+' : '';
                changeEl.textContent = `${sign}${change}%`;
                changeEl.className = 'price-change ' + (change >= 0 ? 'positive' : 'negative');
            }
        };

        updatePrice();
        this.priceUpdateInterval = setInterval(updatePrice, 3000);
    }

    setupChart() {
        const ctx = document.getElementById('goldChart');
        if (!ctx) return;

        // تدرج لوني للرسم البياني
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 220);
        gradient.addColorStop(0, 'rgba(212, 168, 67, 0.3)');
        gradient.addColorStop(0.5, 'rgba(212, 168, 67, 0.1)');
        gradient.addColorStop(1, 'rgba(212, 168, 67, 0)');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'XAU/USD',
                    data: [],
                    borderColor: '#d4a843',
                    backgroundColor: gradient,
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: '#f0d78c',
                    pointHoverBorderColor: '#1a1a2e',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 500,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#1a1a2e',
                        borderColor: '#d4a843',
                        borderWidth: 1.5,
                        titleColor: '#f0d78c',
                        bodyColor: '#ffffff',
                        padding: 12,
                        cornerRadius: 10,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `$${context.parsed.y}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { 
                            color: 'rgba(42, 42, 74, 0.3)',
                            drawBorder: false
                        },
                        ticks: { 
                            color: '#b0b0b0',
                            maxTicksLimit: 6,
                            font: { size: 11 }
                        }
                    },
                    y: {
                        grid: { 
                            color: 'rgba(42, 42, 74, 0.5)',
                            drawBorder: false
                        },
                        ticks: { 
                            color: '#b0b0b0',
                            callback: v => '$' + v,
                            font: { size: 11 }
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

        this.updateChart();

        // تحديث الرسم البياني كل دقيقة
        setInterval(() => {
            if (this.currentPage === 'home') {
                this.updateChart();
            }
        }, 60000);
    }

    updateChart() {
        if (!this.chart) return;

        const data = this.api.generateChartData(this.currentPeriod);
        this.chart.data.labels = data.map(d => d.time);
        this.chart.data.datasets[0].data = data.map(d => d.price);
        this.chart.update('none');
    }

    loadNews() {
        const newsList = document.getElementById('news-list');
        if (!newsList) return;

        // تصفية الأخبار حسب الفلاتر النشطة
        let news = this.api.fetchNews();
        news = news.filter(item => this.activeNewsFilters.has(item.category));

        if (news.length === 0) {
            newsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <p data-i18n="news.noNews">لا توجد أخبار حالياً</p>
                </div>
            `;
            return;
        }

        newsList.innerHTML = news.map(item => this.createNewsHTML(item)).join('');
        this.filterNews();

        // إضافة مستمعي الأحداث لأزرار توليد الإشارة
        newsList.querySelectorAll('.generate-signal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newsId = parseInt(btn.dataset.newsId);
                const newsItem = news.find(n => n.id === newsId);
                
                if (newsItem) {
                    const signal = this.api.generateSignal(newsItem);
                    this.updateLatestSignal(signal);
                    this.addAlertToHistory(signal);
                    this.updateAlertSummary();
                    this.navigateTo('home');

                    // تأثير بصري
                    const originalText = btn.textContent;
                    btn.textContent = this.i18n.translate('news.signalGenerated') || '✓ تم توليد الإشارة';
                    btn.style.background = '#00c853';
                    btn.style.color = '#fff';
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = 'var(--gold)';
                        btn.style.color = '#000';
                    }, 2000);
                }
            });
        });
    }

    createNewsHTML(news) {
        const i18n = this.i18n;
        const emoji = news.type === 'buy' ? '🟢' : news.type === 'sell' ? '🔴' : '⚪';
        const typeText = i18n.translate(`signal.${news.type}`) || news.type;

        return `
            <div class="news-item ${news.type}" data-type="${news.type}" data-category="${news.category}">
                <h4>${news.title}</h4>
                <p style="color: #b0b0b0; font-size: 13px; line-height: 1.5; margin: 8px 0;">${news.content}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; flex-wrap: wrap; gap: 8px;">
                    <span class="impact ${news.type}">${emoji} ${typeText} (${news.confidence}%)</span>
                    <span style="color: #78909c; font-size: 11px;">${news.time}</span>
                </div>
                <button class="generate-signal-btn" data-news-id="${news.id}">
                    ${i18n.translate('news.generateSignal')}
                </button>
            </div>
        `;
    }

    filterNews() {
        const newsItems = document.querySelectorAll('.news-item');
        newsItems.forEach(item => {
            if (this.newsFilter === 'all' || item.dataset.type === this.newsFilter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    updateLatestSignal(signal) {
        const i18n = this.i18n;
        
        const signalTypeEl = document.getElementById('signal-type');
        const signalTimeEl = document.getElementById('signal-time');
        const signalReasonEl = document.getElementById('signal-reason');
        const confidenceValueEl = document.getElementById('confidence-value');
        const confidenceFill = document.getElementById('confidence-fill');
        const marketDirection = document.getElementById('market-direction');

        if (signalTypeEl) {
            const typeText = i18n.translate(`signal.${signal.type}Gold`) || 
                           (signal.type === 'buy' ? '🟢 شراء الذهب' : 
                            signal.type === 'sell' ? '🔴 بيع الذهب' : '⚪ محايد');
            signalTypeEl.textContent = typeText;
            signalTypeEl.className = 'signal-type ' + signal.type;
        }

        if (signalTimeEl) {
            signalTimeEl.textContent = i18n.formatDate(signal.timestamp);
        }

        if (signalReasonEl) {
            signalReasonEl.textContent = `${i18n.translate('signal.reason')}: ${signal.reason}`;
        }

        if (confidenceValueEl) {
            confidenceValueEl.textContent = signal.confidence + '%';
        }

        if (confidenceFill) {
            confidenceFill.style.width = signal.confidence + '%';
            
            let strength;
            if (signal.confidence >= 80) strength = 'strong';
            else if (signal.confidence >= 60) strength = 'medium';
            else strength = 'weak';
            
            confidenceFill.className = 'confidence-fill ' + strength;
        }

        // تحديث اتجاه السوق
        if (marketDirection) {
            if (signal.type === 'buy') {
                marketDirection.textContent = i18n.translate('market.bullish');
                marketDirection.className = 'direction-indicator bullish';
            } else if (signal.type === 'sell') {
                marketDirection.textContent = i18n.translate('market.bearish');
                marketDirection.className = 'direction-indicator bearish';
            } else {
                marketDirection.textContent = i18n.translate('market.sideways');
                marketDirection.className = 'direction-indicator sideways';
            }
        }
    }

    loadAlertHistory() {
        const alertsList = document.getElementById('alerts-list');
        if (!alertsList) return;

        const signals = this.api.getSignalHistory();

        if (signals.length === 0) {
            alertsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p data-i18n="alerts.noAlerts">لا توجد تنبيهات سابقة</p>
                </div>
            `;
            return;
        }

        alertsList.innerHTML = signals.map(signal => this.createAlertHTML(signal)).join('');
    }

    createAlertHTML(signal) {
        const i18n = this.i18n;
        const emoji = signal.type === 'buy' ? '🟢' : signal.type === 'sell' ? '🔴' : '⚪';
        const typeText = i18n.translate(`signal.${signal.type}Gold`) || signal.type;

        let resultHTML = '';
        if (signal.result) {
            const resultClass = signal.result === 'success' ? 'positive' : 'negative';
            const resultText = signal.result === 'success' ? 
                i18n.translate('signal.success') : 
                i18n.translate('signal.failed');
            resultHTML = `
                <span class="alert-result ${resultClass}">${resultText}</span>
                ${signal.resultPrice ? `<span style="color: #b0b0b0; font-size: 11px; margin-right: 8px;">$${signal.resultPrice}</span>` : ''}
            `;
        } else {
            resultHTML = `
                <span class="alert-result" style="background: rgba(255,193,7,0.2); color: #ffc107;">
                    ${i18n.translate('signal.pending')}
                </span>
            `;
        }

        return `
            <div class="alert-item" data-signal-id="${signal.id}">
                <div class="alert-type">${emoji} ${typeText}</div>
                <div style="color: #b0b0b0; font-size: 13px;">${i18n.translate('home.confidence')}: ${signal.confidence}%</div>
                <div style="color: #b0b0b0; font-size: 12px; margin-top: 4px;">${signal.reason}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    <div class="alert-time">${i18n.formatDate(signal.timestamp)}</div>
                    ${resultHTML}
                </div>
            </div>
        `;
    }

    addAlertToHistory(signal) {
        const alertsList = document.getElementById('alerts-list');
        if (!alertsList) return;

        // إزالة رسالة "لا توجد تنبيهات"
        const emptyState = alertsList.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        // إضافة التنبيه الجديد
        const alertHTML = this.createAlertHTML(signal);
        alertsList.insertAdjacentHTML('afterbegin', alertHTML);
    }

    updateAlertResult(signal) {
        const alertItem = document.querySelector(`[data-signal-id="${signal.id}"]`);
        if (!alertItem) return;

        const i18n = this.i18n;
        const resultHTML = alertItem.querySelector('.alert-result');
        if (resultHTML && signal.result) {
            const resultClass = signal.result === 'success' ? 'positive' : 'negative';
            const resultText = signal.result === 'success' ? 
                i