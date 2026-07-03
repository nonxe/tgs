import fs from 'fs';

const jsFiles = [
  '4bd1b696-665419bf7862b04a.js',
  '5947-09038808b8d0c93c.js',
  'main-app-dac742b49e555512.js',
  '4467-5661d8445bfe8389.js',
  'ad2866b8-39e29f3b6458da5f.js',
  '164f4fb6-eefa8207d2d906a0.js',
  '280273a7-c13237ff86ea6df6.js',
  '1534-a18b39546c3ec67c.js',
  '4539-65392814751b1711.js',
  '1356-7a83d42ccf161d13.js',
  '7503-f1b6e60e5f1a3fe0.js',
  '1168-992faf2567fb2a36.js',
  '4546-d43d4f36f92e3e79.js',
  '6990-06cd563df1677e88.js',
  '9719-bc44ac154ab03270.js',
  '2423-da93a2ffb4314eb8.js',
  'app/%5Blocale%5D/page-f9ecc52c7d8b1833.js',
  'app/%5Blocale%5D/layout-904657dc714f5275.js'
];

async function scanJs() {
  for (const file of jsFiles) {
    const cleanName = file.replace(/%5B/g, '[').replace(/%5D/g, ']');
    const url = `https://twitterwebviewer.com/_next/static/chunks/${file}`;
    console.log(`Scanning ${url} ...`);
    try {
      // Fetch JS via proxy
      const proxyUrl = 'https://proxy.cors.sh/' + url;
      const res = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        const text = await res.text();
        
        // Search for keywords
        const keywords = ['/api/', 'sotwe', 'twstalker', 'fxtwitter', 'vxtwitter', 'syndication', 'twitter.com', 'x.com', 'fetch(', 'axios'];
        for (const kw of keywords) {
          if (text.includes(kw)) {
            console.log(`  -> Found keyword "${kw}" in ${cleanName}`);
            // Find surrounding text
            let idx = 0;
            while ((idx = text.indexOf(kw, idx)) !== -1) {
              console.log(`    Context: ${text.substring(Math.max(0, idx - 50), Math.min(text.length, idx + 100)).replace(/\n/g, ' ')}`);
              idx += kw.length;
              if (idx > 2000) break; // Limit context search per file
            }
          }
        }
      }
    } catch (e) {
      console.log(`  Failed: ${e.message}`);
    }
  }
}

scanJs();
