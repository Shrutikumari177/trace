const cds = require('@sap/cds');
const QRCode = require('qrcode');

module.exports = cds.service.impl(async function () {
    this.on('generateQRCode', async (req) => {
        const { text } = req.data;
        try {
            const qrCode = await QRCode.toDataURL(text);
            return qrCode;
        } catch (error) {
            console.error("QR Code generation failed:", error);
            req.error(500, "Failed to generate QR code");
        }
    });
});
