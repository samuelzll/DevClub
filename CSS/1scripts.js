    const imagens = ["imgs/1img.jpg", "imgs/2img.jpg", "imgs/3img.jpg", "imgs/4img.jpg"];
    let indice = 0;
    const img = document.getElementById("imagem");

    function trocarImagem() {
      indice++;
      if (indice >= imagens.length) {
        indice = 0; // volta para a primeira imagem
      }

      // Efeito de transição suave
      img.style.opacity = 0;
      setTimeout(() => {
        img.src = imagens[indice];
        img.style.opacity = 1;
      }, 500);
    }

    // Troca a imagem a cada 3 segundos
    setInterval(trocarImagem, 3000);
