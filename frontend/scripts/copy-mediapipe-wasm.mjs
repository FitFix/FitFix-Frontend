// Copies MediaPipe's WebAssembly runtime from node_modules into public/ so the
// app serves it from its own origin (no third-party CDN at runtime, cached by
// Vercel's edge). Runs automatically before `npm run dev` and `npm run build`.
// The copied files are build output and are git-ignored.
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
const dest = join(root, 'public', 'mediapipe', 'wasm');

if (!existsSync(src)) {
  console.error('[mediapipe] @mediapipe/tasks-vision is not installed — run npm install first.');
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
// FilesetResolver picks the SIMD build when supported, else the no-SIMD one.
const wanted = readdirSync(src).filter((f) => /^vision_wasm(_nosimd)?_internal\.(js|wasm)$/.test(f));
for (const file of wanted) cpSync(join(src, file), join(dest, file));
console.log(`[mediapipe] copied ${wanted.length} wasm runtime files to public/mediapipe/wasm`);
