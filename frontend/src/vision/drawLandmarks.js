// Canvas drawing for on-device landmarks. Coordinates are normalized (0–1),
// so the overlay canvas is sized to the video's native resolution and then
// scaled by CSS exactly like the <video> (object-cover), keeping them aligned.
import { POSE_BODY_CONNECTIONS, POSE_BODY_POINTS, POSE_INDEX, HAND_CONNECTIONS } from './landmarks.js';

const ACCENT = '#00E5FF';
const VISIBLE = 0.5;

/** Resize the canvas to the video's resolution (if needed) and clear it. */
export function prepareCanvas(canvas, width, height) {
  if (!canvas || !width || !height) return null;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  return ctx;
}

/**
 * Draw the body skeleton. `highlight` is the [a, b, c] landmark names being
 * measured (drawn bolder so the user sees which joint is scored).
 */
export function drawPose(ctx, landmarks, highlight = []) {
  if (!ctx || !landmarks) return;
  const { width: w, height: h } = ctx.canvas;
  const unit = Math.max(1.5, Math.min(w, h) / 240); // scale strokes with resolution
  const vis = (i) => (landmarks[i]?.visibility ?? 1) >= VISIBLE;

  ctx.lineCap = 'round';
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = unit * 1.5;
  ctx.globalAlpha = 0.9;
  for (const [i, j] of POSE_BODY_CONNECTIONS) {
    if (!vis(i) || !vis(j)) continue;
    ctx.beginPath();
    ctx.moveTo(landmarks[i].x * w, landmarks[i].y * h);
    ctx.lineTo(landmarks[j].x * w, landmarks[j].y * h);
    ctx.stroke();
  }

  ctx.fillStyle = '#FFFFFF';
  for (const i of POSE_BODY_POINTS) {
    if (!vis(i)) continue;
    ctx.beginPath();
    ctx.arc(landmarks[i].x * w, landmarks[i].y * h, unit * 1.6, 0, 2 * Math.PI);
    ctx.fill();
  }

  // The measured joint chain, emphasised.
  const ids = highlight.map((n) => POSE_INDEX[n]).filter((i) => i != null);
  if (ids.length === 3 && ids.every(vis)) {
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = unit * 2.4;
    ctx.beginPath();
    ctx.moveTo(landmarks[ids[0]].x * w, landmarks[ids[0]].y * h);
    ctx.lineTo(landmarks[ids[1]].x * w, landmarks[ids[1]].y * h);
    ctx.lineTo(landmarks[ids[2]].x * w, landmarks[ids[2]].y * h);
    ctx.stroke();
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(landmarks[ids[1]].x * w, landmarks[ids[1]].y * h, unit * 3.2, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Draw up to two hands (21 landmarks each). */
export function drawHands(ctx, hands) {
  if (!ctx) return;
  const { width: w, height: h } = ctx.canvas;
  const unit = Math.max(1.2, Math.min(w, h) / 300);
  ctx.lineCap = 'round';
  for (const { landmarks } of hands) {
    if (!landmarks || landmarks.length < 21) continue;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = unit * 1.5;
    for (const [i, j] of HAND_CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(landmarks[i].x * w, landmarks[i].y * h);
      ctx.lineTo(landmarks[j].x * w, landmarks[j].y * h);
      ctx.stroke();
    }
    ctx.fillStyle = '#FFFFFF';
    for (const p of landmarks) {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, unit * 1.4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}
