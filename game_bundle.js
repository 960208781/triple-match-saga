/**
 * 游戏打包文件
 * 用于微信小游戏环境
 * 将所有模块打包成一个文件
 */

// 注意：实际发布时需要使用构建工具（如webpack/rollup）打包
// 这里只是一个占位文件

(function() {
  'use strict';
  
  // 模块加载器
  const modules = {};
  const moduleCache = {};
  
  // 定义模块
  function define(name, deps, factory) {
    modules[name] = {
      deps: deps,
      factory: factory
    };
  }
  
  // 加载模块
  function require(name) {
    if (moduleCache[name]) {
      return moduleCache[name].exports;
    }
    
    const module = modules[name];
    if (!module) {
      throw new Error(`Module ${name} not found`);
    }
    
    const exports = {};
    moduleCache[name] = { exports };
    
    const deps = module.deps.map(dep => require(dep));
    module.factory.apply(null, [exports, ...deps]);
    
    return moduleCache[name].exports;
  }
  
  // 全局导出
  window.define = define;
  window.require = require;
  
  // 游戏配置
  const gameConfig = {
    name: '三消奇缘',
    nameEn: 'Triple Match Saga',
    version: '1.0.0',
    author: 'Triple Match Saga Team',
    
    // 游戏设置
    settings: {
      maxLevel: 80,
      themes: ['candy', 'animals', 'desserts', 'fruits'],
      levelsPerTheme: 20
    },
    
    // 调试模式
    debug: false,
    
    // 性能设置
    performance: {
      targetFPS: 60,
      particleLimit: 500
    }
  };
  
  // 工具函数
  const utils = {
    // 随机数
    random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    // 随机选择
    randomChoice: (arr) => arr[Math.floor(Math.random() * arr.length)],
    
    // 打乱数组
    shuffle: (arr) => {
      const result = [...arr];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },
    
    // 限制数值
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    
    // 线性插值
    lerp: (a, b, t) => a + (b - a) * t,
    
    // 距离计算
    distance: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    
    // 角度转弧度
    degToRad: (deg) => deg * Math.PI / 180,
    
    // 弧度转角度
    radToDeg: (rad) => rad * 180 / Math.PI,
    
    // 格式化时间
    formatTime: (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // 格式化数字
    formatNumber: (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }
  };
  
  // 颜色工具
  const colorUtils = {
    // 十六进制转RGB
    hexToRgb: (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },
    
    // RGB转十六进制
    rgbToHex: (r, g, b) => {
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    },
    
    // 混合颜色
    blend: (color1, color2, ratio) => {
      const rgb1 = colorUtils.hexToRgb(color1);
      const rgb2 = colorUtils.hexToRgb(color2);
      
      if (!rgb1 || !rgb2) return color1;
      
      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
      
      return colorUtils.rgbToHex(r, g, b);
    },
    
    // 调整亮度
    adjustBrightness: (hex, percent) => {
      const rgb = colorUtils.hexToRgb(hex);
      if (!rgb) return hex;
      
      const adjust = (value) => {
        return Math.min(255, Math.max(0, Math.round(value * (1 + percent / 100))));
      };
      
      return colorUtils.rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
    }
  };
  
  // 动画工具
  const animationUtils = {
    // 缓动函数
    easing: {
      linear: (t) => t,
      easeIn: (t) => t * t,
      easeOut: (t) => t * (2 - t),
      easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: (t) => t * t * t,
      easeOutCubic: (t) => (--t) * t * t + 1,
      easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      bounce: (t) => {
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
      },
      elastic: (t) => {
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
      }
    },
    
    // 创建动画
    create: (options) => {
      const {
        from,
        to,
        duration,
        easing = 'linear',
        onUpdate,
        onComplete
      } = options;
      
      const startTime = Date.now();
      const easingFn = animationUtils.easing[easing] || animationUtils.easing.linear;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easedProgress = easingFn(progress);
        
        const currentValue = from + (to - from) * easedProgress;
        
        if (onUpdate) onUpdate(currentValue, progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else if (onComplete) {
          onComplete();
        }
      };
      
      requestAnimationFrame(animate);
    }
  };
  
  // 导出全局工具
  window.GameConfig = gameConfig;
  window.Utils = utils;
  window.ColorUtils = colorUtils;
  window.AnimationUtils = animationUtils;
  
  // 版本信息
  console.log('=================================');
  console.log('  三消奇缘 - Triple Match Saga');
  console.log('  Version: ' + gameConfig.version);
  console.log('=================================');
  
})();
