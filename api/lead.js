// Vercel serverless function: receives a sign-up lead and forwards it to Telegram.
// Needs two environment variables set in Vercel (Project → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN  token of the bot made with @BotFather
//   TELEGRAM_CHAT_ID    optional: chat that receives the leads (defaults to Kiarash's chat)
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const name = String(body.name || "").trim().slice(0, 80);
  const phone = String(body.phone || "").trim();
  const tg = String(body.tg || "").trim().slice(0, 40);
  const price = String(body.price || "").slice(0, 40);
  if (name.length < 2 || !/^09\d{9}$/.test(phone)) return res.status(400).json({ ok: false, error: "invalid" });

  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID || "6289784037"; // default: Kiarash's chat with @hisepai_leads_bot
  if (!token || !chat) return res.status(500).json({ ok: false, error: "not configured" });

  const time = new Date().toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });
  const text = `🆕 ثبت‌نام جدید دوره\n\n👤 نام: ${name}\n📱 موبایل: ${phone}\n✈️ تلگرام: ${tg || "-"}\n💳 قیمت: ${price || "-"}\n🕒 ${time}`;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text })
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
};
