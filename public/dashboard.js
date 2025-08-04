// dashboard.js
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  window.location.href = 'index.html';
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("bookContainer");
  const searchInput = document.getElementById("searchInput");
  const addBookBtn = document.getElementById("addBookBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const addBookForm = document.getElementById("addBookForm");
  const submitBookBtn = document.getElementById("submitBookBtn");
  const inputNewTitle = document.getElementById("newTitle");
  const inputNewAuthor = document.getElementById("newAuthor");
  const inputNewGenre = document.getElementById("newGenre");
  const inputNewStatus = document.getElementById("newStatus");
  const inputNewDesc = document.getElementById("newDesc");
  const inputEditId = document.getElementById("editId");

  const totalCount = document.getElementById("totalCount");
  const belumCount = document.getElementById("belumCount");
  const sedangCount = document.getElementById("sedangCount");
  const selesaiCount = document.getElementById("selesaiCount");

  let books = [];

  function toggleForm(force = null) {
    const form = document.getElementById("addBookForm");
    const show = force !== null ? force : form.classList.contains("hidden");

    if (show) {
      form.classList.remove("hidden");
    } else {
      form.classList.add("hidden");

      // Reset input saat form ditutup
      inputEditId.value = "";
      inputNewTitle.value = "";
      inputNewAuthor.value = "";
      inputNewGenre.value = "";
      inputNewStatus.value = "0";
      inputNewDesc.value = "";
    }
}

window.toggleForm = toggleForm;

  async function fetchBooks() {
    const res = await fetch(`/books?user_id=${user.id}`);
    const json = await res.json();
    books = json.data || [];
    renderBooks(books);
    updateSummary(books);
  }

  function renderBooks(data) {
    container.innerHTML = "";
    data.forEach(book => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-xl p-4 shadow relative";
      card.innerHTML = `
        <button onclick="startEditBook(${book.id})" class="absolute top-2 right-2 text-sm text-gray-400 hover:text-black">⋮</button>
        <h3 class="font-semibold">${book.book_name}</h3>
        <p class="text-sm text-gray-600">${book.book_author}</p>
        ${renderStatus(book.status)}
        <p class="text-sm text-gray-500 mt-1">Genre: ${book.book_genre || '-'}</p>
        <p class="text-sm text-gray-500">Ditambahkan: ${new Date(book.created_at).toLocaleDateString('id-ID')}</p>
        ${book.book_desc ? `<p class="text-sm text-gray-700 mt-2">Catatan: ${book.book_desc}</p>` : ''}
      `;
      container.appendChild(card);
    });
  }
  

  function renderStatus(status) {
    switch (status) {
      case 0:
        return `<div class="text-sm text-orange-600 font-medium mt-2">🕐 Belum Dibaca</div>`;
      case 1:
        return `<div class="text-sm text-blue-600 font-medium mt-2">📘 Sedang Dibaca</div>`;
      case 2:
        return `<div class="text-sm text-green-600 font-medium mt-2">✅ Selesai</div>`;
      default:
        return `<div class="text-sm text-gray-500 font-medium mt-2">❓ Tidak diketahui</div>`;
    }
  }

  function updateSummary(data) {
    totalCount.textContent = data.length;
    belumCount.textContent = data.filter(b => b.status === 0).length;
    sedangCount.textContent = data.filter(b => b.status === 1).length;
    selesaiCount.textContent = data.filter(b => b.status === 2).length;
  }

  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = books.filter(book =>
      book.book_name.toLowerCase().includes(keyword) ||
      book.book_author.toLowerCase().includes(keyword)
    );
    renderBooks(filtered);
  });

  addBookBtn.addEventListener("click", () => {
  const isEditing = inputEditId.value !== "";
  if (!isEditing) {
    inputNewTitle.value = "";
    inputNewAuthor.value = "";
    inputNewGenre.value = "";
    inputNewStatus.value = "0";
    inputNewDesc.value = "";
    inputEditId.value = "";
  }
  toggleForm();
});

  submitBookBtn.addEventListener("click", async () => {
    const title = inputNewTitle.value.trim();
    const author = inputNewAuthor.value.trim();
    const genre = inputNewGenre.value.trim();
    const status = parseInt(inputNewStatus.value);
    const desc = inputNewDesc.value.trim();
    const editId = inputEditId.value;

    if (!title || !author || !genre) {
      alert("Isi semua kolom!");
      return;
    }

    const payload = {
      book_name: title,
      book_author: author,
      book_genre: genre,
      status,
      book_desc: desc
    };

    try {
      let res;
      if (editId) {
        res = await fetch(`/books/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          alert("Buku berhasil diperbarui!");
        } else {
          alert("Gagal memperbarui buku.");
        }
      } else {
        payload.user_id = user.id;
        res = await fetch(`/books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          alert("Buku berhasil ditambahkan!");
        } else {
          alert("Gagal menambahkan buku.");
        }
      }
    } catch (err) {
      console.error("Kesalahan jaringan:", err);
      alert("Terjadi kesalahan saat menyimpan data.");
    }

    // Reset & tutup form
    toggleForm(false);
    addBookBtn.textContent = "Tambah Buku";
    inputNewTitle.value = "";
    inputNewAuthor.value = "";
    inputNewGenre.value = "";
    inputNewStatus.value = "0";
    inputNewDesc.value = "";
    inputEditId.value = "";

    // Refresh daftar
    fetchBooks();
});


  window.startEditBook = function(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    inputEditId.value = book.id;
    inputNewTitle.value = book.book_name;
    inputNewAuthor.value = book.book_author;
    inputNewGenre.value = book.book_genre || "";
    inputNewStatus.value = book.status || "0";
    inputNewDesc.value = book.book_desc || "";

    // Buka form menggunakan toggleForm
    toggleForm(true);
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });

  fetchBooks();
});
