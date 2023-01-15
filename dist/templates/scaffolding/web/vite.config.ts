import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import markdown, { Mode } from 'vite-plugin-markdown';

const path = require('path');
require('dotenv-flow').config();

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: 'inline',
    },
    plugins: [
        tsconfigPaths({
            loose: true,
        }),
        react(),
        svgrPlugin(),
        markdown({ mode: [Mode.REACT] }),
    ],
    define: {
        'process.env.MONO': process.env.MONO,
    },
    resolve: {
        alias: {},
    },
    server: {
        host: true,
        port: 3000,
    },
});
