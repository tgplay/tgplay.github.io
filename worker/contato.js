// Cloudflare Worker: recebe o formulário de contato do site e manda a mensagem para o WhatsApp
// do dono via CallMeBot. A chave fica nos segredos do Worker, nunca no site.
//
// Segredos (Settings > Variables and Secrets, tipo Secret):
//   CALLMEBOT_APIKEY  chave recebida do CallMeBot
//   WHATSAPP_PHONE    número que recebe as mensagens, com DDI (ex.: +5511945172012)
// Variável opcional (tipo Text):
//   ALLOWED_ORIGINS   origens aceitas, separadas por vírgula (padrão: https://tgplay.github.io)

const LIMITS = { name: 100, phone: 30, email: 150, message: 2000 };
const MOTIVOS = { vendas: "Solicitar orçamento", suporte: "Suporte técnico", geral: "Outro assunto" };
const MAX_PER_HOUR = 5;

// Limite de envios por IP. Fica na memória da instância do Worker: segura o abuso comum,
// mas zera quando a Cloudflare troca de instância.
const hits = new Map();

function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 3600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_HOUR;
}

const cors = origin => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin",
});

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin) },
  });
}

const clean = (value, max) => String(value ?? "").replace(/\s+\n/g, "\n").trim().slice(0, max);

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || "https://tgplay.github.io").split(",").map(s => s.trim());
    const origin = request.headers.get("Origin") || "";
    if (!allowed.includes(origin)) return json({ success: false, message: "Origem não permitida." }, 403, allowed[0]);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== "POST") return json({ success: false, message: "Use POST." }, 405, origin);

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ success: false, message: "Dados inválidos." }, 400, origin);
    }

    // Campo-isca: só robôs preenchem. Finge sucesso e descarta.
    if (data.website) return json({ success: true, message: "Mensagem enviada!" }, 200, origin);

    const ip = request.headers.get("CF-Connecting-IP") || "desconhecido";
    if (tooMany(ip)) {
      return json({ success: false, message: "Muitas mensagens em pouco tempo. Tente de novo mais tarde." }, 429, origin);
    }

    const motivo = MOTIVOS[data.tipo];
    const name = clean(data.name, LIMITS.name);
    const phone = clean(data.phone, LIMITS.phone);
    const email = clean(data.email, LIMITS.email);
    const message = clean(data.message, LIMITS.message);
    if (!motivo || !name || !phone || !message) {
      return json({ success: false, message: "Preencha o motivo, o nome, o WhatsApp e a mensagem." }, 400, origin);
    }
    if (phone.replace(/\D/g, "").length < 10) {
      return json({ success: false, message: "Confira o número de WhatsApp, com DDD." }, 400, origin);
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ success: false, message: "Confira o e-mail digitado." }, 400, origin);
    }

    const text = "📩 *Nova mensagem pelo site devspace*\n\n" +
      `*Motivo:* ${motivo}\n*Nome:* ${name}\n*WhatsApp:* ${phone}\n` +
      (email ? `*E-mail:* ${email}\n` : "") +
      `\n${message}`;

    const url = "https://api.callmebot.com/whatsapp.php?phone=" + encodeURIComponent(env.WHATSAPP_PHONE) +
      "&text=" + encodeURIComponent(text) + "&apikey=" + encodeURIComponent(env.CALLMEBOT_APIKEY);

    try {
      const res = await fetch(url);
      const body = await res.text();
      if (!res.ok || /invalid|error|not allowed/i.test(body)) throw new Error(`CallMeBot ${res.status}`);
    } catch (err) {
      console.log("Falha no envio:", err.message);
      return json({ success: false, message: "Não conseguimos enviar agora." }, 502, origin);
    }

    return json({ success: true, message: "Mensagem enviada! Em breve entraremos em contato pelo seu WhatsApp." }, 200, origin);
  },
};
