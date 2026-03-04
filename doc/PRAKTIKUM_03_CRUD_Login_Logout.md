# Praktikum 3 – CRUD, Login, dan Logout

**Pemrograman Mobile II · Expo / React Native**

Panduan ini mengajak kamu belajar **CRUD** (Create, Read, Update, Delete), **alur Login** sebagai halaman pertama, dan **Logout dengan konfirmasi**—dengan bahasa yang santai dan runut, cocok buat yang sudah kenal Functional Component dan useState dari Praktikum 2.

---

## Target Pelajaran Hari Ini

| No | Target | Keterangan |
|----|--------|------------|
| 1 | **Halaman CRUD Data Mahasiswa** | Tampil data dalam tabel/kartu, tambah (form modal), ubah (form modal), hapus (konfirmasi Alert). Data disimpan di state; pagination per 10 data. |
| 2 | **Halaman Login (demo)** | Halaman pertama saat app dibuka. Form email/NIM + password; tombol "Masuk" mengarahkan ke tab utama (router.replace). |
| 3 | **Tab Logout dengan konfirmasi** | Tab "Logout" di tab bar; saat diklik muncul dialog "Yakin mau logout?" (Alert). Batal = kembali ke tab sebelumnya; Ya = ke halaman login. |
| 4 | **Navigasi: Stack & Tabs** | Root layout pakai Stack (login → tabs → modal). Aplikasi selalu buka di login dulu (initialRouteName). Setelah login, user masuk ke Tabs (Home, Explore, Praktikum, Modul, Logout). |

Di app: **buka aplikasi** → tampil **Login** → isi form (bebas) → **Masuk** → masuk ke **tab utama**. Di tab **Modul** ada CRUD data mahasiswa; di tab **Logout** ada konfirmasi sebelum keluar ke login lagi.

---

## Pendahuluan: Kenapa Belajar CRUD, Login, dan Logout?

Di aplikasi sungguhan, kamu sering perlu: **nampilin data**, **nambah**, **ubah**, dan **hapus** (CRUD); plus **login** sebagai pintu masuk dan **logout** dengan konfirmasi biar user enggak ke-logout gegara salah pencet.

Di praktikum ini kita pakai **state** (useState) buat nyimpen data—belum pakai API atau database. Jadi CRUD-nya "di memori": tambah/ubah/hapus mengubah state, dan tampilan ikut berubah. Login dan Logout cuma demo: tidak ada cek ke server; yang penting kamu ngerti **alur navigasi** (kapan pindah ke mana) dan **dialog konfirmasi**.

Yang akan kamu pelajari:

- **CRUD**: state array, form di Modal, tombol Ubah/Hapus per baris, Alert untuk konfirmasi hapus, pagination.
- **Login**: halaman pertama (initialRouteName), router.replace ke (tabs) supaya user enggak bisa "back" ke login.
- **Logout**: useFocusEffect biar tiap kali tab Logout diklik muncul dialog; router.back (batal) atau router.replace('/login') (keluar).

---

## 1. CRUD: Create, Read, Update, Delete

### 1.1 Apa Itu CRUD?

**CRUD** = empat aksi dasar terhadap data:

| Singkatan | Arti | Di app kita |
|-----------|------|--------------|
| **C**reate | Tambah data baru | Tombol "+ Tambah Mahasiswa" → form modal → Simpan. |
| **R**ead   | Baca/tampilkan data | Tabel (atau kartu di HP) + pagination. |
| **U**pdate | Ubah data yang sudah ada | Tombol "Ubah" di tiap baris → form modal (terisi data lama) → Simpan. |
| **D**elete | Hapus data | Tombol "Hapus" di tiap baris → Alert "Yakin?" → Ya = data dihapus dari state. |

Data kita simpan di **state** (useState), misalnya `const [dataMahasiswa, setDataMahasiswa] = useState(DATA_AWAL)`. Create = nambah item ke array (setDataMahasiswa([...prev, itemBaru])). Update = ganti satu item di array (map: kalau id cocok, ganti; lainnya tetap). Delete = buang satu item (filter: ambil yang id-nya bukan yang dihapus).

### 1.2 Read: Menampilkan Data (Tabel / Kartu)

Data ditampilkan dengan **.map()**: loop array, tiap item jadi satu baris (atau satu kartu). Supaya enggak penuh satu layar, kita **paginate**: tampil misalnya 10 data per halaman, dengan state **currentPage**. Data yang ditampilkan = slice array dari (currentPage - 1) * 10 sampai currentPage * 10.

Di project ini, di layar lebar dipakai **tabel** (baris + kolom); di layar sempit (mobile) dipakai **kartu** per mahasiswa biar enak dibaca. Itu pakai **useWindowDimensions()**: kalau width < 420, tampil layout kartu; kalau tidak, tampil tabel.

### 1.3 Create & Update: Form di Modal

Tambah dan Ubah pakai **satu form** yang sama, tapi **mode**-nya beda: 'tambah' (form kosong) atau 'ubah' (form terisi data mahasiswa yang dipilih). Form itu tampil di **Modal** (popup di atas layar). State yang dipakai misalnya: **modalVisible**, **modeForm** ('tambah' | 'ubah'), **mahasiswaEdit** (kalau ubah, ini datanya), **formNim**, **formNama**, **formProdi**.

- **Tambah**: tombol "+ Tambah" → set modeForm('tambah'), form dikosongkan, modalVisible = true. Pas Simpan → bikin objek baru (id unik, misalnya Date.now()), setDataMahasiswa([...prev, baru]), tutup modal.
- **Ubah**: tombol "Ubah" di baris → set modeForm('ubah'), mahasiswaEdit = data baris itu, form diisi nilai lama, modalVisible = true. Pas Simpan → setDataMahasiswa(prev => prev.map(...)) ganti yang id-nya sama, tutup modal.

### 1.4 Delete: Konfirmasi dengan Alert

Sebelum hapus, baiknya tanya dulu. Pakai **Alert.alert('Judul', 'Pesan', [tombol Batal, tombol Ya])**. Di **onPress** tombol "Ya", panggil setDataMahasiswa(prev => prev.filter(m => m.id !== idYangDihapus)). Kalau halaman jadi kosong (total halaman berkurang), currentPage bisa disesuaikan biar enggak nunjuk halaman yang enggak ada.

### 1.5 Pagination

**totalPages = Math.ceil(dataMahasiswa.length / ITEM_PER_PAGE)**. **dataPerHalaman** = slice dari **(currentPage - 1) * ITEM_PER_PAGE** sampai **currentPage * ITEM_PER_PAGE**. Tombol "Sebelumnya" / "Selanjutnya" ubah **currentPage**; di halaman 1 "Sebelumnya" disabled, di halaman terakhir "Selanjutnya" disabled.

---

## 2. Login: Halaman Pertama dan Pindah ke Tab

### 2.1 Kenapa Login Jadi Halaman Pertama?

Supaya tiap kali app dibuka, user lihat **login** dulu (demo: tanpa cek server). Itu diatur di **root layout** (_layout.tsx di app/): **Stack** dengan **initialRouteName="login"**. Jadi layar pertama yang keluar = login.

### 2.2 Isi Halaman Login (demo)

Form: **TextInput** untuk email/NIM dan password (state: email, password). Tombol **"Masuk"**. Pas tombol ditekan, panggil **router.replace('/(tabs)')**. **replace** artinya halaman login diganti oleh (tabs)—user enggak bisa tekan "back" dan balik ke login. Jadi setelah "Masuk", yang aktif ya tab utama (Home, Explore, Praktikum, Modul, Logout).

Tidak ada validasi ke server; isi form bebas, yang penting alur navigasinya: **login → replace ke (tabs)**.

### 2.3 SafeAreaView dan KeyboardAvoidingView

Supaya form enggak kena notch atau keyboard, halaman login pakai **SafeAreaView** (edges top & bottom) dan **KeyboardAvoidingView** (behavior 'padding' di iOS). Isi form bisa dibungkus **ScrollView** biar kalau keyboard muncul, user bisa scroll.

---

## 3. Logout: Tab dengan Dialog Konfirmasi

### 3.1 Alur Logout

User tap tab **"Logout"** di tab bar. Yang kita mau: **bukan langsung keluar**, tapi **tanya dulu** "Yakin mau logout?". Kalau user pilih **Batal** → kembali ke tab yang tadi. Kalau pilih **Ya, Logout** → keluar ke halaman login (router.replace('/login')).

### 3.2 useFocusEffect: Dialog Tiap Kali Tab Diklik

Tab "Logout" mengarah ke satu **screen** (logout.tsx). Di screen itu kita mau: **setiap kali user masuk ke tab ini** (fokus), langsung tampil dialog. Itu pakai **useFocusEffect** dari React Navigation (bukan useEffect). **useEffect** jalan cuma pas component mount (sekali). **useFocusEffect** jalan **tiap kali layar dapat fokus**—jadi tiap kali user tap tab Logout, efek jalan lagi dan dialog keluar lagi.

Di dalam useFocusEffect kita panggil **Alert.alert**:

- Judul: "Yakin mau logout?"
- Pesan: "Kamu akan kembali ke halaman login."
- Tombol: **Batal** (style: 'cancel') → onPress: **router.back()** (kembali ke tab sebelumnya).
- Tombol: **Ya, Logout** (style: 'destructive') → onPress: **router.replace('/login')**.
- Opsi: **cancelable: true**, **onDismiss: () => router.back()** — kalau user nutup dialog (misal tap di luar di Android), kita tetap panggil router.back() biar enggak nangkring di layar Logout.

### 3.3 useCallback

useFocusEffect menerima satu function. Supaya function itu "stabil" (referensi enggak berubah tiap render) dan efek enggak jalan berkali-kali tanpa perlu, kita bungkus dengan **useCallback(() => { ... }, [])**. Dependency array kosong = fungsi dibuat sekali.

---

## 4. Navigasi: Stack dan Tabs

### 4.1 Root Layout (app/_layout.tsx)

**Stack** = navigator tumpukan: satu layar di atas yang lain. Urutan screen: **login** → **(tabs)** → **modal**. **initialRouteName="login"** bikin layar pertama = login. **unstable_settings.initialRouteName = 'login'** bantu Expo Router tentuin entry point.

- **login**: halaman form login; headerShown: false.
- **(tabs)**: satu "screen" yang isinya **tab bar** (Home, Explore, Praktikum, Modul, Logout); headerShown: false.
- **modal**: halaman popup (presentation: 'modal'); bisa dipakai buat about/settings.

### 4.2 Tab Layout (app/(tabs)/_layout.tsx)

**Tabs** = navigator dengan beberapa tab di bawah. Setiap **Tabs.Screen** = satu tab. **name** harus sama dengan nama file .tsx di folder (tabs): name="modul" → modul.tsx, name="logout" → logout.tsx. **tabBarIcon** pakai komponen IconSymbol (ikon SF Symbol / Material sesuai platform). **screenOptions**: tabBarActiveTintColor (warna tab aktif), headerShown: false, tabBarButton: HapticTab (getar halus pas tap).

### 4.3 router.replace vs router.back

- **router.replace('/(tabs)')** atau **router.replace('/login')**: ganti layar saat ini dengan layar tujuan; history stack diganti, jadi user enggak bisa "back" ke layar sebelumnya.
- **router.back()**: kembali satu langkah (misalnya dari tab Logout balik ke tab yang tadi).

---

## 5. Contoh File di Project Ini

Agar teori tadi langsung keliatan di app, di project ini sudah disiapkan file-file berikut.

| File | Isi singkat |
|------|------------------|
| **`app/_layout.tsx`** | Root layout: ThemeProvider, Stack (login, (tabs), modal), initialRouteName="login", StatusBar. |
| **`app/login.tsx`** | Halaman login: form email + password, tombol Masuk → router.replace('/(tabs)'). SafeAreaView, KeyboardAvoidingView, ScrollView. |
| **`app/(tabs)/_layout.tsx`** | Tab bar: Home, Explore, Praktikum, Modul, Logout. Setiap tab punya title dan tabBarIcon (IconSymbol). |
| **`app/(tabs)/modul.tsx`** | Halaman CRUD data mahasiswa: state data, pagination, tabel/kartu (responsif), tombol Tambah, Ubah, Hapus, Modal form, Alert konfirmasi hapus. |
| **`app/(tabs)/logout.tsx`** | Tab Logout: useFocusEffect + Alert.alert "Yakin mau logout?"; Batal → router.back(), Ya → router.replace('/login'). Tampilan sementara: "Memuat…". |
| **`components/ui/icon-symbol.tsx`** | Komponen ikon: nama SF Symbol dipetakan ke Material Icons (Android/web). Termasuk ikon logout (rectangle.portrait.and.arrow.right → logout). |

### 5.1 Penjelasan Singkat per File

---

#### **`doc/PRAKTIKUM_03_CRUD_Login_Logout.md`** (file ini)

Dokumen panduan praktikum 3: CRUD, Login, Logout, dan navigasi (Stack, Tabs, router). Dibuat supaya kamu bisa baca sambil praktik; tidak dijalankan oleh app.

---

#### **`app/_layout.tsx`** — Root Layout

**Fungsi:** Kerangka paling luar app. **ThemeProvider** bikin tema terang/gelap ikut HP. **Stack** urutannya: login → (tabs) → modal. **initialRouteName="login"** bikin app selalu buka di login dulu. **StatusBar** style="auto" ikut tema.

---

#### **`app/login.tsx`** — Halaman Login

**Fungsi:** Halaman pertama yang user lihat. Form **email/NIM** dan **password** (state); tombol **Masuk** panggil **router.replace('/(tabs)')** sehingga user masuk ke tab utama dan enggak bisa back ke login. **SafeAreaView** (edges top & bottom), **KeyboardAvoidingView** (supaya keyboard enggak nutup form), **ScrollView** biar bisa scroll. Ini demo: tidak ada validasi ke server.

---

#### **`app/(tabs)/_layout.tsx`** — Layout Tab Bar

**Fungsi:** Mendefinisikan tab di bawah layar. **Tabs.Screen** untuk index (Home), explore, praktikum, modul, **logout**. **name** harus sama dengan nama file .tsx. Tab Logout pakai ikon **rectangle.portrait.and.arrow.right** (logout). **screenOptions**: tabBarActiveTintColor, headerShown: false, HapticTab.

---

#### **`app/(tabs)/modul.tsx`** — Halaman CRUD Data Mahasiswa

**Fungsi:** Read = tampil data (tabel di layar lebar, kartu di layar sempit). Create = tombol "+ Tambah Mahasiswa" → Modal form → Simpan → nambah ke state. Update = tombol "Ubah" di tiap baris → Modal form terisi data lama → Simpan → map ganti item. Delete = tombol "Hapus" → Alert konfirmasi → filter buang item. **Pagination** 10 data per halaman; state currentPage, slice untuk dataPerHalaman. **useWindowDimensions** buat responsif (lebar < 420 → kartu). Data disimpan di **useState** (array mahasiswa); type Mahasiswa: id, nim, nama, prodi.

---

#### **`app/(tabs)/logout.tsx`** — Tab Logout

**Fungsi:** Setiap kali user tap tab Logout (layar dapat fokus), **useFocusEffect** jalan dan **Alert.alert** tampil: "Yakin mau logout?" dengan tombol **Batal** (router.back) dan **Ya, Logout** (router.replace('/login')). **useCallback** bikin fungsi efek stabil. Return cuma View + Text "Memuat…" karena dialog langsung muncul; tampilan ini hampir tidak kelihatan.

---

#### **`components/ui/icon-symbol.tsx`** (perubahan)

**Fungsi:** Komponen IconSymbol memetakan nama ikon (SF Symbol style) ke Material Icons buat Android/web. Untuk tab Logout ditambah mapping **'rectangle.portrait.and.arrow.right': 'logout'** supaya ikon logout tampil di tab bar.

---

**Ringkasannya:**  
- **app/_layout.tsx** = root Stack, login pertama.  
- **app/login.tsx** = form login, Masuk → (tabs).  
- **app/(tabs)/_layout.tsx** = tab bar (termasuk Modul & Logout).  
- **app/(tabs)/modul.tsx** = CRUD mahasiswa (state, modal, alert, pagination, responsif).  
- **app/(tabs)/logout.tsx** = konfirmasi logout (useFocusEffect + Alert).  
- **doc/PRAKTIKUM_03_CRUD_Login_Logout.md** = panduan ini.

---

## 6. Latihan (Supaya Ilmu Nempel)

1. **Latihan 1 – Validasi form Tambah**  
   Di modul.tsx, sebelum handleSimpanTambah: kalau formNim atau formNama kosong, tampilkan Alert "NIM dan Nama wajib diisi" dan jangan simpan. Kalau sudah terisi, baru tambah ke state dan tutup modal.

2. **Latihan 2 – Pesan setelah Logout**  
   Setelah router.replace('/login') di logout, kita langsung ke halaman login. Coba (opsional) pakai parameter atau state global sederhana buat nampilkan teks sekali di login: "Kamu baru saja logout." (bisa hilang setelah 3 detik). Kalau belum belajar state global, skip dulu dan cukup ingat alur replace ke login.

3. **Latihan 3 – Tombol "Lihat" di CRUD**  
   Di modul.tsx, tambah tombol "Lihat" di tiap baris/kartu. Pas diklik, tampilkan Alert (atau Modal kecil) yang isinya hanya menampilkan NIM, Nama, Prodi dari data itu (read-only). Fokusnya: baca data dari state dan tampilkan di dialog.

---

## 7. Ringkasan Cepat

| Konsep | Arti singkat |
|--------|----------------|
| **CRUD** | Create (tambah), Read (tampil), Update (ubah), Delete (hapus); di sini pakai state array. |
| **Modal** | Popup untuk form Tambah/Ubah; visible diatur state; form dipakai bersama dengan modeForm. |
| **Alert.alert** | Dialog native konfirmasi (misal sebelum hapus, atau "Yakin logout?"). |
| **Pagination** | Tampil data per halaman (slice); currentPage, totalPages, tombol Sebelumnya/Selanjutnya. |
| **Login (demo)** | Halaman pertama (initialRouteName); router.replace('/(tabs)') untuk masuk ke tab. |
| **Logout** | Tab → useFocusEffect → Alert → Batal (router.back) atau Ya (router.replace('/login')). |
| **useFocusEffect** | Efek jalan tiap kali layar dapat fokus (pas tap tab); cocok buat dialog konfirmasi. |
| **router.replace** | Ganti layar saat ini; user enggak bisa back ke layar sebelumnya. |
| **router.back()** | Kembali satu langkah di stack. |

Alur yang bisa kamu ikuti: **baca teori** → **jalanin app** (login → Masuk → buka Modul & Logout) → **baca kode di app/(tabs)/modul.tsx, login.tsx, logout.tsx** → **kerjakan latihan**. Kalau sudah nyaman, lanjut ke materi berikutnya (misalnya API, AsyncStorage, atau form validation yang lebih lengkap).

Semoga panduan ini bantu; kalau ada yang kurang jelas, coba run app dan tap-tap alur login → Modul (tambah/ubah/hapus) → Logout sambil baca lagi baris per baris di file yang dipakai.
