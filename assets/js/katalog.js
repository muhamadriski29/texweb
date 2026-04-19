// ==========================================
// 1. KONFIGURASI GOOGLE SHEETS & PAGINASI
// ==========================================
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1RqwTq4-nVf_vReJtTu10p9pFEVthw1FaxbJI-4Ff4Qo/export?format=csv";

let allProducts = [];
let currentFilteredProducts = []; // Menyimpan hasil filter untuk dipaginasi
let currentCategory = "Semua";

// Pengaturan Paginasi
let currentPage = 1;
const ITEMS_PER_PAGE = 6; // Menampilkan 6 produk per halaman

// ==========================================
// 2. FUNGSI UTAMA (DIJALANKAN SAAT WEB DIBUKA)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  fetchProductsFromSheet();
  setupSearchAndFilter();
  setupCustomDropdown();
});

function fetchProductsFromSheet() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10 animate-pulse">Sedang memuat ratusan koleksi kain premium...</p>';

  Papa.parse(SHEET_CSV_URL, {
    download: true,
    header: true,
    complete: function (results) {
      // 1. Ambil hanya produk yang published = YA
      allProducts = results.data.filter((item) => item.nama && item.published && item.published.trim().toUpperCase() === "YA");

      // 2. LOGIKA PENGURUTAN: Best Seller tampil duluan!
      allProducts.sort((a, b) => {
        const isBestA = a.best_seller && a.best_seller.trim().toUpperCase() === "YA" ? 1 : 0;
        const isBestB = b.best_seller && b.best_seller.trim().toUpperCase() === "YA" ? 1 : 0;
        return isBestB - isBestA; // Urutkan menurun (1 di atas, 0 di bawah)
      });

      currentFilteredProducts = [...allProducts]; // Salin semua produk ke variabel filter awal

      renderCategories();
      renderProductsAndPagination();
    },
    error: function (error) {
      console.error("Error mengambil data CSV:", error);
      grid.innerHTML = '<p class="col-span-full text-center text-red-500 py-10">Gagal memuat katalog. Pastikan koneksi internet stabil.</p>';
    },
  });
}

// ==========================================
// 3. FUNGSI PEMBUAT KATEGORI DINAMIS
// ==========================================
function renderCategories() {
  const rawCategories = allProducts.map((p) => (p.kategori ? p.kategori.trim() : "Lainnya"));
  const uniqueCategories = ["Semua", ...new Set(rawCategories)];

  // A. Desktop
  const desktopContainer = document.getElementById("desktop-category-container");
  if (desktopContainer) {
    desktopContainer.innerHTML = "";
    uniqueCategories.forEach((cat) => {
      const isActive = cat === currentCategory;
      const btnClass = isActive
        ? "px-5 py-2 rounded-full bg-alftex-accent text-white font-bold text-sm shadow-md transition-transform hover:scale-105"
        : "px-5 py-2 rounded-full bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-600 font-medium text-sm hover:bg-alftex-primary hover:text-white dark:hover:bg-slate-600 transition-colors";

      const btn = document.createElement("button");
      btn.className = btnClass;
      btn.innerText = cat;
      btn.onclick = () => filterByCategory(cat);
      desktopContainer.appendChild(btn);
    });
  }

  // B. Mobile
  const mobileList = document.getElementById("mobile-category-list");
  const dropdownText = document.getElementById("dropdown-selected-text");

  if (mobileList && dropdownText) {
    mobileList.innerHTML = "";
    dropdownText.innerText = currentCategory === "Semua" ? "Semua Kategori" : currentCategory;

    uniqueCategories.forEach((cat) => {
      const li = document.createElement("li");
      const isActive = cat === currentCategory;

      li.className = `px-5 py-3 cursor-pointer transition-colors ${isActive ? "bg-alftex-primary/10 dark:bg-slate-700/80 text-alftex-accent font-bold" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-alftex-primary dark:hover:text-white"}`;
      li.innerText = cat === "Semua" ? "Semua Kategori" : cat;

      li.onclick = () => {
        filterByCategory(cat);
        closeDropdown();
      };

      mobileList.appendChild(li);
    });
  }
}

// ==========================================
// 4. LOGIKA CUSTOM DROPDOWN (MOBILE)
// ==========================================
function setupCustomDropdown() {
  const dropdownBtn = document.getElementById("custom-dropdown-btn");
  if (dropdownBtn) {
    dropdownBtn.onclick = (e) => {
      e.stopPropagation();
      const dropdownMenu = document.getElementById("custom-dropdown-menu");
      if (dropdownMenu.classList.contains("hidden")) {
        openDropdown();
      } else {
        closeDropdown();
      }
    };
  }
  document.addEventListener("click", (e) => {
    const dropdownBtn = document.getElementById("custom-dropdown-btn");
    const dropdownMenu = document.getElementById("custom-dropdown-menu");
    if (dropdownBtn && dropdownMenu && !dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      closeDropdown();
    }
  });
}

function openDropdown() {
  const dropdownMenu = document.getElementById("custom-dropdown-menu");
  const dropdownIcon = document.getElementById("dropdown-icon");
  dropdownMenu.classList.remove("hidden");
  setTimeout(() => {
    dropdownMenu.classList.remove("opacity-0", "scale-95");
    dropdownMenu.classList.add("opacity-100", "scale-100");
    dropdownIcon.classList.add("rotate-180");
  }, 10);
}

function closeDropdown() {
  const dropdownMenu = document.getElementById("custom-dropdown-menu");
  const dropdownIcon = document.getElementById("dropdown-icon");
  dropdownMenu.classList.remove("opacity-100", "scale-100");
  dropdownMenu.classList.add("opacity-0", "scale-95");
  dropdownIcon.classList.remove("rotate-180");
  setTimeout(() => {
    dropdownMenu.classList.add("hidden");
  }, 300);
}

// ==========================================
// 5. LOGIKA PENCARIAN & FILTER
// ==========================================
function filterByCategory(cat) {
  currentCategory = cat;
  renderCategories();
  triggerFilter();
}

function setupSearchAndFilter() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => triggerFilter());
  }
}

function triggerFilter() {
  const searchInput = document.getElementById("searchInput");
  const keyword = searchInput ? searchInput.value.toLowerCase() : "";

  let filtered = allProducts;

  if (currentCategory !== "Semua") {
    filtered = filtered.filter((product) => product.kategori && product.kategori.trim() === currentCategory);
  }

  if (keyword) {
    filtered = filtered.filter((product) => product.nama.toLowerCase().includes(keyword) || product.kategori.toLowerCase().includes(keyword));
  }

  // Simpan hasil saringan, reset ke halaman 1, lalu render
  currentFilteredProducts = filtered;
  currentPage = 1;
  renderProductsAndPagination();
}

// ==========================================
// 6. FUNGSI MERAKIT PRODUK & PAGINASI
// ==========================================
function renderProductsAndPagination() {
  renderProducts();
  renderPagination();
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  if (currentFilteredProducts.length === 0) {
    grid.innerHTML = '<p class="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">Tidak ada produk yang cocok dengan pencarian atau kategori Anda.</p>';
    return;
  }

  // Logika memotong array untuk Paginasi
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = currentFilteredProducts.slice(startIndex, endIndex);

  paginatedProducts.forEach((product, index) => {
    const nama = product["nama"];
    const kategori = product["kategori"];
    const deskripsi = product["deskripsi"]; // Tetap mengikuti nama kolom di Sheet Anda
    const gambarRaw = product["gambar"];
    const gambar = gambarRaw ? gambarRaw.trim() : "";
    const lebar = product["lebar"];
    const minOrder = product["min_order"];

    // Mengecek apakah produk ini Best Seller
    const bestSellerRaw = product["best_seller"];
    const isBestSeller = bestSellerRaw && bestSellerRaw.trim().toUpperCase() === "YA";

    const waText = encodeURIComponent(
      `Halo Admin ALFTEX ✨,\nSaya sangat tertarik dan ingin bertanya mengenai produk berikut:\n\n📦 *Nama Produk:* ${nama}\n🏷️ *Kategori:* ${kategori}\n📏 *Lebar Kain:* ${lebar}\n🛒 *Min. Order:* ${minOrder}\n\nMohon info lebih lanjut mengenai ketersediaan stoknya ya. Terima kasih! 🙏`,
    );
    const waLink = `https://wa.me/6282151551532?text=${waText}`;

    let imageSrc = gambar ? `assets/images/products/${gambar}` : "https://via.placeholder.com/400x400/2C1A4D/FFFFFF?text=Foto+Menyusul";

    // Desain Badge Best Seller yang Mewah, Estetik, dan Elegan
    const badgeHTML = isBestSeller
      ? `
      <div class="absolute top-4 left-4 bg-alftex-primary/90 dark:bg-slate-900/90 backdrop-blur-md border border-alftex-accent/50 text-alftex-accent text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg z-20 flex items-center gap-1.5">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
        Best Seller
      </div>
    `
      : "";

    const cardHTML = `
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-1000 hover:duration-300 ease-out border border-gray-100 dark:border-slate-700 overflow-hidden group animate-on-scroll opacity-0 translate-y-16 h-full flex flex-col relative">
        
        <div class="relative h-56 md:h-64 overflow-hidden shrink-0 bg-gray-50 dark:bg-slate-700/50 cursor-pointer p-4 flex items-center justify-center" onclick="openZoomModal('${imageSrc}')">
          <img src="${imageSrc}" alt="${nama}" onerror="this.src='https://via.placeholder.com/400x400/2C1A4D/FFFFFF?text=Foto+Menyusul'" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 z-0">
          <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10"></div>
          
          ${badgeHTML}

          <div class="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-full backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm z-20">
            <svg class="w-4 h-4 text-alftex-primary dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
          </div>
        </div>
        
        <div class="p-5 md:p-6 flex flex-col flex-grow">
          <span class="text-xs font-bold text-alftex-accent uppercase tracking-wider mb-2 block">${kategori}</span>
          <h3 class="text-lg md:text-xl font-bold text-alftex-primary dark:text-white mb-2 line-clamp-2">${nama}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">${deskripsi}</p>
          
          <div class="flex items-center justify-between text-xs md:text-sm mb-5 md:mb-6 border-y border-gray-100 dark:border-slate-700 py-3 mt-auto shrink-0">
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-400 mb-0.5">Lebar Kain</span>
              <span class="font-bold text-gray-800 dark:text-gray-200">${lebar}</span>
            </div>
            <div class="flex flex-col text-right">
              <span class="text-gray-500 dark:text-gray-400 mb-0.5">Min. Order</span>
              <span class="font-bold text-gray-800 dark:text-gray-200">${minOrder}</span>
            </div>
          </div>

          <a href="${waLink}" target="_blank" class="w-full shrink-0 flex items-center justify-center gap-2 bg-alftex-primary dark:bg-slate-700 text-white py-3 rounded-xl font-bold text-sm md:text-base hover:bg-alftex-accent dark:hover:bg-alftex-accent transition-colors duration-300">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            Pesan via WhatsApp
          </a>
        </div>
      </div>
    `;
    grid.innerHTML += cardHTML;
  });

  setTimeout(() => {
    const newCards = document.querySelectorAll("#product-grid .animate-on-scroll");
    newCards.forEach((card, i) => {
      setTimeout(
        () => {
          card.classList.remove("opacity-0", "translate-y-16");
        },
        30 * (i % 10),
      );
    });
  }, 50);
}

function renderPagination() {
  const totalPages = Math.ceil(currentFilteredProducts.length / ITEMS_PER_PAGE);
  const paginationContainer = document.getElementById("pagination-container");

  // Sembunyikan paginasi jika hanya ada 1 halaman atau tidak ada produk
  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  let paginationHTML = `<nav class="inline-flex rounded-xl shadow-sm" aria-label="Pagination">`;

  // Tombol Previous (Kiri)
  const prevDisabled = currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-alftex-primary dark:hover:text-white";
  paginationHTML += `
    <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""} class="relative inline-flex items-center rounded-l-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors ${prevDisabled}">
      <span class="sr-only">Previous</span>
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
    </button>`;

  // Tombol Angka (Menyesuaikan dengan UX Mobile)
  for (let i = 1; i <= totalPages; i++) {
    // Membatasi tombol angka yang muncul agar tidak berantakan di layar kecil
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      const activeClass =
        i === currentPage
          ? "bg-alftex-primary text-white border-alftex-primary dark:border-slate-700 z-10 font-bold"
          : "bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-700";

      paginationHTML += `<button onclick="changePage(${i})" class="relative inline-flex items-center border px-4 py-2.5 text-sm font-medium transition-colors ${activeClass}">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHTML += `<span class="relative inline-flex items-center border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-medium text-gray-400">...</span>`;
    }
  }

  // Tombol Next (Kanan)
  const nextDisabled = currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-alftex-primary dark:hover:text-white";
  paginationHTML += `
    <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""} class="relative inline-flex items-center rounded-r-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors ${nextDisabled}">
      <span class="sr-only">Next</span>
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" /></svg>
    </button>`;

  paginationHTML += `</nav>`;
  paginationContainer.innerHTML = paginationHTML;
}

// Eksekusi perpindahan halaman
function changePage(page) {
  const totalPages = Math.ceil(currentFilteredProducts.length / ITEMS_PER_PAGE);
  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderProductsAndPagination();

  // UX Plus: Gulir layar secara halus kembali ke awal daftar produk
  const searchSection = document.getElementById("searchInput");
  if (searchSection) {
    searchSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ==========================================
// 7. MODAL ZOOM GAMBAR
// ==========================================
function openZoomModal(imageSrc) {
  const modal = document.getElementById("zoomModal");
  const modalContent = document.getElementById("modalContent");
  const zoomedImage = document.getElementById("zoomedImage");

  zoomedImage.src = imageSrc;
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  setTimeout(() => {
    modalContent.classList.remove("scale-95", "opacity-0");
    modalContent.classList.add("scale-100", "opacity-100");
  }, 10);
}

function closeZoomModal() {
  const modal = document.getElementById("zoomModal");
  const modalContent = document.getElementById("modalContent");

  modalContent.classList.remove("scale-100", "opacity-100");
  modalContent.classList.add("scale-95", "opacity-0");

  setTimeout(() => {
    modal.classList.remove("flex");
    modal.classList.add("hidden");
  }, 300);
}
