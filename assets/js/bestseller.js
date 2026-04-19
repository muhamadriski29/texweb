// Konfigurasi Google Sheets
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1RqwTq4-nVf_vReJtTu10p9pFEVthw1FaxbJI-4Ff4Qo/export?format=csv";

document.addEventListener("DOMContentLoaded", () => {
  fetchBestSellers();
});

function fetchBestSellers() {
  const grid = document.getElementById("bestseller-grid");
  if (!grid) return;

  grid.innerHTML = '<p class="text-center text-gray-500 py-10 animate-pulse w-full">Memuat produk terlaris...</p>';

  Papa.parse(SHEET_CSV_URL, {
    download: true,
    header: true,
    complete: function (results) {
      let bestSellers = results.data.filter((item) => item.nama && item.published && item.published.trim().toUpperCase() === "YA" && item.best_seller && item.best_seller.trim().toUpperCase() === "YA");

      bestSellers = bestSellers.slice(0, 5);
      renderBestSellers(bestSellers);
    },
    error: function (error) {
      console.error("Error mengambil data CSV:", error);
      grid.innerHTML = '<p class="text-center text-red-500 py-10 w-full">Gagal memuat produk terlaris. Pastikan koneksi internet stabil.</p>';
    },
  });
}

function renderBestSellers(products) {
  const grid = document.getElementById("bestseller-grid");
  grid.innerHTML = "";

  if (products.length === 0) {
    grid.innerHTML = '<p class="text-center text-gray-500 py-10 w-full">Belum ada produk terlaris saat ini.</p>';
    return;
  }

  products.forEach((product, index) => {
    const nama = product["nama"];
    const kategori = product["kategori"];
    const deskripsi = product["deskripsi"];
    const gambarRaw = product["gambar"];
    const gambar = gambarRaw ? gambarRaw.trim() : "";
    const lebar = product["lebar"];
    const minOrder = product["min_order"];

    const rawWaText = `Halo Admin ALFTEX ✨,\nSaya sangat tertarik dengan produk *Best Seller* yang ada di halaman depan website:\n\n📦 *Nama Produk:* ${nama}\n🏷️ *Kategori:* ${kategori}\n\nMohon info lebih lanjut mengenai ketersediaan stoknya ya. Terima kasih! 🙏`;
    const waLink = `https://wa.me/6282151551532?text=${encodeURIComponent(rawWaText)}`;

    let imageSrc = gambar ? `assets/images/products/${gambar}` : "https://via.placeholder.com/400x400/2C1A4D/FFFFFF?text=Foto+Menyusul";

    const delayClass = `delay-${(index % 5) * 100 + 100}`;

    // PERUBAHAN: Menambahkan cursor-pointer, onclick="openZoomModal", dan ikon zoom
    const cardHTML = `
      <div class="w-full md:w-[47%] lg:w-[31%] max-w-sm bg-white rounded-2xl overflow-hidden shadow-lg border border-purple-100 flex flex-col group hover:shadow-2xl dark:bg-slate-800 dark:border-slate-700 animate-on-scroll opacity-0 translate-y-16 transition-all duration-1000 hover:duration-300 ease-out ${delayClass}">
        
        <div class="h-56 md:h-64 bg-purple-50 dark:bg-slate-700/50 overflow-hidden relative p-4 flex items-center justify-center cursor-pointer" onclick="openZoomModal('${imageSrc}')">
          <div class="absolute inset-0 bg-alftex-primary/5 group-hover:bg-transparent transition-colors z-10"></div>
          <img src="${imageSrc}" alt="${nama}" onerror="this.src='https://via.placeholder.com/400x400/2C1A4D/FFFFFF?text=Foto+Menyusul'" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 z-0">
          
          <div class="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-full backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm z-20">
            <svg class="w-4 h-4 text-alftex-primary dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
          </div>
        </div>
        
        <div class="p-6 flex-1 flex flex-col relative">
          <span class="bg-alftex-accent text-alftex-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full absolute -top-4 right-6 shadow-md">${kategori}</span>
          <h3 class="text-lg md:text-xl font-bold text-alftex-primary dark:text-white mt-2 mb-2 line-clamp-1">${nama}</h3>
          <p class="text-gray-500 dark:text-gray-300 text-sm mb-6 line-clamp-2 flex-1">${deskripsi}</p>
          
          <div class="flex justify-between items-center mt-auto pt-4 border-t border-purple-50 dark:border-slate-700">
            <div class="flex flex-col">
              <span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Spesifikasi</span>
              <span class="text-xs sm:text-sm font-bold text-alftex-primary dark:text-white">${lebar} | Min: ${minOrder}</span>
            </div>
            
            <a href="${waLink}" target="_blank" class="bg-green-500 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-green-600 transition shadow-md flex items-center gap-1 shrink-0">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Pesan
            </a>
          </div>
        </div>
      </div>
    `;
    grid.innerHTML += cardHTML;
  });

  // GANTI DENGAN KODE INI: Pengintai Scroll (Intersection Observer)
  const newCards = document.querySelectorAll("#bestseller-grid .animate-on-scroll");

  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        // Jika elemen sudah masuk ke dalam layar (viewport)
        if (entry.isIntersecting) {
          entry.target.classList.remove("opacity-0", "translate-y-16");
          // Berhenti mengintai setelah animasi selesai agar tidak berulang-ulang
          observerInstance.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1, // Memicu animasi ketika 10% bagian card sudah terlihat
      rootMargin: "0px 0px -50px 0px",
    },
  );

  // Pasang pengintai ke semua card yang baru dibuat
  newCards.forEach((card) => observer.observe(card));
}

// ==========================================
// FUNGSI MODAL ZOOM GAMBAR (Ditambahkan di sini)
// ==========================================
function openZoomModal(imageSrc) {
  const modal = document.getElementById("zoomModal");
  const modalContent = document.getElementById("modalContent");
  const zoomedImage = document.getElementById("zoomedImage");

  if (modal && modalContent && zoomedImage) {
    zoomedImage.src = imageSrc;
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    setTimeout(() => {
      modalContent.classList.remove("scale-95", "opacity-0");
      modalContent.classList.add("scale-100", "opacity-100");
    }, 10);
  }
}

function closeZoomModal() {
  const modal = document.getElementById("zoomModal");
  const modalContent = document.getElementById("modalContent");

  if (modal && modalContent) {
    modalContent.classList.remove("scale-100", "opacity-100");
    modalContent.classList.add("scale-95", "opacity-0");

    setTimeout(() => {
      modal.classList.remove("flex");
      modal.classList.add("hidden");
    }, 300);
  }
}
