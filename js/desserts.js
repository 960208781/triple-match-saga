/**
 * 甜点精灵绘制模块
 * 主题3：甜蜜工坊（关卡41-60）
 * 6种甜点：蛋糕/甜甜圈/马卡龙/冰淇淋/饼干/布丁
 */

(function() {
  'use strict';
  
  // 甜点类型
  const dessertTypes = ['cake', 'donut', 'macaron', 'icecream', 'cookie', 'pudding'];
  
  // 甜点颜色配置
  const dessertColors = {
    cake: { 
      base: '#FFB6C1', 
      cream: '#FFFFFF', 
      cherry: '#FF4757',
      plate: '#DEB887'
    },
    donut: { 
      base: '#D2691E', 
      frosting: '#FF69B4', 
      sprinkles: ['#FFD700', '#FF4500', '#00CED1', '#32CD32', '#FF69B4']
    },
    macaron: { 
      top: '#FFB6C1', 
      bottom: '#FFB6C1', 
      filling: '#FF69B4'
    },
    icecream: { 
      cone: '#DEB887', 
      scoop1: '#FFB6C1', 
      scoop2: '#87CEEB',
      scoop3: '#98FB98'
    },
    cookie: { 
      base: '#D2691E', 
      chips: '#4A3728',
      highlight: '#E8A45C'
    },
    pudding: { 
      base: '#FFD700', 
      caramel: '#8B4513',
      highlight: '#FFF8DC'
    }
  };
  
  // 绘制蛋糕
  function drawCake(ctx, x, y, size, options = {}) {
    const colors = dessertColors.cake;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    const baseSize = size * 0.7;
    
    ctx.save();
    
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制盘子
    ctx.fillStyle = colors.plate;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + halfSize * 0.6, halfSize * 0.85, halfSize * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制蛋糕底层
    const cakeGradient = ctx.createLinearGradient(centerX - halfSize * 0.6, centerY, centerX + halfSize * 0.6, centerY);
    cakeGradient.addColorStop(0, '#FF9AA2');
    cakeGradient.addColorStop(0.5, colors.base);
    cakeGradient.addColorStop(1, '#FF9AA2');
    
    ctx.fillStyle = cakeGradient;
    ctx.beginPath();
    ctx.moveTo(centerX - halfSize * 0.55, centerY + halfSize * 0.4);
    ctx.lineTo(centerX - halfSize * 0.55, centerY - halfSize * 0.1);
    ctx.quadraticCurveTo(centerX - halfSize * 0.55, centerY - halfSize * 0.2, centerX - halfSize * 0.45, centerY - halfSize * 0.2);
    ctx.lineTo(centerX + halfSize * 0.45, centerY - halfSize * 0.2);
    ctx.quadraticCurveTo(centerX + halfSize * 0.55, centerY - halfSize * 0.2, centerX + halfSize * 0.55, centerY - halfSize * 0.1);
    ctx.lineTo(centerX + halfSize * 0.55, centerY + halfSize * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // 绘制奶油层
    ctx.fillStyle = colors.cream;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - halfSize * 0.2, halfSize * 0.5, halfSize * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制奶油装饰
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const bx = centerX + Math.cos(angle) * halfSize * 0.35;
      const by = centerY - halfSize * 0.35;
      ctx.fillStyle = colors.cream;
      ctx.beginPath();
      ctx.arc(bx, by, halfSize * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 绘制樱桃
    ctx.fillStyle = colors.cherry;
    ctx.beginPath();
    ctx.arc(centerX, centerY - halfSize * 0.45, halfSize * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // 樱桃高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(centerX - halfSize * 0.04, centerY - halfSize * 0.5, halfSize * 0.04, 0, Math.PI * 2);
    ctx.fill();
    
    // 樱桃茎
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - halfSize * 0.57);
    ctx.quadraticCurveTo(centerX + halfSize * 0.1, centerY - halfSize * 0.7, centerX + halfSize * 0.05, centerY - halfSize * 0.75);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // 绘制甜甜圈
  function drawDonut(ctx, x, y, size, options = {}) {
    const colors = dessertColors.donut;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    
    ctx.save();
    
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制甜甜圈主体
    ctx.fillStyle = colors.base;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // 中心孔
    ctx.fillStyle = '#1A1A1A'; // 背景色
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制糖霜
    ctx.fillStyle = colors.frosting;
    ctx.beginPath();
    ctx.arc(centerX, centerY - halfSize * 0.05, halfSize * 0.65, 0, Math.PI * 2);
    ctx.fill();
    
    // 糖霜边缘波浪
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制糖屑
    colors.sprinkles.forEach((color, i) => {
      const angle = (i / colors.sprinkles.length) * Math.PI * 2;
      const dist = halfSize * (0.35 + (i % 2) * 0.15);
      const sx = centerX + Math.cos(angle) * dist;
      const sy = centerY - halfSize * 0.05 + Math.sin(angle) * dist * 0.5;
      
      ctx.fillStyle = color;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle + i * 0.5);
      ctx.fillRect(-halfSize * 0.06, -halfSize * 0.02, halfSize * 0.12, halfSize * 0.04);
      ctx.restore();
    });
    
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX - halfSize * 0.2, centerY - halfSize * 0.35, halfSize * 0.2, halfSize * 0.1, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制马卡龙
  function drawMacaron(ctx, x, y, size, options = {}) {
    const colors = dessertColors.macaron;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    
    ctx.save();
    
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制下半部分
    ctx.fillStyle = colors.bottom;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + halfSize * 0.15, halfSize * 0.55, halfSize * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 下半部分侧面
    ctx.fillStyle = '#E8A0B0';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + halfSize * 0.2, halfSize * 0.55, halfSize * 0.15, 0, 0, Math.PI);
    ctx.fill();
    
    // 绘制夹心
    ctx.fillStyle = colors.filling;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, halfSize * 0.5, halfSize * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 夹心溢出效果
    ctx.beginPath();
    ctx.ellipse(centerX - halfSize * 0.4, centerY, halfSize * 0.08, halfSize * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + halfSize * 0.4, centerY, halfSize * 0.08, halfSize * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制上半部分
    ctx.fillStyle = colors.top;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - halfSize * 0.15, halfSize * 0.55, halfSize * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 上半部分高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(centerX - halfSize * 0.15, centerY - halfSize * 0.25, halfSize * 0.25, halfSize * 0.1, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 顶部小高光点
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(centerX - halfSize * 0.25, centerY - halfSize * 0.3, halfSize * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制冰淇淋
  function drawIcecream(ctx, x, y, size, options = {}) {
    const colors = dessertColors.icecream;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    
    ctx.save();
    
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制蛋筒
    const coneGradient = ctx.createLinearGradient(centerX - halfSize * 0.3, centerY, centerX + halfSize * 0.3, centerY);
    coneGradient.addColorStop(0, '#C4A060');
    coneGradient.addColorStop(0.5, colors.cone);
    coneGradient.addColorStop(1, '#C4A060');
    
    ctx.fillStyle = coneGradient;
    ctx.beginPath();
    ctx.moveTo(centerX - halfSize * 0.3, centerY + halfSize * 0.1);
    ctx.lineTo(centerX, centerY + halfSize * 0.75);
    ctx.lineTo(centerX + halfSize * 0.3, centerY + halfSize * 0.1);
    ctx.closePath();
    ctx.fill();
    
    // 蛋筒网格
    ctx.strokeStyle = 'rgba(139, 90, 43, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const yOffset = halfSize * (0.2 + i * 0.15);
      const xWidth = halfSize * (0.25 - i * 0.05);
      ctx.beginPath();
      ctx.moveTo(centerX - xWidth, centerY + yOffset);
      ctx.lineTo(centerX + xWidth, centerY + yOffset);
      ctx.stroke();
    }
    // 斜线
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX - halfSize * 0.25 + i * halfSize * 0.15, centerY + halfSize * 0.2);
      ctx.lineTo(centerX - halfSize * 0.15 + i * halfSize * 0.15, centerY + halfSize * 0.65);
      ctx.stroke();
    }
    
    // 绘制冰淇淋球
    // 第三个球（底部）
    ctx.fillStyle = colors.scoop3;
    ctx.beginPath();
    ctx.arc(centerX, centerY + halfSize * 0.05, halfSize * 0.28, 0, Math.PI * 2);
    ctx.fill();
    
    // 第二个球
    ctx.fillStyle = colors.scoop2;
    ctx.beginPath();
    ctx.arc(centerX - halfSize * 0.08, centerY - halfSize * 0.2, halfSize * 0.26, 0, Math.PI * 2);
    ctx.fill();
    
    // 第一个球（顶部）
    ctx.fillStyle = colors.scoop1;
    ctx.beginPath();
    ctx.arc(centerX + halfSize * 0.05, centerY - halfSize * 0.42, halfSize * 0.24, 0, Math.PI * 2);
    ctx.fill();
    
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(centerX - halfSize * 0.02, centerY - halfSize * 0.5, halfSize * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX - halfSize * 0.15, centerY - halfSize * 0.28, halfSize * 0.06, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制饼干
  function drawCookie(ctx, x, y, size, options = {}) {
    const colors = dessertColors.cookie;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    
    ctx.save();
    
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制饼干主体
    const cookieGradient = ctx.createRadialGradient(
      centerX - halfSize * 0.2, centerY - halfSize * 0.2, 0,
      centerX, centerY, halfSize * 0.7
    );
    cookieGradient.addColorStop(0, colors.highlight);
    cookieGradient.addColorStop(0.7, colors.base);
    cookieGradient.addColorStop(1, '#A0522D');
    
    ctx.fillStyle = cookieGradient;
    ctx.beginPath();
    // 不规则圆形边缘
    const points = 12;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const r = halfSize * (0.6 + Math.sin(angle * 3) * 0.05);
      const px = centerX + Math.cos(angle) * r;
      const py = centerY + Math.sin(angle) * r;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    // 绘制巧克力碎片
    const chipPositions = [
      { x: -0.2, y: -0.2 },
      { x: 0.15, y: -0.25 },
      { x: 0.25, y: 0.1 },
      { x: -0.1, y: 0.2 },
      { x: -0.3, y: 0.05 },
      { x: 0.05, y: 0.3 },
      { x: 0.3, y: -0.15 }
    ];
    
    ctx.fillStyle = colors.chips;
    chipPositions.forEach(pos => {
      ctx.beginPath();
      ctx.ellipse(
        centerX + pos.x * halfSize,
        centerY + pos.y * halfSize,
        halfSize * 0.08,
        halfSize * 0.06,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.ellipse(centerX - halfSize * 0.15, centerY - halfSize * 0.15, halfSize * 0.2, halfSize * 0.12, -0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制布丁
  function drawPudding(ctx, x, y, size, options = {}) {
    const colors = dessertColors.pudding;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    
    ctx.save();
    
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制布丁主体
    const puddingGradient = ctx.createLinearGradient(centerX, centerY - halfSize * 0.5, centerX, centerY + halfSize * 0.5);
    puddingGradient.addColorStop(0, colors.highlight);
    puddingGradient.addColorStop(0.5, colors.base);
    puddingGradient.addColorStop(1, '#DAA520');
    
    ctx.fillStyle = puddingGradient;
    ctx.beginPath();
    ctx.moveTo(centerX - halfSize * 0.45, centerY + halfSize * 0.35);
    ctx.quadraticCurveTo(centerX - halfSize * 0.5, centerY - halfSize * 0.1, centerX - halfSize * 0.35, centerY - halfSize * 0.35);
    ctx.quadraticCurveTo(centerX, centerY - halfSize * 0.45, centerX + halfSize * 0.35, centerY - halfSize * 0.35);
    ctx.quadraticCurveTo(centerX + halfSize * 0.5, centerY - halfSize * 0.1, centerX + halfSize * 0.45, centerY + halfSize * 0.35);
    ctx.closePath();
    ctx.fill();
    
    // 绘制焦糖酱
    ctx.fillStyle = colors.caramel;
    ctx.beginPath();
    ctx.moveTo(centerX - halfSize * 0.35, centerY - halfSize * 0.3);
    ctx.quadraticCurveTo(centerX, centerY - halfSize * 0.4, centerX + halfSize * 0.35, centerY - halfSize * 0.3);
    ctx.quadraticCurveTo(centerX + halfSize * 0.3, centerY - halfSize * 0.1, centerX, centerY - halfSize * 0.15);
    ctx.quadraticCurveTo(centerX - halfSize * 0.3, centerY - halfSize * 0.1, centerX - halfSize * 0.35, centerY - halfSize * 0.3);
    ctx.fill();
    
    // 焦糖滴落效果
    ctx.beginPath();
    ctx.moveTo(centerX - halfSize * 0.1, centerY - halfSize * 0.15);
    ctx.quadraticCurveTo(centerX - halfSize * 0.15, centerY + halfSize * 0.1, centerX - halfSize * 0.08, centerY + halfSize * 0.2);
    ctx.quadraticCurveTo(centerX - halfSize * 0.05, centerY + halfSize * 0.25, centerX, centerY + halfSize * 0.2);
    ctx.quadraticCurveTo(centerX + halfSize * 0.05, centerY + halfSize * 0.1, centerX, centerY - halfSize * 0.1);
    ctx.fill();
    
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(centerX - halfSize * 0.15, centerY - halfSize * 0.25, halfSize * 0.12, halfSize * 0.06, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制函数映射
  const drawFunctions = {
    cake: drawCake,
    donut: drawDonut,
    macaron: drawMacaron,
    icecream: drawIcecream,
    cookie: drawCookie,
    pudding: drawPudding
  };
  
  // 通用绘制函数
  function drawDessert(ctx, x, y, size, type, options = {}) {
    const drawFn = drawFunctions[type] || drawCake;
    drawFn(ctx, x, y, size, options);
  }
  
  // 绘制金色甜点（彩蛋）
  function drawGoldenDessert(ctx, x, y, size, type, options = {}) {
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    
    ctx.save();
    
    // 金色光晕
    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, halfSize * 1.2);
    glow.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制甜点
    ctx.filter = 'sepia(50%) saturate(200%) hue-rotate(-10deg)';
    drawDessert(ctx, x, y, size, type, options);
    ctx.filter = 'none';
    
    // 金色边框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // 预渲染甜点到离屏Canvas
  const dessertCache = {};
  
  function prerenderDesserts(size = 48) {
    dessertTypes.forEach(type => {
      const canvas = document.createElement('canvas') || 
        (typeof wx !== 'undefined' && wx.createOffscreenCanvas(size, size));
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      drawDessert(ctx, 0, 0, size, type);
      dessertCache[type] = canvas;
    });
  }
  
  // 获取缓存的甜点图像
  function getDessertImage(type) {
    return dessertCache[type];
  }
  
  // 导出全局API
  window.Desserts = {
    types: dessertTypes,
    colors: dessertColors,
    draw: drawDessert,
    drawGolden: drawGoldenDessert,
    prerender: prerenderDesserts,
    getImage: getDessertImage
  };
  
})();
