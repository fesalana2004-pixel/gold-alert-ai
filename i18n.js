// Gold Alert AI - Internationalization Module
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('goldAlert_lang') || 'ar';
        this.translations = {};
        this.fallbackLang = 'en';
        this.rtlLanguages = ['ar', 'fa', 'he', 'ur'];
        this.initialized = false;
    }

    async init() {
        await this.loadLanguage(this.currentLang);
        this.applyTranslations();
        this.setDirection();
        this.initialized = true;
        
        // إعداد محدد اللغة
        this.setupLanguageSelector();
    }

    async loadLanguage(lang) {
        try {
            const module = await import(`../locales/${lang}.js`);
            this.translations = module.default;
            document.documentElement.setAttribute('lang', lang);
        } catch (e) {
            console.warn(`Language ${lang} not found, falling back to ${this.fallbackLang}`);
            try {
                const module = await import(`../locales/${this.fallbackLang}.js`);
                this.translations = module.default;
                this.currentLang = this.fallbackLang;
                document.documentElement.setAttribute('lang', this.fallbackLang);
            } catch (e2) {
                console.error('Failed to load any language');
                this.translations = {};
            }
        }
    }

    async changeLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('goldAlert_lang', lang);
        
        // تحديث محدد اللغة
        const select = document.getElementById('language-select');
        if (select) select.value = lang;
        
        await this.loadLanguage(lang);
        this.applyTranslations();
        this.setDirection();
        
        // إعادة تهيئة واجهة المستخدم
        if (window.app && window.app.refreshUI) {
            window.app.refreshUI();
        }
        
        this.showToast(`تم تغيير اللغة إلى ${this.translate(`language.name`)}`);
    }

    translate(key, params = {}) {
        let translation = this.getNestedTranslation(key);
        
        if (translation === null) {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
        
        // استبدال المتغيرات
        Object.keys(params).forEach(param => {
            translation = translation.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
        });
        
        return translation;
    }

    getNestedTranslation(key) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return null;
            }
        }
        
        return typeof value === 'string' ? value : null;
    }

    applyTranslations() {
        // ترجمة النصوص في العناصر
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (translation && translation !== key) {
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = translation;
                } else if (element.tagName === 'META') {
                    element.setAttribute('content', translation);
                } else {
                    element.textContent = translation;
                }
            }
        });

        // ترجمة السمات
        document.querySelectorAll('[data-i18n-attr]').forEach(element => {
            const attrs = element.getAttribute('data-i18n-attr').split(',');
            attrs.forEach(attr => {
                const [attrName, key] = attr.split(':').map(s => s.trim());
                const translation = this.translate(key);
                if (translation) {
                    element.setAttribute(attrName, translation);
                }
            });
        });

        // تحديث عنوان الصفحة
        const appName = this.translate('app.name');
        if (appName) {
            document.title = appName;
            document.querySelector('meta[name="description"]')?.setAttribute('content', this.translate('app.description') || '');
        }
    }

    setDirection() {
        const isRTL = this.rtlLanguages.includes(this.currentLang);
        const dir = isRTL ? 'rtl' : 'ltr';
        
        document.documentElement.setAttribute('dir', dir);
        document.body.style.direction = dir;
        document.body.style.textAlign = isRTL ? 'right' : 'left';
        
        // تحديث manifest للاتجاه
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
            // يمكن تحديث manifest ديناميكياً إذا لزم الأمر
        }
    }

    setupLanguageSelector() {
        const select = document.getElementById('language-select');
        if (!select) return;
        
        select.value = this.currentLang;
        
        select.addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getAvailableLanguages() {
        return [
            { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
            { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
            { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
            { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
            { code: 'tr', name: 'Türkçe', flag: '🇹🇷', nativeName: 'Türkçe' },
            { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', nativeName: 'हिन्दी' },
            { code: 'zh', name: '中文', flag: '🇨🇳', nativeName: '中文' }
        ];
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.classList.add('show');
        
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    formatDate(date, format = 'short') {
        const locale = this.currentLang === 'ar' ? 'ar-SA' : 
                      this.currentLang === 'zh' ? 'zh-CN' : 
                      this.currentLang;
        
        const options = format === 'short' ? {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        } : {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        };
        
        return new Date(date).toLocaleString(locale, options);
    }

    formatNumber(number, decimals = 2) {
        const locale = this.currentLang === 'ar' ? 'ar-SA' : this.currentLang;
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    formatCurrency(amount, currency = 'USD') {
        const locale = this.currentLang === 'ar' ? 'ar-SA' : this.currentLang;
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
}

export default I18n;