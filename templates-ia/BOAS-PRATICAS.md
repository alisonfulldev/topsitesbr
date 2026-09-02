# Boas Práticas — Templates Preenchíveis por IA

> **Prioridade absoluta: mobile.** Desktop é segunda tela, não primeira.  
> Todo elemento deve funcionar perfeitamente em 375px antes de qualquer ajuste para telas maiores.

---

## 1. Filosofia Mobile-First

- Escreva o CSS base para mobile (375–480px). Use `@media (min-width: N)` para crescer, **nunca** `max-width` para quebrar.
- Breakpoints em uso neste projeto:

| Breakpoint | Uso |
|---|---|
| `base` | Mobile padrão (375–479px) |
| `480px` | Ajuste fino para telas muito pequenas |
| `768px` | Tablet / landscape mobile — ativa layouts de 2 colunas |
| `1024px` | Desktop — ativa layouts de 3 colunas e fontes maiores |

- Nunca crie um quarto breakpoint sem necessidade real.

---

## 2. Placeholders `{{CAMPO}}` — Regras Críticas

Os campos `{{CAMPO}}` são strings longas sem espaços (ex: `{{EMPRESA_NOME}}`).  
Eles **quebram qualquer layout** que não esteja preparado.

### Sempre aplicar em headings E leads:
```css
.hero-h1, .sec-h2, .sec-lead {
  overflow-wrap: anywhere;
}
```

### Sempre aplicar em células de grid (stats, tabelas):
```css
.celula-grid {
  min-width: 0;        /* impede o grid de explodir */
  overflow: hidden;
}
.valor-stat {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; /* ou word-break: break-all */
}
```

### Avatares / iniciais (ex: depoimentos):
```css
.avatar {
  overflow: hidden;   /* {{DEPOIMENTO_1_AUTOR_INICIAL}} é uma string longa */
  flex-shrink: 0;
}
```

---

## 3. Seções de Stats / Métricas

### Resultado esperado no mobile:
```
{{ANOS_EXPERIENCIA}}+      ← valor grande, laranja
Anos de Experiência         ← label pequeno ABAIXO do valor
────────────────────────
{{CLIENTES_ATENDIDOS}}+
Clientes Atendidos
────────────────────────
{{TAXA_SATISFACAO}}%
Satisfação
```

### Padrão CSS definitivo (copiar e colar):

```css
/* ── Stats bar ── */
.stats-inner {
  display: flex;
  flex-direction: column;          /* mobile: itens empilhados */
}
.stat-item {
  padding: 18px 24px;
  display: flex;
  flex-direction: column;          /* VALOR em cima, LABEL embaixo */
  gap: 4px;
  border-bottom: 1px solid rgba(255,255,255,.07); /* ou var(--border) */
}
.stat-item:last-child { border-bottom: none; }
.stat-val {
  font-size: 1.75rem; font-weight: 800;
  color: var(--accent); line-height: 1;
  overflow-wrap: anywhere;         /* evita overflow com placeholder longo */
}
.stat-label {
  font-size: .78rem;
  text-transform: uppercase; letter-spacing: .05em; line-height: 1.3;
}

/* Desktop: linha com 3 colunas */
@media (min-width: 768px) {
  .stats-inner { flex-direction: row; }
  .stat-item {
    flex: 1;
    flex-direction: column;        /* valor cima, label baixo — igual mobile */
    align-items: center;
    text-align: center;
    gap: 6px;
    padding: 24px 16px;
    border-bottom: none;
    border-right: 1px solid rgba(255,255,255,.07);
  }
  .stat-item:last-child { border-right: none; }
  .stat-val { font-size: 1.875rem; }
}
```

### ❌ O que NUNCA fazer:

| Erro | Por quê quebra |
|---|---|
| `grid-template-columns: repeat(3, 1fr)` no mobile | Placeholder longo explode a célula, último item fica cortado |
| `flex-direction: row` dentro do `.stat-item` no mobile | `{{ANOS_EXPERIENCIA}}+` ocupa toda a largura, label fica espremido ou invisível |
| Sem `overflow-wrap: anywhere` no `.stat-val` | String sem espaço transborda o container na horizontal |
| Sem `min-width: 0` em células de grid | Grid CSS não restringe filhos — item extrapola o grid |

---

## 4. Hero Section

### Mobile (base):
- Coluna única, texto em cima
- Foto: `display: none` (economiza espaço e carregamento)
- Altura: `min-height: 100svh` (use `svh`, não `vh`)
- Padding-top = altura do header fixo (ex: `68px`)
- CTAs: `flex-direction: column`, botões `width: 100%`
- Elementos decorativos flutuantes: `display: none`

### Desktop (768px+):
- Grid `1fr 1fr`: texto esquerda, foto direita
- Foto: `display: block; align-self: stretch`
- Para a foto preencher a altura do grid: `width: 100%; height: 100%; object-fit: cover`
- Elementos decorativos (badge flutuante, etc.): `display: block`

### Template do hero:
```css
/* Mobile */
.hero { display: flex; flex-direction: column; min-height: 100svh; padding-top: 68px; }
.hero-body { flex: 1; display: flex; align-items: stretch; }
.hero-grid { flex: 1; min-width: 0; display: grid; grid-template-columns: 1fr; }
.hero-visual { display: none; }
.hero-float-badge { display: none; }
.hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }

/* 480px */
@media (max-width: 480px) {
  .hero-ctas { flex-direction: column; }
  .hero-ctas .btn { width: 100%; justify-content: center; }
}

/* 768px+ */
@media (min-width: 768px) {
  .hero-grid { grid-template-columns: 1fr 1fr; align-items: stretch; }
  .hero-visual { display: block; align-self: stretch; }
  .hero-float-badge { display: block; }
}
```

---

## 5. Tamanhos de Fonte — Escala Obrigatória

| Elemento | Mobile (base) | 768px | 1024px |
|---|---|---|---|
| `h1` do hero | `2rem–2.25rem` | `2.75rem` | `3.25rem` |
| `h2` de seção | `1.75rem–2rem` | `2rem` | `2.25rem` |
| `body` / parágrafos | `0.9375rem` | `0.9375rem` | `1rem` |
| Labels de seção | `0.8rem` | `0.8rem` | `0.8rem` |
| Stat valor | `1.625rem` | `1.875rem` | `2rem` |

---

## 6. Padding de Seção — Padrão

```css
.section { padding: 64px 0; }           /* base mobile */

@media (max-width: 480px) {
  .section { padding: 52px 0; }         /* telefones pequenos */
}
@media (min-width: 768px) {
  .section { padding: 88px 0; }         /* tablet */
}
@media (min-width: 1024px) {
  .section { padding: 110px 0; }        /* desktop */
}
```

---

## 7. Elementos Decorativos Absolutos

Quadrados decorativos, sombras e ornamentos posicionados com `position: absolute` **sempre** causam overflow e scroll horizontal no mobile.

**Regra:**
```css
/* Mobile: escondido */
.deco-elemento { display: none; }

/* Desktop: aparece só quando há espaço */
@media (min-width: 768px) {
  .deco-elemento { display: block; }
  /* E SEMPRE adicionar padding ao pai para acomodar o sangramento: */
  .pai-do-deco { padding-bottom: 20px; padding-right: 20px; }
}
```

---

## 8. Header / Navegação

- Header sempre `position: fixed; z-index: 100`
- Mobile: mostrar apenas logo + hamburger
- Hamburger deve ter animação X ao abrir (via `nth-child` transforms)
- Overlay de nav fecha ao clicar em qualquer link
- Bloquear scroll do body quando overlay aberto: `document.body.style.overflow = 'hidden'`

```css
.nav { display: none; }
.header-cta { display: none; }
.hamburger { display: flex; }

@media (min-width: 768px) {
  .nav { display: flex; }
  .header-cta { display: flex; }
  .hamburger { display: none; }
}
```

---

## 9. Grids de Cards (Serviços, Diferenciais)

```css
/* Mobile: 1 coluna */
.cards-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

/* Tablet: 2 colunas */
@media (min-width: 768px) {
  .cards-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: 3 colunas */
@media (min-width: 1024px) {
  .cards-grid { grid-template-columns: repeat(3, 1fr); }
}
```

Se o card tem layout interno (número + corpo), no desktop com 3 colunas:
```css
@media (min-width: 1024px) {
  .card-interno { grid-template-columns: 1fr; }  /* empilha num + corpo */
}
```

---

## 10. Processo / Steps

- Mobile: `flex-direction: column` com linha vertical conectando os círculos
- Desktop: `flex-direction: row` com linha horizontal

```css
/* Mobile */
.steps { display: flex; flex-direction: column; }
.step { display: flex; gap: 20px; padding-bottom: 36px; }
.step:last-child { padding-bottom: 0; }
.step-left { display: flex; flex-direction: column; align-items: center; }
.step-line { width: 2px; flex: 1; background: var(--border); margin-top: 6px; }
.step:last-child .step-line { display: none; }

/* Desktop */
@media (min-width: 768px) {
  .steps { flex-direction: row; }
  .step { flex-direction: column; flex: 1; padding-bottom: 0; padding-right: 20px; }
  .step:last-child { padding-right: 0; }
  .step-left { flex-direction: row; align-items: center; margin-bottom: 16px; }
  .step-line { width: auto; height: 2px; flex: 1; margin-top: 0; margin-left: 6px; }
}
```

---

## 11. Formulário de Contato

- Mobile: campos `100%` de largura, coluna única
- Desktop: `grid-template-columns: 1fr 1fr` para Nome + Telefone lado a lado
- Botão submit: `align-self: flex-start` no desktop, `width: 100%` no mobile

---

## 12. Footer

- Mobile: `grid-template-columns: 1fr` — tudo empilhado
- Desktop: `grid-template-columns: 2fr 1fr 1fr` — brand + 2 colunas de links

---

## 13. Imagens

- Sempre `object-fit: cover` em fotos de hero/sobre com altura fixa
- Altura da foto no mobile: `260px–340px` (nunca `auto` em contêiner sem altura definida)
- Altura no desktop: `400px–500px` ou `height: 100%` quando em grid que já define a altura
- Fotos de Unsplash: usar parâmetro `?w=900&q=80` para hero, `?w=700&q=80` para sobre

---

## 14. Logo com Fallback CSS

```html
<a class="logo-wrap" id="logoWrap">
  <img src="{{LOGO_URL}}" alt="{{LOGO_ALT}}" id="logoImg" />
  <span class="logo-text">{{EMPRESA_NOME}}<span class="accent">.</span></span>
</a>
```
```css
.logo-wrap.has-logo .logo-text { display: none; }
.logo-wrap:not(.has-logo) img { display: none; }
```
```js
const img = document.getElementById('logoImg');
if (img.src && !img.src.includes('{{')) {
  document.getElementById('logoWrap').classList.add('has-logo');
}
img.addEventListener('error', () =>
  document.getElementById('logoWrap').classList.remove('has-logo')
);
```

---

## 15. Performance e JS

- Usar `IntersectionObserver` para scroll-reveal (nunca `scroll` event bruto)
- `{ passive: true }` em todo listener de scroll
- `lucide.createIcons()` chamado **depois** de todo o HTML estar no DOM
- Fontes Google: sempre `rel="preconnect"` antes do link da fonte

---

## 16. Erros Mais Comuns — Tabela de Referência Rápida

| Problema visual | Causa raiz | Fix definitivo |
|---|---|---|
| Último stat cortado (`{{TAXA_SATISFAC`) | `grid-template-columns: repeat(3,1fr)` no mobile sem `min-width:0` | Usar `flex-direction: column` no stats-inner; cada item em coluna. Ver seção 3. |
| Label do stat espremido/invisível | `.stat-item` com `flex-direction: row` — placeholder longo ocupa tudo | `.stat-item { flex-direction: column }` — valor em cima, label embaixo |
| H1 / h2 transborda horizontalmente | Placeholder sem espaço não quebra linha | `overflow-wrap: anywhere` em **todos** os headings e `.sec-lead` |
| Stat val transborda mesmo em coluna | Sem `overflow-wrap` no valor | `overflow-wrap: anywhere` no `.stat-val` |
| Scroll horizontal no mobile | Deco absoluto (`bottom:-16px; right:-16px`) sem confinamento | `display: none` no mobile; mostrar só em 768px+ com `padding` no pai |
| Foto do hero não preenche altura | `height: auto` em coluna de grid | `height: 100%; object-fit: cover; align-self: stretch` |
| Hero visual some no mobile | `display: none` no base — comportamento correto | Confirmado: deve ser `none` no mobile; `block` só a partir de 768px |
| Avatar gigante com placeholder | `.avatar` sem `overflow: hidden` | Sempre `overflow: hidden` em avatares e iniciais |
| Hamburger sem animação X | Falta CSS de transform no estado `.open` | `span:nth-child(1/2/3)` com `rotate` + `scaleX(0)` no `.open` |
| Nav overlay não fecha ou não cobre | `position: absolute` em vez de `fixed`, ou `inset` incorreto | `position: fixed; inset: 68px 0 0 0` (68px = altura do header) |
| Botão ghost não fica 100% no mobile | `display: inline-flex` não estica em flex column pai | Forçar `display: flex; width: 100%; justify-content: center` no breakpoint |
| Botões CTA não empilham no mobile | `flex-wrap: wrap` mas sem `flex-direction: column` em 480px | Adicionar `flex-direction: column` no `@media (max-width: 480px)` |
| Elemento deco sangra à direita no desktop | Pai sem `padding-right` para acomodar o `right: -18px` do deco | `padding-bottom: 20px; padding-right: 20px` no pai a partir de 768px |
| Hero grid não estica verticalmente | `hero-grid` sem `flex: 1` dentro do `hero-body` flex | `.hero-grid { flex: 1; min-width: 0; }` |
| `.sec-lead` transborda em seção escura | Sem `overflow-wrap` no lead | `overflow-wrap: anywhere` em `.sec-lead` e variantes `-white` |

---

*Atualizar este arquivo sempre que um novo padrão de bug for descoberto durante a criação dos templates.*
