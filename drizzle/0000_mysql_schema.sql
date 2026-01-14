-- Migration for creating all archive management tables
-- Generated for MySQL database

-- Create user table with role and status fields
CREATE TABLE `user` (
	`id` varchar(255) PRIMARY KEY NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean DEFAULT false NOT NULL,
	`image` varchar(255),
	`role` enum('superadmin', 'operator', 'user') DEFAULT 'user' NOT NULL,
	`status` enum('pending', 'active', 'inactive') DEFAULT 'pending' NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for user table
CREATE INDEX `idx_email` ON `user` (`email`);

-- Create session table
CREATE TABLE `session` (
	`id` varchar(255) PRIMARY KEY NOT NULL,
	`expires_at` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`ip_address` varchar(45),
	`user_agent` text,
	`user_id` varchar(255) NOT NULL
);

-- Create indexes for session table
CREATE INDEX `idx_token` ON `session` (`token`);
CREATE INDEX `idx_user_id` ON `session` (`user_id`);

-- Create account table for Better Auth
CREATE TABLE `account` (
	`id` varchar(255) PRIMARY KEY NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`password` text,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL
);

-- Create verification table
CREATE TABLE `verification` (
	`id` varchar(255) PRIMARY KEY NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create kategori table
CREATE TABLE `kategori` (
	`id` int PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`nama` varchar(255) NOT NULL,
	`deskripsi` text,
	`kode` varchar(50) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for kategori table
CREATE INDEX `idx_kode` ON `kategori` (`kode`);
CREATE UNIQUE INDEX `kategori_kode_unique` ON `kategori` (`kode`);

-- Create sub_kategori table
CREATE TABLE `sub_kategori` (
	`id` int PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`nama` varchar(255) NOT NULL,
	`deskripsi` text,
	`kode` varchar(50) NOT NULL,
	`kategori_id` int NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for sub_kategori table
CREATE INDEX `idx_sub_kode` ON `sub_kategori` (`kode`);
CREATE INDEX `idx_kategori_id` ON `sub_kategori` (`kategori_id`);

-- Create kode_klasifikasi table
CREATE TABLE `kode_klasifikasi` (
	`id` int PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`kode` varchar(50) NOT NULL,
	`uraian` varchar(500) NOT NULL,
	`deskripsi` text,
	`tingkat` int DEFAULT 1 NOT NULL,
	`induk_id` int,
	`is_active` boolean DEFAULT true NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for kode_klasifikasi table
CREATE INDEX `idx_kode_klasifikasi` ON `kode_klasifikasi` (`kode`);
CREATE INDEX `idx_induk_id` ON `kode_klasifikasi` (`induk_id`);
CREATE UNIQUE INDEX `kode_klasifikasi_kode_unique` ON `kode_klasifikasi` (`kode`);

-- Create unit_pengolah table
CREATE TABLE `unit_pengolah` (
	`id` int PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`nama` varchar(255) NOT NULL,
	`singkatan` varchar(50),
	`deskripsi` text,
	`kode` varchar(50) NOT NULL,
	`parent_unit_id` int,
	`is_active` boolean DEFAULT true NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for unit_pengolah table
CREATE INDEX `idx_unit_kode` ON `unit_pengolah` (`kode`);
CREATE INDEX `idx_parent_unit_id` ON `unit_pengolah` (`parent_unit_id`);
CREATE UNIQUE INDEX `unit_pengolah_kode_unique` ON `unit_pengolah` (`kode`);

-- Create arsip_unit table
CREATE TABLE `arsip_unit` (
	`id` int PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`nomor` varchar(100) NOT NULL,
	`judul` varchar(500) NOT NULL,
	`deskripsi` text,
	`kode_klasifikasi_id` int NOT NULL,
	`unit_pengolah_id` int NOT NULL,
	`kategori_id` int,
	`sub_kategori_id` int,
	`tahun` int NOT NULL,
	`volume` int DEFAULT 1 NOT NULL,
	`satuan_volume` varchar(50) DEFAULT 'box' NOT NULL,
	`lokasi_simpan` varchar(255),
	`kurun_waktu` varchar(100),
	`tingkat_perkembangan` enum('asli', 'copy', 'salinan') DEFAULT 'asli' NOT NULL,
	`status` enum('aktif', 'inaktif', 'musnah') DEFAULT 'aktif' NOT NULL,
	`created_by` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for arsip_unit table
CREATE INDEX `idx_nomor` ON `arsip_unit` (`nomor`);
CREATE INDEX `idx_kode_klasifikasi_id` ON `arsip_unit` (`kode_klasifikasi_id`);
CREATE INDEX `idx_unit_pengolah_id` ON `arsip_unit` (`unit_pengolah_id`);
CREATE INDEX `idx_kategori_id_arsip` ON `arsip_unit` (`kategori_id`);
CREATE INDEX `idx_tahun` ON `arsip_unit` (`tahun`);
CREATE UNIQUE INDEX `arsip_unit_nomor_unique` ON `arsip_unit` (`nomor`);

-- Create berkas_arsip table
CREATE TABLE `berkas_arsip` (
	`id` int PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`nomor` varchar(100) NOT NULL,
	`judul` varchar(500) NOT NULL,
	`deskripsi` text,
	`kode_klasifikasi_id` int NOT NULL,
	`kategori_id` int,
	`sub_kategori_id` int,
	`jenis` enum('teks', 'gambar', 'video', 'audio', 'dokumen', 'lainnya') DEFAULT 'dokumen' NOT NULL,
	`format` varchar(50),
	`ukuran` int,
	`lokasi_fisik` varchar(255),
	`lokasi_digital` varchar(500),
	`tanggal_dibuat` timestamp,
	`tanggal_diterima` timestamp,
	`retensi_aktif` int DEFAULT 0 NOT NULL,
	`retensi_inaktif` int DEFAULT 0 NOT NULL,
	`status` enum('aktif', 'inaktif', 'musnah', 'permanen') DEFAULT 'aktif' NOT NULL,
	`created_by` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for berkas_arsip table
CREATE INDEX `idx_berkas_nomor` ON `berkas_arsip` (`nomor`);
CREATE INDEX `idx_berkas_kode_klasifikasi_id` ON `berkas_arsip` (`kode_klasifikasi_id`);
CREATE INDEX `idx_berkas_kategori_id` ON `berkas_arsip` (`kategori_id`);
CREATE INDEX `idx_status` ON `berkas_arsip` (`status`);
CREATE UNIQUE INDEX `berkas_arsip_nomor_unique` ON `berkas_arsip` (`nomor`);

-- Create arsip_unit_berkas association table
CREATE TABLE `arsip_unit_berkas` (
	`id` int PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`arsip_unit_id` int NOT NULL,
	`berkas_arsip_id` int NOT NULL,
	`catatan` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for arsip_unit_berkas table
CREATE INDEX `idx_arsip_unit_id` ON `arsip_unit_berkas` (`arsip_unit_id`);
CREATE INDEX `idx_berkas_arsip_id` ON `arsip_unit_berkas` (`berkas_arsip_id`);
CREATE UNIQUE INDEX `arsip_unit_berkas_unique` ON `arsip_unit_berkas` (`arsip_unit_id`, `berkas_arsip_id`);

-- Add foreign key constraints
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `arsip_unit` ADD CONSTRAINT `arsip_unit_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `berkas_arsip` ADD CONSTRAINT `berkas_arsip_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `sub_kategori` ADD CONSTRAINT `sub_kategori_kategori_id_kategori_id_fk` FOREIGN KEY (`kategori_id`) REFERENCES `kategori`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `kode_klasifikasi` ADD CONSTRAINT `kode_klasifikasi_induk_id_kode_klasifikasi_id_fk` FOREIGN KEY (`induk_id`) REFERENCES `kode_klasifikasi`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `unit_pengolah` ADD CONSTRAINT `unit_pengolah_parent_unit_id_unit_pengolah_id_fk` FOREIGN KEY (`parent_unit_id`) REFERENCES `unit_pengolah`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `arsip_unit` ADD CONSTRAINT `arsip_unit_kode_klasifikasi_id_kode_klasifikasi_id_fk` FOREIGN KEY (`kode_klasifikasi_id`) REFERENCES `kode_klasifikasi`(`id`) ON UPDATE no action;
ALTER TABLE `arsip_unit` ADD CONSTRAINT `arsip_unit_unit_pengolah_id_unit_pengolah_id_fk` FOREIGN KEY (`unit_pengolah_id`) REFERENCES `unit_pengolah`(`id`) ON UPDATE no action;
ALTER TABLE `arsip_unit` ADD CONSTRAINT `arsip_unit_kategori_id_kategori_id_fk` FOREIGN KEY (`kategori_id`) REFERENCES `kategori`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `arsip_unit` ADD CONSTRAINT `arsip_unit_sub_kategori_id_sub_kategori_id_fk` FOREIGN KEY (`sub_kategori_id`) REFERENCES `sub_kategori`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `berkas_arsip` ADD CONSTRAINT `berkas_arsip_kode_klasifikasi_id_kode_klasifikasi_id_fk` FOREIGN KEY (`kode_klasifikasi_id`) REFERENCES `kode_klasifikasi`(`id`) ON UPDATE no action;
ALTER TABLE `berkas_arsip` ADD CONSTRAINT `berkas_arsip_kategori_id_kategori_id_fk` FOREIGN KEY (`kategori_id`) REFERENCES `kategori`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `berkas_arsip` ADD CONSTRAINT `berkas_arsip_sub_kategori_id_sub_kategori_id_fk` FOREIGN KEY (`sub_kategori_id`) REFERENCES `sub_kategori`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `arsip_unit_berkas` ADD CONSTRAINT `arsip_unit_berkas_arsip_unit_id_arsip_unit_id_fk` FOREIGN KEY (`arsip_unit_id`) REFERENCES `arsip_unit`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `arsip_unit_berkas` ADD CONSTRAINT `arsip_unit_berkas_berkas_arsip_id_berkas_arsip_id_fk` FOREIGN KEY (`berkas_arsip_id`) REFERENCES `berkas_arsip`(`id`) ON DELETE cascade ON UPDATE no action;