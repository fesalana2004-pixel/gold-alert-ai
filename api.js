// Gold Alert AI - API Module (محاكاة البيانات)
class GoldAPI {
    constructor() {
        this.basePrice = 2650;
        this.priceHistory = {
            '1h': [],
            '24h': [],
            '1w': [],
            '1m': []
        };
        this.signals = [];
        this.listeners = [];
        this.updateInterval = null;
        
        // تحميل الإشارات المحفوظة
        this.loadSignals();
    }

    // محاكاة سعر الذهب الحي
    getCurrentPrice() {
        const variation = (Math.random() - 0.48) * 25; // ميل طفيف للارتفاع
        const price = this.basePrice + variation;
        const change = ((variation / this.basePrice) * 100);
        
        this.basePrice = price; // تحديث السعر الأساسي
        
        return {
            price: price.toFixed(2),
            change: parseFloat(change.toFixed(2)),
            timestamp: new Date().toISOString()
        };
    }

    // توليد بيانات الرسم البياني
    generateChartData(period) {
        const now = Date.now();
        let points, interval;
        
        switch (period) {
            case '1h': points = 60; interval = 60000; break;
            case '24h': points = 24; interval = 3600000; break;
            case '1w': points = 7; interval = 86400000; break;
            case '1m': points = 30; interval = 86400000; break;
            default: points = 24; interval = 3600000;
        }
        
        const data = [];
        let price = this.basePrice - 30;
        
        for (let i = points; i >= 0; i--) {
            price += (Math.random() - 0.48) * 4;
            price += Math.sin(i * 0.3) * 5;
            
            const time = new Date(now - (i * interval));
            let timeStr;
            
            if (period === '1h') {
                timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (period === '24h') {
                timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                timeStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
            
            data.push({
                time: timeStr,
                price: parseFloat(price.toFixed(2))
            });
        }
        
        return data;
    }

    // تحليل الأخبار بالذكاء الاصطناعي (محاكاة)
    analyzeNews(newsItem) {
        const buyKeywords = {
            high: ['انخفاض حاد', 'تراجع كبير', 'انهيار', 'أزمة مالية', 'حرب', 'ركود', 'تيسير كمي'],
            medium: ['انخفاض', 'تراجع', 'ضعف', 'خفض', 'توتر', 'مخاوف', 'هبوط'],
            low: ['تباطؤ', 'ترقب', 'حذر', 'دعم']
        };
        
        const sellKeywords = {
            high: ['ارتفاع قوي', 'نمو كبير', 'ازدهار', 'تعافي قوي', 'تشديد نقدي'],
            medium: ['ارتفاع', 'نمو', 'قوة', 'رفع', 'تحسن', 'إيجابي'],
            low: ['استقرار', 'ثبات', 'تحسن طفيف']
        };

        let buyScore = 0;
        let sellScore = 0;
        
        const text = (newsItem.title + ' ' + newsItem.content).toLowerCase();

        // تحليل كلمات الشراء
        Object.entries(buyKeywords).forEach(([weight, keywords]) => {
            keywords.forEach(word => {
                if (text.includes(word)) {
                    buyScore += weight === 'high' ? 3 : weight === 'medium' ? 2 : 1;
                }
            });
        });

        // تحليل كلمات البيع
        Object.entries(sellKeywords).forEach(([weight, keywords]) => {
            keywords.forEach(word => {
                if (text.includes(word)) {
                    sellScore += weight === 'high' ? 3 : weight === 'medium' ? 2 : 1;
                }
            });
        });

        // تحليل الفئات الخاصة
        if (newsItem.category === 'geopolitical') buyScore += 2;
        if (newsItem.category === 'interest-rates' && text.includes('خفض')) buyScore += 2;
        if (newsItem.category === 'nfp' && text.includes('ارتفاع')) sellScore += 2;
        if (newsItem.category === 'cpi' && text.includes('ارتفاع')) sellScore += 2;

        const totalScore = buyScore + sellScore;
        let type, confidence;

        if (totalScore === 0) {
            type = 'neutral';
            confidence = 50;
        } else if (buyScore > sellScore) {
            type = 'buy';
            confidence = Math.min(55 + (buyScore / (buyScore + sellScore)) * 40, 95);
        } else if (sellScore > buyScore) {
            type = 'sell';
            confidence = Math.min(55 + (sellScore / (buyScore + sellScore)) * 40, 95);
        } else {
            type = 'neutral';
            confidence = 50;
        }

        return {
            type,
            confidence: Math.round(confidence),
            buyScore,
            sellScore
        };
    }

    // جلب الأخبار (محاكاة)
    fetchNews() {
        const categories = ['interest-rates', 'cpi', 'nfp', 'central-banks', 'geopolitical'];
        const newsTemplates = [
            {
                title: 'انخفاض مؤشر الدولار الأمريكي لأدنى مستوى في شهرين',
                content: 'تراجع الدولار مقابل سلة العملات الرئيسية وسط توقعات متزايدة بخفض أسعار الفائدة من قبل الاحتياطي الفيدرالي. هذا الانخفاض يعزز جاذبية الذهب كملاذ آمن.',
                category: 'interest-rates'
            },
            {
                title: 'ارتفاع بيانات الوظائف غير الزراعية NFP بشكل مفاجئ',
                content: 'أظهرت بيانات الوظائف غير الزراعية ارتفاعاً فاق التوقعات بـ 50 ألف وظيفة جديدة، مما يشير إلى قوة سوق العمل الأمريكي وقد يؤخر خفض الفائدة.',
                category: 'nfp'
            },
            {
                title: 'مؤشر التضخم CPI يسجل ارتفاعاً طفيفاً خلال الشهر الماضي',
                content: 'ارتفع مؤشر أسعار المستهلك بنسبة 0.2% الشهر الماضي، مقارنة بتوقعات بارتفاع 0.3%. هذا التباطؤ النسبي قد يمنح الفيدرالي مساحة للتحرك.',
                category: 'cpi'
            },
            {
                title: 'توترات جيوسياسية متصاعدة في الشرق الأوسط تدفع الذهب للارتفاع',
                content: 'تصاعد حدة التوترات في منطقة الشرق الأوسط يزيد من إقبال المستثمرين على أصول الملاذ الآمن وفي مقدمتها الذهب، وسط مخاوف من اتساع رقعة الصراع.',
                category: 'geopolitical'
            },
            {
                title: 'البنك المركزي الأوروبي يقرر الإبقاء على أسعار الفائدة دون تغيير',
                content: 'قرر البنك المركزي الأوروبي الإبقاء على سياساته النقدية الحالية دون تغيير، مشيراً إلى ضرورة انتظار المزيد من البيانات الاقتصادية قبل اتخاذ أي قرار.',
                category: 'central-banks'
            },
            {
                title: 'تراجع عوائد سندات الخزانة الأمريكية يعزز جاذبية الذهب',
                content: 'انخفضت عوائد سندات الخزانة الأمريكية لأجل 10 سنوات إلى ما دون 4%، مما يقلل من تكلفة الفرصة البديلة لحيازة الذهب ويدفع أسعاره للارتفاع.',
                category: 'interest-rates'
            },
            {
                title: 'توقعات برفع أسعار الفائدة الأمريكية مع تحسن البيانات الاقتصادية',
                content: 'تتجه التوقعات نحو إمكانية رفع أسعار الفائدة مجدداً بعد صدور بيانات اقتصادية إيجابية تفوق التقديرات، مما قد يضغط على أسعار الذهب.',
                category: 'interest-rates'
            },
            {
                title: 'أزمة مصرفية جديدة تلوح في الأفق مع تعثر بنوك إقليمية',
                content: 'ظهور مؤشرات على تعثر بعض البنوك الإقليمية يعيد للأذهان أزمة القطاع المصرفي ويدفع المستثمرين نحو الذهب كتحوط ضد المخاطر.',
                category: 'geopolitical'
            }
        ];

        // إضافة أوقات عشوائية
        const times = ['منذ 10 دقائق', 'منذ 30 دقيقة', 'منذ ساعة', 'منذ ساعتين', 'منذ 3 ساعات', 'منذ 5 ساعات', 'منذ 8 ساعات'];
        
        const shuffled = [...newsTemplates].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 5 + Math.floor(Math.random() * 3));

        return selected.map((news, index) => {
            const analysis = this.analyzeNews(news);
            return {
                id: Date.now() + index,
                ...news,
                ...analysis,
                time: times[Math.floor(Math.random() * times.length)]
            };
        }).sort((a, b) => b.confidence - a.confidence);
    }

    // توليد إشارة تداول
    generateSignal(news) {
        const signal = {
            id: Date.now(),
            type: news.type,
            confidence: news.confidence,
            reason: news.title,
            category: news.category,
            timestamp: new Date().toISOString(),
            result: null,
            resultPrice: null
        };

        this.signals.unshift(signal);
        
        // الاحتفاظ بآخر 100 إشارة فقط
        if (this.signals.length > 100) {
            this.signals = this.signals.slice(0, 100);
        }

        this.saveSignals();
        this.notifyListeners(signal);
        this.scheduleResultCheck(signal.id);

        return signal;
    }

    // جدولة التحقق من نتيجة الإشارة
    scheduleResultCheck(signalId) {
        const delay = 30000 + Math.random() * 60000; // 30-90 ثانية
        
        setTimeout(() => {
            this.simulateResult(signalId);
        }, delay);
    }

    // محاكاة نتيجة الإشارة
    simulateResult(signalId) {
        const signal = this.signals.find(s => s.id === signalId);
        if (signal && !signal.result) {
            const successRate = signal.confidence / 100;
            const success = Math.random() < successRate;
            
            signal.result = success ? 'success' : 'failed';
            signal.resultPrice = this.getCurrentPrice().price;
            signal.resultTime = new Date().toISOString();
            
            this.saveSignals();
            this.notifyListeners(signal, 'result');
        }
    }

    // نظام المستمعين
    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    notifyListeners(signal, event = 'new') {
        this.listeners.forEach(cb => {
            try {
                cb(signal, event);
            } catch (e) {
                console.error('Listener error:', e);
            }
        });
    }

    // الحصول على الإشارات السابقة
    getSignalHistory() {
        return [...this.signals];
    }

    // مسح سجل الإشارات
    clearSignals() {
        this.signals = [];
        localStorage.removeItem('goldAlert_signals');
    }

    // حفظ الإشارات
    saveSignals() {
        try {
            localStorage.setItem('goldAlert_signals', JSON.stringify(this.signals.slice(0, 50)));
        } catch (e) {
            console.warn('Failed to save signals');
        }
    }

    // تحميل الإشارات
    loadSignals() {
        try {
            const saved = localStorage.getItem('goldAlert_signals');
            if (saved) {
                this.signals = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load signals');
        }
    }

    // إحصائيات الإشارات
    getSignalStats() {
        const total = this.signals.length;
        const success = this.signals.filter(s => s.result === 'success').length;
        const failed = this.signals.filter(s => s.result === 'failed').length;
        const pending = total - success - failed;
        
        return { total, success, failed, pending };
    }
}

// تصدير نسخة واحدة للتطبيق
window.goldAPI = new GoldAPI();