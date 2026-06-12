const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4, // forzar IPv4 (en Windows, IPv6 a Gmail suele fallar con ECONNREFUSED)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // evita error de certificado autofirmado (antivirus/proxy local interceptando TLS)
  },
})

const enviarCodigoRecuperacion = async (email, nombre, codigo) => {
  await transporter.sendMail({
    from: '"EduSmart AI+" <' + process.env.EMAIL_USER + '>',
    to: email,
    subject: 'Recupera tu contrasena - EduSmart AI+',
    html: `
      <div style="font-family: Poppins, Arial, sans-serif; background:#0F0A1E; padding:32px; border-radius:16px; max-width:480px; margin:0 auto;">
        <h2 style="color:#fff; margin:0 0 8px;">EduSmart <span style="color:#A78BFA;">AI+</span></h2>
        <p style="color:#D1D5DB; font-size:14px;">Hola ${nombre},</p>
        <p style="color:#D1D5DB; font-size:14px;">Recibimos una solicitud para restablecer tu contrasena. Usa el siguiente codigo para continuar:</p>
        <div style="background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.3); border-radius:12px; padding:16px; text-align:center; margin:20px 0;">
          <span style="font-size:32px; font-weight:900; letter-spacing:8px; color:#A78BFA;">${codigo}</span>
        </div>
        <p style="color:#9CA3AF; font-size:13px;">Este codigo expira en 15 minutos. Si no solicitaste este cambio, ignora este correo.</p>
      </div>
    `,
  })
}

module.exports = { enviarCodigoRecuperacion }
