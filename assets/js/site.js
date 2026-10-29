// devspace — comportamento comum das páginas.
(function () {
  "use strict";

  // Número do WhatsApp que recebe as mensagens do formulário (só dígitos, com DDI e DDD).
  var WHATSAPP = "5511945172012";

  // Endereço do Cloudflare Worker (pasta worker/) que entrega o formulário direto no WhatsApp.
  // Vazio = o formulário abre o WhatsApp do visitante com a mensagem pronta.
  var WORKER_URL = "";

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

  // ── Formulário de contato ──
  // Com WORKER_URL: envia direto para o WhatsApp do dono; se falhar, oferece o WhatsApp do visitante.
  // Sem WORKER_URL: abre o WhatsApp do visitante com a mensagem pronta.
  var form = document.querySelector(".gps-form");
  if (form) {
    var feed = form.querySelector(".gps-form__feedback");
    var submit = form.querySelector('[type="submit"]');
    var fallback = form.querySelector(".gps-form__fallback");
    var labels = { vendas: "Solicitar orçamento", suporte: "Suporte técnico", geral: "Outro assunto" };

    if (!WORKER_URL) submit.innerHTML = "Enviar pelo WhatsApp &rarr;";

    // /contato?tipo=vendas (botões "Solicitar orçamento") ou ?tipo=suporte já escolhem o motivo
    var tipo = new URLSearchParams(window.location.search).get("tipo");
    if (tipo && labels[tipo]) form.elements.tipo.value = tipo;

    var show = function (text, kind) {
      feed.textContent = text;
      feed.className = "gps-form__feedback " + kind;
      feed.hidden = false;
    };

    var whatsappLink = function (d) {
      var texto = "Olá! Vim pelo site da devspace.\n\n" +
        "*Motivo:* " + labels[d.tipo] + "\n" +
        "*Nome:* " + d.name + "\n" +
        (d.email ? "*E-mail:* " + d.email + "\n" : "") +
        "\n" + d.message;
      return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      fallback.hidden = true;

      var d = {
        tipo: form.elements.tipo.value,
        name: form.elements.name.value.trim(),
        phone: form.elements.phone.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim(),
        website: form.elements.website.value
      };
      if (!d.tipo) return show("Selecione o motivo do contato.", "error");
      if (!d.name || !d.message) return show("Preencha o nome e a mensagem.", "error");
      if (d.phone.replace(/\D/g, "").length < 10) return show("Informe o seu WhatsApp com DDD.", "error");
      if (d.email && !form.elements.email.checkValidity()) return show("Confira o e-mail digitado.", "error");

      if (!WORKER_URL) {
        show("Abrindo o WhatsApp com a sua mensagem. É só tocar em enviar.", "success");
        window.open(whatsappLink(d), "_blank", "noopener");
        return;
      }

      submit.disabled = true;
      submit.textContent = "Enviando...";
      fetch(WORKER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) })
        .then(function (r) { return r.json().then(function (body) { return { ok: r.ok, status: r.status, body: body }; }); })
        .then(function (res) {
          if (res.ok && res.body.success) {
            show(res.body.message, "success");
            form.reset();
            return;
          }
          // Erro de preenchimento: a pessoa corrige. Demais falhas: oferece o WhatsApp dela.
          if (res.status === 400) return show(res.body.message, "error");
          throw new Error(res.body.message);
        })
        .catch(function () {
          show("Não conseguimos enviar agora. Você pode mandar a mesma mensagem pelo seu WhatsApp:", "error");
          fallback.href = whatsappLink(d);
          fallback.hidden = false;
        })
        .finally(function () {
          submit.disabled = false;
          submit.innerHTML = "Enviar mensagem &rarr;";
        });
    });
  }
})();
