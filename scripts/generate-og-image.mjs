import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

const WIDTH = 1200;
const HEIGHT = 630;
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// Background gradient
const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
bgGrad.addColorStop(0, '#1a0000');
bgGrad.addColorStop(0.3, '#3d0c0c');
bgGrad.addColorStop(0.6, '#8b0000');
bgGrad.addColorStop(1, '#cc3300');
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Radial glow center
const glow = ctx.createRadialGradient(600, 315, 0, 600, 315, 500);
glow.addColorStop(0, 'rgba(139, 0, 0, 0.5)');
glow.addColorStop(1, 'transparent');
ctx.fillStyle = glow;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Radial glow top-left
const glow2 = ctx.createRadialGradient(180, 160, 0, 180, 160, 300);
glow2.addColorStop(0, 'rgba(255, 170, 0, 0.08)');
glow2.addColorStop(1, 'transparent');
ctx.fillStyle = glow2;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Radial glow bottom-right
const glow3 = ctx.createRadialGradient(1020, 470, 0, 1020, 470, 300);
glow3.addColorStop(0, 'rgba(255, 170, 0, 0.08)');
glow3.addColorStop(1, 'transparent');
ctx.fillStyle = glow3;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Gold border frame
ctx.strokeStyle = '#ffd700';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.roundRect(12, 12, WIDTH - 24, HEIGHT - 24, 12);
ctx.stroke();

// Inner border
ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.roundRect(20, 20, WIDTH - 40, HEIGHT - 40, 8);
ctx.stroke();

// Corner ornaments
function drawCorner(x, y, dx, dy) {
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + dy * 50);
  ctx.lineTo(x, y);
  ctx.lineTo(x + dx * 50, y);
  ctx.stroke();
}
drawCorner(32, 32, 1, 1);
drawCorner(WIDTH - 32, 32, -1, 1);
drawCorner(32, HEIGHT - 32, 1, -1);
drawCorner(WIDTH - 32, HEIGHT - 32, -1, -1);

// Sparkles
function drawSparkle(x, y, size) {
  const sparkGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
  sparkGrad.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
  sparkGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)');
  sparkGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sparkGrad;
  ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);
  
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}
drawSparkle(150, 80, 3);
drawSparkle(1000, 120, 2.5);
drawSparkle(300, 530, 2);
drawSparkle(950, 500, 3);
drawSparkle(100, 300, 2);
drawSparkle(1100, 350, 2.5);
drawSparkle(500, 100, 1.5);
drawSparkle(700, 550, 1.5);

// Year badge
const badgeText = '丙午馬年 2026';
ctx.font = 'bold 22px "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
const badgeMetrics = ctx.measureText(badgeText);
const badgeW = badgeMetrics.width + 64;
const badgeH = 44;
const badgeX = (WIDTH - badgeW) / 2;
const badgeY = 120;

const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
badgeGrad.addColorStop(0, '#ffd700');
badgeGrad.addColorStop(1, '#ffaa00');
ctx.fillStyle = badgeGrad;
ctx.beginPath();
ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 22);
ctx.fill();

ctx.fillStyle = '#8b0000';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(badgeText, WIDTH / 2, badgeY + badgeH / 2);

// Horse emoji placeholder — draw a decorative "馬" character
ctx.font = 'bold 72px "PingFang TC", "Noto Sans TC", serif';
const horseGrad = ctx.createLinearGradient(0, 190, 0, 270);
horseGrad.addColorStop(0, '#fff9e6');
horseGrad.addColorStop(0.4, '#ffd700');
horseGrad.addColorStop(1, '#ffaa00');
ctx.fillStyle = horseGrad;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('🐎', WIDTH / 2, 220);

// Title: 媽祖靈感開壇
ctx.font = 'bold 64px "PingFang TC", "Noto Serif TC", "Microsoft JhengHei", serif';
const titleGrad = ctx.createLinearGradient(0, 280, 0, 360);
titleGrad.addColorStop(0, '#fff9e6');
titleGrad.addColorStop(0.4, '#ffd700');
titleGrad.addColorStop(1, '#ffaa00');
ctx.fillStyle = titleGrad;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Shadow for title
ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
ctx.shadowBlur = 20;
ctx.fillText('媽祖靈感開壇', WIDTH / 2, 320);
ctx.shadowBlur = 0;

// Subtitle: 互動抽獎系統
ctx.font = 'bold 36px "PingFang TC", "Noto Sans TC", sans-serif';
ctx.fillStyle = '#ffd700';
ctx.shadowColor = 'rgba(255, 215, 0, 0.4)';
ctx.shadowBlur = 10;
ctx.fillText('互動抽獎系統', WIDTH / 2, 385);
ctx.shadowBlur = 0;

// Divider line
const divGrad = ctx.createLinearGradient(400, 0, 800, 0);
divGrad.addColorStop(0, 'transparent');
divGrad.addColorStop(0.5, '#ffd700');
divGrad.addColorStop(1, 'transparent');
ctx.strokeStyle = divGrad;
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(400, 425);
ctx.lineTo(800, 425);
ctx.stroke();

// Feature tags
const features = ['🔥 五行命理加權', '🎴 卡牌揭曉動畫', '🏮 廟會風格 UI'];
ctx.font = '18px "PingFang TC", "Noto Sans TC", sans-serif';

const tagGap = 40;
const tagPadX = 20;
const tagPadY = 8;
const tagMetrics = features.map(f => ctx.measureText(f));
const totalTagW = tagMetrics.reduce((sum, m) => sum + m.width + tagPadX * 2, 0) + tagGap * (features.length - 1);
let tagStartX = (WIDTH - totalTagW) / 2;

features.forEach((feat, i) => {
  const tw = tagMetrics[i].width + tagPadX * 2;
  const th = 36;
  const ty = 460;

  // Tag background
  ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(tagStartX, ty, tw, th, 18);
  ctx.fill();
  ctx.stroke();

  // Tag text
  ctx.fillStyle = 'rgba(255, 215, 0, 0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(feat, tagStartX + tw / 2, ty + th / 2);

  tagStartX += tw + tagGap;
});

// Bottom watermark
ctx.font = '14px "PingFang TC", sans-serif';
ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
ctx.textAlign = 'center';
ctx.fillText('React 19 + Vite + Framer Motion', WIDTH / 2, HEIGHT - 50);

// Export
const buffer = canvas.toBuffer('image/png');
writeFileSync('public/og-image.png', buffer);
console.log('✅ OG image generated: public/og-image.png (1200x630)');
