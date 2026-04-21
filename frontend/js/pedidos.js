const API = "http://localhost/gestion_pedidos/backend/api";

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) window.location.href = "login.html";

let carrito = [];
let productos_disponibles = [];

function cerrarSesion() {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    cargarProductosSelect();
    cargarPedidos();
});

function cargarProductosSelect() {
    fetch(`${API}/productos.php?accion=listar`)
    .then(res => res.json())
    .then(productos => {
        productos_disponibles = productos;
        const select = document.getElementById("producto_sel");
        productos.forEach(p => {
            select.innerHTML += `
                <option value="${p.id_producto}" 
                        data-precio="${p.precio}" 
                        data-nombre="${p.nombre}">
                    ${p.nombre} - $${parseFloat(p.precio).toLocaleString()}
                </option>`;
        });
    });
}

function agregarAlCarrito() {
    const select   = document.getElementById("producto_sel");
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const id       = select.value;
    const nombre   = select.options[select.selectedIndex]?.dataset.nombre;
    const precio   = parseFloat(select.options[select.selectedIndex]?.dataset.precio);

    if (!id || !cantidad || cantidad < 1) {
        mostrarAlerta("alerta_pedido", "warning", "Selecciona producto y cantidad");
        return;
    }

    const existente = carrito.find(i => i.id_producto == id);
    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carrito.push({ id_producto: id, nombre, precio_unitario: precio, cantidad });
    }

    actualizarCarrito();
}

function actualizarCarrito() {
    const lista = document.getElementById("lista_carrito");
    const total = carrito.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);

    lista.innerHTML = carrito.map((i, idx) => `
        <li class="list-group-item d-flex justify-content-between">
            <span>${i.nombre} x${i.cantidad}</span>
            <span>
                $${(i.precio_unitario * i.cantidad).toLocaleString()}
                <button onclick="quitarDelCarrito(${idx})" 
                        class="btn btn-sm btn-danger ms-2">✕</button>
            </span>
        </li>
    `).join("");

    document.getElementById("total_carrito").textContent = 
        "$" + total.toLocaleString();
    document.getElementById("carrito_container").className = 
        carrito.length > 0 ? "mt-3" : "d-none";
}

function quitarDelCarrito(idx) {
    carrito.splice(idx, 1);
    actualizarCarrito();
}

function crearPedido() {
    const direccion = document.getElementById("direccion").value;

    if (!direccion) {
        mostrarAlerta("alerta_pedido", "warning", "Ingresa la dirección de envío");
        return;
    }
    if (carrito.length === 0) {
        mostrarAlerta("alerta_pedido", "warning", "El carrito está vacío");
        return;
    }

    fetch(`${API}/pedidos.php?accion=crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_usuario: usuario.id_usuario,
            direccion_envio: direccion,
            productos: carrito
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            mostrarAlerta("alerta_pedido", "danger", data.error);
        } else {
            mostrarAlerta("alerta_pedido", "success", "¡Pedido creado correctamente!");
            carrito = [];
            actualizarCarrito();
            document.getElementById("direccion").value = "";
            cargarPedidos();
        }
    });
}

function cargarPedidos() {
    fetch(`${API}/pedidos.php?accion=listar`)
    .then(res => res.json())
    .then(pedidos => {
        const tabla = document.getElementById("tabla_pedidos");
        if (pedidos.length === 0) {
            tabla.innerHTML = `<tr>
                <td colspan="6" class="text-center">No hay pedidos aún</td>
            </tr>`;
            return;
        }
        tabla.innerHTML = pedidos.map(p => `
            <tr>
                <td>${p.id_pedido}</td>
                <td>${p.cliente}</td>
                <td>$${parseFloat(p.total).toLocaleString()}</td>
                <td>
                    <span class="badge ${badgeEstado(p.estado)}">
                        ${p.estado}
                    </span>
                </td>
                <td>${new Date(p.fecha_pedido).toLocaleDateString()}</td>
                <td>
                    <select onchange="cambiarEstado(${p.id_pedido}, this.value)"
                            class="form-select form-select-sm">
                        <option value="">Cambiar...</option>
                        <option value="1">Pendiente</option>
                        <option value="2">Confirmado</option>
                        <option value="3">Enviado</option>
                        <option value="4">Entregado</option>
                        <option value="5">Cancelado</option>
                    </select>
                </td>
            </tr>
        `).join("");
    });
}

function badgeEstado(estado) {
    const colores = {
        "pendiente":  "bg-warning text-dark",
        "confirmado": "bg-info text-dark",
        "enviado":    "bg-primary",
        "entregado":  "bg-success",
        "cancelado":  "bg-danger"
    };
    return colores[estado] || "bg-secondary";
}

function cambiarEstado(id_pedido, id_estado) {
    if (!id_estado) return;

    fetch(`${API}/pedidos.php?accion=estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_pedido, id_estado, observacion: "Actualizado" })
    })
    .then(res => res.json())
    .then(data => {
        mostrarAlerta("alerta_pedido", "success", "Estado actualizado");
        cargarPedidos();
    });
}

function mostrarAlerta(id, tipo, mensaje) {
    const alerta = document.getElementById(id);
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
    setTimeout(() => alerta.className = "d-none", 3000);
}