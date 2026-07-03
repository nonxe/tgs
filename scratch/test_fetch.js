import fs from 'fs';

const proxies = [
  { name: 'thingproxy', url: 'https://thingproxy.freeboard.io/fetch/https://twitterwebviewer.com/?user=elonmusk' },
  { name: 'htmldriven', url: 'https://cors-proxy.htmldriven.com/?url=https://twitterwebviewer.com/?user=elonmusk' },
  { name: 'allorigins_raw', url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://twitterwebviewer.com/?user=elonmusk') },
  { name: 'corsproxy_io', url: 'https://corsproxy.io/?' + encodeURIComponent('https://twitterwebviewer.com/?user=elonmusk') },
];

async function testProxies() {
  for (const proxy of proxies) {
    try {
      console.log(`Testing ${proxy.name} ...`);
      const res = await fetch(proxy.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(5000),
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`Length: ${text.length}`);
        console.log(`Contains elonmusk:`, text.includes('elonmusk'));
        if (text.includes('elonmusk') && !text.includes('VPN') && !text.includes('hidemy.name')) {
          console.log(`SUCCESS! WORKING PROXY FOUND: ${proxy.name}`);
          fs.writeFileSync('C:\\Users\\alike\\.gemini\\antigravity\\brain\\0ed67316-961e-4474-ac5b-0713918c23d7\\scratch\\twv_page.html', text);
          break;
        }
      }
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

testProxies();
