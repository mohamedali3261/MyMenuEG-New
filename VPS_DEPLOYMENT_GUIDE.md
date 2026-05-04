# دليل رفع المشروع على VPS

## 📋 متطلبات VPS

- Ubuntu 20.04 أو أحدث
- Node.js 18+ و npm
- MySQL 8.0+
- PM2 (لإدارة العمليات)
- Nginx (كـ Reverse Proxy)
- Redis (اختياري - للكاش)

---

## 🗂️ بنية المشروع

```
mymenueg/
├── backend/
│   └── server/          # Backend API (Express + TypeScript)
│       ├── src/         # كود المصدر
│       ├── prisma/      # Database schema & migrations
│       ├── .env         # متغيرات البيئة (لا ترفعه على Git)
│       └── .env.example # مثال لمتغيرات البيئة
├── frontend/            # Frontend (React + Vite)
│   ├── src/            # كود المصدر
│   ├── public/         # ملفات ثابتة
│   └── dist/           # ملفات البناء (بعد npm run build)
├── uploads/            # ملفات المستخدمين المرفوعة
├── backups/            # نسخ احتياطية للقاعدة
└── package.json        # Dependencies الرئيسية
```

---

## 🚀 خطوات الرفع على VPS

### 1️⃣ تحديث النظام وتثبيت المتطلبات

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# تثبيت PM2
sudo npm install -g pm2

# تثبيت Nginx
sudo apt install -y nginx

# تثبيت Redis (اختياري)
sudo apt install -y redis-server
```

### 2️⃣ إنشاء قاعدة البيانات

```bash
# الدخول إلى MySQL
sudo mysql -u root -p

# إنشاء قاعدة البيانات والمستخدم
CREATE DATABASE mymenueg_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mymenueg_user'@'localhost' IDENTIFIED BY 'كلمة_سر_قوية';
GRANT ALL PRIVILEGES ON mymenueg_db.* TO 'mymenueg_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3️⃣ رفع المشروع على VPS

```bash
# إنشاء مجلد للمشروع
sudo mkdir -p /var/www/mymenueg
sudo chown -R $USER:$USER /var/www/mymenueg
cd /var/www/mymenueg

# استنساخ المشروع من GitHub
git clone https://github.com/mohamedali3261/MyMenuEG-New.git .

# تثبيت Dependencies
npm install
```

### 4️⃣ إعداد ملف البيئة (.env)

```bash
# نسخ ملف المثال
cp backend/server/.env.example backend/server/.env

# تعديل الملف
nano backend/server/.env
```

**محتوى ملف .env للإنتاج:**

```env
# Server
PORT=5000
NODE_ENV=production

# JWT Secrets (استخدم أسرار قوية!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-here
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
CUSTOMER_ACCESS_TOKEN_TTL=12h

# Database
DATABASE_URL=mysql://mymenueg_user:كلمة_السر@localhost:3306/mymenueg_db

# CORS (ضع دومين موقعك)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Cloudinary (للصور)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (اختياري)
REDIS_URL=redis://localhost:6379

# Email (اختياري)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Payment (اختياري)
PAYMOB_API_KEY=your-paymob-key
PAYMOB_INTEGRATION_ID=123
PAYMOB_IFRAME_ID=123
PAYMOB_HMAC_SECRET=your-hmac-secret
```

### 5️⃣ تشغيل Migrations وبناء المشروع

```bash
# تشغيل Prisma migrations
cd backend/server
npx prisma migrate deploy
npx prisma generate

# العودة للمجلد الرئيسي
cd ../..

# بناء المشروع
npm run build
```

### 6️⃣ إعداد PM2 لتشغيل Backend

```bash
# إنشاء ملف ecosystem.config.js
nano ecosystem.config.js
```

**محتوى ecosystem.config.js:**

```javascript
module.exports = {
  apps: [
    {
      name: 'mymenueg-backend',
      script: 'tsx',
      args: 'backend/server/src/index.ts',
      cwd: '/var/www/mymenueg',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
```

```bash
# تشغيل Backend بـ PM2
pm2 start ecosystem.config.js

# حفظ التكوين
pm2 save

# تشغيل PM2 عند بدء النظام
pm2 startup
```

### 7️⃣ إعداد Nginx

```bash
# إنشاء ملف تكوين Nginx
sudo nano /etc/nginx/sites-available/mymenueg
```

**محتوى ملف Nginx:**

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/mymenueg/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Uploads folder
    location /uploads {
        alias /var/www/mymenueg/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/mymenueg /etc/nginx/sites-enabled/

# اختبار التكوين
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx
```

### 8️⃣ تثبيت SSL (HTTPS)

```bash
# تثبيت Certbot
sudo apt install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# تجديد تلقائي
sudo certbot renew --dry-run
```

### 9️⃣ إعداد Firewall

```bash
# السماح بـ HTTP و HTTPS و SSH
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 🔄 تحديث المشروع

```bash
cd /var/www/mymenueg

# سحب آخر التحديثات
git pull origin main

# تثبيت Dependencies الجديدة
npm install

# تشغيل Migrations الجديدة
cd backend/server
npx prisma migrate deploy
npx prisma generate
cd ../..

# بناء المشروع
npm run build

# إعادة تشغيل Backend
pm2 restart mymenueg-backend
```

---

## 📊 مراقبة المشروع

```bash
# عرض حالة العمليات
pm2 status

# عرض Logs
pm2 logs mymenueg-backend

# عرض استهلاك الموارد
pm2 monit

# إعادة تشغيل
pm2 restart mymenueg-backend

# إيقاف
pm2 stop mymenueg-backend
```

---

## 🔐 أمان إضافي

### 1. حماية ملف .env

```bash
chmod 600 backend/server/.env
```

### 2. إنشاء مستخدم خاص للتطبيق

```bash
sudo useradd -r -s /bin/false mymenueg
sudo chown -R mymenueg:mymenueg /var/www/mymenueg
```

### 3. تفعيل Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📦 النسخ الاحتياطي

### نسخ احتياطي للقاعدة

```bash
# إنشاء نسخة احتياطية
mysqldump -u mymenueg_user -p mymenueg_db > backup_$(date +%Y%m%d).sql

# استعادة نسخة احتياطية
mysql -u mymenueg_user -p mymenueg_db < backup_20260504.sql
```

### نسخ احتياطي للملفات

```bash
# نسخ مجلد uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة: Backend لا يعمل

```bash
# تحقق من Logs
pm2 logs mymenueg-backend

# تحقق من المنفذ
sudo netstat -tulpn | grep 5000

# إعادة التشغيل
pm2 restart mymenueg-backend
```

### المشكلة: Database connection error

```bash
# تحقق من MySQL
sudo systemctl status mysql

# تحقق من الاتصال
mysql -u mymenueg_user -p -h localhost mymenueg_db
```

### المشكلة: Nginx error

```bash
# تحقق من Logs
sudo tail -f /var/log/nginx/error.log

# اختبار التكوين
sudo nginx -t

# إعادة التشغيل
sudo systemctl restart nginx
```

---

## 📞 الدعم

للمساعدة أو الاستفسارات:
- GitHub: https://github.com/mohamedali3261/MyMenuEG-New
- Issues: https://github.com/mohamedali3261/MyMenuEG-New/issues

---

## ✅ Checklist قبل الإطلاق

- [ ] تم تغيير JWT_SECRET و JWT_REFRESH_SECRET
- [ ] تم إعداد قاعدة البيانات بشكل صحيح
- [ ] تم تشغيل جميع Migrations
- [ ] تم إعداد Cloudinary للصور
- [ ] تم تكوين CORS بشكل صحيح
- [ ] تم تثبيت SSL Certificate
- [ ] تم إعداد Firewall
- [ ] تم اختبار جميع الوظائف الأساسية
- [ ] تم إعداد النسخ الاحتياطي التلقائي
- [ ] تم تكوين PM2 للتشغيل التلقائي

---

**ملاحظة:** تأكد من تغيير جميع القيم الافتراضية (مثل الأسرار والدومينات) قبل الإطلاق!
