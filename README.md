# Portofolio Haikal

Website portofolio responsif dengan tema krem–hijau, filter kategori karya, detail proyek, dan bagian profil.

## Menjalankan

Buka `index.html` di browser, atau jalankan:

```sh
python3 -m http.server 8000
```

Lalu buka http://localhost:8000. Tidak memerlukan build atau instalasi dependency. Google Fonts memerlukan koneksi internet. Foto referensi Unsplash disimpan di folder assets.

## Personalisasi

Edit `index.html` untuk mengubah profil, karya, warna, dan kontak. Nama menggunakan Haikal; profesi desainer digital dan seluruh proyek masih merupakan contoh. Tombol kontak menampilkan pemberitahuan sampai kontak asli ditambahkan.

## Fitur

- Layout desktop dan ponsel
- Filter Website, Branding, dan UI/UX
- Dialog detail proyek
- Navigasi keyboard dan dukungan reduced motion

## Arah desain Tallyhouse

Adaptasi Tallyhouse untuk portofolio: Google Sans, grid bergaris, blok oranye, ringkasan karya lavender, bagian sage, dan animasi bar berbasis scroll dengan fallback statis serta reduced motion.

Data sementara: profesi dan bio Haikal, empat studi konsep, daftar layanan, serta proses kerja. Kontak asli, biaya, dan jadwal belum ditetapkan. Tidak ada testimoni atau kualifikasi rekaan.

## Motion slides

Judul, proyek, dan bagian utama masuk dengan slide ringan saat terlihat. Langkah proses muncul berurutan; filter karya dan dialog juga memiliki transisi slide. Tidak memakai library animasi. Konten tetap terlihat tanpa JavaScript, animasi dibatalkan saat fokus keyboard masuk, dan preferensi reduced motion dihormati.

## Melengkapi isi

Lihat [ISI-PORTOFOLIO.md](ISI-PORTOFOLIO.md) untuk daftar data yang perlu diisi. Teks halaman tidak mengklaim profesi atau pengalaman klien yang belum dikonfirmasi. Empat proyek masih ditandai sebagai contoh pratinjau.
