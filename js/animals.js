/**
 * 动物精灵绘制模块
 * 主题2：萌宠世界（关卡21-40）
 * 6种可爱动物头像：小猫/小狗/小兔/小熊/小狐狸/小熊猫
 */

(function() {
  'use strict';
  
  // 动物类型
  const animalTypes = ['cat', 'dog', 'rabbit', 'bear', 'fox', 'panda'];
  
  // 动物颜色配置
  const animalColors = {
    cat: { 
      body: '#FFB347', 
      light: '#FFD599', 
      dark: '#E89530',
      nose: '#FF6B6B',
      innerEar: '#FFB6C1'
    },
    dog: { 
      body: '#D2691E', 
      light: '#E8A45C', 
      dark: '#A0522D',
      nose: '#2C1810',
      innerEar: '#DEB887'
    },
    rabbit: { 
      body: '#FFFFFF', 
      light: '#FFF5EE', 
      dark: '#E8E8E8',
      nose: '#FFB6C1',
      innerEar: '#FFB6C1'
    },
    bear: { 
      body: '#8B4513', 
      light: '#A0522D', 
      dark: '#5D2E0C',
      nose: '#2C1810',
      innerEar: '#DEB887'
    },
    fox: { 
      body: '#FF6B35', 
      light: '#FF8C5A', 
      dark: '#CC5629',
      nose: '#2C1810',
      innerEar: '#FFFFFF'
    },
    panda: { 
      body: '#FFFFFF', 
      light: '#FFFFFF', 
      dark: '#E8E8E8',
      black: '#1A1A1A',
      nose: '#1A1A1A',
      innerEar: '#1A1A1A'
    }
  };
  
  // 绘制小猫
  function drawCat(ctx, x, y, size, options = {}) {
    const colors = animalColors.cat;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    const faceRadius = halfSize * 0.75;
    
    ctx.save();
    
    // 应用变换
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制耳朵（三角形）
    ctx.fillStyle = colors.body;
    // 左耳
    ctx.beginPath();
    ctx.moveTo(centerX - faceRadius * 0.7, centerY - faceRadius * 0.3);
    ctx.lineTo(centerX - faceRadius * 0.3, centerY - faceRadius * 1.3);
    ctx.lineTo(centerX - faceRadius * 0.1, centerY - faceRadius * 0.5);
    ctx.closePath();
    ctx.fill();
    // 左耳内部
    ctx.fillStyle = colors.innerEar;
    ctx.beginPath();
    ctx.moveTo(centerX - faceRadius * 0.55, centerY - faceRadius * 0.35);
    ctx.lineTo(centerX - faceRadius * 0.35, centerY - faceRadius * 1.0);
    ctx.lineTo(centerX - faceRadius * 0.2, centerY - faceRadius * 0.5);
    ctx.closePath();
    ctx.fill();
    
    // 右耳
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.moveTo(centerX + faceRadius * 0.7, centerY - faceRadius * 0.3);
    ctx.lineTo(centerX + faceRadius * 0.3, centerY - faceRadius * 1.3);
    ctx.lineTo(centerX + faceRadius * 0.1, centerY - faceRadius * 0.5);
    ctx.closePath();
    ctx.fill();
    // 右耳内部
    ctx.fillStyle = colors.innerEar;
    ctx.beginPath();
    ctx.moveTo(centerX + faceRadius * 0.55, centerY - faceRadius * 0.35);
    ctx.lineTo(centerX + faceRadius * 0.35, centerY - faceRadius * 1.0);
    ctx.lineTo(centerX + faceRadius * 0.2, centerY - faceRadius * 0.5);
    ctx.closePath();
    ctx.fill();
    
    // 绘制脸部
    const faceGradient = ctx.createRadialGradient(
      centerX - faceRadius * 0.2, centerY - faceRadius * 0.2, 0,
      centerX, centerY, faceRadius
    );
    faceGradient.addColorStop(0, colors.light);
    faceGradient.addColorStop(0.7, colors.body);
    faceGradient.addColorStop(1, colors.dark);
    
    ctx.fillStyle = faceGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制眼睛
    const eyeY = centerY - faceRadius * 0.15;
    const eyeOffsetX = faceRadius * 0.35;
    
    // 眼白
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(centerX - eyeOffsetX, eyeY, faceRadius * 0.2, faceRadius * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + eyeOffsetX, eyeY, faceRadius * 0.2, faceRadius * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 瞳孔
    ctx.fillStyle = '#2C1810';
    ctx.beginPath();
    ctx.ellipse(centerX - eyeOffsetX, eyeY, faceRadius * 0.1, faceRadius * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + eyeOffsetX, eyeY, faceRadius * 0.1, faceRadius * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛高光
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX - faceRadius * 0.03, eyeY - faceRadius * 0.05, faceRadius * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX - faceRadius * 0.03, eyeY - faceRadius * 0.05, faceRadius * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制鼻子
    ctx.fillStyle = colors.nose;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + faceRadius * 0.1);
    ctx.lineTo(centerX - faceRadius * 0.1, centerY + faceRadius * 0.25);
    ctx.lineTo(centerX + faceRadius * 0.1, centerY + faceRadius * 0.25);
    ctx.closePath();
    ctx.fill();
    
    // 绘制嘴巴
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + faceRadius * 0.25);
    ctx.lineTo(centerX, centerY + faceRadius * 0.4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX - faceRadius * 0.15, centerY + faceRadius * 0.4, faceRadius * 0.15, 0, Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX + faceRadius * 0.15, centerY + faceRadius * 0.4, faceRadius * 0.15, 0, Math.PI, false);
    ctx.stroke();
    
    // 绘制胡须
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 1;
    // 左边胡须
    ctx.beginPath();
    ctx.moveTo(centerX - faceRadius * 0.3, centerY + faceRadius * 0.1);
    ctx.lineTo(centerX - faceRadius * 0.9, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - faceRadius * 0.3, centerY + faceRadius * 0.2);
    ctx.lineTo(centerX - faceRadius * 0.9, centerY + faceRadius * 0.2);
    ctx.stroke();
    // 右边胡须
    ctx.beginPath();
    ctx.moveTo(centerX + faceRadius * 0.3, centerY + faceRadius * 0.1);
    ctx.lineTo(centerX + faceRadius * 0.9, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX + faceRadius * 0.3, centerY + faceRadius * 0.2);
    ctx.lineTo(centerX + faceRadius * 0.9, centerY + faceRadius * 0.2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // 绘制小狗
  function drawDog(ctx, x, y, size, options = {}) {
    const colors = animalColors.dog;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    const faceRadius = halfSize * 0.75;
    
    ctx.save();
    
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制耳朵（下垂的耳朵）
    ctx.fillStyle = colors.body;
    // 左耳
    ctx.beginPath();
    ctx.ellipse(centerX - faceRadius * 0.85, centerY - faceRadius * 0.1, faceRadius * 0.35, faceRadius * 0.6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // 右耳
    ctx.beginPath();
    ctx.ellipse(centerX + faceRadius * 0.85, centerY - faceRadius * 0.1, faceRadius * 0.35, faceRadius * 0.6, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制脸部
    const faceGradient = ctx.createRadialGradient(
      centerX - faceRadius * 0.2, centerY - faceRadius * 0.2, 0,
      centerX, centerY, faceRadius
    );
    faceGradient.addColorStop(0, colors.light);
    faceGradient.addColorStop(0.7, colors.body);
    faceGradient.addColorStop(1, colors.dark);
    
    ctx.fillStyle = faceGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制眼睛
    const eyeY = centerY - faceRadius * 0.15;
    const eyeOffsetX = faceRadius * 0.35;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX, eyeY, faceRadius * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX, eyeY, faceRadius * 0.18, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#2C1810';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX, eyeY, faceRadius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX, eyeY, faceRadius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX - faceRadius * 0.03, eyeY - faceRadius * 0.03, faceRadius * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX - faceRadius * 0.03, eyeY - faceRadius * 0.03, faceRadius * 0.04, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制鼻子
    ctx.fillStyle = colors.nose;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + faceRadius * 0.2, faceRadius * 0.15, faceRadius * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 鼻子高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX - faceRadius * 0.05, centerY + faceRadius * 0.15, faceRadius * 0.06, faceRadius * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制嘴巴
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + faceRadius * 0.32);
    ctx.lineTo(centerX, centerY + faceRadius * 0.5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX - faceRadius * 0.2, centerY + faceRadius * 0.5, faceRadius * 0.2, 0, Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX + faceRadius * 0.2, centerY + faceRadius * 0.5, faceRadius * 0.2, 0, Math.PI, false);
    ctx.stroke();
    
    // 绘制舌头
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + faceRadius * 0.55, faceRadius * 0.12, faceRadius * 0.15, 0, 0, Math.PI);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制小兔
  function drawRabbit(ctx, x, y, size, options = {}) {
    const colors = animalColors.rabbit;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    const faceRadius = halfSize * 0.6;
    
    ctx.save();
    
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制长耳朵
    ctx.fillStyle = colors.body;
    // 左耳
    ctx.beginPath();
    ctx.ellipse(centerX - faceRadius * 0.4, centerY - faceRadius * 1.3, faceRadius * 0.25, faceRadius * 0.7, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.innerEar;
    ctx.beginPath();
    ctx.ellipse(centerX - faceRadius * 0.4, centerY - faceRadius * 1.3, faceRadius * 0.12, faceRadius * 0.5, -0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // 右耳
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.ellipse(centerX + faceRadius * 0.4, centerY - faceRadius * 1.3, faceRadius * 0.25, faceRadius * 0.7, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.innerEar;
    ctx.beginPath();
    ctx.ellipse(centerX + faceRadius * 0.4, centerY - faceRadius * 1.3, faceRadius * 0.12, faceRadius * 0.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制脸部
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制眼睛
    const eyeY = centerY - faceRadius * 0.1;
    const eyeOffsetX = faceRadius * 0.35;
    
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX, eyeY, faceRadius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX, eyeY, faceRadius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX - faceRadius * 0.03, eyeY - faceRadius * 0.03, faceRadius * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX - faceRadius * 0.03, eyeY - faceRadius * 0.03, faceRadius * 0.04, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制鼻子
    ctx.fillStyle = colors.nose;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + faceRadius * 0.2, faceRadius * 0.1, faceRadius * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制嘴巴
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + faceRadius * 0.28);
    ctx.lineTo(centerX, centerY + faceRadius * 0.4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX - faceRadius * 0.12, centerY + faceRadius * 0.4, faceRadius * 0.12, 0, Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX + faceRadius * 0.12, centerY + faceRadius * 0.4, faceRadius * 0.12, 0, Math.PI, false);
    ctx.stroke();
    
    // 绘制腮红
    ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
    ctx.beginPath();
    ctx.ellipse(centerX - faceRadius * 0.55, centerY + faceRadius * 0.2, faceRadius * 0.15, faceRadius * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + faceRadius * 0.55, centerY + faceRadius * 0.2, faceRadius * 0.15, faceRadius * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制小熊
  function drawBear(ctx, x, y, size, options = {}) {
    const colors = animalColors.bear;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    const faceRadius = halfSize * 0.75;
    
    ctx.save();
    
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制圆形耳朵
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.arc(centerX - faceRadius * 0.7, centerY - faceRadius * 0.7, faceRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + faceRadius * 0.7, centerY - faceRadius * 0.7, faceRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // 耳朵内部
    ctx.fillStyle = colors.innerEar;
    ctx.beginPath();
    ctx.arc(centerX - faceRadius * 0.7, centerY - faceRadius * 0.7, faceRadius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + faceRadius * 0.7, centerY - faceRadius * 0.7, faceRadius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制脸部
    const faceGradient = ctx.createRadialGradient(
      centerX - faceRadius * 0.2, centerY - faceRadius * 0.2, 0,
      centerX, centerY, faceRadius
    );
    faceGradient.addColorStop(0, colors.light);
    faceGradient.addColorStop(0.7, colors.body);
    faceGradient.addColorStop(1, colors.dark);
    
    ctx.fillStyle = faceGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制眼睛
    const eyeY = centerY - faceRadius * 0.15;
    const eyeOffsetX = faceRadius * 0.35;
    
    ctx.fillStyle = '#2C1810';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX, eyeY, faceRadius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX, eyeY, faceRadius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX - faceRadius * 0.03, eyeY - faceRadius * 0.03, faceRadius * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX - faceRadius * 0.03, eyeY - faceRadius * 0.03, faceRadius * 0.04, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制鼻子
    ctx.fillStyle = colors.nose;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + faceRadius * 0.15, faceRadius * 0.15, faceRadius * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 鼻子高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX - faceRadius * 0.05, centerY + faceRadius * 0.1, faceRadius * 0.06, faceRadius * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制嘴巴
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + faceRadius * 0.27);
    ctx.lineTo(centerX, centerY + faceRadius * 0.4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX - faceRadius * 0.18, centerY + faceRadius * 0.4, faceRadius * 0.18, 0, Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX + faceRadius * 0.18, centerY + faceRadius * 0.4, faceRadius * 0.18, 0, Math.PI, false);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // 绘制小狐狸
  function drawFox(ctx, x, y, size, options = {}) {
    const colors = animalColors.fox;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    const faceRadius = halfSize * 0.75;
    
    ctx.save();
    
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制尖耳朵
    ctx.fillStyle = colors.body;
    // 左耳
    ctx.beginPath();
    ctx.moveTo(centerX - faceRadius * 0.6, centerY - faceRadius * 0.2);
    ctx.lineTo(centerX - faceRadius * 0.25, centerY - faceRadius * 1.2);
    ctx.lineTo(centerX, centerY - faceRadius * 0.4);
    ctx.closePath();
    ctx.fill();
    // 左耳内部白色
    ctx.fillStyle = colors.innerEar;
    ctx.beginPath();
    ctx.moveTo(centerX - faceRadius * 0.45, centerY - faceRadius * 0.25);
    ctx.lineTo(centerX - faceRadius * 0.28, centerY - faceRadius * 0.95);
    ctx.lineTo(centerX - faceRadius * 0.1, centerY - faceRadius * 0.45);
    ctx.closePath();
    ctx.fill();
    
    // 右耳
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.moveTo(centerX + faceRadius * 0.6, centerY - faceRadius * 0.2);
    ctx.lineTo(centerX + faceRadius * 0.25, centerY - faceRadius * 1.2);
    ctx.lineTo(centerX, centerY - faceRadius * 0.4);
    ctx.closePath();
    ctx.fill();
    // 右耳内部白色
    ctx.fillStyle = colors.innerEar;
    ctx.beginPath();
    ctx.moveTo(centerX + faceRadius * 0.45, centerY - faceRadius * 0.25);
    ctx.lineTo(centerX + faceRadius * 0.28, centerY - faceRadius * 0.95);
    ctx.lineTo(centerX + faceRadius * 0.1, centerY - faceRadius * 0.45);
    ctx.closePath();
    ctx.fill();
    
    // 绘制脸部
    const faceGradient = ctx.createRadialGradient(
      centerX - faceRadius * 0.2, centerY - faceRadius * 0.2, 0,
      centerX, centerY, faceRadius
    );
    faceGradient.addColorStop(0, colors.light);
    faceGradient.addColorStop(0.7, colors.body);
    faceGradient.addColorStop(1, colors.dark);
    
    ctx.fillStyle = faceGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制白色面部区域
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(centerX - faceRadius * 0.5, centerY + faceRadius * 0.1);
    ctx.quadraticCurveTo(centerX, centerY - faceRadius * 0.3, centerX + faceRadius * 0.5, centerY + faceRadius * 0.1);
    ctx.quadraticCurveTo(centerX, centerY + faceRadius * 0.8, centerX - faceRadius * 0.5, centerY + faceRadius * 0.1);
    ctx.fill();
    
    // 绘制眼睛
    const eyeY = centerY - faceRadius * 0.1;
    const eyeOffsetX = faceRadius * 0.35;
    
    ctx.fillStyle = '#2C1810';
    ctx.beginPath();
    ctx.ellipse(centerX - eyeOffsetX, eyeY, faceRadius * 0.08, faceRadius * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + eyeOffsetX, eyeY, faceRadius * 0.08, faceRadius * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX - faceRadius * 0.02, eyeY - faceRadius * 0.04, faceRadius * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX - faceRadius * 0.02, eyeY - faceRadius * 0.04, faceRadius * 0.03, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制鼻子
    ctx.fillStyle = colors.nose;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + faceRadius * 0.15);
    ctx.lineTo(centerX - faceRadius * 0.1, centerY + faceRadius * 0.25);
    ctx.lineTo(centerX + faceRadius * 0.1, centerY + faceRadius * 0.25);
    ctx.closePath();
    ctx.fill();
    
    // 绘制嘴巴
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + faceRadius * 0.25);
    ctx.lineTo(centerX, centerY + faceRadius * 0.35);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX - faceRadius * 0.12, centerY + faceRadius * 0.35, faceRadius * 0.12, 0, Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX + faceRadius * 0.12, centerY + faceRadius * 0.35, faceRadius * 0.12, 0, Math.PI, false);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // 绘制小熊猫
  function drawPanda(ctx, x, y, size, options = {}) {
    const colors = animalColors.panda;
    const halfSize = size / 2;
    const centerX = x + halfSize;
    const centerY = y + halfSize;
    const faceRadius = halfSize * 0.75;
    
    ctx.save();
    
    if (options.scale !== undefined) {
      ctx.translate(centerX, centerY);
      ctx.scale(options.scale, options.scale);
      ctx.translate(-centerX, -centerY);
    }
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    
    // 绘制黑色耳朵
    ctx.fillStyle = colors.black;
    ctx.beginPath();
    ctx.arc(centerX - faceRadius * 0.65, centerY - faceRadius * 0.65, faceRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + faceRadius * 0.65, centerY - faceRadius * 0.65, faceRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制白色脸部
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制黑色眼圈
    ctx.fillStyle = colors.black;
    // 左眼圈
    ctx.beginPath();
    ctx.ellipse(centerX - faceRadius * 0.35, centerY - faceRadius * 0.1, faceRadius * 0.25, faceRadius * 0.3, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // 右眼圈
    ctx.beginPath();
    ctx.ellipse(centerX + faceRadius * 0.35, centerY - faceRadius * 0.1, faceRadius * 0.25, faceRadius * 0.3, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制白色眼睛
    const eyeY = centerY - faceRadius * 0.1;
    const eyeOffsetX = faceRadius * 0.35;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX, eyeY, faceRadius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX, eyeY, faceRadius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // 瞳孔
    ctx.fillStyle = colors.black;
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX, eyeY, faceRadius * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX, eyeY, faceRadius * 0.07, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛高光
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX - faceRadius * 0.02, eyeY - faceRadius * 0.02, faceRadius * 0.025, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX - faceRadius * 0.02, eyeY - faceRadius * 0.02, faceRadius * 0.025, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制鼻子
    ctx.fillStyle = colors.nose;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + faceRadius * 0.2, faceRadius * 0.12, faceRadius * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制嘴巴
    ctx.strokeStyle = colors.black;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + faceRadius * 0.3);
    ctx.lineTo(centerX, centerY + faceRadius * 0.45);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX - faceRadius * 0.15, centerY + faceRadius * 0.45, faceRadius * 0.15, 0, Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX + faceRadius * 0.15, centerY + faceRadius * 0.45, faceRadius * 0.15, 0, Math.PI, false);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // 绘制函数映射
  const drawFunctions = {
    cat: drawCat,
    dog: drawDog,
    rabbit: drawRabbit,
    bear: drawBear,
    fox: drawFox,
    panda: drawPanda
  };
  
  // 通用绘制函数
  function drawAnimal(ctx, x, y, size, type, options = {}) {
    const drawFn = drawFunctions[type] || drawCat;
    drawFn(ctx, x, y, size, options);
  }
  
  // 绘制金色动物（彩蛋）
  function drawGoldenAnimal(ctx, x, y, size, type, options = {}) {
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
    
    // 绘制动物（带金色滤镜效果）
    ctx.filter = 'sepia(50%) saturate(200%) hue-rotate(-10deg)';
    drawAnimal(ctx, x, y, size, type, options);
    ctx.filter = 'none';
    
    // 金色边框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // 预渲染动物到离屏Canvas
  const animalCache = {};
  
  function prerenderAnimals(size = 48) {
    animalTypes.forEach(type => {
      const canvas = document.createElement('canvas') || 
        (typeof wx !== 'undefined' && wx.createOffscreenCanvas(size, size));
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      drawAnimal(ctx, 0, 0, size, type);
      animalCache[type] = canvas;
    });
  }
  
  // 获取缓存的动物图像
  function getAnimalImage(type) {
    return animalCache[type];
  }
  
  // 导出全局API
  window.Animals = {
    types: animalTypes,
    colors: animalColors,
    draw: drawAnimal,
    drawGolden: drawGoldenAnimal,
    prerender: prerenderAnimals,
    getImage: getAnimalImage
  };
  
})();
