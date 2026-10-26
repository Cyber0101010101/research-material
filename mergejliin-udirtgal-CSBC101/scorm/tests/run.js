// Headless тест: тоглуулагчийг SCORM API mock-той ачаалж, бүх дасгалыг «solve» хийж, оноо, cmi утгыг шалгана.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const lesson = process.argv[2] || path.join(__dirname, '..', 'content', 'lesson2.js');
const player = path.join(__dirname, '..', 'player');

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scormtest-'));
  for (const f of ['index.html', 'engine.js', 'player.js', 'style.css']) fs.copyFileSync(path.join(player, f), path.join(dir, f));
  fs.copyFileSync(lesson, path.join(dir, 'content.js'));

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FILE_NOT_FOUND/.test(m.text())) errors.push('CONSOLE: ' + m.text()); });

  // SCORM 1.2 API-г window дээр mock болгож өгнө (тоглуулагч window.API-г олно)
  await page.addInitScript(() => {
    window.__cmi = {};
    window.API = {
      LMSInitialize: () => { window.__init = true; return 'true'; },
      LMSFinish: () => { window.__finish = true; return 'true'; },
      LMSGetValue: (k) => (window.__cmi[k] !== undefined ? window.__cmi[k] : ''),
      LMSSetValue: (k, v) => { window.__cmi[k] = String(v); return 'true'; },
      LMSCommit: () => 'true',
      LMSGetLastError: () => '0',
      LMSGetErrorString: () => 'No error',
      LMSGetDiagnostic: () => '',
    };
  });

  await page.goto('file://' + path.join(dir, 'index.html') + '?debug=1');
  await page.locator('#app .screen').first().waitFor({ timeout: 10000 });

  const info = await page.evaluate(() => ({ lms: window.PLAYER.lms(), screens: window.PLAYER.screens.length, ex: window.PLAYER.exercises.length, total: window.PLAYER.totalPoints }));
  console.log('LMS detected:', info.lms, '| screens:', info.screens, '| exercises:', info.ex, '| totalPoints:', info.total);
  if (!info.lms) throw new Error('SCORM API detected-гүй');

  for (let i = 0; i < info.screens - 1; i++) {
    await page.evaluate((idx) => window.PLAYER.go(idx), i);
    await page.waitForTimeout(60);
    for (const b of await page.$$('[data-solve]')) { await b.click(); await page.waitForTimeout(25); }
    for (const box of await page.$$('.ex')) {
      const check = await box.$('.btn.primary');
      if (check) { await check.click(); await page.waitForTimeout(35); }
    }
  }
  await page.waitForTimeout(150);
  // Үр дүнгийн дэлгэц рүү очоод дуусгах товчийг дарна
  await page.evaluate(() => window.PLAYER.go(window.PLAYER.screens.length - 1));
  await page.waitForTimeout(100);
  const finBtn = await page.$('.res-top + * , .screen .btn.primary.big');
  const bigBtn = await page.$('.btn.primary.big');
  if (bigBtn) { await bigBtn.click(); await page.waitForTimeout(80); }

  const out = await page.evaluate(() => ({ scorePct: window.PLAYER.scorePct(), scores: window.PLAYER.state.scores, cmi: window.__cmi, finished: !!window.__finish }));
  console.log('Score %:', out.scorePct);console.log('per-ex:',JSON.stringify(out.scores));
  console.log('Recorded exercises:', Object.keys(out.scores).length, '/', info.ex);
  console.log('cmi.core.score.raw:', out.cmi['cmi.core.score.raw'], '| status:', out.cmi['cmi.core.lesson_status'], '| interactions:', out.cmi['cmi.interactions._count'], '| finish called:', out.finished);

  const problems = [];
  if (errors.length) problems.push('JS алдаа:\n  ' + errors.join('\n  '));
  if (out.scorePct !== 100) problems.push('Зөв бодоход оноо 100% байх ёстой, гарсан: ' + out.scorePct);
  if (Object.keys(out.scores).length !== info.ex) problems.push('Бүртгэгдсэн дасгал ' + Object.keys(out.scores).length + ' / ' + info.ex);
  if (out.cmi['cmi.core.lesson_status'] !== 'passed') problems.push('lesson_status != passed');
  if (String(out.cmi['cmi.core.score.raw']) !== '100') problems.push('score.raw != 100');
  if (!out.finished) problems.push('LMSFinish дуудагдаагүй');

  await browser.close();
  fs.rmSync(dir, { recursive: true, force: true });
  if (problems.length) { console.error('\n❌ АЛДАА:\n' + problems.join('\n')); process.exit(1); }
  console.log('\n✅ Бүх шалгалт давлаа:', path.basename(lesson));
})().catch((e) => { console.error(e); process.exit(1); });
