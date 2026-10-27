/* CSBC101 SCORM — цэвэр логик: терминал симулятор, SHA-256, шифр, URL задлагч, нууц үгийн энтропи.
   Браузерт window.ENGINE, Node-д module.exports болж ачаалагдана. */
(function (root) {
  'use strict';

  // ───────────── SHA-256 (UTF-8) ─────────────
  function utf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(str));
    return Array.from(Buffer.from(str, 'utf8'));
  }
  function sha256(str) {
    const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const bytes = utf8Bytes(str);
    const l = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);
    const hi = Math.floor(l / 0x100000000), lo = l >>> 0;
    bytes.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255, (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));
    const w = new Array(64);
    for (let i = 0; i < bytes.length; i += 64) {
      for (let t = 0; t < 16; t++) w[t] = (bytes[i + 4 * t] << 24) | (bytes[i + 4 * t + 1] << 16) | (bytes[i + 4 * t + 2] << 8) | bytes[i + 4 * t + 3];
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[t] + w[t]) | 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H = [H[0] + a, H[1] + b, H[2] + c, H[3] + d, H[4] + e, H[5] + f, H[6] + g, H[7] + h].map((x) => x | 0);
    }
    return H.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }

  // ───────────── Кодчилол, шифр ─────────────
  function b64decode(s) {
    const clean = String(s).trim().replace(/\s+/g, '');
    let bin;
    if (typeof atob !== 'undefined') bin = atob(clean);
    else bin = Buffer.from(clean, 'base64').toString('binary');
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return Buffer.from(bytes).toString('utf8');
  }
  function b64encode(s) {
    const bytes = utf8Bytes(String(s));
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    if (typeof btoa !== 'undefined') return btoa(bin);
    return Buffer.from(bin, 'binary').toString('base64');
  }
  function caesar(s, shift) {
    shift = ((shift % 26) + 26) % 26;
    return String(s).replace(/[a-z]/gi, (ch) => {
      const base = ch <= 'Z' ? 65 : 97;
      return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26) + base);
    });
  }
  function hexdecode(s) {
    const clean = String(s).replace(/[^0-9a-f]/gi, '');
    const bytes = [];
    for (let i = 0; i + 1 < clean.length; i += 2) bytes.push(parseInt(clean.substr(i, 2), 16));
    const arr = Uint8Array.from(bytes);
    if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(arr);
    return Buffer.from(arr).toString('utf8');
  }

  // ───────────── URL задлагч ─────────────
  const SLD = ['gov.mn', 'edu.mn', 'com.mn', 'org.mn', 'net.mn', 'co.uk', 'org.uk', 'ac.uk', 'com.au', 'co.jp', 'com.cn', 'co.kr'];
  function parseUrl(raw) {
    const s = String(raw).trim();
    const m = s.match(/^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)([^?#]*)(\?[^#]*)?(#.*)?$/i);
    if (!m) return null;
    let auth = m[2], userinfo = '';
    if (auth.includes('@')) { userinfo = auth.slice(0, auth.lastIndexOf('@')); auth = auth.slice(auth.lastIndexOf('@') + 1); }
    let port = '';
    const pm = auth.match(/:(\d+)$/);
    if (pm) { port = pm[1]; auth = auth.slice(0, -pm[0].length); }
    const host = auth.toLowerCase();
    const isIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
    const labels = host.split('.').filter(Boolean);
    let regDomain = host, sub = '';
    if (!isIP && labels.length >= 2) {
      const last2 = labels.slice(-2).join('.');
      const n = SLD.includes(last2) && labels.length >= 3 ? 3 : 2;
      regDomain = labels.slice(-n).join('.');
      sub = labels.slice(0, -n).join('.');
    }
    const warnings = [];
    if (m[1].toLowerCase() === 'http') warnings.push('HTTP — холболт шифрлэгдээгүй');
    if (userinfo) warnings.push('«@» тэмдэгтийн өмнөх хэсэг хаяг биш — хөтөч зөвхөн «@»-ийн араас ирэх хостыг нээнэ');
    if (isIP) warnings.push('Домэйн нэрийн оронд IP хаяг ашигласан');
    if (host.includes('xn--')) warnings.push('Punycode (xn--) — өөр цагаан толгойн үсгээр дуурайлгасан байж болзошгүй');
    if (sub.split('.').filter(Boolean).length >= 3) warnings.push('Дэд домэйн хэт олон — жинхэнэ домэйныг нуух заль байж болзошгүй');
    if (/(login|secure|verify|update|account|password|signin)/i.test(sub)) warnings.push('Дэд домэйнд «login / secure / verify» гэх мэт итгэл төрүүлэх үг');
    if ((regDomain.match(/-/g) || []).length >= 2) warnings.push('Үндсэн домэйнд олон зураас (-) байна');
    return { scheme: m[1].toLowerCase(), userinfo, host, port, sub, regDomain, path: m[3] || '', query: m[4] || '', fragment: m[5] || '', isIP, warnings };
  }

  // ───────────── Нууц үгийн энтропи ─────────────
  const COMMON = ['password', 'password1', 'password123', '123456', '12345678', '123456789', 'qwerty', 'qwerty123', 'admin', 'admin123', 'iloveyou', 'welcome', 'p@ssw0rd', 'letmein', 'monkey', 'dragon', '111111', 'abc123', 'mongolia', 'ulaanbaatar'];
  function passwordInfo(pw) {
    pw = String(pw);
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/[0-9]/.test(pw)) pool += 10;
    if (/[^a-zA-Z0-9Ѐ-ӿ]/.test(pw)) pool += 33;
    if (/[Ѐ-ӿ]/.test(pw)) pool += 70;
    const len = Array.from(pw).length;
    const bits = len && pool ? len * Math.log2(pool) : 0;
    const common = COMMON.includes(pw.toLowerCase());
    const guessesPerSec = 1e10;
    const seconds = common ? 0.001 : Math.pow(2, Math.max(0, bits - 1)) / guessesPerSec;
    return { len, pool, bits: Math.round(bits * 10) / 10, common, seconds };
  }
  function humanTime(sec) {
    if (sec < 1) return '1 секундээс бага';
    const units = [['жил', 31536000], ['өдөр', 86400], ['цаг', 3600], ['минут', 60], ['секунд', 1]];
    if (sec > 31536000 * 1e9) return 'тэрбум гаруй жил';
    if (sec > 31536000 * 1e6) return Math.round(sec / 31536000 / 1e6) + ' сая жил';
    for (const [n, s] of units) if (sec >= s) return Math.round(sec / s).toLocaleString('en-US') + ' ' + n;
    return Math.round(sec) + ' секунд';
  }

  // ───────────── Терминал симулятор ─────────────
  function tokenize(line) {
    const out = [];
    let cur = '', q = null, has = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === q) q = null; else cur += c; continue; }
      if (c === '"' || c === "'") { q = c; has = true; continue; }
      if (/\s/.test(c)) { if (cur || has) { out.push(cur); cur = ''; has = false; } continue; }
      cur += c;
    }
    if (q) throw new Error('хаагдаагүй хашилт');
    if (cur || has) out.push(cur);
    return out;
  }
  function splitPipes(line) {
    const parts = [];
    let cur = '', q = null;
    for (const c of line) {
      if (q) { cur += c; if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { q = c; cur += c; continue; }
      if (c === '|') { parts.push(cur); cur = ''; continue; }
      cur += c;
    }
    parts.push(cur);
    return parts.map((p) => p.trim());
  }
  function fileText(files, name) {
    if (!(name in files)) throw new Error(name + ': ийм файл байхгүй');
    const f = files[name];
    return typeof f === 'string' ? f : f.text || '';
  }
  function linesOf(text) {
    const l = String(text).split('\n');
    if (l.length && l[l.length - 1] === '') l.pop();
    return l;
  }
  function fields(line) { return line.trim().split(/\s+/); }

  const HELP = [
    'Боломжит командууд:',
    '  ls                      — файлуудын жагсаалт',
    '  cat ФАЙЛ                — файлын агуулга',
    '  head [-n N] ФАЙЛ        — эхний N мөр (анхдагч 10)',
    '  tail [-n N] ФАЙЛ        — сүүлийн N мөр',
    '  grep [-i] [-v] [-c] [-E] ХЭВ [ФАЙЛ] — хэв агуулсан мөрүүд',
    '  wc -l [ФАЙЛ]            — мөрийн тоо',
    "  awk '{print $N}'        — N дэх баганыг хэвлэх ($NF — сүүлийн)",
    "  cut -d'Т' -f N          — тусгаарлагчаар хуваасан N дэх хэсэг",
    '  sort [-n] [-r]          — эрэмбэлэх',
    '  uniq [-c]               — давхардлыг нэгтгэх (-c: тоолох)',
    '  sha256sum ФАЙЛ          — файлын SHA-256 хэш',
    '  base64 -d ФАЙЛ          — Base64 тайлах',
    '  exiftool ФАЙЛ           — зургийн мета өгөгдөл',
    '  echo ТЕКСТ, pwd, whoami, clear, help',
    'Хоолой (|) ашиглаж болно. Жишээ: grep "Failed" auth.log | wc -l',
  ].join('\n');

  function runOne(argv, input, files, ctx) {
    const cmd = argv[0], args = argv.slice(1);
    const takeFile = (rest) => (rest.length ? linesOf(fileText(files, rest[rest.length - 1])) : input);
    switch (cmd) {
      case 'help': return HELP.split('\n');
      case 'ls': return Object.keys(files).sort();
      case 'pwd': return [ctx.cwd || '/home/cadet/lab'];
      case 'whoami': return [ctx.user || 'cadet'];
      case 'echo': return [args.join(' ')];
      case 'cat': {
        if (!args.length) return input || [];
        let out = [];
        args.forEach((a) => (out = out.concat(linesOf(fileText(files, a)))));
        return out;
      }
      case 'head': case 'tail': {
        let n = 10; const rest = [];
        for (let i = 0; i < args.length; i++) {
          if (args[i] === '-n') n = parseInt(args[++i], 10);
          else if (/^-\d+$/.test(args[i])) n = parseInt(args[i].slice(1), 10);
          else rest.push(args[i]);
        }
        if (isNaN(n)) throw new Error(cmd + ': -n-ийн дараа тоо бичнэ');
        const l = takeFile(rest);
        return cmd === 'head' ? l.slice(0, n) : l.slice(Math.max(0, l.length - n));
      }
      case 'grep': {
        let i = false, v = false, c = false, E = false; const rest = [];
        args.forEach((a) => {
          if (/^-[ivcE]+$/.test(a)) { i = i || a.includes('i'); v = v || a.includes('v'); c = c || a.includes('c'); E = E || a.includes('E'); }
          else rest.push(a);
        });
        if (!rest.length) throw new Error('grep: хайх хэвийг бичнэ үү');
        const pat = rest[0];
        const re = E ? new RegExp(pat, i ? 'i' : '') : new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), i ? 'i' : '');
        const src = rest.length > 1 ? linesOf(fileText(files, rest[1])) : input;
        if (!src) throw new Error('grep: файл заагаагүй');
        const out = src.filter((l) => re.test(l) !== v);
        return c ? [String(out.length)] : out;
      }
      case 'wc': {
        const rest = args.filter((a) => !a.startsWith('-'));
        const l = rest.length ? linesOf(fileText(files, rest[0])) : input || [];
        if (args.includes('-w')) return [String(l.reduce((s, x) => s + (x.trim() ? fields(x).length : 0), 0))];
        if (args.includes('-c')) return [String(l.reduce((s, x) => s + utf8Bytes(x).length + 1, 0))];
        return [String(l.length)];
      }
      case 'sort': {
        const n = args.some((a) => /^-[a-z]*n/.test(a)), r = args.some((a) => /^-[a-z]*r/.test(a));
        const rest = args.filter((a) => !a.startsWith('-'));
        const l = (rest.length ? linesOf(fileText(files, rest[0])) : input || []).slice();
        l.sort((a, b) => (n ? (parseFloat(a) || 0) - (parseFloat(b) || 0) : a < b ? -1 : a > b ? 1 : 0));
        if (r) l.reverse();
        return l;
      }
      case 'uniq': {
        const c = args.includes('-c');
        const l = input || [];
        const out = [];
        let prev = null, cnt = 0;
        const flush = () => { if (prev !== null) out.push(c ? String(cnt).padStart(7, ' ') + ' ' + prev : prev); };
        l.forEach((x) => { if (x === prev) cnt++; else { flush(); prev = x; cnt = 1; } });
        flush();
        return out;
      }
      case 'awk': {
        const prog = args[0] || '';
        const m = prog.match(/^\{\s*print\s+(.+?)\s*\}$/);
        if (!m) throw new Error("awk: зөвхөн '{print $N}' хэлбэрийг дэмжинэ");
        const specs = m[1].split(/\s*,\s*/);
        const src = args.length > 1 ? linesOf(fileText(files, args[1])) : input || [];
        return src.map((line) => {
          const f = fields(line);
          return specs.map((sp) => {
            if (sp === '$0') return line;
            if (sp === '$NF') return f[f.length - 1];
            let mm = sp.match(/^\$\(NF-(\d+)\)$/);
            if (mm) return f[f.length - 1 - parseInt(mm[1], 10)] || '';
            mm = sp.match(/^\$(\d+)$/);
            if (mm) return f[parseInt(mm[1], 10) - 1] || '';
            throw new Error('awk: ойлгогдохгүй талбар ' + sp);
          }).join(' ');
        });
      }
      case 'cut': {
        let d = '\t', f = null; const rest = [];
        for (let k = 0; k < args.length; k++) {
          const a = args[k];
          if (a.startsWith('-d')) d = a.length > 2 ? a.slice(2) : args[++k];
          else if (a.startsWith('-f')) f = parseInt(a.length > 2 ? a.slice(2) : args[++k], 10);
          else rest.push(a);
        }
        if (!f) throw new Error('cut: -f N заана уу');
        const src = rest.length ? linesOf(fileText(files, rest[0])) : input || [];
        return src.map((l) => l.split(d)[f - 1] || '');
      }
      case 'sha256sum': {
        if (!args.length) throw new Error('sha256sum: файл заана уу');
        return args.map((a) => sha256(fileText(files, a)) + '  ' + a);
      }
      case 'base64': {
        if (!args.includes('-d')) throw new Error('base64: зөвхөн -d (тайлах) дэмжинэ');
        const rest = args.filter((a) => a !== '-d');
        const src = rest.length ? fileText(files, rest[0]) : (input || []).join('\n');
        return linesOf(b64decode(src));
      }
      case 'exiftool': {
        if (!args.length) throw new Error('exiftool: файл заана уу');
        const f = files[args[0]];
        if (f === undefined) throw new Error(args[0] + ': ийм файл байхгүй');
        if (typeof f === 'string' || !f.meta) return ['Мета өгөгдөл олдсонгүй'];
        return Object.keys(f.meta).map((k) => k.padEnd(28, ' ') + ': ' + f.meta[k]);
      }
      default:
        throw new Error(cmd + ': команд олдсонгүй (help гэж бичээд жагсаалтыг харна уу)');
    }
  }

  function run(line, files, ctx) {
    ctx = ctx || {};
    line = String(line).trim();
    if (!line) return { out: '' };
    try {
      let data = null;
      for (const seg of splitPipes(line)) {
        const argv = tokenize(seg);
        if (!argv.length) throw new Error('хоолойн (|) хооронд команд дутуу');
        data = runOne(argv, data, files, ctx);
      }
      return { out: (data || []).join('\n') };
    } catch (e) {
      return { out: e.message, error: true };
    }
  }

  const ENGINE = { sha256, b64decode, b64encode, caesar, hexdecode, parseUrl, passwordInfo, humanTime, run, tokenize };
  if (typeof module !== 'undefined' && module.exports) module.exports = ENGINE;
  else root.ENGINE = ENGINE;
})(typeof window !== 'undefined' ? window : globalThis);
