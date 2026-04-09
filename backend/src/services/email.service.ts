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

interface OrderEmailData {
  to: string;
  orderId: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  shippingAddress: Record<string, string>;
  paymentMethod: string;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  if (!process.env.SMTP_USER) return;

  const itemsHtml = data.items
    .map((i) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${i.price.toLocaleString()}</td></tr>`)
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#333">¡Pedido confirmado! #${data.orderId}</h2>
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

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: data.to,
      subject: `Pedido #${data.orderId} confirmado`,
      html,
    });
  } catch (err) {
    console.error('Email send failed:', err);
  }
}
