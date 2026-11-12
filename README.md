# Portofolio Haikal

Portofolio mahasiswa Pulp and Paper Institut Teknologi Sains Bandung, dengan pengalaman magang APP Group dan pengembangan kemampuan data serta front-end web.

## Jalankan

Buka `index.html` di browser atau gunakan `python3 -m http.server 8000`, kemudian buka http://localhost:8000. Tidak memerlukan build atau instalasi dependency. Google Fonts membutuhkan internet.

## Isi

Perkenalan, pendidikan, tiga pengalaman magang, keahlian dan pengembangan diri, ruang karya, serta informasi kontak. Karya Fapong Gallery dan Rewinder Training Simulator ditampilkan dengan pratinjau serta tautan website. Kontak pribadi belum ditambahkan. Lihat [ISI-PORTOFOLIO.md](ISI-PORTOFOLIO.md) untuk data yang masih diperlukan.

## Desain dan motion

Adaptasi Tallyhouse: Google Sans, garis grid, blok oranye, lavender, sage, dan hitam. Slide saat scroll dan dialog mendukung reduced motion dan fokus keyboard. Konten tetap terbaca tanpa JavaScript.

Folder assets berisi foto referensi dari versi sebelumnya; halaman profil saat ini tidak menggunakannya.

## Foto profil

Foto hero menggunakan file asli dari ZIP Haikal: `assets/haikal-working-original.jpeg`, tanpa perubahan file atau filter. Crop tampilan melalui CSS berfokus pada Haikal yang duduk bersama laptop, dengan komposisi yang sama di desktop dan ponsel. Foto profil pada bagian Tentang menggunakan foto asli `assets/haikal-profile-original.jpg`.


## Animasi GSAP

Galeri dokumentasi tambahan dihapus sesuai permintaan. Animasi memakai GSAP 3.13.0 asli, SplitText, dan ScrollTrigger yang disimpan lokal di `assets/vendor/gsap` (header lisensi vendor dipertahankan). Implementasi ada di `assets/animations.js`.

SplitText mengatur entrance judul hero; timeline mengatur stagger konten; ScrollTrigger mengatur reveal bagian halaman dan pratinjau proyek. Hover ringan hanya aktif pada pointer yang mendukung hover. `gsap.matchMedia` menghormati reduced motion dan breakpoint, mengembalikan styles serta membersihkan instance saat kondisi berubah. Listener dan SplitText dibersihkan saat pagehide; pageshow dari back-forward cache menginisialisasi ulang. Konten tetap terbaca jika JavaScript atau GSAP gagal dimuat.
