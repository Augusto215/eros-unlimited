const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3010;

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

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register', isLoggedIn: !!req.session?.user });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login', isLoggedIn: !!req.session?.user });
});

app.get('/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/');
});

require('dotenv').config();
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(express.urlencoded({ extended: true }));

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 6);

    const { data, error: insertError } = await supabase
      .from('users')
      .insert([{ 
        name, 
        email, 
        password_hash: hashedPassword 
      }])
      .select()
      .single();

    if (insertError) {
      // Verificar se é erro de email duplicado
      if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
        return res.render('register', { 
          error: 'Email already registered! Log in or use another email.', 
          title: 'Register', 
          isLoggedIn: !!req.session?.user 
        });
      }
      
      console.error('Erro ao cadastrar usuário:', insertError);
      return res.render('register', { 
        error: 'Error registering user. Please try again.', 
        title: 'Register', 
        isLoggedIn: !!req.session?.user 
      });
    }

    // Registration successful
    return res.render('register', { 
      success: true, 
      title: 'Register', 
      isLoggedIn: !!req.session?.user 
    });

  } catch (error) {
    console.error('Error during registration process:', error);

    return res.render('register', { 
      error: 'Error processing registration. Please try again.', 
      title: 'Register', 
      isLoggedIn: !!req.session?.user 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
