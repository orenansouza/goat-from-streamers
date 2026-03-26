const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const points = await new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout')), 20000);

      page.on('response', async (response) => {
        try {
          const data = await response.json();
          const list = data?.data?.list ?? (Array.isArray(data?.data) ? data.data : null);
          if (list) {
            const index = list.findIndex(s => s.name && s.name.startsWith('30K -'));
            if (index !== -1) {
              const squad = list[index];
              clearTimeout(timer);
              resolve(String(squad.points));
            }
          }
        } catch (_) {}
      });

      await page.goto('https://goatroyale.com/ranking/premium/squad', {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
    });

    const outputDir = path.join(__dirname, '..', 'docs', '30kPoints');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputPath, points);
    console.log('Points saved:', points);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
