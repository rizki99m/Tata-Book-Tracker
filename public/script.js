async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error-msg");

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({username, password})
  });

  const result = await res.json();
  if (res.ok) {
      localStorage.setItem('user', JSON.stringify(result.user));
      window.location.href = 'dashboard.html';
  } else {
    errorMsg.textContent = result.error || "Gagal login";
  }
}
