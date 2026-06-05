import type { Translation } from '../i18n-types';

const id = {
  // Auth
  LOGIN_TITLE: 'Masuk Orang Tua',
  LOGIN_SUBTITLE: 'Masuk untuk mengelola profil anak Anda.',
  LOGIN_EMAIL: 'Surel',
  LOGIN_PASSWORD: 'Kata Sandi',
  LOGIN_SUBMIT: 'Masuk',
  LOGIN_SUBMITTING: 'Memasuki\u2026',
  LOGIN_SIGNUP_LINK: 'Belum punya akun? Buat satu',
  REGISTER_TITLE: 'Buat Akun',
  REGISTER_SUBTITLE: 'Akun orang tua adalah langkah pertama dalam perjalanan belajar anak Anda.',
  REGISTER_SUBMIT: 'Buat akun',
  REGISTER_SUBMITTING: 'Membuat akun\u2026',
  REGISTER_PASSWORD_HINT: 'Minimal 8 karakter.',
  REGISTER_SIGNIN_LINK: 'Sudah punya akun? Masuk',

  // Dashboard
  DASHBOARD_TITLE: 'Dasbor',
  DASHBOARD_ADD_CHILD: 'Tambah Anak',
  DASHBOARD_NO_CHILDREN: 'Belum ada profil anak. Tambahkan satu untuk memulai.',
  DASHBOARD_SIGN_OUT: 'Keluar',
  DASHBOARD_SIGNING_OUT: 'Keluar\u2026',
  DASHBOARD_SIGN_OUT_CONFIRM: 'Apakah Anda yakin ingin keluar?',

  // Letters
  LETTERS_SHOW: 'Tampilkan',
  LETTERS_HIDE: 'Sembunyikan',

  // Harakat
  HARAKAT_PLAIN: 'Polos',
  HARAKAT_FATHAH: 'Fathah',
  HARAKAT_KASRAH: 'Kasrah',
  HARAKAT_DAMMAH: 'Dammah',

  // Child Mode
  CHILDMODE_ENABLE: 'Aktifkan Mode Anak',
  CHILDMODE_DISABLE: 'Nonaktifkan Mode Anak',
  CHILDMODE_ACTIVE: 'Mode Anak aktif',

  // Profile
  PROFILE_NAME: 'Nama',
  PROFILE_AVATAR: 'Avatar',
  PROFILE_EDIT: 'Edit',
  PROFILE_SAVE: 'Simpan',
  PROFILE_CANCEL: 'Batal',
  PROFILE_ADD_TITLE: 'Tambah Profil Anak',
  PROFILE_EDIT_TITLE: 'Edit Profil Anak',
  PROFILE_DELETE: 'Hapus',
  PROFILE_DELETE_CONFIRM: 'Apakah Anda yakin ingin menghapus profil ini?',
  PROFILE_MANAGE_LETTERS: 'Kelola Huruf',
  PROFILE_LETTERS_LABEL: 'diperkenalkan',

  // Locale
  LOCALE_SWITCH: 'English',

  // Reading Practice
  READING_SHUFFLE: 'Acak',
  READING_DONE: 'Selesai',
  READING_NEXT_GROUP: 'Grup Berikutnya',
  READING_RANDOMIZE: 'Acak Vokal',

  // Errors
  ERROR_GENERIC: 'Terjadi kesalahan. Silakan coba lagi.',
  ERROR_INVALID_EMAIL: 'Masukkan alamat surel yang valid.',
  ERROR_SHORT_PASSWORD: 'Kata sandi minimal 8 karakter.',
} satisfies Translation;

export default id;
