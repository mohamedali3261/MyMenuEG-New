# 📘 الدليل الشامل لرفع المواقع البرمجية (Full-Stack Deployment Guide)

هذا الدليل هو مرجع عام يشرح كيفية رفع أي موقع مكون من (React + Node.js + PostgreSQL) على منصة Vercel بشكل احترافي.

---

## 🔗 المواقع والأدوات المستخدمة (Necessary Tools)
1.  **[GitHub](https://github.com):** لرفع وحفظ الكود المصدري وربطه بالاستضافة.
2.  **[Vercel](https://vercel.com):** المنصة الأساسية لاستضافة الموقع (Frontend + Backend).
3.  **[Neon.tech](https://neon.tech):** لإنشاء قاعدة بيانات PostgreSQL سحابية مجانية.
4.  **[Cloudinary](https://cloudinary.com):** لتخزين الصور سحابياً (بدلاً من Storage السيرفر).

---

## 1️⃣ المرحلة الأولى: تهيئة قاعدة البيانات (Database Context)
في المواقع السحابية، نحتاج لاتصال مشفر وقوي:
*   **DATABASE_URL:** احصل على رابط الاتصال من Neon (يبدأ بـ `postgresql://`).
*   **SSL:** تأكد من إضافة إعداد التشفير في كود الاتصال (Pool/Client) لضمان قبول الاتصال من Vercel:
    ```javascript
    ssl: { rejectUnauthorized: false }
    ```
*   **Permissions:** استخدم دائماً المستخدم الرئيسي (Owner) لضمان صلاحية إنشاء الجداول (Tables).

---

## 2️⃣ المرحلة الثانية: تحويل السيرفر إلى Serverless
لأن Vercel يشغل الكود كـ "وظيفة" (Function) وليس سيرفر دائم:
1.  **إنشاء مجلد api:** في المجلد الرئيسي للمشروع، أنشئ ملف `api/index.js`.
2.  **الربط:** اجعل هذا الملف يستورد تطبيق Express الخاص بك:
    ```javascript
    import app from '../server/index.js'; // مسار ملف السيرفر الرئيسي
    export default app;
    ```
3.  **التصدير:** في ملف السيرفر الأصلي، تأكد من عمل `export default app` في النهاية.

---

## 3️⃣ المرحلة الثالثة: إعدادات التوجيه (Routing)
أنشئ ملف **`vercel.json`** في المجلد الرئيسي لتوجيه الطلبات:
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
*   **فائدته:** يضمن أن أي طلب لـ `/api` يذهب للسيرفر، وأي طلب صفحات يذهب لواجهة الـ React.

---

## 4️⃣ المرحلة الرابعة: التخزين السحابي للصور (Cloud Storage)
بما أن الاستضافات السحابية تمسح الملفات المحلية عند إعادة التشغيل:
1.  **Cloudinary Helper:** أنشئ ملف مساعد للرفع واستخدم مكتبة `cloudinary`.
2.  **API Upload:** اجعل الـ Endpoint الخاص بالرفع يرسل الصورة لـ Cloudinary ويخزن الرابط (URL) العائد في قاعدة البيانات.

---

## 5️⃣ المرحلة الخامسة: تهيئة الواجهة (Frontend Adaptation)
*   **API Path:** اجعل الـ `baseURL` في Axios هو `/api` فقط.
*   **Vite Proxy:** أضف هذا الجزء في `vite.config.ts` ليعمل الموقع محلياً بشكل صحيح:
    ```javascript
    server: {
      proxy: { '/api': 'http://localhost:5000' } // منفذ السيرفر المحلي
    }
    ```

---

## 6️⃣ المرحلة السادسة: الرفع وكلمات السر (Environment Variables)
بعد ربط GitHub بـ Vercel، أضف هذه القيم في **Environment Variables**:
*   `DATABASE_URL`: رابط قاعدة البيانات السحابية.
*   `CLOUDINARY_CLOUD_NAME`: اسم السحابة.
*   `CLOUDINARY_API_KEY`: مفتاح الـ API.
*   `CLOUDINARY_API_SECRET`: السر البرمجي.
*   `NODE_ENV`: قيمتها `production`.

---

## 💡 نصيحة ذهبية:
قبل ضغط زر **Deploy**، تأكد دائماً أن ملف **`.gitignore`** يحتوي على `.env` لكي لا ترفع كلمات سرك للعامة!

**تم بحمد الله. بالتوفيق في مشروعك القادم!** 🚀
