const express = require('express');
const morgan = require('morgan');
const path = require('path');

const config = require('./config');
const { data } = require('./data');

const logger = morgan('short');

const app = express();

app.use(logger, express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res, next) => {
  res.render('index', { data });
});

app.get('/download', (req, res, next) => {
  res.render('default', { data });
});

data.products.forEach((product, index) => {
  const productData = { global: data.global, ...product };
  app.get(`/${product.slug}`, (req, res, next) => {
    res.render('choice', { data: productData });
  });

  app.get(`/download/${product.slug}`, (req, res, next) => {
    res.render('download', { data, index });
  });
});

app.use(express.static(path.join(__dirname, 'static')));

const port = process.env['PORT'] || config.port || 9292;
app.listen(port, () => {
  console.log(`Firefox Fortress started on ${port}`); //eslint-disable-line no-console
});
