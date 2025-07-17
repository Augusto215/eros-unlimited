const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3022;

const session = require('express-session'); 
require('dotenv').config();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname , 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// Middleware para verificar autenticação
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }

  return res.redirect('/login');
};

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Site de Filmes',
    isLoggedIn: !!req.session?.user,
    user: req.session?.user || null
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About',
    isLoggedIn: !!req.session?.user,
    user: req.session?.user || null
  });
});

app.get('/partner', (req, res) => {
  res.render('partner', {
    title: 'Partner',
    isLoggedIn: !!req.session?.user,
    user: req.session?.user || null
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact',
    isLoggedIn: !!req.session?.user,
    user: req.session?.user || null
   });
});

app.get('/movies', (req, res) => {
  res.render('movies', {
    title: 'Movies',
    isLoggedIn: !!req.session?.user,
    user: req.session?.user || null
   });
});

app.get('/register', (req, res) => {
  // Se já está logado, redirecionar para home
  if (req.session?.user) {
    return res.redirect('/');
  }
  
  res.render('register', { 
    title: 'Register', 
    isLoggedIn: false,
    user: null
  });
});

app.get('/login', (req, res) => {
  // Se já está logado, redirecionar para home
  if (req.session?.user) {
    return res.redirect('/');
  }
  
  res.render('login', { 
    title: 'Login', 
    isLoggedIn: false,
    user: null
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
    }
    res.redirect('/');
  });
});

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

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validações básicas
    if (!email || !password) {
      return res.render('login', { 
        error: 'Email and password are required.', 
        title: 'Login', 
        isLoggedIn: false,
        user: null
      });
    }

    // Buscar usuário no banco
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password_hash, is_active')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.render('login', { 
        error: 'Invalid email or password.', 
        title: 'Login', 
        isLoggedIn: false,
        user: null
      });
    }

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.render('login', { 
        error: 'Account is inactive. Contact support.', 
        title: 'Login', 
        isLoggedIn: false,
        user: null
      });
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.render('login', { 
        error: 'Invalid email or password.', 
        title: 'Login', 
        isLoggedIn: false,
        user: null
      });
    }

    // Login bem-sucedido - criar sessão
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    // Atualizar last_login (opcional)
    await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id);

    // Redirecionar para dashboard ou página inicial
    res.redirect('/');

  } catch (error) {
    console.error('Error during login process:', error);

    return res.render('login', { 
      error: 'Error processing login. Please try again.', 
      title: 'Login', 
      isLoggedIn: false,
      user: null
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
