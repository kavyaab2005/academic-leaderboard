CREATE DATABASE leaderboard;
USE leaderboard;

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) -- store hashed password (password_hash)
);

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  class VARCHAR(64),
  roll VARCHAR(64)
);

CREATE TABLE leaderboard (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  name VARCHAR(255),
  score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE studymaterials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url TEXT,
  caption VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
