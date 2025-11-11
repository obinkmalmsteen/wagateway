const {Client, LocalAuth}= require('whatsapp-web.js');
const qrcode = require ('qrcode-terminal');
const express = require ('express');
const mysql = require ('mysql2');
const socketIO = require ('socket.io');
const http = require ('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// koneksi database

const db = mysql.createConnection({
host: "localhost",
user : "root",
password : "",
database :"wagateway"

});

db.connect(err=>{ if (err) throw err;
console.log('MYSQL database Connected');
});

//setup whatsapp Client
const client = new Client ({
	authStrategy : new LocalAuth()
});

// tampilan qrcode
client.on('qr',qr => {
	qrcode.generate(qr,{small: true});
	io.emit('qr',qr);
});

// siap digunakan
client.on('ready',() => {
	console.log('WhatsApp web ready');
	io.emit('Ready');
});

//terima pesan masuk
client.on('message',async message => {
	console.log('Pesan Masuk:', message.body);
	
	db.query("INSERT INTO messages (from_number, message, direction) VALUES (?, ?, 'in')",
	[message.from, message.body]);
});

//kirim pesan keluar
app.get('/send',(req, res) => {
	const { to, message } = req.query;
	
	if (!to || !message) return res.send('Parameter tidak lengkap');
	
	const nomor = to + "@c.us";
	
	client.sendMessage(nomor, message).then(() => {
		db.query("INSERT INTO messages (to_number, message, direction) VALUES (?, ?, 'out')",
		[to, message]);
		res.send('Pesan Dikirim');
	}).catch(err => {
		res.status(500).send('Gagal Kirim: ' +err);
	});
});

server.listen(8000,() =>{
	console.log('server running on http://localhost:8000');
});

client.initialize();

	

