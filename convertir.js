const fs = require("fs");

// 1️⃣ Leer archivo original
const data = JSON.parse(fs.readFileSync("profile_posts_1.json", "utf-8"));

let resultado = [];

// 2️⃣ Recorrer datos
data.forEach(item => {

    if (item.data && item.data[0] && item.data[0].post) {

        // texto base
        let texto = item.data[0].post;

        // corregir encoding
        texto = Buffer.from(texto, 'latin1').toString('utf8');

        // limpiar formato
        texto = texto.replace(/\n+/g, "\n\n").trim();

        // generar título
        let titulo = texto;

        // eliminar fecha al inicio
        titulo = titulo.replace(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\s*[-–]?\s*/, "");

        // recortar título
        titulo = titulo.substring(0, 40) + "...";

        // fecha
        let fecha = new Date(item.timestamp * 1000);
        let fechaFormateada = fecha.toISOString().split("T")[0];

        resultado.push({
            titulo: titulo,
            texto: texto,
            fecha: fechaFormateada,
            imagen: ""
        });
    }

});

// 3️⃣ Guardar archivo limpio
fs.writeFileSync("datos.json", JSON.stringify(resultado, null, 2));

console.log("✅ datos.json generado con", resultado.length, "publicaciones");