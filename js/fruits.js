/**
 * 水果精灵绘制模块
 * 主题4：水果派对（关卡61-80）
 * 6种水果：草莓/橙子/柠檬/苹果/葡萄/西瓜
 */

(function() {
  'use strict';
  
  // 水果类型
  const fruitTypes = ['strawberry', 'orange', 'lemon', 'apple', 'grape', 'watermelon'];
  
  // 水果颜色配置
  const fruitColors = {
    strawberry: { 
      body: '#FF4757', 
      light: '#FF6B7A', 
      dark: '#CC3A47',
      seeds: '#FFD700',
      leaf: '#32CD32'
    },
    orange: { 
      body: '#FF9F43', 
      light: '#FFB976', 
      dark: '#CC7F36',
      segment: '#FFD700'
    },
    lemon: { 
      body: '#FFD32A', 
      light: '#FFE066', 
      dark: '#CCB022',
      inner: '#FFF8DC'
    },
    apple: { 
      body: '#FF4757', 
      light: '#FF6B7A', 
      dark: '#CC3A47',
      leaf: '#32CD32',
      stem: '#8B4513'
    },
    grape: { 
      body: '#9370DB', 
      light: '#B19CD9', 
      dark: '#7B5CB0',
      highlight: '#D4B3F5'
    },
    watermelon: { 
      rind: '#32CD32', 
      rindDark: '#228B22',
      flesh: '#FF6B6B',
      seeds: '#1A1A1A'
    }
  };
  
  // 绘制草莓
  function drawStrawberry(ctx, x, y, size, options = {}) {
    const colors = fruitColors.strawberry;
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
    
    // 绘制叶子
    ctx.fillStyle = colors.leaf;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - halfSize * 0.35);
      ctx.quadraticCurveTo(
        centerX + Math.cos(angle) * halfSize * 0.3,
        centerY - halfSize * 0.45,
        centerX + Math.cos(angle) * halfSize * 0.25,
        centerY - halfSize * 0.55
      );
      ctx.quadraticCurveTo(
        centerX + Math.cos(angle) * halfSize * 0.15,
        centerY - halfSize * 0.45,
        centerX,
        centerY - halfSize * 0.35
      );
      ctx.fill();
    }
    
    // 绘制草莓主体（心形）
    const gradient = ctx.createRadialGradient(
      centerX - halfSize * 0.15, centerY - halfSize * 0.15, 0,
      centerX, centerY, halfSize * 0.7
    );
    gradient.addColorStop(0, colors.light);
    gradient.addColorStop(0.7, colors.body);
    gradient.addColorStop(1, colors.dark);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + halfSize * 0.65);
    ctx.bezierCurveTo(
      centerX - halfSize * 0.6, centerY + halfSize * 0.3,
      centerX - halfSize * 0.55, centerY - halfSize * 0.3,
      centerX, centerY - halfSize * 0.25
    );
    ctx.bezierCurveTo(
      centerX + halfSize * 0.55, centerY - halfSize * 0.3,
      centerX + halfSize * 0.6, centerY + halfSize * 0.3,
      centerX, centerY + halfSize * 0.65
    );
    ctx.fill();
    
    // 绘制种子
    const seedPositions = [
      { x: 0, y: 0.1 },
      { x: -0.15, y: 0.2 },
      { x: 0.15, y: 0.2 },
      { x: -0.1, y: 0.35 },
      { x: 0.1, y: 0.35 },
      { x: 0, y: 0.45 },
      { x: -0.2, y: 0.05 },
      { x: 0.2, y: 0.05 }
    ];
    
    ctx.fillStyle = colors.seeds;
    seedPositions.forEach(pos => {
      ctx.beginPath();
      ctx.ellipse(
        centerX + pos.x * halfSize,
        centerY + pos.y * halfSize,
        halfSize * 0.03,
        halfSize * 0.02,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX - halfSize * 0.15, centerY - halfSize * 0.1, halfSize * 0.15, halfSize * 0.1, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制橙子
  function drawOrange(ctx, x, y, size, options = {}) {
    const colors = fruitColors.orange;
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
    
    // 绘制橙子主体
    const gradient = ctx.createRadialGradient(
      centerX - halfSize * 0.2, centerY - halfSize * 0.2, 0,
      centerX, centerY, halfSize * 0.7
    );
    gradient.addColorStop(0, colors.light);
    gradient.addColorStop(0.6, colors.body);
    gradient.addColorStop(1, colors.dark);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 0.65, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制橙子纹理（小圆点）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * halfSize * 0.55;
      ctx.beginPath();
      ctx.arc(
        centerX + Math.cos(angle) * dist,
        centerY + Math.sin(angle) * dist,
        halfSize * 0.02,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // 绘制叶子
    ctx.fillStyle = colors.leaf || '#32CD32';
    ctx.beginPath();
    ctx.ellipse(centerX + halfSize * 0.15, centerY - halfSize * 0.6, halfSize * 0.15, halfSize * 0.08, 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制茎
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - halfSize * 0.55, halfSize * 0.04, halfSize * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(centerX - halfSize * 0.2, centerY - halfSize * 0.2, halfSize * 0.2, halfSize * 0.12, -0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制柠檬
  function drawLemon(ctx, x, y, size, options = {}) {
    const colors = fruitColors.lemon;
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
    
    // 绘制柠檬主体（椭圆形）
    const gradient = ctx.createRadialGradient(
      centerX - halfSize * 0.2, centerY - halfSize * 0.15, 0,
      centerX, centerY, halfSize * 0.7
    );
    gradient.addColorStop(0, colors.light);
    gradient.addColorStop(0.6, colors.body);
    gradient.addColorStop(1, colors.dark);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, halfSize * 0.55, halfSize * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制两端尖角
    ctx.fillStyle = colors.dark;
    // 左尖
    ctx.beginPath();
    ctx.moveTo(centerX - halfSize * 0.5, centerY);
    ctx.quadraticCurveTo(centerX - halfSize * 0.7, centerY, centerX - halfSize * 0.55, centerY);
    ctx.fill();
    // 右尖
    ctx.beginPath();
    ctx.moveTo(centerX + halfSize * 0.5, centerY);
    ctx.quadraticCurveTo(centerX + halfSize * 0.7, centerY, centerX + halfSize * 0.55, centerY);
    ctx.fill();
    
    // 绘制叶子
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.ellipse(centerX + halfSize * 0.25, centerY - halfSize * 0.55, halfSize * 0.12, halfSize * 0.06, 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(centerX - halfSize * 0.15, centerY - halfSize * 0.2, halfSize * 0.18, halfSize * 0.1, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制苹果
  function drawApple(ctx, x, y, size, options = {}) {
    const colors = fruitColors.apple;
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
    
    // 绘制苹果主体
    const gradient = ctx.createRadialGradient(
      centerX - halfSize * 0.2, centerY - halfSize * 0.2, 0,
      centerX, centerY, halfSize * 0.7
    );
    gradient.addColorStop(0, colors.light);
    gradient.addColorStop(0.6, colors.body);
    gradient.addColorStop(1, colors.dark);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    // 苹果形状
    ctx.moveTo(centerX, centerY + halfSize * 0.6);
    ctx.bezierCurveTo(
      centerX - halfSize * 0.7, centerY + halfSize * 0.5,
      centerX - halfSize * 0.65, centerY - halfSize * 0.2,
      centerX - halfSize * 0.1, centerY - halfSize * 0.35
    );
    ctx.bezierCurveTo(
      centerX - halfSize * 0.05, centerY - halfSize * 0.55,
      centerX + halfSize * 0.05, centerY - halfSize * 0.55,
      centerX + halfSize * 0.1, centerY - halfSize * 0.35
    );
    ctx.bezierCurveTo(
      centerX + halfSize * 0.65, centerY - halfSize * 0.2,
      centerX + halfSize * 0.7, centerY + halfSize * 0.5,
      centerX, centerY + halfSize * 0.6
    );
    ctx.fill();
    
    // 绘制茎
    ctx.strokeStyle = colors.stem;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - halfSize * 0.35);
    ctx.quadraticCurveTo(centerX + halfSize * 0.05, centerY - halfSize * 0.5, centerX + halfSize * 0.02, centerY - halfSize * 0.55);
    ctx.stroke();
    
    // 绘制叶子
    ctx.fillStyle = colors.leaf;
    ctx.beginPath();
    ctx.ellipse(centerX + halfSize * 0.12, centerY - halfSize * 0.5, halfSize * 0.15, halfSize * 0.08, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(centerX - halfSize * 0.2, centerY - halfSize * 0.15, halfSize * 0.18, halfSize * 0.12, -0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制葡萄
  function drawGrape(ctx, x, y, size, options = {}) {
    const colors = fruitColors.grape;
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
    
    // 绘制茎
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - halfSize * 0.55);
    ctx.lineTo(centerX, centerY - halfSize * 0.7);
    ctx.stroke();
    
    // 绘制葡萄粒（三角形排列）
    const grapePositions = [
      // 顶部
      { x: 0, y: -0.35 },
      // 第二排
      { x: -0.12, y: -0.18 },
      { x: 0.12, y: -0.18 },
      // 第三排
      { x: -0.22, y: 0 },
      { x: 0, y: 0 },
      { x: 0.22, y: 0 },
      // 第四排
      { x: -0.12, y: 0.18 },
      { x: 0.12, y: 0.18 },
      // 底部
      { x: 0, y: 0.35 }
    ];
    
    grapePositions.forEach((pos, i) => {
      const gx = centerX + pos.x * halfSize;
      const gy = centerY + pos.y * halfSize;
      
      // 葡萄粒渐变
      const grapeGradient = ctx.createRadialGradient(
        gx - halfSize * 0.05, gy - halfSize * 0.05, 0,
        gx, gy, halfSize * 0.15
      );
      grapeGradient.addColorStop(0, colors.light);
      grapeGradient.addColorStop(0.6, colors.body);
      grapeGradient.addColorStop(1, colors.dark);
      
      ctx.fillStyle = grapeGradient;
      ctx.beginPath();
      ctx.arc(gx, gy, halfSize * 0.13, 0, Math.PI * 2);
      ctx.fill();
      
      // 高光
      ctx.fillStyle = colors.highlight;
      ctx.beginPath();
      ctx.arc(gx - halfSize * 0.04, gy - halfSize * 0.04, halfSize * 0.04, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // 绘制叶子
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.ellipse(centerX + halfSize * 0.15, centerY - halfSize * 0.6, halfSize * 0.12, halfSize * 0.06, 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制西瓜
  function drawWatermelon(ctx, x, y, size, options = {}) {
    const colors = fruitColors.watermelon;
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
    
    // 绘制西瓜切片（扇形）
    // 外皮
    ctx.fillStyle = colors.rind;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, halfSize * 0.7, Math.PI * 0.15, Math.PI * 0.85);
    ctx.closePath();
    ctx.fill();
    
    // 深色条纹
    ctx.fillStyle = colors.rindDark;
    for (let i = 0; i < 5; i++) {
      const angle = Math.PI * (0.2 + i * 0.15);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, halfSize * 0.7, angle, angle + 0.05);
      ctx.closePath();
      ctx.fill();
    }
    
    // 白色内皮
    ctx.fillStyle = '#FFFACD';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, halfSize * 0.6, Math.PI * 0.15, Math.PI * 0.85);
    ctx.closePath();
    ctx.fill();
    
    // 果肉
    const fleshGradient = ctx.createRadialGradient(
      centerX, centerY - halfSize * 0.1, 0,
      centerX, centerY, halfSize * 0.55
    );
    fleshGradient.addColorStop(0, '#FF8A8A');
    fleshGradient.addColorStop(1, colors.flesh);
    
    ctx.fillStyle = fleshGradient;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, halfSize * 0.55, Math.PI * 0.15, Math.PI * 0.85);
    ctx.closePath();
    ctx.fill();
    
    // 西瓜籽
    ctx.fillStyle = colors.seeds;
    const seedPositions = [
      { x: -0.15, y: -0.15, r: 0.25 },
      { x: 0.1, y: -0.1, r: 0.35 },
      { x: -0.1, y: 0.05, r: 0.3 },
      { x: 0.15, y: 0.1, r: 0.25 },
      { x: 0, y: 0.15, r: 0.35 }
    ];
    
    seedPositions.forEach(pos => {
      const sx = centerX + pos.x * halfSize;
      const sy = centerY + pos.y * halfSize;
      
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(pos.r * Math.PI);
      
      // 椭圆形籽
      ctx.beginPath();
      ctx.ellipse(0, 0, halfSize * 0.04, halfSize * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
    
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX - halfSize * 0.1, centerY - halfSize * 0.25, halfSize * 0.15, halfSize * 0.08, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制函数映射
  const drawFunctions = {
    strawberry: drawStrawberry,
    orange: drawOrange,
    lemon: drawLemon,
    apple: drawApple,
    grape: drawGrape,
    watermelon: drawWatermelon
  };
  
  // 通用绘制函数
  function drawFruit(ctx, x, y, size, type, options = {}) {
    const drawFn = drawFunctions[type] || drawStrawberry;
    drawFn(ctx, x, y, size, options);
  }
  
  // 绘制金色水果（彩蛋）
  function drawGoldenFruit(ctx, x, y, size, type, options = {}) {
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
    
    // 绘制水果
    ctx.filter = 'sepia(50%) saturate(200%) hue-rotate(-10deg)';
    drawFruit(ctx, x, y, size, type, options);
    ctx.filter = 'none';
    
    // 金色边框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // 预渲染水果到离屏Canvas
  const fruitCache = {};
  
  function prerenderFruits(size = 48) {
    fruitTypes.forEach(type => {
      const canvas = document.createElement('canvas') || 
        (typeof wx !== 'undefined' && wx.createOffscreenCanvas(size, size));
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      drawFruit(ctx, 0, 0, size, type);
      fruitCache[type] = canvas;
    });
  }
  
  // 获取缓存的水果图像
  function getFruitImage(type) {
    return fruitCache[type];
  }
  
  // 导出全局API
  window.Fruits = {
    types: fruitTypes,
    colors: fruitColors,
    draw: drawFruit,
    drawGolden: drawGoldenFruit,
    prerender: prerenderFruits,
    getImage: getFruitImage
  };
  
})();
