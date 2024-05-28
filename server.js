const express = require('express');
const axios = require('axios');
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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
