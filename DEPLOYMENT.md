# 🚀 الدليل الشامل والمفصل لرفع MyMenuEG على VPS (Ubuntu)

هذا الدليل مكتوب بـ "التفصيل الممل" خطوة بخطوة، من لحظة استلامك لبيانات سيرفر الـ VPS وحتى يعمل الموقع بالكامل ويكون متصلاً بالدومين (النطاق) الخاص بك مع استخراج شهادة أمان (SSL) آمنة.

---

## 🛑 المرحلة الأولى: تجهيز سيرفر الـ VPS

بمجرد شرائك للسيرفر (سواء من DigitalOcean، Hostinger، Contabo، أو غيرهم)، ستحصل على **IP Address** وكلمة مرور للمستخدم `root`.

### 1. الدخول على السيرفر (SSH)
افتح الـ Terminal (أو موجه الأوامر CMD / PowerShell) في جهازك الشخصي واكتب:
```bash
ssh root@YOUR_VPS_IP
```
استبدل `YOUR_VPS_IP` برقم الـ IP الخاص بالسيرفر. سيطلب منك كلمة المرور، قم بإدخالها (ملاحظة: لن تظهر حروف كلمة المرور وأنت تكتب، هذا طبيعي).

### 2. تحديث نظام التشغيل
أول خطوة دائماً على أي سيرفر جديد هي التأكد من أن جميع الحزم محدّثة.
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. تثبيت Docker و Docker Compose
نحتاج إلى Docker لتشغيل المشروع بسهولة داخل حاويات (Containers). قم بتشغيل هذا الأمر لتحميل الـ Script الرسمي وتثبيته:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

بعد التثبيت، تأكد من أن Docker يعمل:
```bash
sudo systemctl enable docker
sudo systemctl start docker
docker --version
```

تأكد من وجود ميزة Compose (المسؤولة عن ملف docker-compose.yml):
```bash
docker compose version
```

---

## 📥 المرحلة الثانية: نقل المشروع إلى السيرفر

يجب الآن جلب الكود من GitHub إلى الـ VPS.

### 1. تثبيت Git
```bash
sudo apt install git -y
```

### 2. نسخ المستودع (Clone)
قم بإنشاء مجلد لمشاريعك (اختياري) وانسخ الكود إليه:
```bash
cd ~
git clone https://github.com/mohamedali3261/MyMenuEG-New.git
cd MyMenuEG-New
```
*ملاحظة: إذا كان المستودع Private (خاص)، سيطلب منك اسم المستخدم وكلمة المرور (والتي أصبحت الآن عبارة عن Personal Access Token من Github).*

---

## ⚙️ المرحلة الثالثة: إعداد ملفات البيئة (`.env`)

يجب إعداد المتغيرات السرية المطلوبة لعمل قاعدة البيانات والسيرفر. 

### 1. إنشاء ملف البيئة
تذكر أن ملف `.env` لا يُرفع على GitHub لأسباب أمنية. لذلك سنقوم بنسخ الملف التجريبي وتعديله:
```bash
cd backend/server
cp .env.example .env
```

### 2. تعديل بيانات الـ `.env`
افتح الملف بمحرر النصوص `nano`:
```bash
nano .env
```

الآن يجب عليك كتابة البيانات بعناية شديدة. إليك ما يجب أن يبدو عليه الملف (بالأخص قسم قاعدة البيانات):

```env
# Server Port (سيقوم Docker بتشغيله على هذا البورت داخلياً)
PORT=5000

# Environment
NODE_ENV=production

# JWT Tokens
JWT_SECRET=super_secret_jwt_key_please_change_me_to_32_chars_or_more
JWT_REFRESH_SECRET=super_secret_refresh_key_please_change_me_to_32_chars_or_more
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# Database Configuration
# هام جداً: في الـ Docker، سنسمي الهوست "mysql" بدل localhost
DATABASE_URL=mysql://mymenueg_user:mymenueg_password@mysql:3306/mymenueg_db

# (أدخل بيانات Cloudinary الخاصة بك هنا لرفع الصور)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
# ضع فيها الدومين الخاص بك
CORS_ORIGIN=https://mymenueg.com,https://www.mymenueg.com
```
*للحفظ في Nano: اضغط `CTRL + X` ثم `Y` ثم انتر.*

### 3. إعداد متغيرات قاعدة البيانات لـ Docker
ارجع للمجلد الرئيسي للمشروع:
```bash
cd ~/MyMenuEG-New
```
افتح ملف `.env` آخر خاص بالـ `docker-compose` لإنشاء قاعدة البيانات الأساسية:
```bash
nano .env
```
أضف فيه هذه الأسطر فقط:
```env
MYSQL_ROOT_PASSWORD=strong_root_password_123
MYSQL_DATABASE=mymenueg_db
MYSQL_USER=mymenueg_user
MYSQL_PASSWORD=mymenueg_password
```
*(هذه البيانات يجب أن تتطابق مع الـ DATABASE_URL الذي وضعته في الأعلى).*

---

## 🚢 المرحلة الرابعة: تشغيل المشروع (Build & Up)

الآن حان وقت سحر الـ Docker لدمج الـ React والـ Node.js والـ MySQL والـ Nginx.

تأكد أنك في مجلد المشروع `~/MyMenuEG-New` ثم نفذ:
```bash
docker compose up -d --build
```
*(ستأخذ هذه العملية دقائق معدودة لأنها ستقوم بتنزيل بيئة Node.js وبناء مشروع React وتحميل MySQL).*

للتأكد من أن كل الحاويات (Containers) تعمل:
```bash
docker compose ps
```
يجب أن تجد 4 حاويات، جميعها في حالة **Up** وتعمل.

---

## 🗄️ المرحلة الخامسة: بناء جداول قاعدة البيانات (Prisma)

على الرغم من تشغيل السيرفرات، قاعدة بيانات MySQL الآن فارغة ويجب إنشاء الجداول بداخلها بناءً على ملف Schema الخاص بك.

نفذ هذا الأمر الصغير للدخول للحاوية الخاصة بالسيرفر وتشغيل بناء الجداول:
```bash
docker compose exec backend npx prisma db push
```
- سيرد عليك بأنه تم الاتصال بنجاح وتم إنشاء الجداول (Created database schema).

### إنشاء حساب الأدمن الأول
لأن الموقع جديد، ستحتاج لإنشاء حساب المدير. في الغالب أنت أنشأت Seed أو Controller خاص به. يمكنك الدخول للموقع لاحقاً وإنشاء الحساب.

---

## 🌐 المرحلة السادسة: ربط الدومين (DNS)

لكي تتمكن من تشغيل الـ SSL والموقع بشكل رسمي، يجب الدخول إلى موقع حجز الدومين الخاص بك (مثل Namecheap, GoDaddy، الخ).

1. ادخل لإعدادات الـ DNS (أو Zone Editor).
2. قم بإنشاء سجل **A Record**:
   - الـ Host: `@`
   - الـ Value: ضع عنوان الـ IP الخاص بالـ VPS الخاص بك.
3. قم بإنشاء سجل **A Record** آخر:
   - الـ Host: `www`
   - الـ Value: ضع عنوان الـ IP الخاص بالـ VPS الخاص بك.

*قد يستغرق الربط من بضعة دقائق إلى ساعات قليلة ليتعرف عليه الإنترنت.*

---

## 🔒 المرحلة السابعة: تأمين الموقع بـ HTTPS (SSL مجاني)

بما أننا نستخدم Nginx داخل Docker كـ Reverse Proxy، ولتسهيل الأمر على النظام، سنقوم بتثبيت Certbot على سيرفر الـ Ubuntu وتمرير الـ SSL للحاوية. 

ولكن، أسهل طريقة بما أن النظام مغلف في Docker هي استخدام سيرفر Nginx الموجود على الـ Host. لإتمام ذلك:

### 1. إيقاف الـ Ports في Docker
بما أننا سنستخدم Nginx الأساسي لينظم مرور الإنترنت:
في ملف `docker-compose.yml` قم بحذف الجزء التالي الخاص بالـ ports للـ nginx الداخلي أو بدّل البورت إلى 8080:
```bash
nano docker-compose.yml
```
في قسم الـ `nginx`:
```yaml
    ports:
      - "8080:80"   # غيرها لتصبح هكذا
```
ثم قم بعمل إعادة تشغيل:
```bash
docker compose down
docker compose up -d
```

### 2. تثبيت Nginx أساسي على Ubuntu للحماية
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

### 3. إعداد موقع الويب في Nginx
```bash
sudo nano /etc/nginx/sites-available/mymenueg
```
ضع داخله:
```nginx
server {
    listen 80;
    server_name mymenueg.com www.mymenueg.com;  # استبدل بالدومين الخاص بك

    location / {
        proxy_pass http://127.0.0.1:8080; # هذا يرسل الزيارات لـ Nginx الذي بالـ Docker
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
ثم فعّله:
```bash
sudo ln -s /etc/nginx/sites-available/mymenueg /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. تسطيب شهادة SSL (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d mymenueg.com -d www.mymenueg.com
```
سيقوم الـ Certbot بسؤالك عن إيميلك والموافقة على الشروط. وبعدها سيضيف الـ HTTPS تلقائياً!

---

## 🛠️ كيفية التحديث عند رفع كود جديد لـ Github

أنت الآن طورت الموقع وتقوم برفع تحديثات جديدة عبر Git، كيف تنقلها للـ VPS؟

بمنتهى البساطة عند الدخول للـ VPS:
```bash
cd ~/MyMenuEG-New
git pull origin main
```
إذا كان التعديل في قاعدة البيانات (Prisma Schema):
```bash
docker compose up -d --build
docker compose exec backend npx prisma db push
```
إذا كان التعديل فقط في الكود (Frontend أو Backend):
```bash
docker compose up -d --build
```

---

## 🚑 استكشاف الأخطاء الشائعة (Troubleshooting)

- **كيف أرى الأخطاء في الباك اند؟**
  ```bash
  docker compose logs backend -f
  ```
  هذا سيعرض كل ما يحدث في الـ Console الخاص بالباك اند مباشرة.

- **كيف أدخل داخل سيرفر الـ Database لأتأكد من شيء؟**
  ```bash
  docker compose exec mysql mysql -u root -p
  ```

- **قاعدة البيانات لا تتصل بالسيرفر Backend؟**
  تأكد أن `DATABASE_URL` في الـ `.env` الخاص بالباك اند يحتوي على كلمة `mysql` بدلاً من `localhost`. هكذا: `mysql://USER:PASS@mysql:3306/DB`

- **المساحة امتلأت على السيرفر بسبب صور الـ Docker؟**
  يمكنك تنظيف الحاويات والصور القديمة بواسطة هذا الأمر:
  ```bash
  docker system prune -af
  ```

🎉 **الآن مشروحك مجهز تماماً ويعمل على Production بأمان ومرونة كاملة وبأعلى معايير الـ DevOps.**
