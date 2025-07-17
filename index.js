const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3010;

require('dotenv').config();
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname , 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: 'Site de Filmes', isLoggedIn: !!req.session?.user });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About', isLoggedIn: !!req.session?.user });
});

app.get('/partner', (req, res) => {
  res.render('partner', { title: 'Partner', isLoggedIn: !!req.session?.user });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact', isLoggedIn: !!req.session?.user });
});

app.get('/cadastro', (req, res) => {
  res.render('cadastro', { title: 'Cadastro', isLoggedIn: !!req.session?.user });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login', isLoggedIn: !!req.session?.user });
});

app.get('/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(express.urlencoded({ extended: true }));

app.post('/cadastro', async (req, res) => {
  const { name, email, password } = req.body;

  // Verifica se o email já existe
  const { data: existingUser, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    // Email já cadastrado
    return res.render('cadastro', { error: 'Email já cadastrado!', title: 'Cadastro', isLoggedIn: !!req.session?.user });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Salva novo usuário
  const { data, error: insertError } = await supabase
    .from('users')
    .insert([{ name, email, password_hash: hashedPassword }]);

  if (insertError) {
    console.log('Erro ao cadastrar usuário:', insertError);
    return res.render('cadastro', { error: 'Erro ao cadastrar!', title: 'Cadastro', isLoggedIn: !!req.session?.user });
  }

  // Cadastro realizado com sucesso
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
