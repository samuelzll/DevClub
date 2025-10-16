# Copilot Instructions for StarBackS DevClub

## Visão Geral
Este projeto é um site estático simples, focado em apresentar a marca fictícia StarBackS DevClub. Ele utiliza apenas HTML e CSS, sem JavaScript ou frameworks. O objetivo é criar uma experiência visual atraente para visitantes interessados em café e tecnologia.

## Estrutura do Projeto
- `index.html`: Página principal, contém toda a estrutura do site.
- `styles.css`: Folha de estilos global, define o layout, cores e tipografia.
- `img/`: Pasta de imagens usadas no site (logo, fundos, thumbnails, copos).

## Padrões e Convenções
- **Fontes**: Utiliza Google Fonts (Poppins) via `<link>` no `<head>`.
- **Imagens**: Todas as imagens são referenciadas via caminhos relativos na pasta `img/`.
- **Classes CSS**: Seguem nomes descritivos em português, como `.caixa-conteudo`, `.logo`, `.botao-menu`.
- **Semântica**: Estrutura HTML prioriza clareza e acessibilidade, com uso de `<h2>`, `<p>`, `<button>`, etc.
- **Idioma**: O site está configurado para `pt-br`.

## Fluxo de Desenvolvimento
- **Não há build, testes ou scripts automatizados**. Todo o desenvolvimento é feito editando diretamente os arquivos HTML e CSS.
- **Debug**: Basta abrir `index.html` em um navegador. Não há dependências externas além das fontes do Google.
- **Atualização de conteúdo**: Para modificar textos, imagens ou estilos, edite diretamente os arquivos correspondentes.

## Exemplos de Padrões
- Para adicionar uma nova imagem, coloque o arquivo em `img/` e referencie com `<img src="img/nome.png">`.
- Para criar um novo bloco de conteúdo, siga a estrutura de `<div class="caixa-textos">...</div>`.
- Para alterar estilos, edite `styles.css` e utilize classes já existentes ou crie novas seguindo o padrão de nomes em português.

## Integrações e Dependências
- **Google Fonts**: Carregadas via `<link>` no `<head>`.
- **Nenhum framework ou biblioteca JS**.

## Recomendações para Agentes AI
- Priorize clareza visual e semântica ao sugerir mudanças.
- Mantenha o padrão de nomes de classes em português.
- Não adicione JavaScript ou frameworks sem solicitação explícita.
- Documente qualquer novo padrão ou convenção diretamente neste arquivo.

## Referências
- Exemplos de estrutura e padrões podem ser encontrados em `index.html` e `styles.css`.
- Imagens disponíveis em `img/`.

---

Se alguma seção estiver incompleta ou pouco clara, peça feedback ao usuário para aprimorar as instruções.