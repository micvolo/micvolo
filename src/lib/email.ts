function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] ?? character);
}

export async function sendOtpEmail(env: Env, recipient: string, code: string): Promise<void> {
  const safeCode = escapeHtml(code);
  await env.EMAIL.send({
    to: recipient,
    from: env.EMAIL_FROM,
    subject: 'Your micvolo access code',
    text: `Your micvolo access code is ${code}. It expires in 10 minutes and can be used once. If you did not request it, ignore this email.`,
    html: `<div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#111;max-width:32rem;margin:0 auto;padding:32px">
      <p style="font-size:13px;color:#666;margin:0 0 32px">micvolo.com / collaboration portal</p>
      <p style="font-size:16px;margin:0 0 12px">Your one-time access code</p>
      <p style="font:600 36px ui-monospace,SFMono-Regular,monospace;letter-spacing:.18em;margin:0 0 24px">${safeCode}</p>
      <p style="font-size:13px;line-height:1.5;color:#666">It expires in 10 minutes and can be used once. If you did not request it, ignore this email.</p>
    </div>`,
  });
}
