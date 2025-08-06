const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve file statis dari folder public
app.use(express.static(path.join(__dirname, '../public')));

// JSON body parser
app.use(express.json());

// Route contoh
app.get('/api/hello', (req, res) => {
  res.json({ message: "Halo dari backend Node.js!" });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});

require('dotenv').config(); // WAJIB di paling atas sebelum panggil process.env

const { createClient } = require('@supabase/supabase-js');

const SCHEMA = 'tata_book'; // (optional) schema custom kamu
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    db: { schema: SCHEMA }
  }
);


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const { data: user, error } = await supabase
    .from('user') 
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Username atau password salah' });
  }

  return res.status(200).json({ message: 'Login berhasil', user: { id: user.id, username: user.username, name : user.name } });
});
// GET all books for a user
app.get('/books', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ error: 'Missing user_id parameter' });
    }

    const { data, error } = await supabase
      .from('book')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(0, 999);
    if (error) throw error;

    res.json({ data });
  } catch (err) {
    console.error('GET /books error:', err.message);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// POST new book
app.post('/books', async (req, res) => {
  const {
    book_name,
    book_author,
    book_genre,
    book_status,
    book_desc,
    user_id
  } = req.body;

  const { data, error } = await supabase
    .from('book')
    .insert([{
      book_name,
      book_author,
      book_genre,
      book_status,
      book_desc,
      user_id
    }])
    .select();

  if (error) {
  console.error('Supabase error:', error.message);
  return res.status(500).json({ error });
}
  return res.status(204).send(); // ← ini WAJIB ditambahkan agar response dikirim
});

// PUT update existing book
app.put('/books/:id', async (req, res) => {
  const { id } = req.params;
  const {
    book_name,
    book_author,
    book_genre,
    book_status,
    book_desc
  } = req.body;

  const { data, error } = await supabase
    .from('book')
    .update({
      book_name,
      book_author,
      book_genre,
      book_status,
      book_desc
    })
    .eq('id', id)
    .select();

  if (error) {
  console.error('Supabase error:', error.message);
  return res.status(500).json({ error });
}
  return res.status(204).send(); // ← ini WAJIB ditambahkan agar response dikirim
});

// DELETE book
app.delete('/books/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('book')
    .delete()
    .eq('id', id);

  if (error) {
  console.error('Supabase error:', error.message);
  return res.status(500).json({ error });
}
  return res.status(204).send(); // ← ini WAJIB ditambahkan agar response dikirim
});
