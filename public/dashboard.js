// ====== client.js ======
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  window.location.href = 'index.html';
}

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#bookTable tbody");
  const searchInput = document.getElementById("searchInput");
  const addBookBtn = document.getElementById("addBookBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const toggleAddBookBtn = document.getElementById("addBookBtn");
  const addBookForm = document.getElementById("addBookForm");
  const submitBookBtn = document.getElementById("submitBookBtn");
  const inputNewTitle = document.getElementById("newTitle");
  const inputNewAuthor = document.getElementById("newAuthor");



  let books = [];

  async function fetchBooks() {
    const res = await fetch(`/books?user_id=${user.id}`);
    const json = await res.json();
    books = json.data || [];  // ambil array-nya dari properti 'data'
    renderTable(books);
  }

  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(book => {
      const row = document.createElement("tr");
      row.dataset.id = book.id;

      row.innerHTML = `
        <td data-label="Judul"><input type="text" class="title" value="${book.book_name}" /></td>
        <td data-label="Penulis"><input type="text" class="author" value="${book.book_author}" /></td>
        <td data-label="Aksi">
          <div class="action-dropdown">
            <button class="action-btn">Aksi ▾</button>
            <div class="dropdown-content" style="display:none;">
              <button class="save-btn" data-id="${book.id}">Simpan</button>
              <button class="delete-btn" data-id="${book.id}">Hapus</button>
            </div>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });
    attachActionListeners();
  }

  function attachActionListeners() {
    document.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        e.stopPropagation();
        const dropdown = btn.nextElementSibling;

        const isOpen = dropdown.style.display === "block";
        closeAllDropdowns(); // Tutup semua dulu
        if (!isOpen) {
        dropdown.style.display = "block"; // Buka hanya kalau sebelumnya tertutup
        }
    });
    });


    document.querySelectorAll(".save-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const row = btn.closest("tr");
        const title = row.querySelector(".title").value;
        const author = row.querySelector(".author").value;

        await fetch(`/books/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ book_name: title, book_author: author })
        });
        alert("Data buku berhasil diperbarui!");
        closeAllDropdowns();
        fetchBooks();
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (confirm("Yakin ingin menghapus buku ini?")) {
          await fetch(`/books/${id}`, { method: 'DELETE' });
          fetchBooks();
        }
      });
    });

    document.addEventListener("click", closeAllDropdowns);
  }

  function closeAllDropdowns() {
    document.querySelectorAll(".dropdown-content").forEach(dc => {
      dc.style.display = "none";
    });
  }

  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = books.filter(book =>
      book.book_name.toLowerCase().includes(keyword) ||
      book.book_author.toLowerCase().includes(keyword)
    );
    renderTable(filtered);
  });

  // Toggle form tambah buku
   addBookBtn.addEventListener("click", () => {
    // Toggle tampil/hidden
    if (addBookForm.style.display === "none" || addBookForm.style.display === "") {
      addBookForm.style.display = "block";
      addBookBtn.textContent = "Tutup Form";
    } else {
      addBookForm.style.display = "none";
      addBookBtn.textContent = "Tambah Buku";
    }
  });


  submitBookBtn.addEventListener("click", async () => {
    const title = inputNewTitle.value.trim();
    const author = inputNewAuthor.value.trim();

    if (!title || !author) {
      alert("Isi semua kolom!");
      return;
    }

    const res = await fetch(`/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        book_name: title,
        book_author: author,
        user_id: user.id,
        is_done: false
      })
    });

    if (res.ok) {
      alert("Buku berhasil ditambahkan!");
      addBookForm.style.display = "none";
      inputNewTitle.value = "";
      inputNewAuthor.value = "";
      fetchBooks();
    } else {
      alert("Gagal menambahkan buku.");
    }
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });

  fetchBooks();
});