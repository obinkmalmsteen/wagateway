const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const mysql = require('mysql2');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// koneksi database
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "wagateway"
});

db.connect(err => {
  if (err) {
    console.error("❌ Gagal koneksi database:", err);
  } else {
    console.log("✅ MySQL database Connected");
  }
});

// setup whatsapp Client
const client = new Client({
  authStrategy: new LocalAuth()
});

// tampilkan qrcode di terminal (untuk debugging)
client.on('qr', qr => {
  console.log("📱 Scan QR di terminal (jika bisa):");
  qrcode.generate(qr, { small: true });
  io.emit('qr', qr);
});

// siap digunakan
client.on('ready', () => {
  console.log('✅ WhatsApp Web Ready');
  io.emit('Ready');
});

// terima pesan masuk
client.on('message', async message => {
  console.log('📩 Pesan Masuk:', message.body);

  db.query("INSERT INTO messages (from_number, message, direction) VALUES (?, ?, 'in')",
    [message.from, message.body]);
});

// kirim pesan keluar
app.get('/send', (req, res) => {
  const { to, message } = req.query;
  if (!to || !message) return res.send('Parameter tidak lengkap');

  const nomor = to + "@c.us";
  client.sendMessage(nomor, message).then(() => {
    db.query("INSERT INTO messages (to_number, message, direction) VALUES (?, ?, 'out')",
      [to, message]);
    res.send('Pesan Dikirim ✅');
  }).catch(err => {
    res.status(500).send('Gagal Kirim: ' + err);
  });
});

// ✅ gunakan PORT dari Railway
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

client.initialize();


