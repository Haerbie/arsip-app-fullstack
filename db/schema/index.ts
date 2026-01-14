import {
  mysqlTable,
  varchar,
  text,
  int,
  timestamp,
  boolean,
  mysqlEnum,
  primaryKey,
  index
} from "drizzle-orm/mysql-core";

// Enhanced User table with role and status fields
export const user = mysqlTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: varchar("image", { length: 255 }),
  role: mysqlEnum("role", ["superadmin", "operator", "user"]).default("user").notNull(),
  status: mysqlEnum("status", ["pending", "active", "inactive"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultTo(new Date()).notNull(),
  updatedAt: timestamp("updated_at").defaultTo(new Date()).onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("idx_email").on(table.email),
}));

// Session table
export const session = mysqlTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => ({
  tokenIdx: index("idx_token").on(table.token),
  userIdIdx: index("idx_user_id").on(table.userId),
}));

// Account table for Better Auth
export const account = mysqlTable("account", {
  id: varchar("id", { length: 255 }).primaryKey(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Verification table
export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 255 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultTo(new Date()),
  updatedAt: timestamp("updated_at").defaultTo(new Date()).onUpdateNow(),
});

// Kategori table
export const kategori = mysqlTable("kategori", {
  id: int("id").primaryKey().autoincrement(),
  nama: varchar("nama", { length: 255 }).notNull(),
  deskripsi: text("deskripsi"),
  kode: varchar("kode", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultTo(new Date()).notNull(),
  updatedAt: timestamp("updated_at").defaultTo(new Date()).onUpdateNow().notNull(),
}, (table) => ({
  kodeIdx: index("idx_kode").on(table.kode),
}));

// Sub Kategori table
export const subKategori = mysqlTable("sub_kategori", {
  id: int("id").primaryKey().autoincrement(),
  nama: varchar("nama", { length: 255 }).notNull(),
  deskripsi: text("deskripsi"),
  kode: varchar("kode", { length: 50 }).notNull(),
  kategoriId: int("kategori_id").notNull().references(() => kategori.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultTo(new Date()).notNull(),
  updatedAt: timestamp("updated_at").defaultTo(new Date()).onUpdateNow().notNull(),
}, (table) => ({
  kodeIdx: index("idx_sub_kode").on(table.kode),
  kategoriIdIdx: index("idx_kategori_id").on(table.kategoriId),
}));

// Kode Klasifikasi table
export const kodeKlasifikasi = mysqlTable("kode_klasifikasi", {
  id: int("id").primaryKey().autoincrement(),
  kode: varchar("kode", { length: 50 }).notNull().unique(),
  uraian: varchar("uraian", { length: 500 }).notNull(),
  deskripsi: text("deskripsi"),
  tingkat: int("tingkat").default(1).notNull(),
  indukId: int("induk_id").references(() => kodeKlasifikasi.id, { onDelete: "set null" }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultTo(new Date()).notNull(),
  updatedAt: timestamp("updated_at").defaultTo(new Date()).onUpdateNow().notNull(),
}, (table) => ({
  kodeIdx: index("idx_kode_klasifikasi").on(table.kode),
  indukIdIdx: index("idx_induk_id").on(table.indukId),
}));

// Unit Pengolah table
export const unitPengolah = mysqlTable("unit_pengolah", {
  id: int("id").primaryKey().autoincrement(),
  nama: varchar("nama", { length: 255 }).notNull(),
  singkatan: varchar("singkatan", { length: 50 }),
  deskripsi: text("deskripsi"),
  kode: varchar("kode", { length: 50 }).notNull().unique(),
  parentUnitId: int("parent_unit_id").references(() => unitPengolah.id, { onDelete: "set null" }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultTo(new Date()).notNull(),
  updatedAt: timestamp("updated_at").defaultTo(new Date()).onUpdateNow().notNull(),
}, (table) => ({
  kodeIdx: index("idx_unit_kode").on(table.kode),
  parentUnitIdIdx: index("idx_parent_unit_id").on(table.parentUnitId),
}));

// Arsip Unit table
export const arsipUnit = mysqlTable("arsip_unit", {
  id: int("id").primaryKey().autoincrement(),
  nomor: varchar("nomor", { length: 100 }).notNull(),
  judul: varchar("judul", { length: 500 }).notNull(),
  deskripsi: text("deskripsi"),
  kodeKlasifikasiId: int("kode_klasifikasi_id").notNull().references(() => kodeKlasifikasi.id),
  unitPengolahId: int("unit_pengolah_id").notNull().references(() => unitPengolah.id),
  kategoriId: int("kategori_id").references(() => kategori.id),
  subKategoriId: int("sub_kategori_id").references(() => subKategori.id),
  tahun: int("tahun").notNull(),
  volume: int("volume").default(1).notNull(),
  satuanVolume: varchar("satuan_volume", { length: 50 }).default("box").notNull(),
  lokasiSimpan: varchar("lokasi_simpan", { length: 255 }),
  kurunWaktu: varchar("kurun_waktu", { length: 100 }),
  tingkatPerkembangan: mysqlEnum("tingkat_perkembangan", ["asli", "copy", "salinan"]).default("asli").notNull(),
  status: mysqlEnum("status", ["aktif", "inaktif", "musnah"]).default("aktif").notNull(),
  createdBy: varchar("created_by", { length: 255 }).references(() => user.id),
  createdAt: timestamp("created_at").defaultTo(new Date()).notNull(),
  updatedAt: timestamp("updated_at").defaultTo(new Date()).onUpdateNow().notNull(),
}, (table) => ({
  nomorIdx: index("idx_nomor").on(table.nomor),
  kodeKlasifikasiIdIdx: index("idx_kode_klasifikasi_id").on(table.kodeKlasifikasiId),
  unitPengolahIdIdx: index("idx_unit_pengolah_id").on(table.unitPengolahId),
  kategoriIdIdx: index("idx_kategori_id_arsip").on(table.kategoriId),
  tahunIdx: index("idx_tahun").on(table.tahun),
}));

// Berkas Arsip table
export const berkasArsip = mysqlTable("berkas_arsip", {
  id: int("id").primaryKey().autoincrement(),
  nomor: varchar("nomor", { length: 100 }).notNull(),
  judul: varchar("judul", { length: 500 }).notNull(),
  deskripsi: text("deskripsi"),
  kodeKlasifikasiId: int("kode_klasifikasi_id").notNull().references(() => kodeKlasifikasi.id),
  kategoriId: int("kategori_id").references(() => kategori.id),
  subKategoriId: int("sub_kategori_id").references(() => subKategori.id),
  jenis: mysqlEnum("jenis", ["teks", "gambar", "video", "audio", "dokumen", "lainnya"]).default("dokumen").notNull(),
  format: varchar("format", { length: 50 }),
  ukuran: int("ukuran"), // in bytes
  lokasiFisik: varchar("lokasi_fisik", { length: 255 }),
  lokasiDigital: varchar("lokasi_digital", { length: 500 }),
  tanggalDibuat: timestamp("tanggal_dibuat"),
  tanggalDiterima: timestamp("tanggal_diterima"),
  retensiAktif: int("retensi_aktif").default(0).notNull(), // in years
  retensiInaktif: int("retensi_inaktif").default(0).notNull(), // in years
  status: mysqlEnum("status", ["aktif", "inaktif", "musnah", " permanen"]).default("aktif").notNull(),
  createdBy: varchar("created_by", { length: 255 }).references(() => user.id),
  createdAt: timestamp("created_at").defaultTo(new Date()).notNull(),
  updatedAt: timestamp("updated_at").defaultTo(new Date()).onUpdateNow().notNull(),
}, (table) => ({
  nomorIdx: index("idx_berkas_nomor").on(table.nomor),
  kodeKlasifikasiIdIdx: index("idx_berkas_kode_klasifikasi_id").on(table.kodeKlasifikasiId),
  kategoriIdIdx: index("idx_berkas_kategori_id").on(table.kategoriId),
  statusIdx: index("idx_status").on(table.status),
}));

// Association table for Arsip Unit and Berkas Arsip relationship
export const arsipUnitBerkas = mysqlTable("arsip_unit_berkas", {
  id: int("id").primaryKey().autoincrement(),
  arsipUnitId: int("arsip_unit_id").notNull().references(() => arsipUnit.id, { onDelete: "cascade" }),
  berkasArsipId: int("berkas_arsip_id").notNull().references(() => berkasArsip.id, { onDelete: "cascade" }),
  catatan: text("catatan"),
  createdAt: timestamp("created_at").defaultTo(new Date()).notNull(),
}, (table) => ({
  arsipUnitIdIdx: index("idx_arsip_unit_id").on(table.arsipUnitId),
  berkasArsipIdIdx: index("idx_berkas_arsip_id").on(table.berkasArsipId),
}));

// Export all tables
export {
  user,
  session,
  account,
  verification,
  kategori,
  subKategori,
  kodeKlasifikasi,
  unitPengolah,
  arsipUnit,
  berkasArsip,
  arsipUnitBerkas,
};

// Type exports for TypeScript
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;
export type Kategori = typeof kategori.$inferSelect;
export type NewKategori = typeof kategori.$inferInsert;
export type SubKategori = typeof subKategori.$inferSelect;
export type NewSubKategori = typeof subKategori.$inferInsert;
export type KodeKlasifikasi = typeof kodeKlasifikasi.$inferSelect;
export type NewKodeKlasifikasi = typeof kodeKlasifikasi.$inferInsert;
export type UnitPengolah = typeof unitPengolah.$inferSelect;
export type NewUnitPengolah = typeof unitPengolah.$inferInsert;
export type ArsipUnit = typeof arsipUnit.$inferSelect;
export type NewArsipUnit = typeof arsipUnit.$inferInsert;
export type BerkasArsip = typeof berkasArsip.$inferSelect;
export type NewBerkasArsip = typeof berkasArsip.$inferInsert;
export type ArsipUnitBerkas = typeof arsipUnitBerkas.$inferSelect;
export type NewArsipUnitBerkas = typeof arsipUnitBerkas.$inferInsert;