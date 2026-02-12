require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

let produk = [];

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token tidak ditemukan"
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET || "rahasia123", (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Token tidak valid atau expired"
      });
    }

    req.user = user;
    next();
  });
}

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  // Validasi
  if (!username || !password) {
    return res.status(400).json({
      message: "Username dan password wajib diisi"
    });
  }

  // Dummy login
  if (username !== "admin" || password !== "123") {
    return res.status(401).json({
      message: "Login gagal"
    });
  }

  // Generate JWT
  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET || "rahasia123",
    { expiresIn: "1h" }
  );

  res.status(200).json({
    message: "Login berhasil",
    token
  });
});

app.get("/api/produk", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Data produk",
    data: produk
  });
});

app.post("/api/produk", authMiddleware, (req, res) => {
  const { nama, harga } = req.body;

  // Validasi
  if (!nama || harga === undefined) {
    return res.status(400).json({
      message: "Nama dan harga wajib diisi"
    });
  }

  if (harga < 0) {
    return res.status(400).json({
      message: "Harga tidak boleh negatif"
    });
  }

  const newProduk = {
    id: produk.length + 1,
    nama,
    harga
  };

  produk.push(newProduk);

  res.status(201).json({
    message: "Produk berhasil ditambahkan",
    data: newProduk
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    message: "Terjadi kesalahan pada server",
    error: err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;
