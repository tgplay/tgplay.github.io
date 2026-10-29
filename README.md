# devspace

Site institucional e portfólio da devspace: sites, apps e sistemas sob medida.

**Site:** https://tgplay.github.io/

Convertido do tema WordPress `astra-child` do projeto `devspace/painel-clientes` para HTML estático,
publicado no GitHub Pages.

## Páginas

| página | arquivo | conteúdo |
|---|---|---|
| Início | `index.html` | apresentação, serviços, diferenciais e 3 projetos em destaque |
| Serviços | `servicos/index.html` | sites, apps e sistemas, e como trabalhamos |
| Portfólio | `portfolio/index.html` | projetos com filtro por tipo e link para cada um |
| Contato | `contato/index.html` | WhatsApp e formulário |

O cabeçalho e o rodapé se repetem em cada página: uma mudança neles precisa ser feita nos quatro arquivos.

## Arquivos comuns

| arquivo | o que faz |
|---|---|
| `assets/css/site.css` | estilos comuns: base, cabeçalho, modo escuro (copiado do `header.css` do tema), rodapé, formulário e banner de cookies |
| `assets/js/site.js` | menu do celular, modo escuro, banner de cookies, filtro do portfólio e formulário de contato |

## Formulário de contato

O site não tem servidor. O formulário monta a mensagem (motivo, nome, e-mail opcional e texto) e abre o
WhatsApp com ela pronta; a pessoa só toca em enviar. O número fica na constante `WHATSAPP` do
`assets/js/site.js` e também aparece no cartão da página de contato e nos dados estruturados
(`application/ld+json`) do `<head>` de cada página.

Os botões «Solicitar orçamento» levam a `/contato/?tipo=vendas` e «Suporte técnico» a
`/contato/?tipo=suporte`, que já escolhem o motivo no formulário.

## Portfólio

Cada projeto é um cartão em `portfolio/index.html` com `data-cat="site"`, `"app"` ou `"sistema"`, que o
filtro usa. Os 3 destaques da página inicial ficam em `index.html` (seção «Projetos em Destaque»).

## Diferenças em relação ao WordPress

- Sem o botão «Login» (o painel do cliente não está publicado).
- O formulário abre o WhatsApp em vez de criar chamado no painel.
- Política de Privacidade e Termos de Uso ficaram de fora: no WordPress ainda eram rascunhos com campos
  a preencher (razão social, CNPJ, cidade).
- Os projetos de exemplo do portfólio foram trocados pelos projetos reais.

## Publicar

```bash
git add -A
git commit -m "<o que mudou>"
git push
```

O GitHub Pages republica em 1 ou 2 minutos.
