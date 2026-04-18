# خطة نشر MyMenuEG على VPS Ubuntu بـ Docker + Nginx

## 🏗️ المعمارية المقترحة

```
Internet
   │
   ▼
[Nginx Container :80/:443]  ← SSL + Static Frontend
   ├── /            → Serves React dist (static files)
   ├── /api/*       → Proxy → [Backend Container :5000]
   └── /uploads/*   → Proxy → [Backend Container :5000]

[Backend Container :5000]   ← Node.js Express
   └── connects to → [MySQL Container :3306]
```

## 📁 الملفات اللي هتتنشئ

```
mymenueg/
├── docker-compose.yml          ← النواة - يشغل كل حاجة
├── nginx/
│   └── default.conf            ← إعدادات Nginx
├── backend/
│   └── Dockerfile              ← Build صورة الـ Backend
├── frontend/
│   └── Dockerfile              ← Build صورة الـ Frontend
└── .env.production             ← متغيرات البيئة (لا تُرفع على Git)
```

## 📋 المتطلبات على الـ VPS

| المتطلب | التفاصيل |
|---|---|
| نظام التشغيل | Ubuntu 22.04+ |
| الحد الأدنى RAM | 2GB (يُفضل 4GB) |
| المساحة | 20GB+ |
| Docker | 24.0+ |
| Docker Compose | 2.0+ |
| Domain | اختياري للـ SSL |

## 🚀 خطوات النشر على الـ VPS

### 1. تثبيت Docker على Ubuntu
```bash
# تحديث الحزم
sudo apt update && sudo apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com | sh

# إضافة المستخدم لـ docker group
sudo usermod -aG docker $USER
newgrp docker

# التحقق
docker --version
docker compose version
```

### 2. رفع الكود على الـ VPS
```bash
# Option A: عبر Git
git clone https://github.com/YOUR_REPO/mymenueg.git
cd mymenueg

# Option B: عبر SCP (من Windows)
scp -r "E:\All-Website\packet\mymenueg" user@YOUR_VPS_IP:/home/user/mymenueg
```

### 3. إنشاء ملف البيئة
```bash
cd mymenueg
cp backend/server/.env.example backend/server/.env

# تعديل الملف بالقيم الحقيقية
nano backend/server/.env
```

### 4. تشغيل المشروع
```bash
# Build + تشغيل كل شيء
docker compose up -d --build

# مشاهدة الـ logs
docker compose logs -f

# التحقق من الصحة
docker compose ps
```

### 5. إعداد SSL مجاني (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## ⚠️ ملاحظات مهمة

> [!IMPORTANT]
> يجب إنشاء ملف `backend/server/.env` يدوياً على الـ VPS ولا ترفعه على Git أبداً.

> [!WARNING]
> بعد أول تشغيل، يجب تشغيل Prisma migrations:
> ```bash
> docker compose exec backend npx prisma db push
> ```

> [!TIP]
> للتحديث بعد تغييرات الكود:
> ```bash
> git pull
> docker compose up -d --build
> ```

## 🔄 أوامر مفيدة

```bash
docker compose up -d --build     # تشغيل + build
docker compose down               # إيقاف كل شيء
docker compose logs backend -f    # logs الـ backend
docker compose logs nginx -f      # logs الـ nginx
docker compose exec backend sh    # دخول shell الـ backend
docker compose restart backend    # إعادة تشغيل خدمة واحدة
```
