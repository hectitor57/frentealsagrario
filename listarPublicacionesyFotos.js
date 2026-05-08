function mostrarDetalle(post){

fetch("profile_posts_1.json")
.then(res => res.json())
.then(data => {

    let contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = "";

    data.forEach(post => {

        let texto = post.data?.[0]?.post || "(sin texto)";
        let fecha = post.timestamp 
            ? new Date(post.timestamp * 1000).toISOString().split("T")[0]
            : "";

        let imagen = post.attachments?.[0]?.data?.[0]?.media?.uri || "";

        let div = document.createElement("div");

        div.style.borderBottom = "1px solid #ccc";
        div.style.padding = "10px";

        div.innerHTML = `
            <strong>${fecha}</strong><br>
            ${texto}<br>
            <small>${imagen}</small>
        `;

        contenedor.appendChild(div);
    });
});
}