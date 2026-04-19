// Aset: js/main.js

// Memastikan semua elemen HTML selesai dimuat sebelum script dijalankan
document.addEventListener("DOMContentLoaded", function () {
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const closeBtn = document.getElementById("close-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("mobile-overlay");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  // Pastikan elemen-elemen tersebut ada di halaman
  if (mobileBtn && closeBtn && mobileMenu && overlay) {
    // Fungsi membuka menu
    function openMenu() {
      overlay.classList.remove("hidden");
      // Sedikit jeda agar transisi opacity bekerja mulus
      setTimeout(() => {
        overlay.classList.remove("opacity-0");
        mobileMenu.classList.remove("translate-x-full");
      }, 10);
    }

    // Fungsi menutup menu
    function closeMenu() {
      overlay.classList.add("opacity-0");
      mobileMenu.classList.add("translate-x-full");
      // Sembunyikan overlay setelah animasi selesai (300ms)
      setTimeout(() => {
        overlay.classList.add("hidden");
      }, 300);
    }

    // Memasang event click
    mobileBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu); // Tutup menu jika area gelap diklik

    // Menutup menu otomatis jika salah satu link diklik
    mobileLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }
  // ==========================================
  // 2. LOGIKA ANIMASI SCROLL (ELEGAN & MEWAH)
  // ==========================================
  // Membuat Observer untuk mendeteksi elemen yang masuk ke layar
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15, // Animasi dimulai saat 15% elemen terlihat di layar
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Menghapus semua variasi class posisi awal (bawah, kiri, kanan, kecil)
        entry.target.classList.remove("opacity-0", "translate-y-12", "translate-y-16", "-translate-x-12", "translate-x-12", "-translate-x-8", "scale-95", "-translate-y-full");
        // Menambahkan class untuk memunculkan elemen ke posisi normal secara utuh
        entry.target.classList.add("opacity-100", "translate-y-0", "translate-x-0", "scale-100");

        // Hentikan pantauan agar animasi hanya terjadi satu kali (saat pertama kali dilihat)
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Menerapkan observer ke semua elemen HTML yang memiliki class 'animate-on-scroll'
  const animatedElements = document.querySelectorAll(".animate-on-scroll");
  animatedElements.forEach((el) => scrollObserver.observe(el));

  // ==========================================
  // ANIMASI KHUSUS HEADER (Turun otomatis saat web dibuka)
  // ==========================================
  setTimeout(() => {
    const header = document.querySelector("header");
    if (header) {
      // Hapus class yang menyembunyikan header
      header.classList.remove("opacity-0", "-translate-y-full");
      // Tambahkan class agar posisi kembali normal
      header.classList.add("opacity-100", "translate-y-0");
    }
  }, 100); // Jeda 100ms agar efek transisi terlihat mulus
});
