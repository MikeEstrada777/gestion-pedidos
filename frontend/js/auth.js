const API = "http://localhost/gestion_pedidos/backend/api";

function login() {
    const correo   = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    fetch(`${API}/usuarios.php?accion=login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            mostrarAlerta("danger", data.error);
        } else {
            localStorage.setItem("usuario", JSON.stringify(data.usuario));
            window.location.href = "dashboard.html";
        }
    });
}

function mostrarAlerta(tipo, mensaje) {
    const alerta = document.getElementById("alerta");
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
}
function registrar() {
    const nombre   = document.getElementById("nombre").value;
    const correo   = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    if (!nombre || !correo || !password) {
        mostrarAlerta("warning", "Todos los campos son obligatorios");
        return;
    }

    fetch(`${API}/usuarios.php?accion=registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            mostrarAlerta("danger", data.error);
        } else {
            mostrarAlerta("success", "¡Cuenta creada! Redirigiendo...");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        }
    });
}