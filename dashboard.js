const token = localStorage.getItem('gh_token');
if (!token) window.location.href = 'index.html';

const owner = 'USERNAME_KAMU'; // ganti dengan username GitHub kamu
const repo = 'REPO_KAMU'; // ganti dengan nama repo kamu
const path = 'books.json';
let sha = '';

const headers = {
  Authorization: `token ${token}`,
  Accept: 'application/vnd.github.v3+json'
};

const bookList = document.getElementById('bookList');
const bookForm = document.getElementById('bookForm');

const loadBooks = async () => {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
  const data = await res.json();
  sha = data.sha;
  const content = JSON.parse(atob(data.content));
  bookList.innerHTML = '';
  content.forEach((book, index) => {
    const li = document.createElement('li');
    li.textContent = `${book.title} - ${book.status}`;
    li.innerHTML += ` <button onclick="deleteBook(${index})">Hapus</button>`;
    bookList.appendChild(li);
  });
};

const updateBooks = async (books) => {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: 'update books',
      content: btoa(JSON.stringify(books, null, 2)),
      sha
    })
  });
  const result = await res.json();
  sha = result.content.sha;
};

bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const status = document.getElementById('status').value;
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
  const data = await res.json();
  const books = JSON.parse(atob(data.content));
  books.push({ title, status });
  await updateBooks(books);
  bookForm.reset();
  loadBooks();
});

const deleteBook = async (index) => {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
  const data = await res.json();
  const books = JSON.parse(atob(data.content));
  books.splice(index, 1);
  await updateBooks(books);
  loadBooks();
};

const exportExcel = async () => {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
  const data = await res.json();
  const books = JSON.parse(atob(data.content));
  let csv = 'Judul,Status\n';
  books.forEach(b => csv += `${b.title},${b.status}\n`);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'books.csv';
  a.click();
};

const logout = () => {
  localStorage.removeItem('gh_token');
  window.location.href = 'index.html';
};

loadBooks();