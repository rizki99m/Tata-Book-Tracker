document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const token = document.getElementById('username').value.trim();
  if (token) {
    localStorage.setItem('gh_token', token);
    window.location.href = 'dashboard.html';
  } else {
    alert('Isi token dulu');
  }
});