// CaseForge AI brag video renderer
// Captures 30fps frames from GSAP composition via Playwright, assembles with ffmpeg
const { chromium, firefox } = require('playwright');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const COMPOSITION_DIR = __dirname + '/composition';
const FRAMES_DIR = __dirname + '/frames';
const OUTPUT_VIDEO = __dirname + '/brag.mp4';
const PORT = 8766;
const FPS = 30;
const DURATION = 22; // seconds
const TOTAL_FRAMES = Math.ceil(DURATION * FPS);
const WIDTH = 1280;
const HEIGHT = 720;

// Full AI message — pre-populated so seek shows correct text
const AI_TEXT = "Walk me through your structure for a profitability case.";

async function main() {
  // Setup frames directory
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR);

  // Start HTTP server
  const server = require('http').createServer((req, res) => {
    const filePath = path.join(COMPOSITION_DIR, req.url === '/' ? 'index.html' : req.url);
    try {
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filePath).slice(1);
      const mimeTypes = { html: 'text/html', js: 'application/javascript', css: 'text/css',
        mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', png: 'image/png' };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    } catch (e) {
      res.writeHead(404); res.end();
    }
  });
  await new Promise(r => server.listen(PORT, r));
  console.log(`Server running on http://localhost:${PORT}`);

  // Launch browser — try chromium first, fall back to firefox
  let browser, page;
  const launchOpts = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu',
           '--disable-dev-shm-usage', '--disable-web-security',
           '--autoplay-policy=no-user-gesture-required'],
    headless: true,
  };

  try {
    browser = await chromium.launch(launchOpts);
    page = await browser.newPage();
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 15000 });
    console.log('Using Chromium');
  } catch (e) {
    console.log('Chromium failed, trying Firefox:', e.message.split('\n')[0]);
    if (browser) await browser.close().catch(() => {});
    browser = await firefox.launch({ headless: true });
    page = await browser.newPage();
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 15000 });
    console.log('Using Firefox');
  }

  // Wait for fonts
  await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);

  // Bootstrap timeline without audio, pre-populate AI text
  await page.evaluate((aiText) => {
    document.getElementById('overlay').style.display = 'none';
    // Pre-populate the AI typed text so every seek shows full text
    document.getElementById('s4-typed').textContent = aiText;
    document.getElementById('s4-cursor').style.opacity = '0';
    // Also show the user + AI reply bubbles (they appear mid-scene)
    const music = document.getElementById('music');
    music.volume = 0;
    window._tl = buildTimeline(music);
    window._tl.pause();
  }, AI_TEXT);

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS}fps...`);
  const t0 = Date.now();

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const t = f / FPS;
    await page.evaluate((time) => { window._tl.seek(time); }, t);
    const framePath = path.join(FRAMES_DIR, `frame-${String(f).padStart(5, '0')}.png`);
    await page.screenshot({ path: framePath, type: 'png' });
    if (f % 30 === 0) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const eta = ((Date.now() - t0) / (f + 1) * (TOTAL_FRAMES - f) / 1000).toFixed(0);
      process.stdout.write(`\r  ${f}/${TOTAL_FRAMES} frames (${elapsed}s elapsed, ~${eta}s remaining)`);
    }
  }
  console.log(`\nCapture done. Encoding video...`);

  await browser.close();
  server.close();

  // Assemble with ffmpeg (spawnSync with arg array — no shell injection risk)
  const result = spawnSync('ffmpeg', [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(FRAMES_DIR, 'frame-%05d.png'),
    '-c:v', 'libx264',
    '-crf', '18',
    '-preset', 'slow',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    OUTPUT_VIDEO,
  ], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`ffmpeg exited ${result.status}`);

  console.log(`\nVideo: ${OUTPUT_VIDEO}`);

  // Clean up frames
  fs.rmSync(FRAMES_DIR, { recursive: true });
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
