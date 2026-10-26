// Browser-гүй статик шалгагч: lessonN.js-ийн бүтэц, дасгалын зөв эсэхийг шалгана.
// node validate.js <lesson.js>
const path = require('path');
const file = process.argv[2];
if (!file) { console.error('Usage: node validate.js <lesson.js>'); process.exit(1); }

const ENGINE = require(path.join(__dirname, '..', 'player', 'engine.js'));
global.window = { ENGINE };
try { require(path.resolve(file)); } catch (e) { console.error('JS алдаа:', e.message); process.exit(1); }
const L = global.window.LESSON;
const errs = [];
const E = (c, m) => { if (!c) errs.push(m); };

E(L && typeof L === 'object', 'LESSON объект алга');
if (L) {
  E(typeof L.id === 'string' && /^csbc101_l\d+$/.test(L.id), 'id буруу (csbc101_lN байх ёстой): ' + L.id);
  E(typeof L.num === 'number', 'num тоо байх ёстой');
  E(typeof L.title === 'string' && L.title.length > 3, 'title богино эсвэл алга');
  E(Array.isArray(L.screens) && L.screens.length >= 6, 'screens дор хаяж 6 байх ёстой, одоо: ' + (L.screens || []).length);
  E(Array.isArray(L.summary) && L.summary.length >= 3, 'summary (3+) алга');
  E(typeof L.next === 'string', 'next алга');
  E(L.badge && L.badge.name, 'badge.name алга');

  const ids = new Set();
  let totalPoints = 0, nEx = 0;
  const TOOLS = ['cipher', 'hash', 'password', 'url'];
  const TYPES = ['text', 'callout', 'cards', 'stats', 'timeline', 'accordion', 'tabs', 'reveal', 'poll', 'quote', 'tool', 'mcq', 'classify', 'order', 'match', 'fillin', 'terminal', 'hotspot', 'scenario'];
  const EXTYPES = ['mcq', 'classify', 'order', 'match', 'fillin', 'terminal', 'hotspot', 'scenario'];

  (L.screens || []).forEach((s, si) => {
    E(s.title, 'screen ' + si + ': title алга');
    E(Array.isArray(s.blocks) && s.blocks.length, 'screen ' + si + ' (' + s.title + '): blocks алга');
    (s.blocks || []).forEach((b, bi) => {
      const where = 'screen ' + si + ' блок ' + bi + ' (' + b.type + ')';
      E(TYPES.includes(b.type), where + ': тодорхойгүй төрөл');
      if (b.type === 'tool') E(TOOLS.includes(b.tool), where + ': tool нэр буруу — ' + b.tool);
      if (EXTYPES.includes(b.type)) {
        nEx++;
        E(typeof b.id === 'string' && b.id, where + ': дасгалд id заавал хэрэгтэй');
        if (b.id) { E(!ids.has(b.id), 'давхардсан id: ' + b.id); ids.add(b.id); }
        E(typeof b.points === 'number' && b.points > 0, where + ' (' + b.id + '): points > 0 байх ёстой');
        E(b.title, where + ' (' + b.id + '): title алга');
        totalPoints += b.points || 0;
      }
      // Төрөл тус бүрийн бүрэн бүтэц
      if (b.type === 'mcq') {
        E(Array.isArray(b.options) && b.options.length >= 2, where + ': options (2+) алга');
        E((b.options || []).some((o) => o.correct), where + ' (' + b.id + '): дор хаяж нэг correct:true хэрэгтэй');
        (b.options || []).forEach((o, oi) => E(typeof o.t === 'string', where + ' сонголт ' + oi + ': t алга'));
      }
      if (b.type === 'classify') {
        E(Array.isArray(b.categories) && b.categories.length >= 2, where + ': categories алга');
        E(Array.isArray(b.items) && b.items.length, where + ': items алга');
        (b.items || []).forEach((it, ii) => E(Number.isInteger(it.cat) && it.cat >= 0 && it.cat < b.categories.length, where + ' item ' + ii + ': cat индекс буруу'));
      }
      if (b.type === 'order') E(Array.isArray(b.items) && b.items.length >= 3, where + ': order items (3+) алга');
      if (b.type === 'match') {
        E(Array.isArray(b.pairs) && b.pairs.length >= 2, where + ': pairs алга');
        (b.pairs || []).forEach((p, pi) => E(p.l && p.r, where + ' pair ' + pi + ': l/r алга'));
      }
      if (b.type === 'fillin') {
        const tasks = b.tasks || [{ answers: b.answers }];
        E(tasks.length > 0, where + ': tasks алга');
        tasks.forEach((t, ti) => {
          E(Array.isArray(t.answers) && t.answers.length, where + ' task ' + ti + ': answers алга');
          // regex эсэх шалгах
          (t.answers || []).forEach((a) => { if (typeof a === 'string' && a.startsWith('/')) { try { new RegExp(a.slice(1, a.lastIndexOf('/')), a.slice(a.lastIndexOf('/') + 1) || 'i'); } catch (e) { errs.push(where + ': буруу regex ' + a); } } });
        });
      }
      if (b.type === 'terminal') {
        E(b.files && typeof b.files === 'object', where + ': files алга');
        E(Array.isArray(b.tasks) && b.tasks.length, where + ': tasks алга');
        // tasks-ийн answers нь командаар бодит гаралттай таарч буйг шалгахгүй (терминал), гэхдээ answers байх ёстой
        (b.tasks || []).forEach((t, ti) => E(Array.isArray(t.answers) && t.answers.length, where + ' task ' + ti + ': answers алга'));
      }
      if (b.type === 'hotspot') {
        const hots = [];
        ['from', 'to', 'subject', 'date', 'attach'].forEach((k) => (b.header && Array.isArray(b.header[k]) ? b.header[k] : []).forEach((p) => { if (p && typeof p === 'object') hots.push(p); }));
        (b.body || []).forEach((para) => (Array.isArray(para) ? para : [para]).forEach((p) => { if (p && typeof p === 'object') hots.push(p); }));
        E(hots.some((p) => p.hot), where + ': дор хаяж нэг hot:true хэсэг хэрэгтэй');
        if (b.verdict) E(Number.isInteger(b.verdict.correct) && b.verdict.options[b.verdict.correct], where + ': verdict.correct буруу');
      }
      if (b.type === 'scenario') {
        E(Array.isArray(b.steps) && b.steps.length, where + ': steps алга');
        (b.steps || []).forEach((st, sti) => {
          E(Array.isArray(st.choices) && st.choices.length >= 2, where + ' алхам ' + sti + ': choices алга');
          E((st.choices || []).some((c) => c.s >= 1), where + ' алхам ' + sti + ': s>=1 (зөв) сонголт заавал хэрэгтэй');
        });
      }
    });
  });

  E(nEx >= 6, 'Дасгал дор хаяж 6 байх ёстой, одоо: ' + nEx);
  E(totalPoints >= 50, 'Нийт оноо хэт бага: ' + totalPoints);
  console.log('Лекц', L.num, '|', (L.screens || []).length, 'хэсэг |', nEx, 'дасгал |', totalPoints, 'оноо');
}

if (errs.length) { console.error('\n❌ ' + errs.length + ' алдаа:\n - ' + errs.join('\n - ')); process.exit(1); }
console.log('✅ Статик шалгалт давлаа:', path.basename(file));
