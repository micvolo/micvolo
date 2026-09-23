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
    subject: `${code} — micvolo access code`,
    text: `${code}\n\nUse this code to sign in to micvolo\nIt expires in 10 minutes and can be used once\n\nIf you did not request it, ignore this email`,
    html: `<div style="max-width:480px;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#171717">
      <p style="margin:0 0 16px;font-size:15px;line-height:1.5">Your micvolo access code</p>
      <p style="margin:0 0 24px;font-size:40px;font-weight:700;line-height:1;letter-spacing:.12em">${safeCode}</p>
      <p style="margin:0;font-size:14px;line-height:1.5;color:#555">Expires in 10 minutes · One use only</p>
      <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#777">If you did not request it, ignore this email</p>
    </div>`,
  });
}
