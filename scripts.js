
let circulo = document.querySelector(".circulo");

function mudar(cor, imagem) {

    circulo.style.backgroundColor = cor;

    document.getElementsByClassName("imagem-copo")[0].src = "img/" + imagem;

}