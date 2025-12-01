const qr = require('qr-image');

class QRService {
  async generateQR(text, options = {}) {
    try {
      const size = options.size || 300;
      const margin = options.margin || 1;

      const qrCode = qr.image(text, {
        type: 'png',
        size: Math.ceil(size / 25),
        margin: margin,
        ec_level: 'M'
      });

      const chunks = [];
      
      return new Promise((resolve, reject) => {
        qrCode.on('data', chunk => chunks.push(chunk));
        
        qrCode.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks);
            const base64 = buffer.toString('base64');
            resolve({
              image: `data:image/png;base64,${base64}`,
              text: text,
              size: size
            });
          } catch (err) {
            reject(new Error('Failed to encode QR code: ' + err.message));
          }
        });
        
        qrCode.on('error', (err) => {
          reject(new Error('Failed to generate QR code: ' + err.message));
        });
      });
    } catch (error) {
      throw new Error('Failed to generate QR code: ' + error.message);
    }
  }
}

module.exports = new QRService();
