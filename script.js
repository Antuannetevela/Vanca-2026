let puntoCount = 0;
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbyPObfZVC-ZN55eiD6jFDLrJbHXomy43cM90XGQ74XqQte8Luw7JrOKNMBoZcaNub4f1A/exec";

let sesionUsuario = null;

document.addEventListener('DOMContentLoaded', function () {
  const btnLogin = document.getElementById('btnLogin');
  const btnLogout = document.getElementById('btnLogout');
  const loginMensaje = document.getElementById('loginMensaje');

  document.querySelectorAll('input[name="movil"]').forEach(radio => {
    radio.addEventListener('change', function () {
      const otroInput = document.getElementById('otro_movil');
      if (this.value === 'Otro') {
        otroInput.disabled = false;
        otroInput.required = true;
        otroInput.focus();
      } else {
        otroInput.disabled = true;
        otroInput.required = false;
        otroInput.value = '';
      }
    });
  });

  btnLogin.addEventListener('click', async function () {
    const usuario = document.getElementById('loginUsuario').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!usuario || !password) {
      loginMensaje.textContent = "Ingrese usuario y contraseña.";
      loginMensaje.style.color = "#dc2626";
      return;
    }

    loginMensaje.textContent = "Validando...";
    loginMensaje.style.color = "#2563eb";

    const data = new FormData();
    data.append("action", "login");
    data.append("usuario", usuario);
    data.append("password", password);

    try {
      const res = await fetch(URL_WEB_APP, {
        method: "POST",
        body: data
      });

      const json = await res.json();

      if (json.success) {
        sesionUsuario = json.user;

        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('formSection').style.display = 'block';

        document.getElementById('usuarioActivoTexto').textContent =
          `${json.user.nombre} (${json.user.usuario})`;

        document.getElementById('usuario_logueado').value = json.user.usuario;
        document.getElementById('nombre_logueado').value = json.user.nombre;
        
        // Establecer Microred automáticamente
        if (json.user.microred) {
          document.getElementById('microred').value = json.user.microred;
        }
      } else {
        loginMensaje.textContent = json.message || "Credenciales incorrectas.";
        loginMensaje.style.color = "#dc2626";
      }
    } catch (error) {
      loginMensaje.textContent = "Error al conectar con el servidor.";
      loginMensaje.style.color = "#dc2626";
      console.error(error);
    }
  });

  btnLogout.addEventListener('click', function () {
    sesionUsuario = null;
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('loginUsuario').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginMensaje').textContent = '';
    document.getElementById('usuarioActivoTexto').textContent = '-';
    document.getElementById('microred').value = '';
  });

  document.getElementById('formulario').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!sesionUsuario) {
      alert("Debe iniciar sesión primero.");
      return;
    }

    const data = new FormData();

    data.append('action', 'guardar_vancan');

    data.append('usuario_logueado', document.getElementById('usuario_logueado').value);
    data.append('nombre_logueado', document.getElementById('nombre_logueado').value);

    data.append('microred', document.getElementById('microred').value);
    data.append('fecha', document.getElementById('fecha').value);
    data.append('num_grupo', document.getElementById('num_grupo').value);
    data.append('num_gps', document.getElementById('num_gps').value);
    data.append('vacunador', document.getElementById('vacunador').value);
    data.append('fecha_barrio', document.getElementById('fecha_barrio').value);
    data.append('usuario_app', document.getElementById('usuario_app').value);
    data.append('registrador', document.getElementById('registrador').value);

    data.append('hora_material', document.getElementById('hora_material').value);
    data.append('hora_partida', document.getElementById('hora_partida').value);
    data.append('movil', document.querySelector('input[name="movil"]:checked')?.value || '');
    data.append('otro_movil', document.getElementById('otro_movil').value);
    data.append('hora_llegada', document.getElementById('hora_llegada').value);

    data.append('indicacion', document.querySelector('input[name="indicacion"]:checked')?.value || '');
    data.append('total_perros', document.getElementById('total_perros').value);
    data.append('total_gatos', document.getElementById('total_gatos').value);
    data.append('hora_termino', document.getElementById('hora_termino').value);
    data.append('comentarios', document.getElementById('comentarios').value);

    let puntos = [];
    for (let i = 1; i <= puntoCount; i++) {
      const tipoElement = document.querySelector(`input[name="tipo_${i}"]:checked`);
      const perrosElement = document.querySelector(`input[name="perros_${i}"]`);
      const gatosElement = document.querySelector(`input[name="gatos_${i}"]`);
      const cambioElement = document.querySelector(`input[name="cambio_${i}"]:checked`);

      if (tipoElement && perrosElement && gatosElement && cambioElement) {
        puntos.push({
          numero: i,
          tipo: tipoElement.value,
          perros: parseInt(perrosElement.value) || 0,
          gatos: parseInt(gatosElement.value) || 0,
          cambio: cambioElement.value
        });
      }
    }

    data.append('puntos', JSON.stringify(puntos));

    try {
      const res = await fetch(URL_WEB_APP, {
        method: 'POST',
        body: data
      });

      const json = await res.json();

      if (json.success) {
        alert('✅ Datos guardados correctamente');
        document.getElementById('formulario').reset();
        document.getElementById('puntos').innerHTML = '';
        puntoCount = 0;
        document.getElementById('total_perros').value = '';
        document.getElementById('total_gatos').value = '';
        document.getElementById('usuario_logueado').value = sesionUsuario.usuario;
        document.getElementById('nombre_logueado').value = sesionUsuario.nombre;
      } else {
        alert('❌ ' + (json.message || 'No se pudo guardar.'));
      }
    } catch (error) {
      console.error(error);
      alert('⚠️ Error al conectar con el servidor.');
    }
  });
});

function agregarPunto() {
  if (puntoCount >= 20) {
    alert('❌ No puedes agregar más de 20 puntos.');
    return;
  }

  puntoCount++;

  const puntosDiv = document.getElementById('puntos');
  const puntoDiv = document.createElement('div');
  puntoDiv.className = 'punto';

  puntoDiv.innerHTML = `
    <h4>Punto ${puntoCount}</h4>

    <label><strong>Tipo:</strong></label>
    <div class="opciones">
      <label><input type="radio" name="tipo_${puntoCount}" value="Fijo" required> Fijo</label>
      <label><input type="radio" name="tipo_${puntoCount}" value="Móvil"> Móvil</label>
      <label><input type="radio" name="tipo_${puntoCount}" value="Puerta a puerta"> Puerta a puerta</label>
    </div>

    <div class="punto-fila">
      <div>
        <label>Número de perros</label>
        <input type="number" name="perros_${puntoCount}" min="0" value="0" onchange="actualizarTotales()" required>
      </div>
      <div>
        <label>Número de gatos</label>
        <input type="number" name="gatos_${puntoCount}" min="0" value="0" onchange="actualizarTotales()" required>
      </div>
    </div>

    <label><strong>¿Cambio de punto?</strong></label>
    <div class="opciones">
      <label><input type="radio" name="cambio_${puntoCount}" value="Sí" required onchange="verificarCambioPunto(this)"> Sí</label>
      <label><input type="radio" name="cambio_${puntoCount}" value="No"> No</label>
    </div>

    <button type="button" onclick="eliminarPunto(this)" style="background:#ef4444;width:100%;margin-top:10px;">🗑️ Eliminar punto</button>
  `;

  puntosDiv.appendChild(puntoDiv);
}

function eliminarPunto(button) {
  button.parentElement.remove();
  actualizarTotales();
}

function actualizarTotales() {
  let totalPerros = 0;
  let totalGatos = 0;

  document.querySelectorAll('input[name^="perros_"]').forEach(el => {
    totalPerros += parseInt(el.value) || 0;
  });

  document.querySelectorAll('input[name^="gatos_"]').forEach(el => {
    totalGatos += parseInt(el.value) || 0;
  });

  document.getElementById('total_perros').value = totalPerros;
  document.getElementById('total_gatos').value = totalGatos;
}

function verificarCambioPunto(radio) {
  if (radio.value === 'Sí') {
    agregarPunto();
  }
}