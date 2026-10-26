/* CSBC101 SCORM 1.2 пакетлагч.
   Ашиглах: node build_scorm.js <lesson.js> <out_dir_for_package_files>
   Гаралт: index.html, engine.js, player.js, style.css, content.js, imsmanifest.xml, metadata.xml */
const fs = require('fs');
const path = require('path');

const lessonFile = process.argv[2];
const outDir = process.argv[3];
if (!lessonFile || !outDir) { console.error('Usage: node build_scorm.js <lesson.js> <out_dir>'); process.exit(1); }

const PLAYER = path.join(__dirname, 'player');
fs.mkdirSync(outDir, { recursive: true });

// LESSON-ийн meta-г уншина (гүйцэтгэхгүйгээр num/title-ийг авах зорилгоор engine stub)
const src = fs.readFileSync(lessonFile, 'utf8');
const num = (src.match(/num:\s*(\d+)/) || [])[1] || '0';
const titleM = src.match(/title:\s*'([^']+)'/) || src.match(/title:\s*"([^"]+)"/);
const title = titleM ? titleM[1] : ('Лекц ' + num);
const idM = src.match(/id:\s*'([^']+)'/);
const courseId = idM ? idM[1] : ('csbc101_l' + num);

// Статик файлуудыг хуулна
['index.html', 'engine.js', 'player.js', 'style.css'].forEach((f) => {
  fs.copyFileSync(path.join(PLAYER, f), path.join(outDir, f));
});
fs.copyFileSync(lessonFile, path.join(outDir, 'content.js'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fullTitle = 'Лекц ' + num + '. ' + title;

const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST-${esc(courseId)}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
    <adlcp:location>metadata.xml</adlcp:location>
  </metadata>
  <organizations default="ORG-${esc(courseId)}">
    <organization identifier="ORG-${esc(courseId)}">
      <title>CSBC101 Мэргэжлийн удиртгал</title>
      <item identifier="ITEM-${esc(courseId)}" identifierref="RES-${esc(courseId)}" isvisible="true">
        <title>${esc(fullTitle)}</title>
        <adlcp:masteryscore>70</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-${esc(courseId)}" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="engine.js"/>
      <file href="player.js"/>
      <file href="content.js"/>
      <file href="style.css"/>
      <file href="metadata.xml"/>
    </resource>
  </resources>
</manifest>
`;
fs.writeFileSync(path.join(outDir, 'imsmanifest.xml'), manifest);

const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<lom xmlns="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1">
  <general>
    <title><langstring xml:lang="mn">${esc(fullTitle)}</langstring></title>
    <description><langstring xml:lang="mn">CSBC101 «Мэргэжлийн удиртгал» хичээлийн интерактив лекц ба практик дасгалууд. ҮБХИС, Кибер аюулгүй байдлын тэнхим.</langstring></description>
    <language>mn</language>
  </general>
  <lifecycle><version><langstring>1.0</langstring></version></lifecycle>
  <technical><format>text/html</format></technical>
  <educational>
    <learningresourcetype><value><langstring xml:lang="x-none">exercise</langstring></value></learningresourcetype>
    <intendedenduserrole><value><langstring xml:lang="x-none">learner</langstring></value></intendedenduserrole>
  </educational>
</lom>
`;
fs.writeFileSync(path.join(outDir, 'metadata.xml'), metadata);
console.log('built package files in', outDir, '(', fullTitle, ')');
