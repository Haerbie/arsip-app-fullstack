import { z } from "zod";

// User validation schemas
export const userCreateSchema = z.object({
  name: z.string().min(2, "Nama harus minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  role: z.enum(["superadmin", "operator", "user"], {
    errorMap: () => ({ message: "Role harus salah satu dari: superadmin, operator, user" }),
  }),
  password: z
    .string()
    .min(8, "Password harus minimal 8 karakter")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password harus mengandung minimal satu huruf besar, satu huruf kecil, dan satu angka"),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2, "Nama harus minimal 2 karakter").optional(),
  email: z.string().email("Email tidak valid").optional(),
  role: z.enum(["superadmin", "operator", "user"]).optional(),
  status: z.enum(["pending", "active", "inactive"]).optional(),
});

// Kategori validation schemas
export const kategoriCreateSchema = z.object({
  nama: z.string().min(2, "Nama kategori harus minimal 2 karakter"),
  deskripsi: z.string().optional(),
  kode: z.string().min(1, "Kode kategori harus diisi"),
});

export const kategoriUpdateSchema = z.object({
  nama: z.string().min(2, "Nama kategori harus minimal 2 karakter").optional(),
  deskripsi: z.string().optional(),
  kode: z.string().min(1, "Kode kategori harus diisi").optional(),
});

// Sub Kategori validation schemas
export const subKategoriCreateSchema = z.object({
  nama: z.string().min(2, "Nama sub kategori harus minimal 2 karakter"),
  deskripsi: z.string().optional(),
  kode: z.string().min(1, "Kode sub kategori harus diisi"),
  kategoriId: z.number("Kategori ID harus berupa angka"),
});

export const subKategoriUpdateSchema = z.object({
  nama: z.string().min(2, "Nama sub kategori harus minimal 2 karakter").optional(),
  deskripsi: z.string().optional(),
  kode: z.string().min(1, "Kode sub kategori harus diisi").optional(),
  kategoriId: z.number("Kategori ID harus berupa angka").optional(),
});

// Kode Klasifikasi validation schemas
export const kodeKlasifikasiCreateSchema = z.object({
  kode: z.string().min(1, "Kode klasifikasi harus diisi"),
  uraian: z.string().min(2, "Uraian harus minimal 2 karakter"),
  deskripsi: z.string().optional(),
  tingkat: z.number().min(1).max(10).default(1),
  indukId: z.number().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const kodeKlasifikasiUpdateSchema = z.object({
  kode: z.string().min(1, "Kode klasifikasi harus diisi").optional(),
  uraian: z.string().min(2, "Uraian harus minimal 2 karakter").optional(),
  deskripsi: z.string().optional(),
  tingkat: z.number().min(1).max(10).optional(),
  indukId: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
});

// Unit Pengolah validation schemas
export const unitPengolahCreateSchema = z.object({
  nama: z.string().min(2, "Nama unit harus minimal 2 karakter"),
  singkatan: z.string().optional(),
  deskripsi: z.string().optional(),
  kode: z.string().min(1, "Kode unit harus diisi"),
  parentUnitId: z.number().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const unitPengolahUpdateSchema = z.object({
  nama: z.string().min(2, "Nama unit harus minimal 2 karakter").optional(),
  singkatan: z.string().optional(),
  deskripsi: z.string().optional(),
  kode: z.string().min(1, "Kode unit harus diisi").optional(),
  parentUnitId: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
});

// Arsip Unit validation schemas
export const arsipUnitCreateSchema = z.object({
  nomor: z.string().min(1, "Nomor arsip harus diisi"),
  judul: z.string().min(2, "Judul harus minimal 2 karakter"),
  deskripsi: z.string().optional(),
  kodeKlasifikasiId: z.number("Kode klasifikasi ID harus berupa angka"),
  unitPengolahId: z.number("Unit pengolah ID harus berupa angka"),
  kategoriId: z.number("Kategori ID harus berupa angka").optional(),
  subKategoriId: z.number("Sub kategori ID harus berupa angka").optional(),
  tahun: z.number().min(1900).max(new Date().getFullYear() + 10),
  volume: z.number().min(1).default(1),
  satuanVolume: z.string().default("box"),
  lokasiSimpan: z.string().optional(),
  kurunWaktu: z.string().optional(),
  tingkatPerkembangan: z.enum(["asli", "copy", "salinan"]).default("asli"),
  status: z.enum(["aktif", "inaktif", "musnah"]).default("aktif"),
});

export const arsipUnitUpdateSchema = z.object({
  nomor: z.string().min(1, "Nomor arsip harus diisi").optional(),
  judul: z.string().min(2, "Judul harus minimal 2 karakter").optional(),
  deskripsi: z.string().optional(),
  kodeKlasifikasiId: z.number("Kode klasifikasi ID harus berupa angka").optional(),
  unitPengolahId: z.number("Unit pengolah ID harus berupa angka").optional(),
  kategoriId: z.number("Kategori ID harus berupa angka").optional(),
  subKategoriId: z.number("Sub kategori ID harus berupa angka").optional(),
  tahun: z.number().min(1900).max(new Date().getFullYear() + 10).optional(),
  volume: z.number().min(1).optional(),
  satuanVolume: z.string().optional(),
  lokasiSimpan: z.string().optional(),
  kurunWaktu: z.string().optional(),
  tingkatPerkembangan: z.enum(["asli", "copy", "salinan"]).optional(),
  status: z.enum(["aktif", "inaktif", "musnah"]).optional(),
});

// Berkas Arsip validation schemas
export const berkasArsipCreateSchema = z.object({
  nomor: z.string().min(1, "Nomor berkas harus diisi"),
  judul: z.string().min(2, "Judul harus minimal 2 karakter"),
  deskripsi: z.string().optional(),
  kodeKlasifikasiId: z.number("Kode klasifikasi ID harus berupa angka"),
  kategoriId: z.number("Kategori ID harus berupa angka").optional(),
  subKategoriId: z.number("Sub kategori ID harus berupa angka").optional(),
  jenis: z.enum(["teks", "gambar", "video", "audio", "dokumen", "lainnya"]).default("dokumen"),
  format: z.string().optional(),
  ukuran: z.number().min(0).optional(),
  lokasiFisik: z.string().optional(),
  lokasiDigital: z.string().optional(),
  tanggalDibuat: z.string().datetime().optional(),
  tanggalDiterima: z.string().datetime().optional(),
  retensiAktif: z.number().min(0).default(0),
  retensiInaktif: z.number().min(0).default(0),
  status: z.enum(["aktif", "inaktif", "musnah", "permanen"]).default("aktif"),
});

export const berkasArsipUpdateSchema = z.object({
  nomor: z.string().min(1, "Nomor berkas harus diisi").optional(),
  judul: z.string().min(2, "Judul harus minimal 2 karakter").optional(),
  deskripsi: z.string().optional(),
  kodeKlasifikasiId: z.number("Kode klasifikasi ID harus berupa angka").optional(),
  kategoriId: z.number("Kategori ID harus berupa angka").optional(),
  subKategoriId: z.number("Sub kategori ID harus berupa angka").optional(),
  jenis: z.enum(["teks", "gambar", "video", "audio", "dokumen", "lainnya"]).optional(),
  format: z.string().optional(),
  ukuran: z.number().min(0).optional(),
  lokasiFisik: z.string().optional(),
  lokasiDigital: z.string().optional(),
  tanggalDibuat: z.string().datetime().optional(),
  tanggalDiterima: z.string().datetime().optional(),
  retensiAktif: z.number().min(0).optional(),
  retensiInaktif: z.number().min(0).optional(),
  status: z.enum(["aktif", "inaktif", "musnah", "permanen"]).optional(),
});

// Arsip Unit Berkas association schema
export const arsipUnitBerkasCreateSchema = z.object({
  arsipUnitId: z.number("Arsip unit ID harus berupa angka"),
  berkasArsipId: z.number("Berkas arsip ID harus berupa angka"),
  catatan: z.string().optional(),
});

// Pagination query schema
export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Export types
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type KategoriCreate = z.infer<typeof kategoriCreateSchema>;
export type KategoriUpdate = z.infer<typeof kategoriUpdateSchema>;
export type SubKategoriCreate = z.infer<typeof subKategoriCreateSchema>;
export type SubKategoriUpdate = z.infer<typeof subKategoriUpdateSchema>;
export type KodeKlasifikasiCreate = z.infer<typeof kodeKlasifikasiCreateSchema>;
export type KodeKlasifikasiUpdate = z.infer<typeof kodeKlasifikasiUpdateSchema>;
export type UnitPengolahCreate = z.infer<typeof unitPengolahCreateSchema>;
export type UnitPengolahUpdate = z.infer<typeof unitPengolahUpdateSchema>;
export type ArsipUnitCreate = z.infer<typeof arsipUnitCreateSchema>;
export type ArsipUnitUpdate = z.infer<typeof arsipUnitUpdateSchema>;
export type BerkasArsipCreate = z.infer<typeof berkasArsipCreateSchema>;
export type BerkasArsipUpdate = z.infer<typeof berkasArsipUpdateSchema>;
export type ArsipUnitBerkasCreate = z.infer<typeof arsipUnitBerkasCreateSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;