import fs from 'fs';

async function findWorkingNitter() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/wiki/zedeus/nitter/Instances.md');
    const md = await res.text();
    
    // Extract all URLs
    const regex = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;
    const urls = [];
    let match;
    while ((match = regex.exec(md)) !== null) {
      const url = match[0];
      if (url.includes('nitter') && !urls.includes(url) && !url.includes('github') && !url.includes('zedeus')) {
        urls.push(url);
      }
    }
    
    console.log('Found Nitter instances in wiki:', urls.length);
    console.log('Instances list:', urls);
    
    // Test the first 25 instances
    for (const base of urls.slice(0, 30)) {
      try {
        console.log(`Testing ${base}/elonmusk/rss ...`);
        const rssRes = await fetch(`${base}/elonmusk/rss`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(4000),
        });
        console.log(`Status: ${rssRes.status}`);
        if (rssRes.ok) {
          const text = await rssRes.text();
          if (text.includes('<rss') || text.includes('<feed')) {
            console.log(`SUCCESS! Working Nitter RSS instance: ${base}`);
            fs.writeFileSync('C:\\Users\\alike\\.gemini\\antigravity\\brain\\0ed67316-961e-4474-ac5b-0713918c23d7\\scratch\\twv_page.html', text);
            break;
          }
        }
      } catch (e) {
        console.log(`Failed: ${e.message}`);
      }
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

findWorkingNitter();
