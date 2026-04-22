const API = "http://localhost/gestion_pedidos/backend/api";

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) window.location.href = "login.html";
if (usuario.rol === "admin") window.location.href = "dashboard.html";

document.getElementById("nombre_cliente").textContent = "Hola, " + usuario.nombre;

let carrito = [];

function cerrarSesion() {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", cargarProductos);

function cargarProductos() {
    fetch(`${API}/productos.php?accion=listar`)
    .then(res => res.json())
    .then(productos => {
        const lista = document.getElementById("lista_productos");
        if (productos.length === 0) {
            lista.innerHTML = `<p class="text-muted">No hay productos disponibles</p>`;
            return;
        }
        lista.innerHTML = productos.map(p => `
            <div class="col-md-4 mb-4">
                <div class="card shadow h-100">
                    <div class="card-body text-center">
                        <h1>📦</h1>
                        <h5>${p.nombre}</h5>
                        <p class="text-muted">${p.descripcion}</p>
                        <p class="fw-bold text-primary">
                            $${parseFloat(p.precio).toLocaleString()}
                        </p>
                        <p class="text-muted small">Stock: ${p.stock}</p>
                        <button onclick="agregarAlCarrito(
                                    '${p.id_producto}',
                                    '${p.nombre}',
                                    ${p.precio},
                                    ${p.stock})"
                                class="btn btn-primary w-100"
                                ${p.stock == 0 ? 'disabled' : ''}>
                            ${p.stock == 0 ? 'Sin stock' : 'Agregar al carrito'}
                        </button>
                    </div>
                </div>
            </div>
        `).join("");
    });
}

function agregarAlCarrito(id, nombre, precio, stock) {
    const existente = carrito.find(i => i.id_producto == id);
    if (existente) {
        if (existente.cantidad >= stock) {
            alert("No hay suficiente stock");
            return;
        }
        existente.cantidad++;
    } else {
        carrito.push({ id_producto: id, nombre, precio_unitario: precio, cantidad: 1 });
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
        carrito.length > 0 ? "mb-4" : "d-none";
}

function quitarDelCarrito(idx) {
    carrito.splice(idx, 1);
    actualizarCarrito();
}

function crearPedido() {
    const direccion = document.getElementById("direccion").value;

    if (!direccion) {
        mostrarAlerta("warning", "Ingresa la dirección de envío");
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
            mostrarAlerta("danger", data.error);
        } else {
            mostrarAlerta("success", "¡Pedido creado! Redirigiendo...");
            carrito = [];
            actualizarCarrito();
            setTimeout(() => {
                window.location.href = "mis_pedidos.html";
            }, 1500);
        }
    });
}

function mostrarAlerta(tipo, mensaje) {
    const alerta = document.getElementById("alerta_pedido");
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
    setTimeout(() => alerta.className = "d-none", 3000);
}