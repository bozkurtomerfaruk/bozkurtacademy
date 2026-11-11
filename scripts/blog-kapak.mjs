// Blog kapak görseli: images/blog/<slug>/kapak.svg (1200×630) → kapak-{480,800,1200}.{webp,jpg}
// Kullanım: node scripts/blog-kapak.mjs <slug> [<slug> …]   (hepsi için: node scripts/blog-kapak.mjs --all)
// Site fontları (fonts/*.woff2) gömülür; WebP ve JPEG, tarayıcının canvas kodlayıcısıyla üretilir. AVIF üretilmez.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Playwright genel kurulumdan da bulunsun (NODE_PATH) diye require ile yüklenir.
const { chromium } = createRequire(import.meta.url)('playwright');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'images/blog');
const args = process.argv.slice(2);
const slugs = args.includes('--all') ? fs.readdirSync(dir).filter(d => fs.existsSync(path.join(dir, d, 'kapak.svg'))) : args;
if (!slugs.length) { console.error('Kullanım: node scripts/blog-kapak.mjs <slug> | --all'); process.exit(1); }

const font = n => fs.readFileSync(path.join(root, 'fonts', n)).toString('base64');
const css = `@font-face{font-family:"Albert Sans";src:url(data:font/woff2;base64,${font('albert-sans.woff2')}) format("woff2");font-weight:100 900}
@font-face{font-family:"STIX Two Text";src:url(data:font/woff2;base64,${font('stix-two-text.woff2')}) format("woff2");font-weight:400 700}
html,body{margin:0}`;
const LIMIT = 150 * 1024;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
let failed = false;
for (const slug of slugs) {
  const svgFile = path.join(dir, slug, 'kapak.svg');
  if (!fs.existsSync(svgFile)) { console.error(`Yok: ${path.relative(root, svgFile)}`); failed = true; continue; }
  await page.setContent(`<!doctype html><html lang="tr"><head><style>${css}</style></head><body>${fs.readFileSync(svgFile, 'utf8')}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  const png = (await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } })).toString('base64');
  const files = await page.evaluate(async (png) => {
    const img = new Image(); img.src = `data:image/png;base64,${png}`; await img.decode();
    const out = {};
    for (const w of [480, 800, 1200]) {
      const c = document.createElement('canvas'); c.width = w; c.height = Math.round(630 * w / 1200);
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
      out[`kapak-${w}.webp`] = c.toDataURL('image/webp', 0.8).split(',')[1];
      out[`kapak-${w}.jpg`] = c.toDataURL('image/jpeg', 0.82).split(',')[1];
    }
    return out;
  }, png);
  for (const [name, b64] of Object.entries(files)) {
    const buf = Buffer.from(b64, 'base64');
    fs.writeFileSync(path.join(dir, slug, name), buf);
    const kb = Math.round(buf.length / 1024);
    console.log(`${buf.length > LIMIT ? 'BÜYÜK' : 'ok   '} ${kb} KB  images/blog/${slug}/${name}`);
    if (buf.length > LIMIT) failed = true;
  }
}
await browser.close();
if (failed) { console.error('Bir veya daha fazla dosya eksik ya da 150 KB’tan büyük.'); process.exit(1); }
