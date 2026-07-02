/**
 * Ya-ho 숨김 YouTube 플레이어 광고 테스트
 * - 원본과 동일한 1×1 hidden iframe
 * - 네트워크에서 광고 도메인 요청 감지
 * - 플레이어 state / time 변화 기록
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 9876;
const AD_PATTERNS = [
  'doubleclick.net',
  'googleads.',
  'googlesyndication',
  'pagead',
  'youtube.com/pagead',
  'youtube.com/api/stats/ads',
  'googlevideo.com/videoplayback', // not ad itself but stream
];

const TEST_VIDEOS = [
  { id: 'M7lc1UVf-VE', label: 'YouTube Embed API sample (official)' },
  { id: 'jNQXAC9IVRw', label: 'Me at the zoo (first YT video)' },
  { id: 'kJQP7kiw5Fk', label: 'Despacito' },
];

function serveFile(res, filePath, type) {
  res.writeHead(200, { 'Content-Type': type });
  res.end(fs.readFileSync(filePath));
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (req.url === '/' || req.url === '/test-ad.html') {
        serveFile(res, path.join(__dirname, 'test-ad.html'), 'text/html; charset=utf-8');
      } else {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

async function runOneTest(browser, video) {
  const page = await browser.newPage();
  const networkLog = [];

  page.on('request', (req) => {
    const url = req.url();
    if (AD_PATTERNS.some((p) => url.includes(p))) {
      networkLog.push({ type: 'request', url: url.slice(0, 200) });
    }
  });

  page.on('response', (res) => {
    const url = res.url();
    if (AD_PATTERNS.some((p) => url.includes(p))) {
      networkLog.push({ type: 'response', status: res.status(), url: url.slice(0, 200) });
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'log') console.log('  [page]', msg.text());
  });

  await page.goto(`http://127.0.0.1:${PORT}/test-ad.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });

  await page.waitForFunction(() => window.__readyToAutoPlay === true, { timeout: 45000 });
  await page.waitForFunction(() => window.ytReady === true, { timeout: 15000 });

  await page.evaluate((vid) => {
    document.getElementById('videoId').value = vid;
  }, video.id);

  await page.click('#playBtn');
  console.log('Play clicked for ' + video.id);

  // 재생 클릭 후 35초 관찰
  await new Promise((r) => setTimeout(r, 35000));

  const iframeInfo = await page.evaluate(() => {
    const iframe = document.querySelector('iframe');
    if (!iframe) return null;
    const r = iframe.getBoundingClientRect();
    const host = document.getElementById('ytPlayer');
    return {
      width: r.width,
      height: r.height,
      hostOpacity: host ? getComputedStyle(host).opacity : null,
      src: iframe.src?.slice(0, 140),
    };
  });

  const summary = await page.evaluate(() => ({
    stateLog: window.__stateLog || [],
    adRequests: window.__adRequests || [],
    finalState: window.ytReady && window.yt?.getPlayerState ? window.yt.getPlayerState() : null,
    currentTime: window.ytReady && window.yt?.getCurrentTime ? window.yt.getCurrentTime() : null,
    duration: window.ytReady && window.yt?.getDuration ? window.yt.getDuration() : null,
    videoTitle: window.ytReady && window.yt?.getVideoData ? window.yt.getVideoData()?.title : null,
  }));

  await page.close();

  const adHits = networkLog.filter((x) =>
    x.url.includes('doubleclick') ||
    x.url.includes('googleads') ||
    x.url.includes('pagead') ||
    x.url.includes('/api/stats/ads')
  );

  return {
    video,
    iframeInfo,
    summary,
    adNetworkHits: adHits,
    allAdRelatedNetwork: networkLog.slice(0, 30),
    stateChanges: summary?.stateLog || [],
  };
}

async function main() {
  console.log('=== Ya-ho Hidden YouTube Player Ad Test ===\n');

  const server = await startServer();
  console.log(`Local server: http://127.0.0.1:${PORT}/test-ad.html\n`);

  const browser = await puppeteer.launch({
    executablePath: '/usr/local/bin/google-chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-blink-features=AutomationControlled',
      '--mute-audio',
    ],
  });

  const results = [];
  for (const video of TEST_VIDEOS) {
    console.log(`\n--- Testing: ${video.label} (${video.id}) ---`);
    try {
      const r = await runOneTest(browser, video);
      results.push(r);
      console.log('iframe:', JSON.stringify(r.iframeInfo));
      console.log('state changes:', r.stateChanges.map((s) => s.state).join(' → '));
      console.log('ad network hits:', r.adNetworkHits.length);
      r.adNetworkHits.slice(0, 5).forEach((h) => console.log(' ', h.url));
    } catch (e) {
      console.error('Test failed:', e.message);
      results.push({ video, error: e.message });
    }
  }

  await browser.close();
  server.close();

  // 결과 저장
  const outPath = path.join(__dirname, 'test-ad-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log('\n=== SUMMARY ===');
  for (const r of results) {
    if (r.error) {
      console.log(`${r.video.id}: ERROR ${r.error}`);
      continue;
    }
    const states = r.stateChanges.map((s) => s.state);
    const hasBuffering = states.includes('BUFFERING');
    const multiplePlaying = states.filter((s) => s === 'PLAYING').length > 1;
    const hasAdNetwork = r.adNetworkHits.length > 0;
    console.log(`\n${r.video.label}:`);
    console.log(`  hidden iframe: ${r.iframeInfo?.width}x${r.iframeInfo?.height}, opacity=${r.iframeInfo?.opacity}`);
    console.log(`  states: ${states.join(' → ') || '(none)'}`);
    console.log(`  ad domain requests: ${r.adNetworkHits.length} ${hasAdNetwork ? '✅ detected' : '❌ not detected'}`);
    console.log(`  multiple PLAYING (possible ad→main): ${multiplePlaying}`);
    console.log(`  time at end: ${r.summary?.currentTime}s / ${r.summary?.duration}s`);
  }
  console.log(`\nFull results: ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
