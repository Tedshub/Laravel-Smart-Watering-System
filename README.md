<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.
# Laravel Smart Watering System

Sistem penyiraman pintar berbasis Laravel 12 dengan Inertia.js dan React.js untuk monitoring dan kontrol otomatis sistem irigasi tanaman.

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

## ✨ Fitur

- 🌱 Dashboard monitoring real-time
- 📊 Grafik data sensor kelembaban tanah
- ⏰ Penjadwalan penyiraman otomatis
- 🔔 Notifikasi sistem
- 📱 Responsive design untuk mobile dan desktop
- 🔐 Sistem autentikasi pengguna
- 📈 Laporan riwayat penyiraman
- ⚙️ Pengaturan threshold kelembaban

## 🔧 Prasyarat

Pastikan sistem Anda memiliki:

- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 18.x
- **NPM** atau **Yarn**
- **MySQL** >= 8.0 atau **PostgreSQL** >= 13
- **Git**

### Verifikasi Prasyarat

```bash
# Cek versi PHP
php --version

# Cek versi Composer
composer --version

# Cek versi Node.js
node --version

# Cek versi NPM
npm --version
```

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/Tedshub/Laravel-Smart-Watering-System.git
cd Laravel-Smart-Watering-System
```

### 2. Install Dependencies Backend

```bash
# Install dependencies PHP dengan Composer
composer install
```

### 3. Install Dependencies Frontend

```bash
# Install dependencies Node.js
npm install
# atau menggunakan yarn
yarn install
```

### 4. Setup Environment

```bash
# Copy file environment
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 5. Konfigurasi Database

Edit file `.env` dan sesuaikan konfigurasi database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smart_watering_db
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 6. Buat Database

```bash
# Buat database (MySQL)
mysql -u root -p -e "CREATE DATABASE smart_watering_db;"

# Atau menggunakan PostgreSQL
createdb smart_watering_db
```

### 7. Migrasi Database

```bash
# Jalankan migrasi database
php artisan migrate

# Jalankan seeder (opsional, untuk data dummy)
php artisan db:seed
```

## ⚙️ Konfigurasi

### Konfigurasi Tambahan di .env

```env
# Aplikasi
APP_NAME="Smart Watering System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Mail Configuration (untuk notifikasi)
MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls

# Pusher (untuk real-time updates)
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_key
PUSHER_APP_SECRET=your_pusher_secret
PUSHER_APP_CLUSTER=your_cluster

# Queue (untuk background jobs)
QUEUE_CONNECTION=database
```

### Konfigurasi Storage

```bash
# Buat symbolic link untuk storage
php artisan storage:link
```

## 🏃‍♂️ Menjalankan Aplikasi

### Development Mode

```bash
# Terminal 1: Jalankan server Laravel
php artisan serve

# Terminal 2: Compile dan watch frontend assets
npm run dev
# atau
yarn dev
```

### Production Build

```bash
# Build assets untuk production
npm run build
# atau
yarn build

# Jalankan dengan server web (Apache/Nginx)
```

### Background Services

```bash
# Jalankan queue worker (untuk background jobs)
php artisan queue:work

# Jalankan scheduler (untuk tugas terjadwal)
php artisan schedule:work
```

## 📁 Struktur Proyek

```
Laravel-Smart-Watering-System/
├── app/
│   ├── Http/Controllers/           # Controllers
│   ├── Models/                     # Eloquent Models
│   ├── Services/                   # Business Logic Services
│   └── Jobs/                       # Background Jobs
├── database/
│   ├── migrations/                 # Database Migrations
│   └── seeders/                    # Database Seeders
├── resources/
│   ├── js/
│   │   ├── Components/             # React Components
│   │   ├── Pages/                  # Inertia Pages
│   │   └── Layouts/                # Layout Components
│   └── css/                        # Stylesheets
├── routes/
│   ├── web.php                     # Web Routes
│   └── api.php                     # API Routes
├── public/                         # Public Assets
├── storage/                        # Storage Files
└── .env                            # Environment Configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/login` - Login pengguna
- `POST /api/register` - Registrasi pengguna
- `POST /api/logout` - Logout pengguna

### Dashboard
- `GET /api/dashboard` - Data dashboard
- `GET /api/sensor-data` - Data sensor real-time

### Watering System
- `GET /api/watering-schedules` - Daftar jadwal penyiraman
- `POST /api/watering-schedules` - Buat jadwal baru
- `PUT /api/watering-schedules/{id}` - Update jadwal
- `DELETE /api/watering-schedules/{id}` - Hapus jadwal
- `POST /api/manual-watering` - Penyiraman manual

### Reports
- `GET /api/reports/watering-history` - Riwayat penyiraman
- `GET /api/reports/sensor-data` - Data sensor historis

## 🛠️ Troubleshooting

### Error Umum dan Solusi

#### 1. "Class not found" Error
```bash
# Regenerate autoload files
composer dump-autoload
```

#### 2. Permission Error pada Storage
```bash
# Set permission untuk folder storage dan bootstrap/cache
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### 3. NPM/Node Error
```bash
# Clear npm cache
npm cache clean --force

# Hapus node_modules dan install ulang
rm -rf node_modules
npm install
```

#### 4. Database Connection Error
- Pastikan database server berjalan
- Periksa konfigurasi di file `.env`
- Pastikan database sudah dibuat

#### 5. Asset Not Loading
```bash
# Clear cache dan recompile assets
php artisan cache:clear
php artisan config:clear
php artisan view:clear
npm run dev
```

### Debug Mode

Untuk debugging, set `APP_DEBUG=true` di file `.env` dan jalankan:

```bash
# Lihat log aplikasi
php artisan log:clear
tail -f storage/logs/laravel.log
```

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

### Development Guidelines

- Ikuti PSR-12 coding standards untuk PHP
- Gunakan ESLint dan Prettier untuk JavaScript/React
- Tulis test untuk fitur baru
- Update dokumentasi jika diperlukan

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Periksa [Issues](https://github.com/Tedshub/Laravel-Smart-Watering-System/issues) yang sudah ada
2. Buat issue baru jika masalah belum pernah dilaporkan
3. Berikan detail lengkap tentang masalah yang dialami

## 🙏 Acknowledgments

- [Laravel](https://laravel.com/) - Framework PHP
- [Inertia.js](https://inertiajs.com/) - Modern monolith
- [React](https://reactjs.org/) - UI Library
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework

---

**Dibuat dengan ❤️ menggunakan Laravel, Inertia.js, dan React.js**
