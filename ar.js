export default {
    language: { name: 'العربية', nativeName: 'العربية' },
    app: {
        name: 'Gold Alert AI | إشارات الذهب الذكية',
        shortName: 'Gold Alert',
        description: 'تطبيق ذكي لمتابعة الذهب وإرسال إشارات تداول فورية بناءً على الأخبار والتحليل الآلي'
    },
    nav: { home: 'الرئيسية', news: 'الأخبار', alerts: 'التنبيهات', settings: 'الإعدادات' },
    home: {
        livePrice: 'سعر الذهب لحظياً', xauusd: 'XAU/USD', live: 'مباشر',
        hour: 'ساعة', hours24: '24 ساعة', week: 'أسبوع', month: 'شهر',
        latestSignal: 'آخر إشارة', signalStrength: 'قوة الإشارة',
        marketDirection: 'اتجاه السوق', noSignal: 'لا توجد إشارات بعد', confidence: 'الثقة'
    },
    signal: {
        buyGold: '🟢 شراء الذهب', sellGold: '🔴 بيع الذهب', neutral: '⚪ محايد',
        buy: 'شراء', sell: 'بيع', strong: 'قوية', medium: 'متوسطة', weak: 'ضعيفة',
        reason: 'السبب', result: 'النتيجة', success: 'نجحت', failed: 'فشلت', pending: 'قيد الانتظار'
    },
    news: {
        title: 'الأخبار الاقتصادية', filterAll: 'الكل', filterBuy: 'شراء 🟢',
        filterSell: 'بيع 🔴', filterNeutral: 'محايد ⚪', impact: 'التأثير',
        generateSignal: 'توليد إشارة من هذا الخبر', signalGenerated: 'تم توليد الإشارة ✓',
        noNews: 'لا توجد أخبار حالياً',
        timeAgo: { minutes: 'منذ {minutes} دقيقة', hours: 'منذ {hours} ساعة', days: 'منذ {days} يوم' }
    },
    alerts: {
        title: 'إجمالي الإشارات', signalHistory: 'سجل الإشارات',
        noAlerts: 'لا توجد تنبيهات سابقة', type: 'نوع الإشارة', time: 'وقت الإشارة', status: 'الحالة'
    },
    settings: {
        title: 'الإعدادات', notifications: 'الإشعارات', enableNotifications: 'تفعيل الإشعارات',
        minConfidence: 'الحد الأدنى لقوة الإشارة', newsFilter: 'فلتر الأخبار المهمة',
        language: 'اللغة', selectLanguage: 'اختر اللغة',
        categories: {
            interestRates: 'أسعار الفائدة الأمريكية', cpi: 'التضخم CPI',
            nfp: 'الوظائف NFP', centralBanks: 'قرارات البنوك المركزية', geopolitical: 'الأزمات الجيوسياسية'
        },
        about: 'حول التطبيق', version: 'الإصدار', contact: 'اتصل بنا',
        privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام'
    },
    market: { bullish: '📈 صاعد', bearish: '📉 هابط', sideways: '📊 عرضي' },
    notifications: {
        newSignal: 'إشارة تداول جديدة', goldBuyAlert: 'إشارة شراء الذهب',
        goldSellAlert: 'إشارة بيع الذهب', confidence: 'الثقة: {confidence}%', tapToView: 'اضغط للمشاهدة'
    },
    errors: { loading: 'خطأ في التحميل', retry: 'إعادة المحاولة', noConnection: 'لا يوجد اتصال بالإنترنت', offline: 'أنت غير متصل حالياً' },
    actions: { save: 'حفظ', cancel: 'إلغاء', confirm: 'تأكيد', delete: 'حذف', share: 'مشاركة', copy: 'نسخ', refresh: 'تحديث' }
};