// Modelo de site para restaurantes: monta a prévia a partir do link.
// Ex.: ?nome=Hamburgueria do Zé&tipo=hamburgueria&bairro=Pinheiros
// Todo o conteúdo é ilustrativo; o texto do link entra só como texto (nunca como HTML).
(function () {
  "use strict";

  var WHATSAPP_DEVSPACE = "5511945172012";

  var TIPOS = {
    hamburgueria: {
      rotulo: "Hamburgueria", emoji: "🍔",
      slogan: "Hambúrguer artesanal, feito na chapa e servido do jeito que você gosta.",
      sobre: "Blend da casa moído todo dia, pão macio e molhos próprios. Aqui cada lanche sai na hora, para comer no salão ou receber em casa.",
      diferenciais: [["🔥", "Carne moída na casa"], ["🛵", "Entrega na região"], ["🥤", "Combos com batata e bebida"], ["🌱", "Opção vegetariana"]],
      cardapio: [
        ["🍔", "Clássico da casa", "Blend 160 g, queijo prato, alface, tomate e molho especial.", 32.9],
        ["🥓", "Bacon duplo", "Dois blends, cheddar, bacon crocante e cebola caramelizada.", 42.9],
        ["🧀", "Cheddar melt", "Blend 160 g com cheddar cremoso e cebola crispy.", 36.9],
        ["🌱", "Veggie", "Hambúrguer de grão-de-bico, rúcula, tomate e maionese verde.", 34.9],
        ["🍟", "Batata rústica", "Porção com páprica e maionese da casa.", 19.9],
        ["🥤", "Milkshake", "Chocolate, morango ou doce de leite. 400 ml.", 21.9]
      ],
      horario: [["Segunda", "Fechado"], ["Terça a quinta", "18h às 23h"], ["Sexta e sábado", "18h à 0h"], ["Domingo", "18h às 23h"]]
    },
    pizzaria: {
      rotulo: "Pizzaria", emoji: "🍕",
      slogan: "Massa de longa fermentação e forno quente: pizza de verdade, inteira ou em pedaço.",
      sobre: "Massa descansada por 48 horas, molho de tomate da casa e ingredientes escolhidos a dedo. No salão, para viagem ou no delivery.",
      diferenciais: [["🔥", "Forno a lenha"], ["🛵", "Delivery na região"], ["🍕", "Meia a meia"], ["🎉", "Rodízio aos fins de semana"]],
      cardapio: [
        ["🍕", "Margherita", "Molho de tomate, muçarela, tomate e manjericão fresco.", 54.9],
        ["🧀", "Quatro queijos", "Muçarela, provolone, gorgonzola e parmesão.", 62.9],
        ["🌶️", "Calabresa", "Calabresa fatiada, cebola roxa e azeitonas.", 56.9],
        ["🍗", "Frango com catupiry", "Frango desfiado temperado e catupiry original.", 59.9],
        ["🥬", "Portuguesa", "Presunto, ovos, cebola, ervilha e muçarela.", 58.9],
        ["🍫", "Chocolate com morango", "Pizza doce com chocolate ao leite e morangos.", 49.9]
      ],
      horario: [["Segunda e terça", "Fechado"], ["Quarta e quinta", "18h às 23h"], ["Sexta e sábado", "18h à 0h30"], ["Domingo", "18h às 23h30"]]
    },
    restaurante: {
      rotulo: "Restaurante", emoji: "🍽️",
      slogan: "Comida caseira, prato bem servido e aquele tempero que lembra almoço de família.",
      sobre: "Cozinha brasileira feita no dia, com pratos executivos no almoço e opções à la carte. Ambiente acolhedor para o almoço do trabalho ou o encontro de família.",
      diferenciais: [["🥘", "Prato do dia"], ["⏱️", "Almoço rápido"], ["🛵", "Marmitas para entrega"], ["👨‍👩‍👧", "Espaço para família"]],
      cardapio: [
        ["🥩", "Executivo de bife", "Bife acebolado, arroz, feijão, fritas e salada.", 34.9],
        ["🍗", "Frango grelhado", "Peito de frango, arroz, feijão, legumes e salada.", 31.9],
        ["🐟", "Peixe do dia", "Filé grelhado com purê de batata e legumes.", 39.9],
        ["🫘", "Feijoada (sábado)", "Completa, com arroz, couve, farofa e laranja.", 44.9],
        ["🥗", "Salada da casa", "Folhas, legumes da estação, grão-de-bico e molho de ervas.", 27.9],
        ["🍮", "Pudim", "Pudim de leite condensado, receita da casa.", 12.9]
      ],
      horario: [["Segunda a sexta", "11h às 15h"], ["Sábado", "11h às 16h"], ["Domingo", "11h às 16h"]]
    },
    cafeteria: {
      rotulo: "Cafeteria", emoji: "☕",
      slogan: "Café especial, fornadas do dia e um cantinho para trabalhar ou encontrar os amigos.",
      sobre: "Grãos selecionados de pequenos produtores, preparados com cuidado. Bolos, salgados e pães saem do forno ao longo do dia.",
      diferenciais: [["☕", "Café especial"], ["🥐", "Fornadas do dia"], ["📶", "Wi-Fi para trabalhar"], ["🐾", "Pet friendly"]],
      cardapio: [
        ["☕", "Espresso", "Grão especial da casa, extração na hora.", 7.5],
        ["🥛", "Cappuccino", "Espresso, leite vaporizado e cacau.", 13.9],
        ["🧋", "Latte gelado", "Espresso duplo, leite e gelo. 400 ml.", 16.9],
        ["🥐", "Croissant", "Massa folhada amanteigada, simples ou com presunto e queijo.", 12.9],
        ["🧀", "Pão de queijo", "Porção com 6 unidades, saindo do forno.", 14.9],
        ["🍰", "Fatia de bolo do dia", "Pergunte o sabor de hoje.", 11.9]
      ],
      horario: [["Segunda a sexta", "7h às 19h"], ["Sábado", "8h às 18h"], ["Domingo", "8h às 14h"]]
    }
  };

  // ── Lê o link ──
  var params = new URLSearchParams(window.location.search);
  var limpa = function (valor, max) { return (valor || "").replace(/\s+/g, " ").trim().slice(0, max); };
  var tipoChave = TIPOS[params.get("tipo")] ? params.get("tipo") : "restaurante";
  var tipo = TIPOS[tipoChave];
  var nome = limpa(params.get("nome"), 60) || ("Seu " + tipo.rotulo);
  var bairro = limpa(params.get("bairro"), 40);
  var cidade = limpa(params.get("cidade"), 40) || "São Paulo";

  document.body.setAttribute("data-tema", tipoChave);
  document.title = nome + " | Prévia de site";

  // ── Textos (sempre por textContent) ──
  var preencher = function (chave, texto) {
    document.querySelectorAll('[data-tipo="' + chave + '"]').forEach(function (el) { el.textContent = texto; });
  };
  var lugar = bairro ? bairro + ", " + cidade : cidade;
  preencher("nome", nome);
  preencher("emoji", tipo.emoji);
  preencher("tag", tipo.rotulo + (bairro ? " em " + bairro : ""));
  preencher("slogan", tipo.slogan);
  preencher("sobre", tipo.sobre);
  preencher("local", "📍 " + lugar);
  preencher("local-mapa", nome + " · " + lugar);

  var formatar = function (preco) { return "R$ " + preco.toFixed(2).replace(".", ","); };

  var lista = document.getElementById("cardapio-lista");
  tipo.cardapio.forEach(function (item) {
    var prato = document.createElement("article");
    prato.className = "prato";
    prato.innerHTML = '<div class="prato__emoji" aria-hidden="true"></div><div class="prato__info">' +
      '<div class="prato__topo"><h3></h3><span class="prato__preco"></span></div><p></p></div>';
    prato.querySelector(".prato__emoji").textContent = item[0];
    prato.querySelector("h3").textContent = item[1];
    prato.querySelector("p").textContent = item[2];
    prato.querySelector(".prato__preco").textContent = formatar(item[3]);
    lista.appendChild(prato);
  });

  var dif = document.getElementById("diferenciais");
  tipo.diferenciais.forEach(function (d) {
    var li = document.createElement("li");
    li.innerHTML = '<span aria-hidden="true"></span><strong></strong>';
    li.querySelector("span").textContent = d[0];
    li.querySelector("strong").textContent = d[1];
    dif.appendChild(li);
  });

  var tabela = document.getElementById("horario-tabela");
  tipo.horario.forEach(function (h) {
    var tr = document.createElement("tr");
    tr.innerHTML = "<td></td><td></td>";
    tr.children[0].textContent = h[0];
    tr.children[1].textContent = h[1];
    tabela.appendChild(tr);
  });

  // ── "Quero um site assim": WhatsApp da devspace com o nome do estabelecimento ──
  var mensagem = "Olá! Vi a prévia do site para *" + nome + "* e quero saber mais.";
  var linkDevspace = "https://wa.me/" + WHATSAPP_DEVSPACE + "?text=" + encodeURIComponent(mensagem);
  document.getElementById("cta-topo").href = linkDevspace;
  document.getElementById("cta-final").href = linkDevspace;

  // ── Botões que, no site final, levam aos canais do estabelecimento ──
  var aviso = document.getElementById("aviso");
  var timer;
  var textos = {
    whatsapp: "Na versão final, este botão abre o WhatsApp de " + nome + " com o pedido já começado.",
    ifood: "Na versão final, este botão leva à página de " + nome + " no iFood (ou outro app de entrega)."
  };
  document.querySelectorAll("[data-demo]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      aviso.textContent = textos[botao.getAttribute("data-demo")];
      aviso.hidden = false;
      clearTimeout(timer);
      timer = setTimeout(function () { aviso.hidden = true; }, 4500);
    });
  });
})();
