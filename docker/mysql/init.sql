-- Initialize Arsip App Database
-- This file is executed when the MySQL container starts for the first time

-- Set character set and collation
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS arsip_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Switch to the arsip_app database
USE arsip_app;

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON arsip_app.* TO 'arsip_user'@'%';

FLUSH PRIVILEGES;
SET FOREIGN_KEY_CHECKS = 1;