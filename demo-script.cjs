'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:3000';
// Strip quotes from env vars if present (dotenv sometimes includes them)
const TEST_EMAIL = (process.env.TEST_EMAIL || 'demo@caseforge.ai').replace(/^["']|["']$/g, '');
const TEST_PASSWORD = (process.env.TEST_PASSWORD || 'demo123456').replace(/^["']|["']$/g, '');
const VIDEO_DIR = path.join(__dirname, 'screenshots');
const OUTPUT_NAME = 'demo-CaseForge-AI.webm';
const REHEARSAL = process.argv.includes('--rehearse');

// Ensure video directory exists
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

// Helper: Inject SVG arrow cursor that follows mouse
async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    cursor.style.cssText = `
      position: fixed; z-index: 999999; pointer-events: none;
      width: 24px; height: 24px;
      transition: left 0.1s, top 0.1s;
      filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
    `;
    cursor.style.left = '0px';
    cursor.style.top = '0px';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });
}

// Helper: Inject subtitle bar at bottom
async function injectSubtitleBar(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-subtitle')) return;
    const bar = document.createElement('div');
    bar.id = 'demo-subtitle';
    bar.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 999998;
      text-align: center; padding: 12px 24px;
      background: rgba(0, 0, 0, 0.75);
      color: white; font-family: -apple-system, "Segoe UI", sans-serif;
      font-size: 16px; font-weight: 500; letter-spacing: 0.3px;
      transition: opacity 0.3s;
      pointer-events: none;
    `;
    bar.textContent = '';
    bar.style.opacity = '0';
    document.body.appendChild(bar);
  });
}

// Helper: Show subtitle text
async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    const bar = document.getElementById('demo-subtitle');
    if (!bar) return;
    if (t) {
      bar.textContent = t;
      bar.style.opacity = '1';
    } else {
      bar.style.opacity = '0';
    }
  }, text);
  if (text) await page.waitForTimeout(800);
}

// Helper: Move mouse and click with smooth animation
async function moveAndClick(page, locator, label, opts = {}) {
  const { postClickDelay = 800, ...clickOpts } = opts;
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: moveAndClick skipped - "${label}" not visible`);
    return false;
  }
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await el.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
      await page.waitForTimeout(400);
    }
    await el.click(clickOpts);
  } catch (e) {
    console.error(`WARNING: moveAndClick failed on "${label}": ${e.message}`);
    return false;
  }
  await page.waitForTimeout(postClickDelay);
  return true;
}

// Helper: Type text slowly with visible delay
async function typeSlowly(page, locator, text, label, charDelay = 35) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: typeSlowly skipped - "${label}" not visible`);
    return false;
  }
  await moveAndClick(page, el, label);
  await el.fill('');
  await el.pressSequentially(text, { delay: charDelay });
  await page.waitForTimeout(500);
  return true;
}

// Helper: Ensure element is visible (for rehearsal)
async function ensureVisible(page, locator, label) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    const msg = `REHEARSAL FAIL: "${label}" not found - selector: ${typeof locator === 'string' ? locator : '(locator object)'}`;
    console.error(msg);
    return false;
  }
  console.log(`REHEARSAL OK: "${label}"`);
  return true;
}

// Rehearsal steps - landing page elements (authenticated sections require login)
const REHEARSAL_STEPS = [
  // Landing page
  { label: 'Landing page hero', selector: 'text=Crack the case' },
  { label: 'Sign in button', selector: 'text=Start practicing free' },
  { label: 'Hero leaderboard card', selector: 'text=Campus Leaderboard' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });

  if (REHEARSAL) {
    console.log('=== REHEARSAL MODE ===');
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
      // Navigate to landing page
      await page.goto(BASE_URL);
      await injectCursor(page);
      await injectSubtitleBar(page);
      await showSubtitle(page, 'Step 1 - Landing page');

      let allOk = true;
      for (const step of REHEARSAL_STEPS) {
        if (!await ensureVisible(page, step.selector, step.label)) {
          allOk = false;
        }
      }

      // Check sign in page elements
      const isOnSignIn = await page.locator('input#email').isVisible().catch(() => false);
      if (isOnSignIn) {
        console.log('REHEARSAL OK: Sign in page (email field found)');
        console.log('  Note: Authenticated sections require valid credentials');
        console.log('  Set TEST_EMAIL and TEST_PASSWORD environment variables for full flow');
      }

      if (!allOk) {
        console.error('REHEARSAL FAILED - fix selectors before recording');
        process.exit(1);
      }
      console.log('REHEARSAL PASSED - landing page selectors verified');
      console.log('  To test authenticated flow, set TEST_EMAIL and TEST_PASSWORD env vars');
    } catch (err) {
      console.error('REHEARSAL ERROR:', err.message);
      process.exit(1);
    } finally {
      await browser.close();
    }
    return;
  }

  // Recording mode
  const context = await browser.newContext({
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    // Phase 1: Landing page
    await page.goto(BASE_URL);
    await injectCursor(page);
    await injectSubtitleBar(page);
    await showSubtitle(page, 'Step 1 - Landing Page');
    await page.waitForTimeout(4000);

    // Pan across hero section
    await page.mouse.move(300, 200, { steps: 8 });
    await page.waitForTimeout(800);
    await page.mouse.move(500, 300, { steps: 8 });
    await page.waitForTimeout(800);

    // Navigate to sign in
    await moveAndClick(page, 'text=Start practicing free', 'Click sign in button');
    await injectCursor(page);
    await injectSubtitleBar(page);
    await showSubtitle(page, 'Step 2 - Authentication');
    await page.waitForTimeout(1000);

    // Fill sign in form using email/password credentials
    // Use environment variables TEST_EMAIL and TEST_PASSWORD if set
    const isOnSignInPage = await page.locator('input#email').isVisible().catch(() => false);
    if (isOnSignInPage) {
      console.log(`Signing in with: ${TEST_EMAIL}`);

      // Use credentials form directly (skip Google OAuth which can't be automated)
      await typeSlowly(page, '#email', TEST_EMAIL, 'Email field');
      await typeSlowly(page, '#password', TEST_PASSWORD, 'Password field');
      await moveAndClick(page, 'button[type="submit"]', 'Click sign in');
      await page.waitForTimeout(3000);
    }

    // Phase 2: Dashboard - wait for navigation with better error handling
    let dashboardSuccess = false;
    try {
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      dashboardSuccess = true;
    } catch (err) {
      console.log('Dashboard navigation timeout - checking current state...');
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);

      // Check if we're still on sign in page
      const stillOnSignIn = await page.locator('input#email').isVisible().catch(() => false);
      if (stillOnSignIn) {
        console.log('Still on sign in page - sign in failed, showing landing page summary');
        await injectCursor(page);
        await injectSubtitleBar(page);
        await showSubtitle(page, 'Step 3 - Public Landing Page Features');
        await page.waitForTimeout(3000);
      }
    }

    // Only proceed with authenticated sections if sign-in succeeded
    if (dashboardSuccess) {
      await injectCursor(page);
      await injectSubtitleBar(page);
      await showSubtitle(page, 'Step 3 - Dashboard Overview');
      await page.waitForTimeout(3000);

      // Pan across dashboard widgets
      await page.mouse.move(400, 250, { steps: 8 });
      await page.waitForTimeout(600);
      await page.mouse.move(600, 350, { steps: 8 });
      await page.waitForTimeout(600);
      await page.mouse.move(800, 450, { steps: 8 });
      await page.waitForTimeout(600);

      // Navigate to New Interview
      await moveAndClick(page, 'button:has-text("New Interview")', 'Click New Interview button');
      await injectCursor(page);
      await injectSubtitleBar(page);
      await showSubtitle(page, 'Step 4 - Interview Setup');
      await page.waitForTimeout(2000);

      // Select firm style
      await moveAndClick(page, 'button:has-text("McKinsey")', 'Select McKinsey firm');
      await page.waitForTimeout(500);

      // Select interview type
      await moveAndClick(page, 'button:has-text("Full Case Interview")', 'Select Full Case Interview');
      await page.waitForTimeout(500);

      // Begin interview
      await moveAndClick(page, 'button:has-text("Begin interview")', 'Begin interview');
      await page.waitForTimeout(3000);

      // Phase 3: Interview Room
      await page.waitForURL('**/interview/**', { timeout: 10000 });
      await injectCursor(page);
      await injectSubtitleBar(page);
      await showSubtitle(page, 'Step 5 - Live Interview Room');
      await page.waitForTimeout(2000);

      // Type a response in the chat
      await typeSlowly(page, 'textarea[placeholder="Type your response…"]', 'Let me start by structuring this problem. First, I would frame the business objective as...', 'Type interview response');

      // Send the message
      await moveAndClick(page, 'button:has-text("Send")', 'Click send button');
      await page.waitForTimeout(5000);

      // Show the AI response streaming
      await page.mouse.move(400, 300, { steps: 8 });
      await page.waitForTimeout(800);

      // End session early for demo
      await moveAndClick(page, 'button:has-text("End")', 'End session');
      await page.waitForTimeout(3000);

      // Phase 4: Feedback Page
      await page.waitForURL('**/feedback/**', { timeout: 10000 });
      await injectCursor(page);
      await injectSubtitleBar(page);
      await showSubtitle(page, 'Step 6 - Scorecard Feedback');
      await page.waitForTimeout(3000);

      // Pan across scorecard
      await page.mouse.move(300, 200, { steps: 8 });
      await page.waitForTimeout(600);
      await page.mouse.move(500, 300, { steps: 8 });
      await page.waitForTimeout(600);

      // Navigate to Drills
      await moveAndClick(page, 'a[href="/drills"]', 'Navigate to Drills');
      await injectCursor(page);
      await injectSubtitleBar(page);
      await showSubtitle(page, 'Step 7 - Drills Library');
      await page.waitForTimeout(2000);

      // Filter drills by skill
      await moveAndClick(page, 'select:has-text("All skills")', 'Open skill filter');
      await page.waitForTimeout(500);

      // Navigate to Leaderboard
      await moveAndClick(page, 'a[href="/leaderboard"]', 'Navigate to Leaderboard');
      await injectCursor(page);
      await injectSubtitleBar(page);
      await showSubtitle(page, 'Step 8 - Campus Leaderboard');
      await page.waitForTimeout(2000);

      // Toggle between tabs
      await moveAndClick(page, 'button:has-text("Overall")', 'Click Overall tab');
      await page.waitForTimeout(500);
      await moveAndClick(page, 'button:has-text("Biggest Improvers")', 'Click Improvers tab');
      await page.waitForTimeout(500);

      // Navigate to Analytics
      await moveAndClick(page, 'a[href="/analytics"]', 'Navigate to Analytics');
      await injectCursor(page);
      await injectSubtitleBar(page);
      await showSubtitle(page, 'Step 9 - Performance Analytics');
      await page.waitForTimeout(2000);

      // Pan across charts
      await page.mouse.move(350, 180, { steps: 8 });
      await page.waitForTimeout(600);
      await page.mouse.move(550, 180, { steps: 8 });
      await page.waitForTimeout(600);

      // Navigate to Goals
      await moveAndClick(page, 'a[href="/goals"]', 'Navigate to Goals');
      await injectCursor(page);
      await injectSubtitleBar(page);
      await showSubtitle(page, 'Step 10 - Goal Tracking');
      await page.waitForTimeout(2000);

      // Create a new goal
      await moveAndClick(page, 'button:has-text("New goal")', 'Click New goal button');
      await typeSlowly(page, 'input[placeholder="Goal title (e.g. Reach 7.5 avg score)"]', 'Reach 8.0 overall score', 'Enter goal title');
      await moveAndClick(page, 'select:has-text("Overall Score Target")', 'Select goal type');
      await moveAndClick(page, 'input[type="number"]', 'Enter target value');
      await page.keyboard.press('Tab');
      await page.keyboard.type('8');
      await page.waitForTimeout(200);

      // Submit goal
      await moveAndClick(page, 'button:has-text("Create goal")', 'Create goal');
      await page.waitForTimeout(1000);

      // Navigate to Settings
      await moveAndClick(page, 'a[href="/settings"]', 'Navigate to Settings');
      await injectCursor(page);
      await injectSubtitleBar(page);
      await showSubtitle(page, 'Step 11 - Profile & Settings');
      await page.waitForTimeout(2000);

      // Pan across settings sections
      await page.mouse.move(300, 200, { steps: 8 });
      await page.waitForTimeout(600);
      await page.mouse.move(300, 350, { steps: 8 });
      await page.waitForTimeout(600);

      // Toggle leaderboard opt-in
      await moveAndClick(page, 'text=Appear on leaderboard', 'Click opt-in toggle');
      await page.waitForTimeout(500);

      // Final pause
      await showSubtitle(page, '');
      await page.waitForTimeout(3000);
    } else {
      console.log('Authentication failed - showing landing page features');
      await showSubtitle(page, '');
      await page.waitForTimeout(3000);
    }

    // Toggle leaderboard opt-in
    await moveAndClick(page, 'text=Appear on leaderboard', 'Click opt-in toggle');
    await page.waitForTimeout(500);

    // Final pause
    await showSubtitle(page, '');
    await page.waitForTimeout(3000);

  } catch (err) {
    console.error('DEMO ERROR:', err.message);
  } finally {
    await context.close();
    const video = page.video();
    if (video) {
      const src = await video.path();
      const dest = path.join(VIDEO_DIR, OUTPUT_NAME);
      try {
        fs.copyFileSync(src, dest);
        console.log('Video saved:', dest);
      } catch (e) {
        console.error('ERROR: Failed to copy video:', e.message);
        console.error('  Source:', src);
        console.error('  Destination:', dest);
      }
    }
    await browser.close();
  }
})();