import { chromium } from '@playwright/test';

(async () => {
  console.log('🚀 Starting comprehensive login and page test...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const consoleMessages = [];

  // Capture all console messages
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    console.log(`[Browser ${msg.type()}]:`, text);
  });

  // Capture all page errors
  page.on('pageerror', error => {
    const errorMsg = error.message;
    errors.push(errorMsg);
    console.error('❌ Page Error:', errorMsg);
  });

  // Capture network errors
  page.on('requestfailed', request => {
    console.error('❌ Network Error:', request.url(), request.failure().errorText);
  });

  try {
    console.log('📍 Step 1: Navigate to app...');
    await page.goto('https://youtube-liker-typescript.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('✅ Page loaded\n');

    console.log('📍 Step 2: Wait for login form...');
    await page.waitForSelector('#loginForm', { timeout: 5000 });
    console.log('✅ Login form visible\n');

    console.log('📍 Step 3: Fill credentials and login...');
    await page.fill('#email', 'lightsongjs@gmail.com');
    await page.fill('#password', 'Work@SB15');
    await page.click('button[type="submit"]');
    console.log('✅ Login submitted\n');

    console.log('📍 Step 4: Wait for login to complete...');
    await page.waitForTimeout(2000);

    // Check for error message
    const errorEl = await page.$('#error');
    if (errorEl) {
      const errorVisible = await errorEl.isVisible();
      if (errorVisible) {
        const errorText = await errorEl.textContent();
        console.log('❌ Error shown on page:', errorText);
      }
    }

    console.log('\n📍 Step 5: Check if app is visible...');
    const appVisible = await page.isVisible('#app.show');
    const loginVisible = await page.isVisible('#login.show');
    console.log('  - App visible:', appVisible);
    console.log('  - Login visible:', loginVisible);

    if (!appVisible) {
      console.error('❌ App did not show after login!');
      await page.screenshot({ path: 'screenshots/stuck-at-login.png' });
      return;
    }

    console.log('\n📍 Step 6: Wait for videos to load...');

    // Wait up to 10 seconds for videos to appear
    let videosLoaded = false;
    for (let i = 0; i < 20; i++) {
      const loadingText = await page.$('.loading');
      const loadingVisible = loadingText ? await loadingText.isVisible() : false;

      if (!loadingVisible) {
        console.log('✅ Loading indicator disappeared');
        videosLoaded = true;
        break;
      }

      console.log(`  ⏳ Still loading... (${(i + 1) * 500}ms)`);
      await page.waitForTimeout(500);
    }

    // Count videos on page
    const videoCount = await page.$$eval('.video', videos => videos.length);
    console.log(`\n📊 Videos found on page: ${videoCount}`);

    if (videoCount === 0) {
      console.error('❌ No videos loaded!');

      // Check what's in the videos container
      const videosHtml = await page.$eval('#videos', el => el.innerHTML);
      console.log('\n📄 Videos container content:');
      console.log(videosHtml.substring(0, 500));
    } else {
      console.log('✅ Videos loaded successfully!');

      // Get first video title
      const firstVideoTitle = await page.$eval('.video-title', el => el.textContent);
      console.log('  First video:', firstVideoTitle);
    }

    // Count tags
    const tagCount = await page.$$eval('.tag', tags => tags.length);
    console.log(`📊 Tags found: ${tagCount}`);

    // Take final screenshot
    await page.screenshot({ path: 'screenshots/after-login-full.png', fullPage: true });
    console.log('\n📸 Screenshot saved: after-login-full.png');

    // Summary of errors
    if (errors.length > 0) {
      console.log('\n❌ JavaScript Errors Found:');
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    } else {
      console.log('\n✅ No JavaScript errors detected');
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
