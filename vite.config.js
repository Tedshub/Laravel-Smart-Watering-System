import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        host: '192.168.1.3',       // Ganti dengan IP lokal kamu jika berubah
        port: 5173,                // Port default Vite
        strictPort: true,          // Hindari pindah port otomatis
        cors: true,                // Izinkan akses lintas origin
    },
    plugins: [
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
});
