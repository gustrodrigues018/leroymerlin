<?php
include 'conexao.php';

$nome = $_POST['nome'];
$quantidade = $_POST['quantidade'];
$tamanho = $_POST['tamanho'];
$categoria = $_POST['categoria'];

$sql = "INSERT INTO epis (nome, quantidade, tamanho, categoria) VALUES ('$nome', $quantidade, $tamanho '$categoria')";
$conn->query($sql);

$conn->close();
header("Location: index.html");
?>
