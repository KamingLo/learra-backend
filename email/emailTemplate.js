export const passwordTemplate = ({ userName, code }) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <p style="font-family: 'Arial Black', sans-serif; font-size: 28px; font-weight: bold; margin: 0;">Learra</p>
    </div>
    <p>Hi ${userName},</p>
    <p>Berikut adalah kode verifikasi kamu. Jika kamu tidak melakukan permintaan ini, abaikan email ini saja.</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #f0f0f0; border-radius: 4px;">${code}</span>
    </div>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} Learra. All rights reserved.
    </p>
  </div>
`;
