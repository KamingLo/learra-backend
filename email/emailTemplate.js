export const passwordTemplate = ({ userName, code }) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <p style="font-size: 28px; font-weight: bold; margin: 0;">Learra</p>
    </div>

    <div style="text-align: center;">
        <p>Hi ${userName},</p>
        <p style="text-align: center;">Terima kasih telah menggunakan Learra! Untuk melanjutkan proses keamanan akun kamu, kami mengirimkan kode verifikasi di bawah ini. Kode ini bersifat rahasia dan hanya berlaku untuk sementara waktu.</p>
        <p style="text-align: center;">Jika kamu tidak meminta kode ini, kemungkinan ada orang lain mencoba mengakses akunmu. Dalam kasus tersebut, tidak perlu melakukan apa-apa akunmu tetap aman.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #f0f0f0; border-radius: 4px;">${code}</span>
    </div>

    <div style="text-align: center; margin:0px 1rem;">
        <p style="font-size: 14px; color: #555;">Tips keamanan: Jangan bagikan kode ini kepada siapa pun. Kode hanya berlaku dalam waktu beberapa menit, jadi segera gunakan kode ini untuk memverifikasi akunmu.</p>
        <p style="font-size: 14px; color: #555;">Jika kamu mengalami masalah atau memiliki pertanyaan, silakan hubungi tim support kami melalui <a href="mailto:support@learra.com" style="color: #007bff;">support@learra.com</a>.</p>
    </div>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} Learra. All rights reserved.
    </p>
</div>
`;
