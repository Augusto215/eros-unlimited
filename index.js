const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname , 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: 'Site de Filmes' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

app.get('/partner', (req, res) => {
  res.render('partner', { title: 'Partner' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
