import { defineConfig } from 'vite';
import RubyPlugin from 'vite-plugin-ruby';

export default defineConfig({
    plugins: [
    RubyPlugin(),
    ],
    build: {
    rollupOptions: {
        input: {
        application: 'app/frontend/entrypoints/application.js',
        styles: 'app/frontend/entrypoints/styles.scss', // Add your SCSS entrypoint here
        },
    },
    },
});