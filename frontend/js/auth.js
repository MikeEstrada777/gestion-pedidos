const API = "http://localhost/gestion_pedidos/backend/api";

function login() {
    const correo   = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value;
    const btn      = document.querySelector(".btn-login");

    if (!correo || !password) {
        mostrarAlerta("warning", "Todos los campos son obligatorios");
        return;
    }

    btn.disabled    = true;
    btn.textContent = "Iniciando sesión...";

    fetch(`${API}/usuarios.php?accion=login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password })
    })
    .then(res => {
        if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
        return res.json();
    })
    .then(data => {
        if (data.error) {
            mostrarAlerta("danger", data.error);
        } else {
            mostrarAlerta("success", "¡Bienvenido! Redirigiendo...");
            localStorage.setItem("usuario", JSON.stringify(data.usuario));
            setTimeout(() => {
                window.location.href = data.usuario.rol === "admin"
                    ? "dashboard.html"
                    : "tienda.html";
            }, 1000);
        }
    })
    .catch(err => {
        mostrarAlerta("danger", "No se pudo conectar al servidor. ¿Está XAMPP corriendo?");
        console.error("Error de login:", err);
    })
    .finally(() => {
        btn.disabled    = false;
        btn.textContent = "Iniciar sesión →";
    });
}

function registrar() {
    const nombre   = document.getElementById("nombre").value.trim();
    const correo   = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value;
    const btn      = document.querySelector(".btn-login");

    if (!nombre || !correo || !password) {
        mostrarAlerta("warning", "Todos los campos son obligatorios");
        return;
    }

    btn.disabled    = true;
    btn.textContent = "Creando cuenta...";

    fetch(`${API}/usuarios.php?accion=registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password, rol: "cliente" })
    })
    .then(res => {
        if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
        return res.json();
    })
    .then(data => {
        if (data.error) {
            mostrarAlerta("danger", data.error);
        } else {
            mostrarAlerta("success", "¡Cuenta creada! Redirigiendo al login...");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        }
    })
    .catch(err => {
        mostrarAlerta("danger", "No se pudo conectar al servidor. ¿Está XAMPP corriendo?");
        console.error("Error de registro:", err);
    })
    .finally(() => {
        btn.disabled    = false;
        btn.textContent = "Crear cuenta →";
    });
}

function mostrarAlerta(tipo, mensaje) {
    const alerta = document.getElementById("alerta");
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
    setTimeout(() => { alerta.className = "d-none"; }, 4000);
}