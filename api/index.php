<?php
$conn = new mysqli("localhost", "root", "", "wagateway");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	$to = $_POST['to'];
	$msg = $_POST['message'];
	
$url = "http://localhost:8000/send?to=$to&message=" . urlencode($msg);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);

echo "<script>alert('Pesan Dikirim');</script>";


}

$result = $conn->query("SELECT * FROM messages ORDER BY timestamp DESC");
?>

<form method="POST">
Nomor Tujuan : <input name="to"><br>
Pesan: <textarea name="message"></textarea><br>
<button>Kirim</button>
</form>

<h3>Pesan:</h3>
<table border="1">
<tr><th>Waktu</th><th>Nomor</th><th>Isi</th><th>Arah</th></tr>
<?php while($row = $result->fetch_assoc()): ?>
<tr>
	<td><?= $row['timestamp'] ?></td>
	<td><?= $row['from_number'] ?? $row['to_number']?></td>
	<td><?= $row['message'] ?></td>
	<td><?= $row['direction'] ?></td>
</tr>
<?php endwhile ?>
</table>