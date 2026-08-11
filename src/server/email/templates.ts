function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);
}

function brandedEmail(input: { eyebrow: string; title: string; body: string; action?: { href: string; label: string } }) {
  const action = input.action ? `<p style="margin:28px 0"><a href="${escapeHtml(input.action.href)}" style="display:inline-block;border-radius:10px;background:#1c1917;color:#fff;padding:13px 20px;text-decoration:none;font-weight:700">${escapeHtml(input.action.label)}</a></p>` : "";
  return `<!doctype html><html><body style="margin:0;background:#f7f2e8;color:#1c1917;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(input.title)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f2e8;padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;border:1px solid #d8cdbd;border-radius:18px;background:#fffdf8;overflow:hidden"><tr><td style="padding:26px 32px;border-bottom:4px solid #b43a25;font-size:28px;font-weight:900;letter-spacing:-2px">Salt<span style="color:#b43a25">N</span>Pepper</td></tr><tr><td style="padding:32px"><p style="margin:0 0 10px;color:#b43a25;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">${escapeHtml(input.eyebrow)}</p><h1 style="margin:0 0 18px;color:#1c1917;font-size:28px;line-height:1.2">${escapeHtml(input.title)}</h1>${input.body}${action}<p style="margin:30px 0 0;border-top:1px solid #d8cdbd;padding-top:18px;color:#6f675e;font-size:12px;line-height:1.6">SaltNPepper · Allmendstrasse 18, 8154 Oberglatt<br>This is an automated service message.</p></td></tr></table></td></tr></table></body></html>`;
}

export function staffInvitationEmail(input: { invitationUrl: string }) {
  return { subject: "You are invited to SaltNPepper", text: `You have been invited to SaltNPepper staff. Set your password: ${input.invitationUrl}. This link expires in 48 hours.`, html: brandedEmail({ eyebrow: "Staff invitation", title: "Welcome to the SaltNPepper team", body: "<p style=\"font-size:16px;line-height:1.7\">Create your staff password to access SaltNPepper order operations. This secure link expires in 48 hours.</p>", action: { href: input.invitationUrl, label: "Accept invitation" } }) };
}

export function orderConfirmationEmail(input: { orderNumber: string }) {
  const orderNumber = escapeHtml(input.orderNumber);
  return { subject: `SaltNPepper order ${input.orderNumber}`, text: `Your SaltNPepper order ${input.orderNumber} is confirmed.`, html: brandedEmail({ eyebrow: "Order confirmed", title: "We are preparing your order", body: `<p style="font-size:16px;line-height:1.7">Your SaltNPepper order <strong>${orderNumber}</strong> is confirmed. We will email you when its status changes.</p>` }) };
}

export function orderStatusEmail(input: { orderNumber: string; status: string; locale: "DE" | "EN" }) {
  const labels: Record<string, { DE: string; EN: string }> = { PREPARING: { DE: "wird zubereitet", EN: "is being prepared" }, READY_FOR_PICKUP: { DE: "ist abholbereit", EN: "is ready for pickup" }, OUT_FOR_DELIVERY: { DE: "ist unterwegs", EN: "is out for delivery" }, COMPLETED: { DE: "ist abgeschlossen", EN: "is completed" }, CANCELLED: { DE: "wurde storniert", EN: "was cancelled" } };
  const status = labels[input.status]?.[input.locale] ?? input.status.replaceAll("_", " ").toLowerCase();
  const subject = input.locale === "DE" ? `Bestellung ${input.orderNumber}: ${status}` : `Order ${input.orderNumber}: ${status}`;
  const body = input.locale === "DE" ? `Ihre Bestellung <strong>${escapeHtml(input.orderNumber)}</strong> ${escapeHtml(status)}.` : `Your order <strong>${escapeHtml(input.orderNumber)}</strong> ${escapeHtml(status)}.`;
  return { subject, text: body.replace(/<[^>]+>/g, ""), html: brandedEmail({ eyebrow: input.locale === "DE" ? "Bestellstatus" : "Order status", title: subject, body: `<p style="font-size:16px;line-height:1.7">${body}</p>` }) };
}

export function contactInquiryEmail(input: { name: string; email: string; phone?: string; subject: string; message: string; locale: "de" | "en" }) {
  return { subject: `Website inquiry: ${input.subject}`, text: `From: ${input.name} <${input.email}>\nPhone: ${input.phone || "Not supplied"}\n\n${input.message}`, html: brandedEmail({ eyebrow: "Website inquiry", title: input.subject, body: `<p style="font-size:16px;line-height:1.7"><strong>From:</strong> ${escapeHtml(input.name)} &lt;${escapeHtml(input.email)}&gt;<br><strong>Phone:</strong> ${escapeHtml(input.phone || "Not supplied")}</p><p style="white-space:pre-wrap;font-size:16px;line-height:1.7">${escapeHtml(input.message)}</p>` }) };
}

export function contactAcknowledgementEmail(input: { name: string; locale: "de" | "en" }) {
  const de = input.locale === "de";
  return { subject: de ? "Ihre Nachricht an SaltNPepper" : "Your message to SaltNPepper", text: de ? `Hallo ${input.name}, wir haben Ihre Nachricht erhalten und melden uns so bald wie möglich.` : `Hello ${input.name}, we received your message and will reply as soon as possible.`, html: brandedEmail({ eyebrow: de ? "Nachricht erhalten" : "Message received", title: de ? `Danke, ${input.name}` : `Thank you, ${input.name}`, body: `<p style="font-size:16px;line-height:1.7">${de ? "Wir haben Ihre Nachricht erhalten und melden uns so bald wie möglich." : "We received your message and will reply as soon as possible."}</p>` }) };
}
