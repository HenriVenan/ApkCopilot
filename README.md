# APK CargioTran — Torre de Controle (React + Vite)

Migração completa dos 3 apps HTML/JS vanilla (`cardBody`, `report`, `turnPass`) para uma
única SPA em React, com rotas, design padronizado e uma tela de autenticação.

## Rodando o projeto

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (por padrão `http://localhost:5173`).

Build de produção: `npm run build` (gera a pasta `dist/`).

## O que foi feito

- **Vite + React 18 + React Router 6**, com rotas para cada um dos 3 arquivos originais:
  - `/cards` → Gerador de Card (`cardBody.html`/`.js`)
  - `/report` → Relatório diário (`report.html`/`.css`)
  - `/turn-pass` → Passagem de turno (`turnPass.html`/`.js`)
  - `/login` → tela de autenticação (nova)
- **Toda manipulação direta do DOM** (`document.getElementById`, `.innerHTML`, `onclick`
  inline) foi substituída por **estado React** (`useState`/`useMemo`) e handlers de evento.
  O `setInterval` do relógio virou o hook `useClock`.
- **Design padronizado**: um único sistema de tokens (`src/styles/tokens.css`) e
  componentes reutilizáveis (`Button`, `Input`, `TextArea`, `Select`, `Field`) usados em
  todas as 3 telas, com o mesmo visual de "torre de controle" (tema escuro, acento laranja
  herdado do badge Shopee original, tipografia mono para os dados/cards de WhatsApp).
- **Autenticação**: tela `/login` dedicada, com `AuthContext` + `ProtectedRoute` que
  protege as 3 rotas internas. Hoje a validação é local (mock, salva em `localStorage`);
  troque a função `validateCredentials` em `src/context/AuthContext.jsx` por uma chamada
  real à sua API quando tiver um backend de autenticação.

## Observação importante

O arquivo `report/report.js` **não estava presente** no `.zip` enviado (só vieram
`report.html` e `report.css`). A lógica da tela de Relatório em `src/pages/Report.jsx` foi
reconstruída a partir dos campos do formulário e das classes do CSS original
(`formulario-card`, `status-atraso`, `linha-info`, `impacto-box`, etc.) — ela cobre
adicionar, listar e remover ocorrências, mas não é uma migração 1:1 porque o
comportamento original não estava disponível. Se você tiver o `report.js` original, me
envie que eu ajusto o comportamento para bater exatamente com o que já existia.

## Estrutura

```
src/
  components/
    ui/          Button, Input, TextArea, Select, Field (design system)
    Layout.jsx   Header + navegação entre canais + Outlet
    ProtectedRoute.jsx
  context/
    AuthContext.jsx
  pages/
    Login.jsx
    CardGenerator.jsx
    Report.jsx
    TurnPass.jsx
  utils/
    parseViagens.js      parser da planilha do Gerador de Card
    parseTurnPass.js      parser da planilha da Passagem de Turno
    statusColeta.js        cálculo de atraso/contagem regressiva da coleta
    useClock.js             hook do relógio ao vivo
  styles/
    tokens.css, global.css, components.css, layout.css
```
