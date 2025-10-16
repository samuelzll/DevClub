// Lista de imagens
const imagens = [
  'imgs/1img.jpg',
  'imgs/2img.jpg',
  'imgs/3img.jpg',
  'imgs/4img.jpg',
  'imgs/5img.jpg'
];

let indice = 0;
const fundo = document.getElementById('imgs/4img.jpg');
const botao = document.getElementById('imgs/5img.jpg');

// Define a primeira imagem
fundo.style.backgroundImage("caixa-menu") = `url(${imagens[indice]})`;

// Ao clicar no botão, troca para a próxima imagem
botao.addEventListener('click', () => {
  indice = (indice + 1) % imagens.length; // volta ao início quando chegar na última
  fundo.style.backgroundImage = 'imgs/4img.jpg)';
});