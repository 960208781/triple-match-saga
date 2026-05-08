/**
 * 糖果精灵绘制模块
 * 主题1：糖果乐园（关卡1-20）
 * 6种糖果精灵：红/橙/黄/绿/蓝/紫
 */

(function() {
  'use strict';
  
  // 糖果颜色配置
  const candyColors = {
    red: { main: '#FF4757', light: '#FF6B7A', dark: '#CC3A47', shine: '#FFB8C0' },
    orange: { main: '#FF9F43', light: '#FFB976', dark: '#CC7F36', shine: '#FFD9B3' },
    yellow: { main: '#FFD32A', light: '#FFE066', dark: '#CCB022', shine: '#FFF0B3' },
    green: { main: '#26DE81', light: '#5AE89E', dark: '#1EB268', shine: '#A8F5C9' },
    blue: { main: '#45AAF2', light: '#70BDF5', dark: '#3791C2', shine: '#A3D4FA' },
    purple: { main: '#A55EEA', light: '#BB7FEE', dark: '#874CBB', shine: '#D4B3F5' }
  };
  
  // 糖果类型
  const candyTypes = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
  
  // 绘制单个糖果
  function drawCandy(ctx, x, y, size, type, options = {}) {
    const colors = candyColors[type] || candyColors.red;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    
    ctx.save();
    
    // 应用缩放和透明度动画
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制糖果主体（圆形）
    const gradient = ctx.createRadialGradient(
      centerX - size * 0.15, centerY - size * 0.15, 0,
      centerX, centerY, halfSize
    );
    gradient.addColorStop(0, colors.light);
    gradient.addColorStop(0.5, colors.main);
    gradient.addColorStop(1, colors.dark);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 0.85, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制高光
    ctx.fillStyle = colors.shine;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(
      centerX - size * 0.15,
      centerY - size * 0.15,
      halfSize * 0.35,
      halfSize * 0.25,
      -Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // 绘制小高光点
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(centerX - size * 0.1, centerY - size * 0.25, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制条纹糖果
  function drawStripedCandy(ctx, x, y, size, type, direction = 'horizontal') {
    const colors = candyColors[type] || candyColors.red;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    
    ctx.save();
    
    // 绘制基础糖果
    drawCandy(ctx, x, y, size, type);
    
    // 绘制条纹
    ctx.globalCompositeOperation = 'overlay';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    
    if (direction === 'horizontal') {
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x, centerY + i * 6);
        ctx.lineTo(x + size, centerY + i * 6);
        ctx.stroke();
      }
    } else {
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + i * 6, y);
        ctx.lineTo(centerX + i * 6, y + size);
        ctx.stroke();
      }
    }
    
    // 绘制方向箭头
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    
    const arrowSize = size * 0.2;
    ctx.beginPath();
    if (direction === 'horizontal') {
      ctx.moveTo(centerX - arrowSize, centerY);
      ctx.lineTo(centerX, centerY - arrowSize * 0.6);
      ctx.lineTo(centerX + arrowSize, centerY);
      ctx.lineTo(centerX, centerY + arrowSize * 0.6);
    } else {
      ctx.moveTo(centerX, centerY - arrowSize);
      ctx.lineTo(centerX - arrowSize * 0.6, centerY);
      ctx.lineTo(centerX, centerY + arrowSize);
      ctx.lineTo(centerX + arrowSize * 0.6, centerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
  
  // 绘制包装糖果
  function drawWrappedCandy(ctx, x, y, size, type) {
    const colors = candyColors[type] || candyColors.red;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    
    ctx.save();
    
    // 绘制基础糖果
    drawCandy(ctx, x, y, size, type);
    
    // 绘制包装纸效果
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    
    // 左边包装
    ctx.beginPath();
    ctx.moveTo(x + size * 0.15, centerY);
    ctx.lineTo(x - size * 0.1, centerY - size * 0.15);
    ctx.lineTo(x - size * 0.1, centerY + size * 0.15);
    ctx.closePath();
    ctx.fillStyle = colors.light;
    ctx.fill();
    ctx.stroke();
    
    // 右边包装
    ctx.beginPath();
    ctx.moveTo(x + size * 0.85, centerY);
    ctx.lineTo(x + size * 1.1, centerY - size * 0.15);
    ctx.lineTo(x + size * 1.1, centerY + size * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 中心包装线
    ctx.beginPath();
    ctx.moveTo(x + size * 0.15, centerY - halfSize * 0.7);
    ctx.lineTo(x + size * 0.15, centerY + halfSize * 0.7);
    ctx.moveTo(x + size * 0.85, centerY - halfSize * 0.7);
    ctx.lineTo(x + size * 0.85, centerY + halfSize * 0.7);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // 绘制彩色炸弹糖果
  function drawColorBomb(ctx, x, y, size) {
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    
    ctx.save();
    
    // 绘制黑色底色
    const gradient = ctx.createRadialGradient(
      centerX - size * 0.1, centerY - size * 0.1, 0,
      centerX, centerY, halfSize
    );
    gradient.addColorStop(0, '#4A4A4A');
    gradient.addColorStop(0.7, '#2A2A2A');
    gradient.addColorStop(1, '#1A1A1A');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 0.85, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制彩虹条纹
    const rainbowColors = ['#FF4757', '#FF9F43', '#FFD32A', '#26DE81', '#45AAF2', '#A55EEA'];
    const stripeCount = rainbowColors.length;
    const stripeAngle = (Math.PI * 2) / stripeCount;
    
    rainbowColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, halfSize * 0.6, i * stripeAngle, (i + 0.5) * stripeAngle);
      ctx.closePath();
      ctx.fill();
    });
    
    // 中心圆
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX - size * 0.1, centerY - size * 0.15, halfSize * 0.25, halfSize * 0.15, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制金色糖果（彩蛋）
  function drawGoldenCandy(ctx, x, y, size) {
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    
    ctx.save();
    
    // 金色渐变
    const gradient = ctx.createRadialGradient(
      centerX - size * 0.15, centerY - size * 0.15, 0,
      centerX, centerY, halfSize
    );
    gradient.addColorStop(0, '#FFF8DC');
    gradient.addColorStop(0.3, '#FFD700');
    gradient.addColorStop(0.7, '#DAA520');
    gradient.addColorStop(1, '#B8860B');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 0.85, 0, Math.PI * 2);
    ctx.fill();
    
    // 闪光效果
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 0.85, 0, Math.PI * 2);
    ctx.stroke();
    
    // 星星装饰
    ctx.fillStyle = '#FFFFFF';
    drawStar(ctx, centerX, centerY, 5, size * 0.15, size * 0.07);
    
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(centerX - size * 0.15, centerY - size * 0.15, halfSize * 0.35, halfSize * 0.25, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制星星
  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;
    
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      let px = cx + Math.cos(rot) * outerRadius;
      let py = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(px, py);
      rot += step;
      
      px = cx + Math.cos(rot) * innerRadius;
      py = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(px, py);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
  
  // 预渲染糖果到离屏Canvas
  const candyCache = {};
  
  function prerenderCandies(size = 48) {
    candyTypes.forEach(type => {
      // 普通糖果
      const normalCanvas = document.createElement('canvas') || 
        (typeof wx !== 'undefined' && wx.createOffscreenCanvas(size, size));
      normalCanvas.width = size;
      normalCanvas.height = size;
      const normalCtx = normalCanvas.getContext('2d');
      drawCandy(normalCtx, 0, 0, size, type);
      candyCache[`${type}_normal`] = normalCanvas;
      
      // 水平条纹糖果
      const hStripedCanvas = document.createElement('canvas') || 
        (typeof wx !== 'undefined' && wx.createOffscreenCanvas(size, size));
      hStripedCanvas.width = size;
      hStripedCanvas.height = size;
      const hStripedCtx = hStripedCanvas.getContext('2d');
      drawStripedCandy(hStripedCtx, 0, 0, size, type, 'horizontal');
      candyCache[`${type}_hstriped`] = hStripedCanvas;
      
      // 垂直条纹糖果
      const vStripedCanvas = document.createElement('canvas') || 
        (typeof wx !== 'undefined' && wx.createOffscreenCanvas(size, size));
      vStripedCanvas.width = size;
      vStripedCanvas.height = size;
      const vStripedCtx = vStripedCanvas.getContext('2d');
      drawStripedCandy(vStripedCtx, 0, 0, size, type, 'vertical');
      candyCache[`${type}_vstriped`] = vStripedCanvas;
      
      // 包装糖果
      const wrappedCanvas = document.createElement('canvas') || 
        (typeof wx !== 'undefined' && wx.createOffscreenCanvas(size, size));
      wrappedCanvas.width = size;
      wrappedCanvas.height = size;
      const wrappedCtx = wrappedCanvas.getContext('2d');
      drawWrappedCandy(wrappedCtx, 0, 0, size, type);
      candyCache[`${type}_wrapped`] = wrappedCanvas;
    });
    
    // 彩色炸弹
    const bombCanvas = document.createElement('canvas') || 
      (typeof wx !== 'undefined' && wx.createOffscreenCanvas(size, size));
    bombCanvas.width = size;
    bombCanvas.height = size;
    const bombCtx = bombCanvas.getContext('2d');
    drawColorBomb(bombCtx, 0, 0, size);
    candyCache['colorBomb'] = bombCanvas;
    
    // 金色糖果
    const goldenCanvas = document.createElement('canvas') || 
      (typeof wx !== 'undefined' && wx.createOffscreenCanvas(size, size));
    goldenCanvas.width = size;
    goldenCanvas.height = size;
    const goldenCtx = goldenCanvas.getContext('2d');
    drawGoldenCandy(goldenCtx, 0, 0, size);
    candyCache['golden'] = goldenCanvas;
  }
  
  // 获取缓存的糖果图像
  function getCandyImage(type, variant = 'normal') {
    const key = variant === 'colorBomb' ? 'colorBomb' : 
                variant === 'golden' ? 'golden' :
                `${type}_${variant}`;
    return candyCache[key];
  }
  
  // 导出全局API
  window.Candy = {
    types: candyTypes,
    colors: candyColors,
    draw: drawCandy,
    drawStriped: drawStripedCandy,
    drawWrapped: drawWrappedCandy,
    drawColorBomb,
    drawGolden: drawGoldenCandy,
    prerender: prerenderCandies,
    getImage: getCandyImage
  };
  
})();
