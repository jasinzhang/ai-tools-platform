class ColorService {
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r, g, b };
  }

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  generatePalette(baseColor, style = 'complementary') {
    const rgb = this.hexToRgb(baseColor || '#3498db');
    if (!rgb) {
      throw new Error('Invalid color format');
    }

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors = [];

    switch (style) {
      case 'complementary':
        // Base color + complementary color
        colors.push({ hex: this.rgbToHex(rgb.r, rgb.g, rgb.b), name: 'Primary' });
        const compH = (hsl.h + 180) % 360;
        const compRgb = this.hslToRgb(compH, hsl.s, hsl.l);
        colors.push({ hex: this.rgbToHex(compRgb.r, compRgb.g, compRgb.b), name: 'Complementary' });
        // Add variations
        colors.push({ hex: this.rgbToHex(Math.max(0, rgb.r - 30), Math.max(0, rgb.g - 30), Math.max(0, rgb.b - 30)), name: 'Dark' });
        colors.push({ hex: this.rgbToHex(Math.min(255, rgb.r + 30), Math.min(255, rgb.g + 30), Math.min(255, rgb.b + 30)), name: 'Light' });
        break;

      case 'analogous':
        // Analogous colors (adjacent on color wheel)
        for (let i = -2; i <= 2; i++) {
          const h = (hsl.h + i * 30 + 360) % 360;
          const aRgb = this.hslToRgb(h, hsl.s, hsl.l);
          colors.push({ hex: this.rgbToHex(aRgb.r, aRgb.g, aRgb.b), name: `Analogous ${i + 3}` });
        }
        break;

      case 'triadic':
        // Triadic colors
        for (let i = 0; i < 3; i++) {
          const h = (hsl.h + i * 120) % 360;
          const tRgb = this.hslToRgb(h, hsl.s, hsl.l);
          colors.push({ hex: this.rgbToHex(tRgb.r, tRgb.g, tRgb.b), name: `Triadic ${i + 1}` });
        }
        break;

      case 'monochromatic':
        // Monochromatic variations
        for (let i = 0; i < 5; i++) {
          const l = Math.max(10, Math.min(90, hsl.l + (i - 2) * 15));
          const mRgb = this.hslToRgb(hsl.h, hsl.s, l);
          colors.push({ hex: this.rgbToHex(mRgb.r, mRgb.g, mRgb.b), name: `Shade ${i + 1}` });
        }
        break;

      default:
        // Default: complementary
        return this.generatePalette(baseColor, 'complementary');
    }

    return { palette: colors, baseColor: baseColor || '#3498db' };
  }
}

module.exports = new ColorService();

