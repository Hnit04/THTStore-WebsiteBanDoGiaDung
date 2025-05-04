// server/utils/sendEmail.js
const nodemailer = require("nodemailer")

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // Sử dụng false để dùng STARTTLS trên cổng 587
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false, // Bỏ qua kiểm tra chứng chỉ tự ký
        },
    })

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    }

    await transporter.sendMail(message)
}

module.exports = sendEmail