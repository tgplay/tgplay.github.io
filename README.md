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

Campos: motivo, nome, WhatsApp do visitante (obrigatórios), e-mail (opcional) e mensagem. Ele funciona de
dois jeitos, conforme a constante `WORKER_URL` do `assets/js/site.js`:

| `WORKER_URL` | o que acontece ao enviar |
|---|---|
| vazio | abre o WhatsApp **do visitante** com a mensagem pronta para o seu número; ele toca em enviar |
| endereço do Worker | a mensagem chega **direto no seu WhatsApp**, sem o visitante sair do site. Se o envio falhar, aparece o botão «Enviar pelo meu WhatsApp» como reserva |

O número que recebe fica na constante `WHATSAPP` do `assets/js/site.js`, no cartão da página de contato e
nos dados estruturados (`application/ld+json`) do `<head>` de cada página.

### Envio direto (Cloudflare Worker + CallMeBot)

O site é público, então a chave do serviço de WhatsApp não pode ficar nele. O Worker
(`worker/contato.js`) guarda a chave em segredo e:
- só aceita pedidos vindos de `https://tgplay.github.io`;
- descarta robôs (campo-isca) e limita a 5 envios por hora por IP;
- recusa campos vazios, WhatsApp sem DDD, e-mail inválido e textos longos demais;
- manda a mensagem para o seu WhatsApp pelo [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/).

**Para ativar:**

1. **Chave do CallMeBot:** salve o contato `+34 623 78 95 95` no celular e mande para ele, pelo WhatsApp,
   a frase `I allow callmebot to send me messages`. A resposta traz a sua `APIKEY`. Se não chegar em
   2 minutos, o CallMeBot pede para tentar de novo depois de 24 horas.
2. **Worker na Cloudflare** (conta gratuita em https://dash.cloudflare.com):
   1. **Workers & Pages** › **Create** › criar um Worker (modelo «Hello World»), com um nome como
      `devspace-contato`, e clicar em **Deploy**.
   2. **Edit code**: apagar o conteúdo, colar o `worker/contato.js` inteiro e clicar em **Deploy**.
   3. **Settings** › **Variables and Secrets** › acrescentar dois itens do tipo **Secret**:
      `CALLMEBOT_APIKEY` (a chave do passo 1) e `WHATSAPP_PHONE` (`+5511945172012`).
3. **Site:** pôr o endereço do Worker (`https://devspace-contato.<sua-conta>.workers.dev`) em
   `WORKER_URL` no `assets/js/site.js` e publicar.

Os nomes dos menus da Cloudflare podem mudar com o tempo; o essencial é: criar o Worker, colar o código e
cadastrar os dois segredos.

**Ativado em 29/10/2026** com o Worker `https://devspace-contato.quartorama.workers.dev/`. No teste, a mensagem chegou alguns minutos depois do envio, e o CallMeBot juntou duas mensagens numa só. Como ele quebra letras acentuadas, o Worker manda o texto sem acentos («formulario», «orcamento»); emojis passam normalmente. Mudou o `worker/contato.js`? Cole de novo em **Edit code** na Cloudflare e clique em **Deploy**: o GitHub não publica o Worker.

Ressalvas do CallMeBot: o plano gratuito é anunciado «só para uso pessoal» e não tem garantia de entrega.
Se as mensagens falharem com frequência, o botão reserva continua levando o contato pelo WhatsApp do
visitante, e dá para trocar o serviço no Worker sem mexer no site.

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
