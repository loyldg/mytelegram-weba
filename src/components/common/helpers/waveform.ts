type IWaveformProps = {
  peak: number;
  fillStyle: string;
  progressFillStyle: string;
  dpr: number;
};

export const MAX_EMPTY_WAVEFORM_POINTS = 30;
const SPIKE_WIDTH = 2;
const SPIKE_STEP = 4;
const SPIKE_RADIUS = 1;
const HEIGHT = 23;
const REMAINING_ALPHA = 0.5;

export function renderWaveform(
  canvas: HTMLCanvasElement,
  spikes: number[],
  progress: number,
  {
    peak, fillStyle, progressFillStyle, dpr,
  }: IWaveformProps,
) {
  const width = spikes.length * SPIKE_STEP;
  const height = HEIGHT;
  const canvasWidth = Math.round(width * dpr);
  const canvasHeight = Math.round(height * dpr);

  if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const path = new Path2D();
  spikes.forEach((item, i) => {
    const spikeHeight = Math.max(2, HEIGHT * (item / Math.max(1, peak)));
    addRoundedRectangle(path, i * SPIKE_STEP, (height + spikeHeight) / 2, SPIKE_WIDTH, spikeHeight, SPIKE_RADIUS);
  });

  const progressX = progress * width;
  fillClipped(ctx, path, 0, progressX, progressFillStyle, 1);
  fillClipped(ctx, path, progressX, width, fillStyle, REMAINING_ALPHA);
}

function fillClipped(
  ctx: CanvasRenderingContext2D, path: Path2D, fromX: number, toX: number, fillStyle: string, alpha: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(fromX, 0, toX - fromX, HEIGHT);
  ctx.clip();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fillStyle;
  ctx.fill(path);
  ctx.restore();
}

function addRoundedRectangle(
  path: Path2D, x: number, y: number, width: number, height: number, radius: number,
) {
  if (width < 2 * radius) {
    radius = width / 2;
  }
  if (height < 2 * radius) {
    radius = height / 2;
  }

  path.moveTo(x + radius, y);
  path.arcTo(x + width, y, x + width, y - height, radius);
  path.arcTo(x + width, y - height, x, y - height, radius);
  path.arcTo(x, y - height, x, y, radius);
  path.arcTo(x, y, x + width, y, radius);
  path.closePath();
}
