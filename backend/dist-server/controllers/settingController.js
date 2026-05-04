import prisma from '../lib/prisma';
import { cacheInvalidateScope, cacheResolveSWR } from '../services/cacheService';
import { removeFile } from '../utils/fileUtils';
import { logAudit } from '../services/auditService';
export const getSettings = async (req, res) => {
    try {
        const payload = await cacheResolveSWR('settings', 'all', async () => {
            const rows = await prisma.settings.findMany();
            const settings = {};
            rows.forEach(row => {
                settings[row.key_name] = row.value;
            });
            // Defaults (consistent with PHP)
            const defaults = {
                cardStyle: 'floating',
                cardHoverAnimation: 'zoom',
                bundleCardStyle: 'A',
                backgroundStyle: 'blobs',
                sliderInterval: '3',
                promo_enabled: 'false',
                whatsapp_enabled: 'false',
                primary_color: '#eb5e28',
                secondary_color: '#10b981',
                blend_colors: 'false',
                light_bg_color: '#e2e8f0',
                store_name: 'MyMenuEG',
                logo_url: '',
                navbar_style: 'variant1',
                contact_settings: JSON.stringify({
                    heroTitleAr: "تواصل معنا - نحن هنا لمساعدتك",
                    heroTitleEn: "Contact Us - We're Here to Help",
                    heroSubtitleAr: "سواء كان لديك استفسار حول منتجاتنا، أو طلبات بالجملة، أو تحتاج إلى تصميم مخصص لمعدات مطعمك، فريقنا خبير وجاهز لتقديم الدعم الكامل عبر جميع وسائل التواصل.",
                    heroSubtitleEn: "Whether you have an inquiry about our products, wholesale orders, or need custom designs for your restaurant supplies, our expert team is ready to fully support you.",
                    formTitleAr: "أرسل لنا رسالة مباشرة",
                    formTitleEn: "Send us a direct message",
                    formSubtitleAr: "يرجى تعبئة النموذج أدناه وسيقوم أحد ممثلي المبيعات أو الدعم الفني بالرد عليك في غضون 24 ساعة كحد أقصى.",
                    formSubtitleEn: "Please fill out the form below and one of our sales or technical support representatives will get back to you within 24 hours.",
                    submitBtnAr: "إرسال الرسالة الآن",
                    submitBtnEn: "Send Message Now",
                    whatsapp: "+20 123 456 789",
                    phone: "+20 123 456 789",
                    email: "hello@mymenueg.com",
                    addressAr: "القاهرة، مصر - شارع التسعين",
                    addressEn: "90th St, Cairo, Egypt",
                    workingHoursAr: "الأحد - الخميس: 9:00 AM - 6:00 PM | السبت: 10:00 AM - 4:00 PM",
                    workingHoursEn: "Sun - Thu: 9:00 AM - 6:00 PM | Sat: 10:00 AM - 4:00 PM"
                }),
                faq_settings: JSON.stringify({
                    enabled: true,
                    items: [
                        {
                            qAr: 'كيف يمكنني تتبع طلبي؟',
                            qEn: 'How can I track my order?',
                            aAr: 'يمكنك تتبع طلبك من خلال صفحة "تتبع الطلبات" باستخدام رقم الطلب الخاص بك والذي يظهر لك بعد إتمام الشراء.',
                            aEn: 'You can track your order through the "Track Order" page using your order number provided after purchase.'
                        },
                        {
                            qAr: 'هل الدفع عند الاستلام متوفر؟',
                            qEn: 'Is Cash on Delivery (COD) available?',
                            aAr: 'نعم، نحن نوفر خدمة الدفع عند الاستلام كخيار أساسي ومجاني لجميع المحافظات.',
                            aEn: 'Yes, Cash on Delivery is available as a primary and free option for all governorates.'
                        }
                    ]
                }),
                notfound_settings: JSON.stringify({
                    titleAr: 'أوبس! صفحة مفقودة',
                    titleEn: 'Oops! Page Missing',
                    descAr: 'يبدو أن الصفحة التي تبحث عنها غير موجودة، ربما تم تغيير الرابط أو إزالتها.',
                    descEn: 'It looks like the page you are looking for doesn\'t exist, it might have been moved or removed.'
                }),
                popup_settings: JSON.stringify({
                    enabled: false,
                    titleAr: "خصم خاص!",
                    titleEn: "Special Offer!",
                    descAr: "اشترك في نشرتنا الإخبارية واحصل على خصم 10%",
                    descEn: "Subscribe to our newsletter and get 10% off",
                    imageUrl: "",
                    actionLink: "/products",
                    actionTextAr: "تسوق الآن",
                    actionTextEn: "Shop Now",
                    delaySeconds: 5
                }),
                payment_settings: JSON.stringify({
                    onlinePaymentEnabled: false,
                    cod: true,
                    paymob: false,
                    fawry: false,
                    wallet: false,
                    paymobApiKey: '',
                    paymobIntegrationId: '',
                    fawryMerchantCode: '',
                    fawrySecurityKey: ''
                }),
                shipping_settings: JSON.stringify({
                    freeShippingEnabled: true,
                    freeShippingMinOrder: 0,
                    flatRateShipping: 0,
                    governorateRates: {}
                }),
                google_login_enabled: 'false',
                google_client_id: '',
                hideEmptySlider: 'false'
            };
            const finalSettings = { ...defaults, ...settings };
            // SECURITY: Strip secrets for non-admin requests or by default
            const secrets = [
                'paymobApiKey', 'paymobIntegrationId', 'paymob_api_key', 'paymob_integration_id',
                'fawryMerchantCode', 'fawrySecurityKey', 'fawry_merchant_code', 'fawry_security_key',
                'github_token', 'githubToken',
                'smtp_password', 'smtp_user', 'mail_password'
            ];
            // We also need to look inside JSON strings
            if (finalSettings.payment_settings) {
                try {
                    const pay = JSON.parse(finalSettings.payment_settings);
                    secrets.forEach(s => delete pay[s]);
                    finalSettings.payment_settings = JSON.stringify(pay);
                }
                catch (error) {
                    console.warn('Failed to sanitize payment_settings JSON', error);
                }
            }
            secrets.forEach(s => delete finalSettings[s]);
            return JSON.stringify(finalSettings);
        }, 180, 900);
        res.json(JSON.parse(payload));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};
export const updateSettings = async (req, res) => {
    try {
        const input = req.body;
        // Keys that contain image URLs (direct or inside JSON)
        const IMAGE_KEYS = ['logo_url'];
        const JSON_IMAGE_KEYS = ['popup_settings', 'loading_screen_settings'];
        // Remove old images when they change
        for (const key of IMAGE_KEYS) {
            if (input[key] !== undefined) {
                const old = await prisma.settings.findUnique({ where: { key_name: key } });
                if (old?.value && old.value !== String(input[key]) && old.value.startsWith('/uploads/')) {
                    removeFile(old.value);
                }
            }
        }
        for (const key of JSON_IMAGE_KEYS) {
            if (input[key] !== undefined) {
                const old = await prisma.settings.findUnique({ where: { key_name: key } });
                if (old?.value) {
                    try {
                        const oldData = JSON.parse(old.value);
                        const newData = JSON.parse(String(input[key]));
                        if (oldData.imageUrl && oldData.imageUrl !== newData.imageUrl && oldData.imageUrl.startsWith('/uploads/')) {
                            removeFile(oldData.imageUrl);
                        }
                    }
                    catch { /* not JSON or parse error, skip */ }
                }
            }
        }
        // Batch upsert using transaction
        await prisma.$transaction(Object.entries(input).map(([key, val]) => prisma.settings.upsert({
            where: { key_name: key },
            create: { key_name: key, value: String(val) },
            update: { value: String(val) }
        })));
        await cacheInvalidateScope('settings');
        await logAudit('update_settings', req.user?.username || 'system', `Updated ${Object.keys(input).length} setting keys`);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
