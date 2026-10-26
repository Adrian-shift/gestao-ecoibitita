# EcoIbititá — Frontend de Gestão

Frontend separado em React + Vite.

## Estrutura

src/
- assets/
- components/
  - PasswordInput.jsx
- context/
- pages/
  - Login.jsx
  - Cadastro.jsx
- services/
  - api.js
- App.css
- App.jsx
- main.jsx

## Executar

```bash
npm install
npm run dev
```

O Vite está configurado para a porta 5174.

## API

O arquivo `src/services/api.js` já está preparado para centralizar a comunicação com o Spring Boot. Login e cadastro ainda não fazem autenticação real.

## Assets

Os arquivos originais exportados do Figma estão em `public/assets/`:
- ecoibitita-background.png
- ecoibitita-logo.png

## Responsividade

Além da responsividade por largura, foi adicionada uma regra para monitores largos com pouca altura, evitando o corte vertical observado em zoom normal.
