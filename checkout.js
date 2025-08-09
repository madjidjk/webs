// Move webhook server-side in production. Client-side webhooks expose secrets.
const DISCORD_WEBHOOK = ""; // disabled on client for security

const planMeta = {
  monthly: { label: "شهري", price: 60, currency: "د.ت", billing: "/ شهر" },
  yearly: { label: "سنوي", price: 210, currency: "د.ت", billing: "/ سنة" },
};

function getPlanFromQuery() {
  const params = new URLSearchParams(location.search);
  const plan = params.get("plan") || "monthly";
  return planMeta[plan] ? plan : "monthly";
}

function updatePlanSummary() {
  const planKey = getPlanFromQuery();
  const meta = planMeta[planKey];
  document.getElementById("planLabel").textContent = meta.label;
  document.getElementById("planPrice").textContent = `${meta.price} ${meta.currency} ${meta.billing}`;
  document.getElementById("planTotal").textContent = `${meta.price} ${meta.currency}`;
  document.getElementById("plan").value = planKey;
}

async function sendToDiscord(payload) {
  const content = `طلب اشتراك جديد`;
  const embed = {
    title: 'طلب اشتراك جديد',
    color: 0x6366f1,
    timestamp: new Date().toISOString(),
    fields: [
      { name: 'الباقة', value: `${payload.planLabel} (${payload.planKey})`, inline: true },
      { name: 'السعر', value: `${payload.price} ${payload.currency} ${payload.billing}`, inline: true },
      { name: 'الاسم', value: payload.fullName || '—', inline: true },
      { name: 'البريد', value: payload.email || '—', inline: true },
      { name: 'الجوال', value: payload.phone || '—', inline: true },
      { name: 'المشروع/الشركة', value: payload.company || '—', inline: true },
      { name: 'ملاحظات', value: payload.notes || '—', inline: false },
    ],
    footer: { text: 'Websitek' },
  };

  const payloadJson = {
    content,
    allowed_mentions: { parse: [] },
    embeds: [embed],
  };

  // Strategy A: multipart/form-data using payload_json (avoids preflight, works with no-cors)
  // Disabled: send via your own backend endpoint instead
  // await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadJson) });
  return true;
}

function sendEmailViaFormSubmit(payload) {
  const f = document.getElementById("emailRelayForm");
  if (!f) return;
  f.querySelector('[name="fullName"]').value = payload.fullName;
  f.querySelector('[name="email"]').value = payload.email;
  f.querySelector('[name="phone"]').value = payload.phone;
  f.querySelector('[name="company"]').value = payload.company;
  f.querySelector('[name="notes"]').value = payload.notes;
  f.querySelector('[name="plan"]').value = `${payload.planLabel} (${payload.planKey})`;
  f.querySelector('[name="price"]').value = `${payload.price} ${payload.currency} ${payload.billing}`;
  f.submit();
}

async function sendEmailViaFormSubmitAjax(payload) {
  const url = "https://formsubmit.co/ajax/madjidjk@gmail.com";
  const body = {
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    company: payload.company,
    notes: payload.notes,
    plan: `${payload.planLabel} (${payload.planKey})`,
    price: `${payload.price} ${payload.currency} ${payload.billing}`,
    _subject: "طلب اشتراك جديد — صانع المواقع",
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("FormSubmit AJAX failed");
  }
  // Optionally read JSON: await res.json()
}

function validate(form) {
  const fullName = form.fullName.value.trim();
  const email = form.email.value.trim();
  if (!fullName) return { ok: false, message: "رجاءً اكتب اسمك الكامل" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "بريد إلكتروني غير صالح" };
  return { ok: true };
}

document.addEventListener("DOMContentLoaded", () => {
  updatePlanSummary();

  const form = document.getElementById("checkoutForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot: if filled, treat as bot and abort silently
    const honey = form.querySelector('input[name="website"]');
    if (honey && honey.value && honey.value.trim() !== "") {
      return;
    }

    const v = validate(form);
    if (!v.ok) {
      alert(v.message);
      return;
    }

    const planKey = document.getElementById("plan").value;
    const meta = planMeta[planKey];

    const payload = {
      planKey,
      planLabel: meta.label,
      price: meta.price,
      currency: meta.currency,
      billing: meta.billing,
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      company: form.company.value.trim(),
      notes: form.notes.value.trim(),
    };

    try {
      await sendToDiscord(payload);
      // حاول أولاً عبر AJAX؛ إن فشل لأي سبب، استخدم نموذج POST المخفي
      try {
        await sendEmailViaFormSubmitAjax(payload);
        location.href = "index.html?thanks=1";
      } catch (_) {
        sendEmailViaFormSubmit(payload);
      }
    } catch (err) {
      console.error(err);
      alert("تعذر إرسال الطلب الآن. حاول لاحقًا أو تواصل معنا.");
    }
  });
});


