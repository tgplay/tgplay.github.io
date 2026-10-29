// devspace — comportamento comum das páginas.
(function () {
  "use strict";

  // Número do WhatsApp que recebe as mensagens do formulário (só dígitos, com DDI e DDD).
  var WHATSAPP = "5511945172012";

  // ── Menu do celular ──
  var btn = document.getElementById("hamburger-btn");
  var nav = document.getElementById("primary-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  // ── Modo escuro (a preferência é aplicada no <head> para não piscar) ──
  var html = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      try { localStorage.setItem("gps-theme", next); } catch (e) {}
    });
  }

  // ── Banner de cookies ──
  var banner = document.getElementById("dv-cookie-banner");
  if (banner) {
    var KEY = "dv_cookies_ok";
    var seen = false;
    try { seen = Boolean(localStorage.getItem(KEY)); } catch (e) {}
    if (!seen) banner.hidden = false;
    document.getElementById("dv-cookie-accept").addEventListener("click", function () {
      try { localStorage.setItem(KEY, "1"); } catch (e) {}
      banner.style.animation = "dvCookieSlide .25s ease reverse";
      setTimeout(function () { banner.hidden = true; }, 240);
    });
  }

  // ── Filtro do portfólio ──
  var filters = document.querySelectorAll(".dv-filter");
  var cards = document.querySelectorAll(".dv-pf-card");
  filters.forEach(function (filter) {
    filter.addEventListener("click", function () {
      filters.forEach(function (b) { b.classList.remove("active"); });
      filter.classList.add("active");
      var cat = filter.dataset.cat;
      cards.forEach(function (card) {
        card.classList.toggle("hidden", !(cat === "todos" || card.dataset.cat === cat));
      });
    });
  });

  // ── Formulário de contato: monta a mensagem e abre o WhatsApp ──
  var form = document.querySelector(".gps-form");
  if (form) {
    var feed = form.querySelector(".gps-form__feedback");
    var labels = { vendas: "Solicitar orçamento", suporte: "Suporte técnico", geral: "Outro assunto" };

    // /contato?tipo=vendas (botões "Solicitar orçamento") ou ?tipo=suporte já escolhem o motivo
    var tipo = new URLSearchParams(window.location.search).get("tipo");
    if (tipo && labels[tipo]) form.elements.tipo.value = tipo;

    var showError = function (text) {
      feed.textContent = text;
      feed.className = "gps-form__feedback error";
      feed.hidden = false;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements.website.value) return; // campo-isca: só robôs preenchem

      var motivo = form.elements.tipo.value;
      var nome = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var mensagem = form.elements.message.value.trim();
      if (!motivo) return showError("Selecione o motivo do contato.");
      if (!nome || !mensagem) return showError("Preencha o nome e a mensagem.");
      if (email && !form.elements.email.checkValidity()) return showError("Confira o e-mail digitado.");

      var texto = "Olá! Vim pelo site da devspace.\n\n" +
        "*Motivo:* " + labels[motivo] + "\n" +
        "*Nome:* " + nome + "\n" +
        (email ? "*E-mail:* " + email + "\n" : "") +
        "\n" + mensagem;

      feed.textContent = "Abrindo o WhatsApp com a sua mensagem. É só tocar em enviar.";
      feed.className = "gps-form__feedback success";
      feed.hidden = false;
      window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
    });
  }
})();
