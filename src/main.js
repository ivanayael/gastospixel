import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import { createClient } from '@supabase/supabase-js'

// Usamos las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

    let editId = null;
    const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

    // Función para mostrar mensajes "pixel art"
    function notify(text, type = 'success') {
        const notif = document.getElementById('notification');
        const notifText = document.getElementById('notif-text');
        notifText.innerText = text;
        notif.style.display = 'block';
        setTimeout(() => { notif.style.display = 'none'; }, 2000);
    }

    async function cargarGastos() {
        const { data, error } = await supabase.from('gastos').select('*').order('created_at', { ascending: false });
        if (error) return console.error(error);

        const lista = document.getElementById('lista-gastos');
        const totalDisplay = document.getElementById('total-monto');
        const totalContainer = document.getElementById('total-container');
        
        lista.innerHTML = '';
        let sumaTotal = 0;

        data.forEach(gasto => {
            sumaTotal += gasto.monto;
            const catArr = (gasto.categoria || "📦 Otros").split(" "); // Separar icono de texto
            
            lista.innerHTML += `
                <div class="expense-item">
                    <div style="display: flex; align-items: center;">
                        <span class="categoria-icon">${catArr[0]}</span>
                        <div>
                            <span class="descripcion">${gasto.descripcion}</span>
                            <span class="monto">${formatter.format(gasto.monto)}</span>
                        </div>
                    </div>
                    <div class="actions-btns">
                        <button onclick="prepararEdicion(${gasto.id}, '${gasto.descripcion}', ${gasto.monto}, '${gasto.categoria}')" class="nes-btn is-warning btn-pixel-small">EDIT</button>
                        <button onclick="borrarGasto(${gasto.id})" class="nes-btn is-error btn-pixel-small">X</button>
                    </div>
                </div>
            `;
        });

        totalDisplay.innerText = formatter.format(sumaTotal);

        // Lógica de alerta visual (Si gastas más de 50 mil)
        if(sumaTotal > 50000) {
            totalContainer.classList.replace('total-normal', 'total-danger');
        } else {
            totalContainer.classList.replace('total-danger', 'total-normal');
        }
    }

    async function guardarGasto() {
        const desc = document.getElementById('desc').value;
        const monto = document.getElementById('monto').value;
        const categoria = document.getElementById('categoria').value;

        if(!desc || !monto) return notify("¡Faltan datos!", "error");

        if (editId) {
            await supabase.from('gastos').update({ descripcion: desc, monto: parseInt(monto), categoria }).eq('id', editId);
            notify("¡Registro Actualizado!");
        } else {
            await supabase.from('gastos').insert([{ descripcion: desc, monto: parseInt(monto), categoria }]);
            notify("¡Gasto Guardado!");
        }

        resetearFormulario();
        cargarGastos();
    }

    async function borrarGasto(id) {
        if(confirm("¿Eliminar este item?")) {
            await supabase.from('gastos').delete().eq('id', id);
            notify("Eliminado...", "error");
            cargarGastos();
        }
    }

    function prepararEdicion(id, descripcion, monto, categoria) {
        editId = id;
        document.getElementById('desc').value = descripcion;
        document.getElementById('monto').value = monto;
        document.getElementById('categoria').value = categoria || "📦 Otros";
        
        document.getElementById('form-title').innerText = "Editando...";
        document.getElementById('btn-guardar').innerText = "¡Actualizar!";
        document.getElementById('btn-guardar').classList.replace('is-primary', 'is-warning');
        document.getElementById('btn-cancelar').style.display = "block";
        window.scrollTo(0,0);
    }

    function resetearFormulario() {
        editId = null;
        document.getElementById('desc').value = '';
        document.getElementById('monto').value = '';
        document.getElementById('form-title').innerText = "Nuevo Registro";
        document.getElementById('btn-guardar').innerText = "¡Ahorrar!";
        document.getElementById('btn-guardar').classList.replace('is-warning', 'is-primary');
        document.getElementById('btn-cancelar').style.display = "none";
    }

    cargarGastos();

window.guardarGasto = guardarGasto;
window.borrarGasto = borrarGasto;
window.prepararEdicion = prepararEdicion;
window.resetearFormulario = resetearFormulario;