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

  let isMobileView = window.innerWidth < 768;

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
    renderBooks();
    updateSummary(books);
  }

  let activeFilterStatus = "all"; 

  function renderBooks() {
  const keyword = searchInput.value.toLowerCase();
  const filtered = books.filter(book => {
    const matchSearch = book.book_name.toLowerCase().includes(keyword) || book.book_author.toLowerCase().includes(keyword);
    const matchStatus = activeFilterStatus === "all" || String(book.book_status) === activeFilterStatus;
    return matchSearch && matchStatus;
  });

  container.innerHTML = "";

  if (isMobileView) {
    // Render cards (mobile)
    filtered.forEach(book => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-xl p-4 shadow relative";
      card.innerHTML = `
        <div class="absolute top-2 right-2">
          <button onclick="toggleDropdown(${book.id})" class="text-lg text-gray-500 hover:text-black">⋮</button>
          <div id="dropdown-${book.id}" class="hidden absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-md z-50">
            <button onclick="startEditBook(${book.id}); closeDropdown()" class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2">
              ✏️ Edit
            </button>
            <button onclick="deleteBook(${book.id}); closeDropdown()" class="w-full px-4 py-2 text-left hover:bg-red-100 text-red-600 flex items-center gap-2">
              🗑️ Hapus
            </button>
          </div>
        </div>
        <h3 class="font-semibold">${book.book_name}</h3>
        <p class="text-sm text-gray-600">${book.book_author}</p>
        ${renderStatus(book.book_status)}
        <p class="text-sm text-gray-500 mt-1">Genre: ${book.book_genre || '-'}</p>
        <p class="text-sm text-gray-500">Ditambahkan: ${new Date(book.created_at).toLocaleDateString('id-ID')}</p>
        ${book.book_desc ? `<p class="text-sm text-gray-700 mt-2">Catatan: ${book.book_desc}</p>` : ''}
      `;
      container.appendChild(card);
    });

  } else {
    // Render table (desktop)
    const wrapper = document.createElement("div");
    wrapper.className = "overflow-x-auto w-full";

    const table = document.createElement("table");
    table.className = "w-full table-fixed bg-white rounded-xl shadow text-sm";

    table.innerHTML = `
      <thead class="bg-gray-100 text-left">
      <tr>
        <th class="p-3 w-1/5">Judul</th>
        <th class="p-3 w-1/5">Penulis</th>
        <th class="p-3 w-1/6">Genre</th>
        <th class="p-3 w-1/6">Status</th>
        <th class="p-3 w-1/4">Catatan</th>
        <th class="p-3 w-1/6">Ditambahkan</th>
        <th class="p-3 w-1/6">Aksi</th>
      </tr>
    </thead>
      <tbody>
        ${filtered.map(book => `
          <tr class="border-t">
            <td class="p-3">${book.book_name}</td>
            <td class="p-3">${book.book_author}</td>
            <td class="p-3">${book.book_genre || '-'}</td>
            <td class="p-3">${renderStatusText(book.book_status)}</td>
            <td class="p-3">${book.book_desc || '-'}</td>
            <td class="p-3">${new Date(book.created_at).toLocaleDateString('id-ID')}</td>
            <td class="p-3">
              <button onclick="startEditBook(${book.id})" class="text-blue-600 hover:underline mr-2">Edit</button>
              <button onclick="deleteBook(${book.id})" class="text-red-600 hover:underline">Hapus</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    `;

    wrapper.appendChild(table);
    container.appendChild(wrapper);
  }
}

function renderStatusText(status) {
  switch (status) {
    case 0: return "Belum Dibaca";
    case 1: return "Sedang Dibaca";
    case 2: return "Selesai";
    default: return "-";
  }
}

  window.toggleDropdown = function(id) {
    document.querySelectorAll('[id^="dropdown-"]').forEach(drop => {
      if (drop.id !== `dropdown-${id}`) drop.classList.add("hidden");
    });
    const dropdown = document.getElementById(`dropdown-${id}`);
    dropdown.classList.toggle("hidden");
  };

  window.closeDropdown = function () {
    document.querySelectorAll('[id^="dropdown-"]').forEach(drop => {
      drop.classList.add("hidden");
    });
  };

  document.addEventListener("click", function (e) {
    const isDropdownBtn = e.target.closest("button[onclick^='toggleDropdown']");
    const isInsideDropdown = e.target.closest("div[id^='dropdown-']");
    
    if (!isDropdownBtn && !isInsideDropdown) {
      closeDropdown();
    }
  });

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
    console.log("JUMLAH BUKU ", data.length);
    totalCount.textContent = data.length;
    belumCount.textContent = data.filter(b => b.book_status === 0).length;
    sedangCount.textContent = data.filter(b => b.book_status === 1).length;
    selesaiCount.textContent = data.filter(b => b.book_status === 2).length;
  }

  searchInput.addEventListener("input", () => {
  renderBooks();
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
      book_status : status,
      book_desc: desc
    };

    console.log("Payload yang dikirim:", payload); 
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

    toggleForm(false);
    addBookBtn.textContent = "Tambah Buku";
    inputNewTitle.value = "";
    inputNewAuthor.value = "";
    inputNewGenre.value = "";
    inputNewStatus.value = "0";
    inputNewDesc.value = "";
    inputEditId.value = "";

    fetchBooks();
  });

  window.startEditBook = function(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    inputEditId.value = book.id;
    inputNewTitle.value = book.book_name;
    inputNewAuthor.value = book.book_author;
    inputNewGenre.value = book.book_genre || "";
    inputNewStatus.value = book.book_status || "0";
    inputNewDesc.value = book.book_desc || "";

    toggleForm(true);
  }

  window.deleteBook = async function(id) {
    if (confirm("Apakah kamu yakin ingin menghapus buku ini?")) {
      const res = await fetch(`/books/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert("Buku berhasil dihapus.");
        fetchBooks();
      } else {
        alert("Gagal menghapus buku.");
      }
    }
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });

  window.addEventListener('resize', () => {
    const prevView = isMobileView;
    isMobileView = window.innerWidth < 768;
    if (prevView !== isMobileView) renderBooks(); // Rerender jika berpindah mobile <-> desktop
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    activeFilterStatus = btn.getAttribute("data-status");

    // Update tampilan tombol aktif
    document.querySelectorAll(".filter-btn").forEach(b => {
      b.classList.remove("bg-gradient-to-r", "from-violet-500", "to-blue-500", "text-white");
      b.classList.add("border", "border-gray-300", "text-black");
    });

    btn.classList.remove("border", "border-gray-300", "text-black");
    btn.classList.add("bg-gradient-to-r", "from-violet-500", "to-blue-500", "text-white");

    renderBooks(); // render ulang sesuai filter
  });
});

  fetchBooks();
});
