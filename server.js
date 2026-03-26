const express = require('express');
const axios = require('axios');
const puppeteer = require('puppeteer');
const app = express();


app.get('/elmPoints', async (req, res) => {
  try {
    const response = await axios.get('https://api.goatroyale.com/info/ranking/guild', {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const contentType = response.headers['content-type'];

    if (contentType && contentType.indexOf('application/json') !== -1) {
      const data = response.data;
      const guild = data.data.list.find(g => g.name === 'ELM — Elements');
      if (guild) {
        res.send(`ELM — Elements: ${guild.points}`);
      } else {
        res.send('Não tem pontos no momento');
      }
    } else {
      console.error('Invalid JSON response');
      res.status(500).send('Invalid JSON response');
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Error fetching data');
  }
});

app.get('/30kPoints', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    const points = await new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout')), 15000);

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

      await page.goto('https://goatroyale.com/ranking/premium/squad', { waitUntil: 'domcontentloaded', timeout: 15000 });
    });

    if (points) {
      res.send(points);
    } else {

      res.send('Não tem pontos no momento');
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Error fetching data');
  } finally {
    if (browser) await browser.close();
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
