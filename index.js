require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { URL } = require('url');
const dns = require('dns');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

// Body parser middleware
app.use(express.urlencoded({ extended: false }));

// In-memory URL store
let url_db = [];
let url_id = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Shorten a valid url
app.post('/api/shorturl', (req, res) => {
  const og_url = req.body.url;

  try {
    const parsed_url = new URL(og_url);
    const hostname = parsed_url.hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({error: 'invalid url'});
      }
      
      const short_url = url_id++;
      url_db.push({og_url, short_url});

      res.json({
        original_url: og_url,
        short_url: short_url
      });
    }); 
  } catch(err) {
    res.json({error: 'invalid url'});
  };
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const short = parseInt(req.params.short_url);
  const entry_point = url_db.find((item) => item.short_url === short);

  if (entry_point) {
    res.redirect(entry_point.og_url);
  } else {
    res.status(404).json({ error: 'No short URL found for given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
