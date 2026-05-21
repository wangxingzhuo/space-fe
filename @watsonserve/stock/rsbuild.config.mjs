import path from 'path';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginStylus } from '@rsbuild/plugin-stylus';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

export default defineConfig({
  html: {
    template: path.join(import.meta.dirname, 'public', 'index.html'),
  },
  output: {
    distPath: 'stock'
  },
  plugins: [pluginReact(), pluginStylus(), pluginNodePolyfill(), pluginSvgr({
    svgrOptions: {
      exportType: 'default',
    },
  })],
  alias: {
    '@': './src',
  },
  server: {
    port: 8088,
    // https://rsbuild.rs/zh/config/server/public-dir
    publicDir: { name: 'public', copyOnBuild: 'auto', watch: false },
    proxy: {
      '/api': {
        target: 'https://stock.watsonserve.com',
        secure: false,
        changeOrigin: true,
        headers: {
          Cookie: 'sess=st368fbfff4d383f105a7e88d07898cc4e'
        }
        // pathRewrite: { '^/api': '' },
      },
    }
  }
});
