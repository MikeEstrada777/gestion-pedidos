<?php
require_once "../config/db.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Total de pedidos
$total_pedidos = $conexion->query(
    "SELECT COUNT(*) AS total FROM pedidos"
)->fetch_assoc()["total"];

// Pedidos pendientes
$pendientes = $conexion->query(
    "SELECT COUNT(*) AS total FROM pedidos WHERE id_estado = 1"
)->fetch_assoc()["total"];

// Total de clientes
$clientes = $conexion->query(
    "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'cliente'"
)->fetch_assoc()["total"];

// Productos con poco stock (menos de 5)
$poco_stock = $conexion->query(
    "SELECT COUNT(*) AS total FROM productos WHERE stock < 5"
)->fetch_assoc()["total"];

// Total ingresos
$ingresos = $conexion->query(
    "SELECT SUM(total) AS total FROM pedidos WHERE id_estado != 5"
)->fetch_assoc()["total"];

echo json_encode([
    "total_pedidos" => $total_pedidos,
    "pendientes"    => $pendientes,
    "clientes"      => $clientes,
    "poco_stock"    => $poco_stock,
    "ingresos"      => $ingresos ?? 0
]);
?>