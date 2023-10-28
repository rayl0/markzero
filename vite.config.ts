import { sveltekit } from '@sveltejs/kit/vite';
import Icons from "unplugin-icons/vite";
import { defineConfig } from 'vite';
import path from 'path';
import { createRequire } from 'module';

const { resolve } = createRequire(import.meta.url)
const prismaClient = `prisma${path.sep}client`
const prismaClientIndexBrowser = resolve('@prisma/client/index-browser').replace(`@${prismaClient}`, `.${prismaClient}`)

export default defineConfig({
  plugins: [sveltekit(), Icons({ compiler: "svelte", scale: 1.5 })],
  resolve: { alias: { '.prisma/client/index-browser': path.relative(__dirname, prismaClientIndexBrowser) } },
});
