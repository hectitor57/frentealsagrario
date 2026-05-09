let cambiosPendientes = false;
let listaFB = [];
let contenedor = document.getElementById("contenedorFB");
let ordenFecha = "desc";
let fechaDesde = "";
let fechaHasta = "";
let textoBusqueda = "";
let filtro = "todas";	
let leidos = JSON.parse(localStorage.getItem("leidos")) || [];
let likes = JSON.parse(localStorage.getItem("likes")) || [];
let datosGlobal = [];
let modoVista = localStorage.getItem("modoVista") || "tarjetas";

// CARGA DE DATOS
fetch("datos.json")
.then(res => res.json())
.then(data => {

    // 👉 asignar ID UNA sola vez
    data.forEach((post, index) => {
        post.id = index;
    });

    datosGlobal = data;
    renderizar(data);
});

// MOSTRAR DETALLE
function mostrarDetalle(post){

    let detalle = document.getElementById("detalle");
    let contenido = document.getElementById("contenidoDetalle");

    let esLeido = leidos.includes(post.id);
    let tieneLike = likes.includes(post.id);

    audio.volume = 0.15;

    contenido.innerHTML = `
        <button id="cerrarBtn" onclick="cerrarDetalle()">✖</button>

        <button onclick="toggleLeido(${post.id})" style="
            margin-bottom:10px;
            padding:5px 10px;
            cursor:pointer;
        ">
                ${esLeido ? "📕 Marcar como NO leído" : "📖 Marcar como leído"}

        </button>

	<button onclick="toggleLike(${post.id})" style="
	    margin-bottom:10px;
	    padding:5px 10px;
	    cursor:pointer;
	">
	    ${tieneLike ? "❤️ Ya me gustó" : "🤍 Me gustó esta reflexión"}
	</button>

	<button onclick="traerFotoAutomatica(${post.id})">
	    📷 Traer foto automática
	</button>

        <h2>${resaltarTexto(post.titulo, textoBusqueda)}</h2>
        <img src="${post.imagen}" style="width:100%">
        <p style="white-space: pre-line; text-align: justify; line-height:1.7;">
		${resaltarTexto(post.texto, textoBusqueda)}
	</p>
    `;

    detalle.style.display = "flex";

    // 👇 ESTO ES CLAVE
    document.getElementById("barraControles").style.display = "none";
    
    setTimeout(() => {
        document.getElementById("contenidoDetalle").focus();
    }, 50);
}

// CERRAR
function cerrarDetalle(){
    audio.volume = 0.4;
    document.getElementById("detalle").style.display = "none";
    document.getElementById("barraControles").style.display = "flex";
}

document.addEventListener("keydown", function(event){
    if(event.key === "Escape"){
        cerrarDetalle();
    }
});

// RENDERIZAR
function renderizar(data){

    let contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = "";

    contenedor.style.display = (modoVista === "tarjetas") ? "grid" : "block";

    // 👉 FILTRO (primero)
    let dataFiltrada = data;

    // 👉 FILTRO por estado (leídos)
	if(filtro === "no_leidas"){
    	dataFiltrada = data.filter(post => !leidos.includes(post.id));
	}

	if(filtro === "leidas"){
    	dataFiltrada = data.filter(post => leidos.includes(post.id));
	}

	// 👉 FILTRO por texto (buscador)
	if(textoBusqueda){
	    dataFiltrada = dataFiltrada.filter(post => 
        post.titulo.toLowerCase().includes(textoBusqueda) ||
        post.texto.toLowerCase().includes(textoBusqueda)
	    );
	}

	// 👉 FILTRO POR FECHA
	if(fechaDesde){
	    dataFiltrada = dataFiltrada.filter(post => 
        parseFecha(post.fecha) >= new Date(fechaDesde)
	    );
	}

	if(fechaHasta){
	    dataFiltrada = dataFiltrada.filter(post => 
        parseFecha(post.fecha) <= new Date(fechaHasta)
	    );
	}

	dataFiltrada.sort((a, b) => {

    let fechaA = parseFecha(a.fecha);
    let fechaB = parseFecha(b.fecha);

    if(ordenFecha === "asc"){
        return fechaA - fechaB;
    } else {
        return fechaB - fechaA;
    }

});

// 👉 RECORRER
dataFiltrada.forEach((post) => {

    let tieneLike = likes.includes(post.id);

    let div = document.createElement("div");

    if(modoVista === "tarjetas"){

        div.className = "tarjeta";

        div.innerHTML = `
            <img src="${post.imagen}">

            <h3>${resaltarTexto(post.titulo, textoBusqueda)}</h3>

            <div style="
                padding:0 10px 10px 10px;
                color:#c0392b;
                font-size:14px;
            ">
                ${tieneLike ? "❤️" : "🤍"}
            </div>
        `;        
		
	} else {

            div.style.borderBottom = "1px solid #ccc";
            div.style.padding = "10px";
            div.style.cursor = "pointer";

            div.innerHTML = `
                <strong>${resaltarTexto(post.titulo, textoBusqueda)}</strong><br>
                <small>${post.fecha}</small>
            `;
        }

        // 👉 ESTILO LEÍDO
        if(leidos.includes(post.id)){

            div.style.background = "#f0f0f0";
            div.style.opacity = "0.7";

            let etiqueta = document.createElement("div");
            etiqueta.innerText = "✔ Leído";

            etiqueta.style.position = "absolute";
            etiqueta.style.top = "10px";
            etiqueta.style.right = "10px";
            etiqueta.style.background = "#4CAF50";
            etiqueta.style.color = "white";
            etiqueta.style.padding = "3px 8px";
            etiqueta.style.fontSize = "12px";
            etiqueta.style.borderRadius = "5px";

            div.style.position = "relative";

            div.appendChild(etiqueta);
        }

        // 👉 CLICK
        div.onclick = (e) => {

            // SHIFT → alternar
            if(e.shiftKey){

                if(leidos.includes(post.id)){
                    leidos = leidos.filter(i => i !== post.id);
                } else {
                    leidos.push(post.id);
                }

                localStorage.setItem("leidos", JSON.stringify(leidos));
                renderizar(datosGlobal);
                return;
            }

            // click normal
            if(!leidos.includes(post.id)&&false){ //&&false fuerza no entre
                leidos.push(post.id);
                localStorage.setItem("leidos", JSON.stringify(leidos));
            }

            mostrarDetalle(post);
        };

        contenedor.appendChild(div);
    });
}

// TOGGLE LEÍDO
function toggleLeido(id){

    if(leidos.includes(id)){
        leidos = leidos.filter(i => i !== id);
    } else {
        leidos.push(id);
    }

    localStorage.setItem("leidos", JSON.stringify(leidos));

    // 👇 PRIMERO actualizar pantalla
    renderizar(datosGlobal);

    // 👇 DESPUÉS cerrar
    cerrarDetalle();
}

function toggleLike(id){

    if(likes.includes(id)){
        likes = likes.filter(i => i !== id);
    } else {
        likes.push(id);
    }

    localStorage.setItem("likes", JSON.stringify(likes));

    renderizar(datosGlobal);

    let post = datosGlobal.find(p => p.id === id);

    mostrarDetalle(post);
}

// CAMBIAR FILTRO
function cambiarFiltro(tipo){
    filtro = tipo;
    renderizar(datosGlobal);
}

function buscarTexto(){
    let input = document.getElementById("buscador");
    textoBusqueda = input.value.toLowerCase();
    renderizar(datosGlobal);
}

function resaltarTexto(texto, busqueda){
    if(!busqueda) return texto;

    let regex = new RegExp(`(${busqueda})`, "gi");
    return texto.replace(regex, '<span style="background:#fff3a0;">$1</span>');
}

function cambiarOrden(valor){
    ordenFecha = valor;
    renderizar(datosGlobal);
}

function filtrarPorFecha(){

    fechaDesde = document.getElementById("fechaDesde").value;
    fechaHasta = document.getElementById("fechaHasta").value;

    renderizar(datosGlobal);
}

function parseFecha(fechaStr){

    if(!fechaStr) return new Date(0);

    if(fechaStr.includes("/")){
        let partes = fechaStr.split("/");
        return new Date(partes[2], partes[1]-1, partes[0]);
    }

    return new Date(fechaStr);
}

function marcarActivo(grupoSelector, valor){

    document.querySelectorAll(grupoSelector + " button")
        .forEach(btn => btn.classList.remove("activo"));

    document.querySelector(grupoSelector + ` button[onclick*="${valor}"]`)
        ?.classList.add("activo");
}

function cambiarVista(modo){
    modoVista = modo;
    localStorage.setItem("modoVista", modo);
    marcarActivo(".grupo:nth-child(1)", modo);
    renderizar(datosGlobal);
}

window.addEventListener("scroll", function(){

    let barra = document.getElementById("barraControles");

    if(window.scrollY > 50){
        barra.classList.add("compacta");
    } else {
        barra.classList.remove("compacta");
    }

});

// mostrar / ocultar botón
window.addEventListener("scroll", function(){

    let boton = document.getElementById("btnArriba");

    if(window.scrollY > 200){
        boton.classList.add("mostrar");
    } else {
        boton.classList.remove("mostrar");
    }

});
// acción de subir
function volverArriba(){
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function cambiarTab(tab){

    document.querySelectorAll(".tab").forEach(div => {
        div.style.display = "none";
    });

    document.getElementById(tab).style.display = "block";

    // 🎵 música según sección
    if(tab === "inicio"){

        if(musicaActiva === "true"){
            musica.play().catch(() => {});
        }

    } else {

        musica.pause();

    }
}

function mostrarListaFB(){

    fetch("profile_posts_1.json")
    .then(res => res.json())
    .then(data => {

        let contenedor = document.getElementById("contenedorFB");
        contenedor.innerHTML = "";

        listaFB = []; // 👈 IMPORTANTE

        data.forEach(post => {

            let texto = post.data?.[0]?.post || "";
            let fecha = new Date(post.timestamp * 1000).toISOString().split("T")[0];

            let rutaOriginal = post.attachments?.[0]?.data?.[0]?.media?.uri;

            if(!rutaOriginal) return;

            let nombreArchivo = rutaOriginal.split("/").pop();
            let imagen = "fb_media/" + nombreArchivo;

            // 👉 GUARDAMOS PARA USO AUTOMÁTICO
            listaFB.push({
                texto: texto,
                fecha: fecha,
                uri: rutaOriginal
            });

            let div = document.createElement("div");

            div.innerHTML = `
                <p><strong>${fecha}</strong></p>
                <p>${texto.substring(0,100)}</p>
                <img src="${imagen}" width="150"><br>

                <button onclick="asignarImagen('${fecha}', \`${texto}\`, '${imagen}', this)">
                    📌 Llevar a tarjeta
                </button>

                <hr>
            `;

            contenedor.appendChild(div);
        });

        alert("✅ Lista FB cargada: " + listaFB.length + " elementos");
    });
}

function asignarImagen(fechaFB, textoFB, imagen, boton){

    let encontrado = false;
console.log("Buscando match para:", fechaFB, textoFB);

    datosGlobal.forEach(post => {
console.log("Comparando con:", post.fecha, post.titulo);
        if(post.fecha === fechaFB && coincideTexto(post.titulo, textoFB)){
            post.imagen = imagen;
            encontrado = true;
        }

    });

    if(encontrado){
        boton.innerText = "✔ Asignado";
        boton.style.background = "#4CAF50";
        boton.style.color = "white";

        renderizar(datosGlobal);
    } else {
        boton.innerText = "❌ No encontró match";
        boton.style.background = "red";
        boton.style.color = "white";
    }
}

function coincideTexto(textoA, textoB){
    let a = textoA.toLowerCase();
    let b = textoB.toLowerCase();

    return a.split(" ").some(p => p.length > 4 && b.includes(p));
}

function limpiar(texto){
    if(!texto) return "";

    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // sin acentos
        .replace(/[^\w\s]/g, "") // sin símbolos raros
        .trim();
}

function buscarFotoAutomatica(post){

    let mejor = null;
    let mejorScore = 0;

    let textoPost = limpiar(post.texto);
    let palabrasPost = textoPost.split(" ").filter(p => p.length > 2);

    listaFB.forEach(item => {

        // 🟢 tolerancia de fecha (±1 día)
        let fechaPost = new Date(post.fecha);
        let fechaFB = new Date(item.fecha);

        let diferenciaDias = Math.abs((fechaPost - fechaFB) / (1000*60*60*24));
        if(diferenciaDias > 1) return;

        let textoFB = limpiar(item.texto);

        let score = 0;

        palabrasPost.forEach(p => {
            if(textoFB.includes(p)){
                score++;
            }
        });

        if(score > mejorScore){
            mejorScore = score;
            mejor = item;
        }
    });

    // 👇 ACA VA LO QUE PREGUNTASTE
    if(mejorScore < 1){
        return null;
    }

    return mejor;
}

function traerFotoAutomatica(id){

    if(listaFB.length === 0){
        alert("⚠ Primero cargá la lista en Explorador FB");
        return;
    }

    let post = datosGlobal.find(p => p.id === id);

    let resultado = buscarFotoAutomatica(post);

    if(!resultado){
        alert("❌ No se encontró coincidencia");
        return;
    }

    let nombreArchivo = resultado.uri.split("/").pop();
    let ruta = "fb_media/" + nombreArchivo;

    post.imagen = ruta;

    cambiosPendientes = true;
    actualizarIndicador();

    renderizar(datosGlobal);

    // 👇 CIERRE AUTOMÁTICO SIN TOCAR LEÍDO
    document.getElementById("detalle").style.display = "none";
    document.getElementById("barraControles").style.display = "flex";
}
function exportarJSON(){

    let datosLimpios = datosGlobal.map(post => {
        return {
            titulo: post.titulo,
            texto: post.texto,
            fecha: post.fecha,
            imagen: post.imagen || ""
        };
    });

    let contenido = JSON.stringify(datosLimpios, null, 2);

    let blob = new Blob([contenido], { type: "application/json" });

    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "datos_actualizado.json";
    a.click();

    URL.revokeObjectURL(url);

    cambiosPendientes = false;
    actualizarIndicador();
}

function actualizarIndicador(){

    let btn = document.querySelector(".guardar");

    if(!btn) return;

    if(cambiosPendientes){
        btn.style.background = "#c0392b"; // rojo
        btn.innerHTML = "💾*<br><small>Guardar</small>";
    } else {
        btn.style.background = "#5a4a3f";
        btn.innerHTML = "💾<br><small>Guardar</small>";
    }
}



function cargarFBInterno(){

    return fetch("profile_posts_1.json")
    .then(res => res.json())
    .then(data => {

        listaFB = data.map(post => {

            let texto = post.data?.[0]?.post || "";
            let fecha = new Date(post.timestamp * 1000)
                .toISOString()
                .split("T")[0];

            let rutaOriginal = post.attachments?.[0]?.data?.[0]?.media?.uri;

            if(!rutaOriginal) return null;

            let nombreArchivo = rutaOriginal.split("/").pop();

            return {
                texto: texto,
                fecha: fecha,
                imagen: "fb_media/" + nombreArchivo
            };

        }).filter(x => x !== null);

        console.log("FB cargado:", listaFB.length);
    });
}

async function autoFull(){

    // 1. Cargar FB automáticamente
    await cargarFBInterno();

    let asignadas = 0;
    let sinFoto = 0;

    datosGlobal.forEach(post => {

        if(post.imagen){
            return;
        }

        let mejor = null;
        let mejorScore = 0;

        let textoPost = limpiar(post.texto);

        listaFB.forEach(item => {

            let fechaPost = new Date(post.fecha);
            let fechaFB = new Date(item.fecha);

            let diferenciaDias = Math.abs((fechaPost - fechaFB) / (1000*60*60*24));
            if(diferenciaDias > 1) return;

            let textoFB = limpiar(item.texto);

            let score = 0;

            textoPost.split(" ").forEach(p => {
                if(p.length > 3 && textoFB.includes(p)){
                    score++;
                }
            });

            if(score > mejorScore){
                mejorScore = score;
                mejor = item;
            }
        });

        if(mejorScore >= 1){
            post.imagen = mejor.imagen;
            asignadas++;
        } else {
            sinFoto++;
        }

    });

    cambiosPendientes = true;
    actualizarIndicador();
    renderizar(datosGlobal);

    alert(
        "✅ Asignadas: " + asignadas + "\n" +
        "⚠️ Sin foto: " + sinFoto
    );
}

let audio = document.getElementById("musicaFondo");
let btnAudio = document.getElementById("btnAudio");
let audioActivo = false;


function toggleAudio(){

    if(audio.paused){
        audio.play();
        btnAudio.innerText = "🔊";
    } else {
        audio.pause();
        btnAudio.innerText = "🔇";
    }
}

let musicaActiva = localStorage.getItem("musicaActiva");

if(musicaActiva === null){
    musicaActiva = "false";
}

let musica = document.getElementById("musicaFondo");
let btnMusica = document.getElementById("btnMusica");

// iniciar
actualizarEstadoMusica();

function toggleMusica(){

    musicaActiva = (musicaActiva === "true") ? "false" : "true";

    localStorage.setItem("musicaActiva", musicaActiva);

    actualizarEstadoMusica();
}

function actualizarEstadoMusica(){

    if(musicaActiva === "true"){

        btnMusica.innerHTML = "🔊";

        if(document.getElementById("inicio").style.display !== "none"){
            musica.play().catch(() => {});
        }

    } else {

        btnMusica.innerHTML = "🔇";

        musica.pause();
    }
}
