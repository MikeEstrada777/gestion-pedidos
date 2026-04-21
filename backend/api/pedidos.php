<?php
require_once "../config/db.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT");

$metodo = $_SERVER["REQUEST_METHOD"];
$accion = $_GET["accion"] ?? "";

// ── CREAR PEDIDO ───────────────────────────────────
if ($metodo === "POST" && $accion === "crear") {
    $datos = json_decode(file_get_contents("php://input"), true);

    $id_usuario     = $datos["id_usuario"]     ?? 0;
    $direccion      = $datos["direccion_envio"] ?? "";
    $productos      = $datos["productos"]       ?? [];

    if (!$id_usuario || empty($productos)) {
        echo json_encode(["error" => "Datos incompletos"]);
        exit;
    }

    // Calcular total
    $total = 0;
    foreach ($productos as $p) {
        $total += $p["precio_unitario"] * $p["cantidad"];
    }

    // Insertar pedido
    $sql  = "INSERT INTO pedidos (id_usuario, id_estado, total, direccion_envio) 
             VALUES (?, 1, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ids", $id_usuario, $total, $direccion);
    $stmt->execute();
    $id_pedido = $stmt->insert_id;

    // Insertar detalle y actualizar stock
    foreach ($productos as $p) {
        $sql2  = "INSERT INTO detalle_pedido 
                  (id_pedido, id_producto, cantidad, precio_unitario) 
                  VALUES (?, ?, ?, ?)";
        $stmt2 = $conexion->prepare($sql2);
        $stmt2->bind_param("iiid", $id_pedido, $p["id_producto"], 
                                   $p["cantidad"], $p["precio_unitario"]);
        $stmt2->execute();

        // Restar stock
        $sql3  = "UPDATE productos SET stock = stock - ? 
                  WHERE id_producto = ?";
        $stmt3 = $conexion->prepare($sql3);
        $stmt3->bind_param("ii", $p["cantidad"], $p["id_producto"]);
        $stmt3->execute();
    }

    // Registrar en historial
    $sql4  = "INSERT INTO historial_estados (id_pedido, id_estado, observacion) 
              VALUES (?, 1, 'Pedido creado')";
    $stmt4 = $conexion->prepare($sql4);
    $stmt4->bind_param("i", $id_pedido);
    $stmt4->execute();

    echo json_encode([
        "mensaje"   => "Pedido creado correctamente",
        "id_pedido" => $id_pedido
    ]);
}

// ── LISTAR PEDIDOS ─────────────────────────────────
if ($metodo === "GET" && $accion === "listar") {
    $sql = "SELECT p.id_pedido, u.nombre AS cliente, 
                   e.nombre AS estado, p.total, 
                   p.fecha_pedido, p.direccion_envio
            FROM pedidos p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            JOIN estados_pedido e ON p.id_estado = e.id_estado
            ORDER BY p.fecha_pedido DESC";

    $resultado = $conexion->query($sql);
    $pedidos   = $resultado->fetch_all(MYSQLI_ASSOC);
    echo json_encode($pedidos);
}

// ── VER DETALLE DE UN PEDIDO ───────────────────────
if ($metodo === "GET" && $accion === "detalle") {
    $id = $_GET["id"] ?? 0;

    $sql  = "SELECT dp.cantidad, dp.precio_unitario, 
                    pr.nombre AS producto
             FROM detalle_pedido dp
             JOIN productos pr ON dp.id_producto = pr.id_producto
             WHERE dp.id_pedido = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $detalle   = $resultado->fetch_all(MYSQLI_ASSOC);
    echo json_encode($detalle);
}

// ── CAMBIAR ESTADO DE PEDIDO ───────────────────────
if ($metodo === "PUT" && $accion === "estado") {
    $datos = json_decode(file_get_contents("php://input"), true);

    $id_pedido = $datos["id_pedido"]  ?? 0;
    $id_estado = $datos["id_estado"]  ?? 0;
    $observacion = $datos["observacion"] ?? "";

    $sql  = "UPDATE pedidos SET id_estado = ? WHERE id_pedido = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ii", $id_estado, $id_pedido);
    $stmt->execute();

    // Registrar en historial
    $sql2  = "INSERT INTO historial_estados 
              (id_pedido, id_estado, observacion) VALUES (?, ?, ?)";
    $stmt2 = $conexion->prepare($sql2);
    $stmt2->bind_param("iis", $id_pedido, $id_estado, $observacion);
    $stmt2->execute();

    echo json_encode(["mensaje" => "Estado actualizado correctamente"]);
}
?>