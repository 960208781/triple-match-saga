/**
 * 主题管理系统
 * 管理4种主题：糖果乐园/萌宠世界/甜蜜工坊/水果派对
 * 每个主题20关，共80关
 */

(function() {
  'use strict';
  
  // 主题配置
  const themes = {
    candy: {
      name: '糖果乐园',
      nameEn: 'Candy Land',
      startLevel: 1,
      endLevel: 20,
      elements: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],
      background: {
        type: 'gradient',
        colors: ['#FFB6C1', '#FFC0CB', '#FFB6C1'],
        decorations: 'candy'
      },
      colors: {
        primary: '#FF69B4',
        secondary: '#FFB6C1',
        accent: '#FFD700'
      }
    },
    animals: {
      name: '萌宠世界',
      nameEn: 'Pet World',
      startLevel: 21,
      endLevel: 40,
      elements: ['cat', 'dog', 'rabbit', 'bear', 'fox', 'panda'],
      background: {
        type: 'gradient',
        colors: ['#90EE90', '#98FB98', '#90EE90'],
        decorations: 'grass'
      },
      colors: {
        primary: '#32CD32',
        secondary: '#90EE90',
        accent: '#FFD700'
      }
    },
    desserts: {
      name: '甜蜜工坊',
      nameEn: 'Sweet Workshop',
      startLevel: 41,
      endLevel: 60,
      elements: ['cake', 'donut', 'macaron', 'icecream', 'cookie', 'pudding'],
      background: {
        type: 'gradient',
        colors: ['#FFF8DC', '#FFFACD', '#FFF8DC'],
        decorations: 'bakery'
      },
      colors: {
        primary: '#FFB6C1',
        secondary: '#FFF8DC',
        accent: '#D2691E'
      }
    },
    fruits: {
      name: '水果派对',
      nameEn: 'Fruit Party',
      startLevel: 61,
      endLevel: 80,
      elements: ['strawberry', 'orange', 'lemon', 'apple', 'grape', 'watermelon'],
      background: {
        type: 'gradient',
        colors: ['#98FB98', '#90EE90', '#98FB98'],
        decorations: 'leaves'
      },
      colors: {
        primary: '#32CD32',
        secondary: '#98FB98',
        accent: '#FF4500'
      }
    }
  };
  
  // 关卡配置
  const levelConfigs = [];
  
  // 生成关卡配置
  function generateLevelConfigs() {
    levelConfigs.length = 0;
    
    for (let level = 1; level <= 80; level++) {
      const theme = getThemeByLevel(level);
      const themeConfig = themes[theme];
      const levelInTheme = level - themeConfig.startLevel + 1;
      
      // 难度递增
      const baseMoves = 25;
      const baseScore = 1000;
      const difficultyMultiplier = 1 + (level - 1) * 0.02;
      
      // 特殊目标类型
      let objective = {
        type: 'score',
        target: Math.floor(baseScore * difficultyMultiplier * (1 + levelInTheme * 0.1))
      };
      
      // 每5关改变目标类型
      if (levelInTheme % 5 === 0) {
        objective = {
          type: 'collect',
          targets: [
            { element: themeConfig.elements[Math.floor(Math.random() * 6)], count: 15 + levelInTheme }
          ]
        };
      }
      
      // 每10关是BOSS关
      if (levelInTheme % 10 === 0) {
        objective = {
          type: 'boss',
          target: Math.floor(baseScore * difficultyMultiplier * 2),
          bossHp: 50 + levelInTheme * 5
        };
      }
      
      levelConfigs.push({
        level,
        theme,
        levelInTheme,
        moves: Math.max(15, Math.floor(baseMoves - level * 0.2)),
        objective,
        boardSize: level <= 20 ? 7 : (level <= 50 ? 8 : 9),
        starScores: [
          Math.floor(baseScore * difficultyMultiplier * 0.8),
          Math.floor(baseScore * difficultyMultiplier * 1.0),
          Math.floor(baseScore * difficultyMultiplier * 1.3)
        ]
      });
    }
  }
  
  // 根据关卡获取主题
  function getThemeByLevel(level) {
    if (level >= 1 && level <= 20) return 'candy';
    if (level >= 21 && level <= 40) return 'animals';
    if (level >= 41 && level <= 60) return 'desserts';
    if (level >= 61 && level <= 80) return 'fruits';
    return 'candy';
  }
  
  // 获取关卡配置
  function getLevelConfig(level) {
    if (level < 1 || level > 80) {
      return levelConfigs[0];
    }
    return levelConfigs[level - 1];
  }
  
  // 获取主题配置
  function getThemeConfig(theme) {
    return themes[theme] || themes.candy;
  }
  
  // 绘制背景
  function drawBackground(ctx, theme, width, height) {
    const themeConfig = themes[theme] || themes.candy;
    const bg = themeConfig.background;
    
    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    bg.colors.forEach((color, i) => {
      gradient.addColorStop(i / (bg.colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 绘制装饰
    drawDecorations(ctx, theme, width, height);
  }
  
  // 绘制装饰
  function drawDecorations(ctx, theme, width, height) {
    const themeConfig = themes[theme] || themes.candy;
    const decorationType = themeConfig.background.decorations;
    
    ctx.save();
    ctx.globalAlpha = 0.3;
    
    switch (decorationType) {
      case 'candy':
        drawCandyDecorations(ctx, width, height);
        break;
      case 'grass':
        drawGrassDecorations(ctx, width, height);
        break;
      case 'bakery':
        drawBakeryDecorations(ctx, width, height);
        break;
      case 'leaves':
        drawLeafDecorations(ctx, width, height);
        break;
    }
    
    ctx.restore();
  }
  
  // 糖果装饰
  function drawCandyDecorations(ctx, width, height) {
    const colors = ['#FF69B4', '#FFD700', '#87CEEB', '#98FB98', '#DDA0DD'];
    
    for (let i = 0; i < 15; i++) {
      const x = (i * 73) % width;
      const y = (i * 47) % height;
      const size = 10 + (i % 5) * 3;
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // 草地装饰
  function drawGrassDecorations(ctx, width, height) {
    ctx.fillStyle = '#228B22';
    
    // 云朵
    for (let i = 0; i < 5; i++) {
      const x = (i * 89 + 30) % width;
      const y = 30 + (i % 3) * 20;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.arc(x + 15, y - 5, 15, 0, Math.PI * 2);
      ctx.arc(x + 30, y, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 草
    ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
    for (let i = 0; i < width; i += 20) {
      const grassHeight = 10 + Math.random() * 15;
      ctx.beginPath();
      ctx.moveTo(i, height);
      ctx.lineTo(i + 5, height - grassHeight);
      ctx.lineTo(i + 10, height);
      ctx.fill();
    }
  }
  
  // 烘焙装饰
  function drawBakeryDecorations(ctx, width, height) {
    // 糖霜滴落效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 10; i++) {
      const x = (i * 67) % width;
      const y = (i * 43) % height;
      
      ctx.beginPath();
      ctx.arc(x, y, 5 + (i % 3) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 小星星
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    for (let i = 0; i < 8; i++) {
      const x = (i * 79 + 20) % width;
      const y = (i * 53 + 10) % height;
      
      drawStar(ctx, x, y, 5, 8, 4);
    }
  }
  
  // 叶子装饰
  function drawLeafDecorations(ctx, width, height) {
    const leafColors = ['#228B22', '#32CD32', '#90EE90'];
    
    for (let i = 0; i < 20; i++) {
      const x = (i * 61) % width;
      const y = (i * 37) % height;
      const size = 8 + (i % 4) * 3;
      
      ctx.fillStyle = leafColors[i % leafColors.length];
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((i * 30) * Math.PI / 180);
      
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
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
  
  // 绘制元素
  function drawElement(ctx, x, y, size, theme, elementType, options = {}) {
    switch (theme) {
      case 'candy':
        if (window.Candy) {
          window.Candy.draw(ctx, x, y, size, elementType, options);
        }
        break;
      case 'animals':
        if (window.Animals) {
          window.Animals.draw(ctx, x, y, size, elementType, options);
        }
        break;
      case 'desserts':
        if (window.Desserts) {
          window.Desserts.draw(ctx, x, y, size, elementType, options);
        }
        break;
      case 'fruits':
        if (window.Fruits) {
          window.Fruits.draw(ctx, x, y, size, elementType, options);
        }
        break;
    }
  }
  
  // 绘制金色元素（彩蛋）
  function drawGoldenElement(ctx, x, y, size, theme, elementType, options = {}) {
    switch (theme) {
      case 'candy':
        if (window.Candy) {
          window.Candy.drawGolden(ctx, x, y, size, options);
        }
        break;
      case 'animals':
        if (window.Animals) {
          window.Animals.drawGolden(ctx, x, y, size, elementType, options);
        }
        break;
      case 'desserts':
        if (window.Desserts) {
          window.Desserts.drawGolden(ctx, x, y, size, elementType, options);
        }
        break;
      case 'fruits':
        if (window.Fruits) {
          window.Fruits.drawGolden(ctx, x, y, size, elementType, options);
        }
        break;
    }
  }
  
  // 获取元素颜色（用于粒子效果等）
  function getElementColor(theme, elementType) {
    const themeConfig = themes[theme];
    if (!themeConfig) return '#FFFFFF';
    
    const index = themeConfig.elements.indexOf(elementType);
    if (index === -1) return '#FFFFFF';
    
    // 返回对应主题的颜色
    const colorMap = {
      candy: ['#FF4757', '#FF9F43', '#FFD32A', '#26DE81', '#45AAF2', '#A55EEA'],
      animals: ['#FFB347', '#D2691E', '#FFFFFF', '#8B4513', '#FF6B35', '#FFFFFF'],
      desserts: ['#FFB6C1', '#D2691E', '#FFB6C1', '#FFB6C1', '#D2691E', '#FFD700'],
      fruits: ['#FF4757', '#FF9F43', '#FFD32A', '#FF4757', '#9370DB', '#FF6B6B']
    };
    
    return colorMap[theme] ? colorMap[theme][index] : '#FFFFFF';
  }
  
  // 初始化
  generateLevelConfigs();
  
  // 导出全局API
  window.Themes = {
    themes,
    levelConfigs,
    getThemeByLevel,
    getLevelConfig,
    getThemeConfig,
    drawBackground,
    drawElement,
    drawGoldenElement,
    getElementColor,
    totalLevels: 80
  };
  
})();
