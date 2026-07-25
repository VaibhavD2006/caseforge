// Frame-by-frame renderer: seeks GSAP timeline per frame, screenshots, assembles with ffmpeg
const { chromium, firefox } = require('playwright');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const FPS = 30;
const DURATION = 20; // seconds
const TOTAL_FRAMES = FPS * DURATION;
const FRAMES_DIR = path.join(__dirname, 'frames');
const SERVER_URL = 'http://localhost:8743/';

const INIT_TIMELINE = `
  gsap.set(['#r1','#r2','#r3','#r4','#r5'], { opacity: 0, y: 5 });
  gsap.set('#s4-feedback', { opacity: 0, y: 6 });
  gsap.set(['#st1','#st2','#st3','#st4'], { opacity: 0, y: 7 });
  const tl = gsap.timeline({ paused: true });
  gsap.set('#s1', { opacity: 1 });
  tl.from('#s1-line1', { opacity: 0, y: 26, duration: 0.38, ease: 'power3.out' }, 0.56)
    .from('#s1-line2', { opacity: 0, y: 26, duration: 0.38, ease: 'power3.out' }, 1.09)
    .from('#s1-badge', { opacity: 0, y: 12, duration: 0.3, ease: 'power2.out' }, 1.64)
    .to('#s1', { opacity: 0, duration: 0.3, ease: 'power2.inOut' }, 2.25)
    .fromTo('#s2', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.inOut' }, 2.25)
    .from('#s2-card', { x: 56, opacity: 0, duration: 0.45, ease: 'power3.out' }, 2.6)
    .fromTo('#s2-cursor', { opacity: 0, x: 340, y: 80 }, { opacity: 1, x: 190, y: 266, duration: 0.55, ease: 'power2.out' }, 4.65)
    .to('#s2-cta', { scale: 0.96, duration: 0.07 }, 5.22)
    .to('#s2-cta', { scale: 1, duration: 0.14, ease: 'back.out(2)' }, 5.29)
    .to('#s2-cursor', { opacity: 0, duration: 0.12 }, 5.28)
    .to('#s2', { opacity: 0, duration: 0.22 }, 5.4)
    .fromTo('#s3', { opacity: 0 }, { opacity: 1, duration: 0.22 }, 5.4)
    .to('#s3-b2', { opacity: 1, duration: 0.28 }, 7.5)
    .to('#s3-b3', { opacity: 1, duration: 0.28 }, 8.74)
    .to('#s3', { opacity: 0, duration: 0.35 }, 9.7)
    .fromTo('#s4', { opacity: 0 }, { opacity: 1, duration: 0.35 }, 9.7);
  [{ row:'#r1',bar:'#b1',w:'82%',t:10.93},{row:'#r2',bar:'#b2',w:'75%',t:11.46},{row:'#r3',bar:'#b3',w:'68%',t:12.02},{row:'#r4',bar:'#b4',w:'79%',t:12.55},{row:'#r5',bar:'#b5',w:'85%',t:13.11}].forEach(({row,bar,w,t})=>{
    tl.to(row,{opacity:1,y:0,duration:0.22},t).to(bar,{width:w,duration:0.48},t+0.04);
  });
  tl.to('#s4-feedback',{opacity:1,y:0,duration:0.32},13.64)
    .to('#s4',{opacity:0,duration:0.38},14.72)
    .fromTo('#s5',{opacity:0},{opacity:1,duration:0.38},14.72);
  [{id:'#st1',t:15.29},{id:'#st2',t:15.84},{id:'#st3',t:16.38},{id:'#st4',t:16.93}].forEach(({id,t})=>{
    tl.to(id,{opacity:1,y:0,duration:0.22},t);
  });
  tl.to('#s5-bar',{width:'74%',duration:0.82},17.47)
    .to('#s5',{opacity:0,duration:0.38},17.85)
    .fromTo('#s6',{opacity:0},{opacity:1,duration:0.38},17.85)
    .from('#s6-logo',{opacity:0,scale:0.9,duration:0.38,ease:'back.out(1.6)'},18.02)
    .from('#s6-tag',{opacity:0,y:10,duration:0.32},18.56)
    .to('#s6',{opacity:0,duration:0.5},19.6);
  window._tl = tl;
`;

// Also inject the typing state for S3 — at seek time we set text directly
const SET_TYPED_TEXT = (t) => t >= 5.7 && t < 10 ? `
  (function(){
    const el = document.getElementById('s3-typed');
    const text = "Walk me through your structure for a profitability case.";
    const elapsed = Math.max(0, ${t} - 5.7);
    const chars = Math.min(Math.round(elapsed * 15), text.length);
    if (el) el.textContent = text.slice(0, chars);
    const cur = document.getElementById('s3-cursor');
    if (cur) cur.style.opacity = chars < text.length ? '1' : '0';
  })();
` : t >= 10 ? `
  (function(){
    const el = document.getElementById('s3-typed');
    if (el) el.textContent = "Walk me through your structure for a profitability case.";
    const cur = document.getElementById('s3-cursor');
    if (cur) cur.style.opacity = '0';
  })();
` : '';

async function main() {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  // Try Edge first (stable on Windows), fall back to Firefox
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await firefox.launch({ headless: true });
  }
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });

  // Suppress audio errors
  await page.route('**/*.mp3', route => route.abort());

  await page.goto(SERVER_URL);
  await page.waitForFunction(() => typeof gsap !== 'undefined');

  // Hide overlay, init timeline
  await page.evaluate(`
    document.getElementById('overlay').style.display = 'none';
    ${INIT_TIMELINE}
  `);

  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);

  console.log(`Rendering ${TOTAL_FRAMES} frames at ${FPS}fps...`);
  const t0 = Date.now();

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = i / FPS;
    const frameNum = String(i).padStart(4, '0');

    await page.evaluate(`window._tl.seek(${t}); ${SET_TYPED_TEXT(t)}`);
    await page.screenshot({
      path: path.join(FRAMES_DIR, `frame_${frameNum}.png`),
      type: 'png',
    });

    if (i % 30 === 0) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const remaining = ((Date.now() - t0) / (i + 1) * (TOTAL_FRAMES - i) / 1000).toFixed(0);
      process.stdout.write(`\r  Frame ${i}/${TOTAL_FRAMES} (${t.toFixed(2)}s) — ${elapsed}s elapsed, ~${remaining}s left  `);
    }
  }

  console.log('\nFrames complete. Closing browser...');
  await browser.close();

  // Assemble with ffmpeg (video only — add audio separately)
  const musicPath = path.join(__dirname, 'assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3').replace(/\\/g, '/');
  const framesGlob = path.join(FRAMES_DIR, 'frame_%04d.png').replace(/\\/g, '/');
  const outPath = path.join(__dirname, '..', 'brag.mp4').replace(/\\/g, '/');

  console.log('Assembling video with ffmpeg...');
  const args = [
    '-y',
    '-r', String(FPS),
    '-i', framesGlob,
    '-i', musicPath,
    '-c:v', 'libx264', '-crf', '17', '-preset', 'slow', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    outPath,
  ];

  const result = spawnSync('ffmpeg', args, { stdio: 'inherit' });
  if (result.status === 0) {
    console.log(`\nDone! Video: ${outPath}`);
  } else {
    console.error('ffmpeg exited with status', result.status);
    console.log('Frames are in:', FRAMES_DIR);
  }
}

main().catch(console.error);
