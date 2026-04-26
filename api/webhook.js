import { createClient } from "@supabase/supabase-js";

// ─── Config ───────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role — обходит RLS
);

// Сколько запросов давать за покупку.
// Можно вынести в env или маппить по offerId / product
const REQUESTS_PER_PURCHASE = 10;

// ─── Helpers ──────────────────────────────────────────────────────
function verifyApiKey(req) {
  // Lava.top при типе аутентификации «API key» шлёт ключ
  // в заголовке Authorization (формат может быть «<key>» или «Bearer <key>»).
  // Проверяем оба варианта.
  const authHeader = req.headers["authorization"] || "";
  const key = authHeader.replace(/^Bearer\s+/i, "").trim();
  return key === process.env.LAVA_WEBHOOK_SECRET;
}

// ─── Handler ──────────────────────────────────────────────────────
export default async function handler(req, res) {
  // 1. Только POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Проверяем ключ
  if (!verifyApiKey(req)) {
    console.warn("[webhook] invalid api key");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const body = req.body;

    // 3. Логируем полный payload (удалить после отладки)
    console.log("[webhook] payload:", JSON.stringify(body, null, 2));

    // 4. Извлекаем email покупателя и статус
    //    Lava.top webhook payload содержит поля:
    //    - status: "success" | "failed"
    //    - buyerEmail / email
    //    - contractId, invoiceId, offerId, amount и т.д.
    const email = body.buyerEmail || body.email;
    const status = body.status;
    const contractId = body.contractId || body.invoiceId || "unknown";

    if (!email) {
      console.error("[webhook] no email in payload");
      return res.status(400).json({ error: "Missing buyer email" });
    }

    // 5. Обрабатываем только успешные платежи
    if (status !== "success") {
      console.log(`[webhook] skipping non-success status: ${status}`);
      return res.status(200).json({ ok: true, skipped: true });
    }

    // 6. Идемпотентность: проверяем, не обрабатывали ли уже этот contractId
    //    (опционально — если есть таблица payment_logs)
    const { data: existing } = await supabase
      .from("payment_logs")
      .select("id")
      .eq("contract_id", contractId)
      .maybeSingle();

    if (existing) {
      console.log(`[webhook] duplicate contractId ${contractId}, skipping`);
      return res.status(200).json({ ok: true, duplicate: true });
    }

    // 7. Обновляем requests_limit пользователю
    //    increment через RPC или update с select
    const { data: user, error: fetchErr } = await supabase
      .from("users")
      .select("id, requests_limit")
      .eq("email", email)
      .maybeSingle();

    if (fetchErr) {
      console.error("[webhook] supabase fetch error:", fetchErr);
      return res.status(500).json({ error: "Database error" });
    }

    if (!user) {
      // Пользователь ещё не зарегистрирован — создаём запись
      const { error: insertErr } = await supabase.from("users").insert({
        email,
        requests_limit: REQUESTS_PER_PURCHASE,
      });

      if (insertErr) {
        console.error("[webhook] supabase insert error:", insertErr);
        return res.status(500).json({ error: "Database error" });
      }

      console.log(`[webhook] created user ${email} with ${REQUESTS_PER_PURCHASE} requests`);
    } else {
      // Пользователь есть — прибавляем лимит
      const newLimit = (user.requests_limit || 0) + REQUESTS_PER_PURCHASE;

      const { error: updateErr } = await supabase
        .from("users")
        .update({ requests_limit: newLimit })
        .eq("id", user.id);

      if (updateErr) {
        console.error("[webhook] supabase update error:", updateErr);
        return res.status(500).json({ error: "Database error" });
      }

      console.log(`[webhook] updated ${email}: ${user.requests_limit} → ${newLimit}`);
    }

    // 8. Записываем лог платежа (идемпотентность)
    await supabase.from("payment_logs").insert({
      contract_id: contractId,
      email,
      payload: body,
      processed_at: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[webhook] unhandled error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
