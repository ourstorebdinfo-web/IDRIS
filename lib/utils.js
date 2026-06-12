export function parseJsonArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.length) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }
  return []
}

export function getColorName(hex) {
  if (!hex) return '';
  const trimmed = hex.trim();
  if (!trimmed.startsWith('#')) return trimmed;

  let cleanHex = trimmed.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  if (cleanHex.length !== 6) return trimmed;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  const baseColors = [
    { name: 'Black', r: 0, g: 0, b: 0 },
    { name: 'White', r: 255, g: 255, b: 255 },
    { name: 'Red', r: 255, g: 0, b: 0 },
    { name: 'Green', r: 0, g: 128, b: 0 },
    { name: 'Blue', r: 0, g: 0, b: 255 },
    { name: 'Yellow', r: 255, g: 255, b: 0 },
    { name: 'Cyan', r: 0, g: 255, b: 255 },
    { name: 'Magenta', r: 255, g: 0, b: 255 },
    { name: 'Silver', r: 192, g: 192, b: 192 },
    { name: 'Gray', r: 128, g: 128, b: 128 },
    { name: 'Maroon', r: 128, g: 0, b: 0 },
    { name: 'Olive', r: 128, g: 128, b: 0 },
    { name: 'Lime', r: 0, g: 255, b: 0 },
    { name: 'Teal', r: 0, g: 128, b: 128 },
    { name: 'Navy', r: 0, g: 0, b: 128 },
    { name: 'Purple', r: 128, g: 0, b: 128 },
    { name: 'Orange', r: 255, g: 165, b: 0 },
    { name: 'Brown', r: 165, g: 42, b: 42 },
    { name: 'Pink', r: 255, g: 192, b: 203 },
    { name: 'Gold', r: 255, g: 215, b: 0 },
    { name: 'Indigo', r: 75, g: 0, b: 130 },
    { name: 'Violet', r: 238, g: 130, b: 238 },
    { name: 'Aqua', r: 0, g: 255, b: 255 },
    { name: 'Sky Blue', r: 135, g: 206, b: 235 },
    { name: 'Emerald Green', r: 16, g: 185, b: 129 },
    { name: 'Rose', r: 244, g: 63, b: 94 },
    { name: 'Amber', r: 245, g: 158, b: 11 }
  ];

  let closestColor = baseColors[0];
  let minDistance = Infinity;

  for (const color of baseColors) {
    const distance = Math.sqrt(
      Math.pow(r - color.r, 2) +
      Math.pow(g - color.g, 2) +
      Math.pow(b - color.b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return closestColor.name;
}

