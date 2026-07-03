async function testApiFetch() {
  try {
    const url = 'https://api.twitterwebviewer.com/api/tweets/elonmusk';
    console.log(`Fetching ${url} ...`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://twitterwebviewer.com',
        'Referer': 'https://twitterwebviewer.com/',
      }
    });
    console.log('Status:', res.status);
    console.log('Headers:', [...res.headers.entries()]);
    const text = await res.text();
    console.log('Length:', text.length);
    console.log('Preview:', text.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testApiFetch();
