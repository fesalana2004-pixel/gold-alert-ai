// Gold Alert AI - Notifications Module
class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.minConfidence = 60;
        this.enabled = true;
        this.vibration = true;
        this.sound = true;
        this.audioContext = null;
        
        this.loadSettings();
        this.init();
    }

    async init() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
        }
        
        if ('vibrate' in navigator) {
            // الاهتزاز مدعوم
        }
    }

    loadSettings() {
        this.minConfidence = parseInt(localStorage.getItem('goldAlert_minConfidence')) || 60;
        this.enabled = localStorage.getItem('goldAlert_notifications') !== 'false';
        this.vibration = localStorage.getItem('goldAlert_vibration') !== 'false';
        this.sound = localStorage.getItem('goldAlert_sound') !== 'false';
    }

    async requestPermission() {
        if ('Notification' in window) {
            const result = await Notification.requestPermission();
            this.permission = result;
            return result === 'granted';
        }
        return false;
    }

    async sendSignalNotification(signal) {
        if (!this.enabled) return;
        if (signal.confidence < this.minConfidence) return;

        const i18n = window.i18n;
        
        // ترجمة نوع الإشارة
        let typeText, emoji;
        if (signal.type === 'buy') {
            typeText = i18n ? i18n.translate('signal.buyGold') : '🟢 شراء الذهب';
            emoji = '🟢';
        } else if (signal.type === 'sell') {
            typeText = i18n ? i18n.translate('signal.sellGold') : '🔴 بيع الذهب';
            emoji = '🔴';
        } else {
            typeText = i18n ? i18n.translate('signal.neutral') : '⚪ محايد';
            emoji = '⚪';
        }

        // إشعار المتصفح
        if (this.permission === 'granted' || await this.requestPermission()) {
            const notification = new Notification(`Gold Alert AI | ${typeText}`, {
                body: `${i18n ? i18n.translate('notifications.confidence', { confidence: signal.confidence }) : `الثقة: ${signal.confidence}%`}\n${signal.reason}`,
                icon: '/assets/icons/icon-192.png',
                badge: '/assets/icons/icon-72.png',
                tag: `signal-${signal.id}`,
                vibrate: this.vibration ? [200, 100, 200, 100, 200] : undefined,
                requireInteraction: signal.confidence >= 80,
                data: signal,
                timestamp: new Date(signal.timestamp).getTime()
            });

            notification.onclick = () => {
                window.focus();
                if (window.app) {
                    window.app.navigateTo('alerts');
                }
                notification.close();
            };
        }

        // الاهتزاز
        if (this.vibration && 'vibrate' in navigator) {
            try {
                const pattern = signal.type === 'buy' ? [200, 100, 400] : 
                               signal.type === 'sell' ? [400, 100, 200] : 
                               [100, 50, 100];
                navigator.vibrate(pattern);
            } catch (e) {
                // الاهتزاز غير متاح
            }
        }

        // الصوت
        if (this.sound) {
            this.playAlertSound(signal.type, signal.confidence);
        }

        // إظهار Toast
        if (window.i18n) {
            window.i18n.showToast(`${emoji} ${typeText} - ${signal.confidence}%`);
        }
    }

    async playAlertSound(type, confidence) {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const ctx = this.audioContext;
            const now = ctx.currentTime;

            // تكوين النغمات حسب نوع الإشارة
            const configs = {
                buy: [
                    { freq: 880, start: 0, duration: 0.12 },
                    { freq: 1100, start: 0.12, duration: 0.15 },
                    { freq: 1320, start: 0.27, duration: 0.2 }
                ],
                sell: [
                    { freq: 660, start: 0, duration: 0.15 },
                    { freq: 440, start: 0.15, duration: 0.2 },
                    { freq: 330, start: 0.35, duration: 0.25 }
                ],
                neutral: [
                    { freq: 600, start: 0, duration: 0.1 },
                    { freq: 600, start: 0.15, duration: 0.1 }
                ]
            };

            const config = configs[type] || configs.neutral;
            const volume = Math.min(0.15 + (confidence / 100) * 0.1, 0.25);

            config.forEach(({ freq, start, duration }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + start);

                gain.gain.setValueAtTime(volume, now + start);
                gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

                osc.start(now + start);
                osc.stop(now + start + duration);
            });

        } catch (e) {
            console.log('Audio playback not supported');
        }
    }

    setMinConfidence(value) {
        this.minConfidence = value;
        localStorage.setItem('goldAlert_minConfidence', value);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('goldAlert_notifications', enabled);
    }

    setVibration(enabled) {
        this.vibration = enabled;
        localStorage.setItem('goldAlert_vibration', enabled);
    }

    setSound(enabled) {
        this.sound = enabled;
        localStorage.setItem('goldAlert_sound', enabled);
    }

    async sendTestNotification() {
        const testSignal = {
            id: Date.now(),
            type: 'buy',
            confidence: 85,
            reason: 'إشارة تجريبية',
            timestamp: new Date().toISOString()
        };
        await this.sendSignalNotification(testSignal);
    }
}

window.notificationManager = new NotificationManager();