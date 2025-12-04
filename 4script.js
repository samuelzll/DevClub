function abrirModal(src) {
    document.getElementById("imagemAmpliada").src = src;
    document.getElementById("modalImagem").style.display = "flex";
}
function fecharModal() {
    document.getElementById("modalImagem").style.display = "none";
}



function toggleInfo(id) {
    const boxes = document.querySelectorAll('.info-box'); // pega todos
    const box = document.getElementById(id);

    // esconde todos
    boxes.forEach(b => {
        if (b.id !== id) b.style.display = "none";
    });

    // só mostra o clicado SE estiver escondido
    if (box.style.display === "none" || box.style.display === "") {
        box.style.display = "block";
    } else {
        box.style.display = "none";
    }
}