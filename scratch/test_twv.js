async function findApiUrl() {
  try {
    const res = await fetch('https://proxy.cors.sh/https://twitterwebviewer.com/_next/static/chunks/4546-d43d4f36f92e3e79.js');
    const text = await res.text();
    const idx = text.indexOf('https://api.twitterweb');
    if (idx !== -1) {
      console.log('API URL Found:', text.substring(idx, idx + 100).split('"')[0].split("'")[0]);
    } else {
      console.log('Not found by prefix, searching with regex...');
      const regex = /https:\/\/api\.[a-zA-Z0-9.-]+/g;
      console.log('Regex matches:', text.match(regex));
    }
  } catch (e) {
    console.error(e);
  }
}

findApiUrl();
