const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbyPObfZVC-ZN55eiD6jFDLrJbHXomy43cM90XGQ74XqQte8Luw7JrOKNMBoZcaNub4f1A/exec";

let sesionUsuario = null;

function toggleFormSections(tipoReporte) {
  const seccionCorto = document.getElementById('seccionCorto');
  const seccionDetallado = document.getElementById('seccionDetallado');
  
  if (tipoReporte === 'Corto') {
    seccionCorto.style.display = 'block';
    seccionDetallado.style.display = 'none';
  } else if (tipoReporte === 'Detallado') {
    seccionCorto.style.display = 'none';
    seccionDetallado.style.display = 'block';
    // Hacer campos detallados requeridos
    document.getElementById('hora_material').required = true;
    document.getElementById('hora_partida').required = true;
    document.getElementById('hora_llegada').required = true;
    document.getElementById('hora_termino').required = true;
    
    // Marcar radios como requeridos
    document.querySelectorAll('input[name="indicacion"]').forEach(input => {
      input.required = true;
    });
    document.querySelectorAll('input[name="movil"]').forEach(input => {
      input.required = true;
    });
  }
}

function actualizarTotalCorto() {
  let perros = parseInt(document.getElementById('perros_corto').value) || 0;
  let gatos = parseInt(document.getElementById('gatos_corto').value) || 0;
  // El total es perros + gatos, pero se guarda como total_perros para compatibilidad
  document.getElementById('total_perros').value = perros + gatos;
}

function togglePunto(numeroPunto) {
  const filaActual = document.getElementById(`fila_punto_0${numeroPunto}`);
  if (!filaActual) return;

  const radioCambio = document.querySelector(`input[name="cambio_p0${numeroPunto - 1}"]:checked`);
  
  if (radioCambio && radioCambio.value === 'Si') {
    filaActual.style.display = 'table-row';
  } else {
    filaActual.style.display = 'none';
    // Limpiar datos del punto oculto
    document.getElementById(`perros_p0${numeroPunto}`).value = 0;
    document.getElementById(`gatos_p0${numeroPunto}`).value = 0;
    // Si existe el siguiente punto, ocultarlo también
    if (numeroPunto < 3) {
      document.querySelector(`input[name="cambio_p0${numeroPunto}"]`).checked = false;
      togglePunto(numeroPunto + 1);
    }
  }
  
  actualizarTotalDetallado();
}

function actualizarTotalDetallado() {
  let totalPerros = 0;
  let totalGatos = 0;

  // Sumar solo los puntos visibles
  for (let i = 1; i <= 3; i++) {
    const filaId = `fila_punto_0${i}`;
    const fila = document.getElementById(filaId);
    
    // Si es el Punto 01 o la fila está visible
    if (i === 1 || (fila && fila.style.display !== 'none')) {
      const perros = parseInt(document.getElementById(`perros_p0${i}`).value) || 0;
      const gatos = parseInt(document.getElementById(`gatos_p0${i}`).value) || 0;
      totalPerros += perros;
      totalGatos += gatos;
    }
  }

  document.getElementById('total_perros_detallado').value = totalPerros;
  document.getElementById('total_gatos_detallado').value = totalGatos;
}

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

    const tipoReporte = document.querySelector('input[name="tipo_reporte"]:checked')?.value || '';
    
    if (!tipoReporte) {
      alert("Seleccione el tipo de reporte.");
      return;
    }

    const data = new FormData();

    data.append('action', 'guardar_vancan');
    data.append('tipo_reporte', tipoReporte);

    data.append('usuario_logueado', document.getElementById('usuario_logueado').value);
    data.append('nombre_logueado', document.getElementById('nombre_logueado').value);

    data.append('microred', document.getElementById('microred').value);
    data.append('fecha_barrio', document.getElementById('fecha_barrio').value);
    data.append('num_grupo', document.getElementById('num_grupo').value);
    data.append('num_gps', document.getElementById('num_gps').value);
    data.append('vacunador', document.getElementById('vacunador').value);
    data.append('usuario_app', document.getElementById('usuario_app').value);
    data.append('registrador', document.getElementById('registrador').value);

    if (tipoReporte === 'Corto') {
      data.append('perros_corto', document.getElementById('perros_corto').value);
      data.append('gatos_corto', document.getElementById('gatos_corto').value);
      data.append('total_perros', parseInt(document.getElementById('perros_corto').value || 0) + parseInt(document.getElementById('gatos_corto').value || 0));
      data.append('comentarios', document.getElementById('comentarios').value);
    } else {
      // Datos del reporte detallado
      data.append('hora_material', document.getElementById('hora_material').value);
      data.append('hora_partida', document.getElementById('hora_partida').value);
      data.append('movil', document.querySelector('input[name="movil"]:checked')?.value || '');
      data.append('otro_movil', document.getElementById('otro_movil').value);
      data.append('hora_llegada', document.getElementById('hora_llegada').value);
      data.append('indicacion', document.querySelector('input[name="indicacion"]:checked')?.value || '');
      
      // Datos de los puntos
      data.append('tipo_punto_p01', document.querySelector('input[name="tipo_punto_p01"]:checked')?.value || '');
      data.append('perros_p01', document.getElementById('perros_p01').value);
      data.append('gatos_p01', document.getElementById('gatos_p01').value);
      data.append('cambio_p01', document.querySelector('input[name="cambio_p01"]:checked')?.value || '');
      
      // Punto 02 (si existe)
      if (document.getElementById('fila_punto_02').style.display !== 'none') {
        data.append('tipo_punto_p02', document.querySelector('input[name="tipo_punto_p02"]:checked')?.value || '');
        data.append('perros_p02', document.getElementById('perros_p02').value);
        data.append('gatos_p02', document.getElementById('gatos_p02').value);
        data.append('cambio_p02', document.querySelector('input[name="cambio_p02"]:checked')?.value || '');
      }
      
      // Punto 03 (si existe)
      if (document.getElementById('fila_punto_03').style.display !== 'none') {
        data.append('tipo_punto_p03', document.querySelector('input[name="tipo_punto_p03"]:checked')?.value || '');
        data.append('perros_p03', document.getElementById('perros_p03').value);
        data.append('gatos_p03', document.getElementById('gatos_p03').value);
      }
      
      data.append('total_perros_detallado', document.getElementById('total_perros_detallado').value);
      data.append('total_gatos_detallado', document.getElementById('total_gatos_detallado').value);
      data.append('hora_termino', document.getElementById('hora_termino').value);
      data.append('comentarios_detallado', document.getElementById('comentarios_detallado').value);
    }

    try {
      const res = await fetch(URL_WEB_APP, {
        method: 'POST',
        body: data
      });

      const json = await res.json();

      if (json.success) {
        alert('✅ Datos guardados correctamente');
        document.getElementById('formulario').reset();
        document.getElementById('seccionCorto').style.display = 'none';
        document.getElementById('seccionDetallado').style.display = 'none';
        document.getElementById('fila_punto_02').style.display = 'none';
        document.getElementById('fila_punto_03').style.display = 'none';
        document.getElementById('total_perros').value = '';
        document.getElementById('total_perros_detallado').value = '0';
        document.getElementById('total_gatos_detallado').value = '0';
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