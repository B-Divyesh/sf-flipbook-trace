import type { FilterMode } from './settings';

/**
 * The code needed to turn source pixels into a visible tracing frame. This is
 * deliberately isolated from the ZIP/PDF exporter: the one-click demo needs
 * to draw and filter its sample before it ever needs export code.
 */
export function applyTraceFilter(canvas: HTMLCanvasElement, mode: FilterMode, threshold: number): void {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = image;
  const gray = new Uint8ClampedArray(canvas.width * canvas.height);
  for (let pixel = 0; pixel < gray.length; pixel += 1) {
    const offset = pixel * 4;
    gray[pixel] = Math.round(data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114);
  }

  const edgeThresholdSquared = (255 - threshold) ** 2;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const pixel = y * canvas.width + x;
      const offset = pixel * 4;
      let value = gray[pixel];
      if (mode === 'threshold') value = value >= threshold ? 255 : 20;
      if (mode === 'edges') {
        if (x === 0 || y === 0 || x === canvas.width - 1 || y === canvas.height - 1) {
          value = 255;
        } else {
          const a = gray[pixel - canvas.width - 1];
          const b = gray[pixel - canvas.width];
          const c = gray[pixel - canvas.width + 1];
          const d = gray[pixel - 1];
          const f = gray[pixel + 1];
          const g = gray[pixel + canvas.width - 1];
          const h = gray[pixel + canvas.width];
          const i = gray[pixel + canvas.width + 1];
          const gx = -a + c - 2 * d + 2 * f - g + i;
          const gy = -a - 2 * b - c + g + 2 * h + i;
          value = gx * gx + gy * gy > edgeThresholdSquared ? 18 : 255;
        }
      }
      data[offset] = value;
      data[offset + 1] = value;
      data[offset + 2] = value;
      data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
}

export function drawDemoFrame(canvas: HTMLCanvasElement, index: number, total = 12): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const { width, height } = canvas;
  const phase = (index / total) * Math.PI * 2;
  context.fillStyle = '#fffaf0';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = '#d4c6ab';
  context.lineWidth = Math.max(1, width / 500);
  for (let x = 18; x < width; x += 34) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + 8, height);
    context.stroke();
  }
  const cx = width * (0.2 + index / total * 0.62);
  const cy = height * (0.49 + Math.sin(phase) * 0.13);
  context.save();
  context.translate(cx, cy);
  context.rotate(Math.sin(phase) * 0.08);
  context.strokeStyle = '#181713';
  context.fillStyle = '#0b5f71';
  context.lineWidth = Math.max(3, width / 130);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  context.ellipse(0, 0, width * 0.095, height * 0.1, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  const wingLift = Math.sin(phase) * height * 0.13;
  context.fillStyle = '#bd3f32';
  context.beginPath();
  context.moveTo(-width * 0.02, 0);
  context.quadraticCurveTo(-width * 0.12, -height * 0.08 - wingLift, -width * 0.16, -height * 0.01 - wingLift);
  context.quadraticCurveTo(-width * 0.08, height * 0.04, -width * 0.01, height * 0.06);
  context.closePath();
  context.fill();
  context.stroke();
  context.fillStyle = '#e6bd3c';
  context.beginPath();
  context.moveTo(width * 0.09, -height * 0.02);
  context.lineTo(width * 0.15, height * 0.01);
  context.lineTo(width * 0.09, height * 0.035);
  context.closePath();
  context.fill();
  context.stroke();
  context.fillStyle = '#181713';
  context.beginPath();
  context.arc(width * 0.05, -height * 0.035, width * 0.009, 0, Math.PI * 2);
  context.fill();
  context.restore();
  context.strokeStyle = '#181713';
  context.lineWidth = Math.max(2, width / 180);
  context.beginPath();
  context.moveTo(width * 0.08, height * 0.78);
  context.quadraticCurveTo(width * 0.45, height * 0.73, width * 0.92, height * 0.8);
  context.stroke();
}

/** Draw the default Pencil edges preview without a full pixel readback. */
export function drawDemoTraceFrame(canvas: HTMLCanvasElement, index: number, total = 12): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const { width, height } = canvas;
  const phase = (index / total) * Math.PI * 2;
  const cx = width * (0.2 + index / total * 0.62);
  const cy = height * (0.49 + Math.sin(phase) * 0.13);
  context.fillStyle = '#fffaf0';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = '#d4c6ab';
  context.lineWidth = Math.max(1, width / 500);
  for (let x = 18; x < width; x += 34) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + 8, height);
    context.stroke();
  }
  context.save();
  context.translate(cx, cy);
  context.rotate(Math.sin(phase) * 0.08);
  context.strokeStyle = '#181713';
  context.fillStyle = '#fffaf0';
  context.lineWidth = Math.max(2, width / 120);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  context.ellipse(0, 0, width * 0.095, height * 0.1, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  const wingLift = Math.sin(phase) * height * 0.13;
  context.beginPath();
  context.moveTo(-width * 0.02, 0);
  context.quadraticCurveTo(-width * 0.12, -height * 0.08 - wingLift, -width * 0.16, -height * 0.01 - wingLift);
  context.quadraticCurveTo(-width * 0.08, height * 0.04, -width * 0.01, height * 0.06);
  context.closePath();
  context.stroke();
  context.beginPath();
  context.moveTo(width * 0.09, -height * 0.02);
  context.lineTo(width * 0.15, height * 0.01);
  context.lineTo(width * 0.09, height * 0.035);
  context.closePath();
  context.stroke();
  context.beginPath();
  context.arc(width * 0.05, -height * 0.035, Math.max(1, width * 0.009), 0, Math.PI * 2);
  context.fillStyle = '#181713';
  context.fill();
  context.restore();
  context.lineWidth = Math.max(1, width / 180);
  context.beginPath();
  context.moveTo(width * 0.08, height * 0.78);
  context.quadraticCurveTo(width * 0.45, height * 0.73, width * 0.92, height * 0.8);
  context.stroke();
}
