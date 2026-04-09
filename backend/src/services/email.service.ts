import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@webgenerica.com';

async function safeSendMail(options: { to: string; subject: string; html: string }) {
  if (!process.env.SMTP_USER) {
    console.log(`[Email] SMTP not configured. Would send to: ${options.to} | Subject: ${options.subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: fromAddress, ...options });
  } catch (err) {
    console.error('Email send failed:', err);
  }
}

// ─── Order confirmation ───

interface OrderEmailData {
  to: string;
  orderId: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  shippingAddress: Record<string, string>;
  paymentMethod: string;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const itemsHtml = data.items
    .map((i) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${i.price.toLocaleString()}</td></tr>`)
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#333">Pedido confirmado #${data.orderId}</h2>
      <p>Gracias por tu compra. Tu pedido está siendo procesado.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead><tr style="background:#f5f5f5"><th style="padding:8px;text-align:left">Producto</th><th style="padding:8px;text-align:center">Cant.</th><th style="padding:8px;text-align:right">Precio</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="font-size:18px;font-weight:bold;text-align:right">Total: $${data.total.toLocaleString()}</p>
      <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin-top:20px">
        <h3 style="margin-top:0;color:#555">Dirección de envío</h3>
        <p style="margin:0">${data.shippingAddress.fullName || ''}<br>${data.shippingAddress.address || ''}<br>${data.shippingAddress.city || ''} ${data.shippingAddress.state || ''} ${data.shippingAddress.zip || ''}</p>
      </div>
      <p style="color:#888;font-size:12px;margin-top:20px">Método de pago: ${data.paymentMethod}</p>
    </div>
  `;

  await safeSendMail({ to: data.to, subject: `Pedido #${data.orderId} confirmado`, html });
}

// ─── Account activation ───

interface ActivationEmailData {
  to: string;
  name: string;
  activationUrl: string;
  tempPassword: string | null;
}

export async function sendActivationEmail(data: ActivationEmailData) {
  const passwordLine = data.tempPassword
    ? `<p>Tu contraseña temporal es: <strong>${data.tempPassword}</strong></p><p style="color:#c00">Cambiala después de iniciar sesión.</p>`
    : '';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#2563eb">Bienvenido/a a WebGenerica</h2>
      <p>Hola <strong>${data.name}</strong>,</p>
      <p>Se creó una cuenta de administrador para vos. Para activar tu cuenta, hacé clic en el siguiente botón:</p>
      <div style="text-align:center;margin:30px 0">
        <a href="${data.activationUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">Activar mi cuenta</a>
      </div>
      ${passwordLine}
      <p style="color:#888;font-size:12px">Si no solicitaste esta cuenta, ignorá este email.</p>
    </div>
  `;

  await safeSendMail({ to: data.to, subject: 'Activá tu cuenta de administrador - WebGenerica', html });
}

// ─── Account suspended ───

interface SuspendEmailData {
  to: string;
  name: string;
  reason: string;
}

export async function sendAccountSuspendedEmail(data: SuspendEmailData) {
  const reasonLine = data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : '';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#dc2626">Cuenta suspendida</h2>
      <p>Hola <strong>${data.name}</strong>,</p>
      <p>Tu cuenta de administrador ha sido suspendida temporalmente.</p>
      ${reasonLine}
      <p>Si creés que esto es un error, contactá al super administrador.</p>
    </div>
  `;

  await safeSendMail({ to: data.to, subject: 'Tu cuenta fue suspendida - WebGenerica', html });
}

// ─── Account reactivated ───

interface ReactivateEmailData {
  to: string;
  name: string;
}

export async function sendAccountReactivatedEmail(data: ReactivateEmailData) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#16a34a">Cuenta reactivada</h2>
      <p>Hola <strong>${data.name}</strong>,</p>
      <p>Tu cuenta de administrador ha sido reactivada. Ya podés iniciar sesión nuevamente.</p>
    </div>
  `;

  await safeSendMail({ to: data.to, subject: 'Tu cuenta fue reactivada - WebGenerica', html });
}
