/**
 * 粒子系统
 * 用于创建各种视觉效果
 */

(function() {
  'use strict';
  
  // 粒子类
  class Particle {
    constructor(x, y, options = {}) {
      this.x = x;
      this.y = y;
      this.vx = options.vx || (Math.random() - 0.5) * 4;
      this.vy = options.vy || (Math.random() - 0.5) * 4;
      this.gravity = options.gravity || 0.1;
      this.friction = options.friction || 0.99;
      this.life = options.life || 1;
      this.maxLife = this.life;
      this.decay = options.decay || 0.02;
      this.size = options.size || 5;
      this.color = options.color || '#ffffff';
      this.alpha = options.alpha || 1;
      this.shape = options.shape || 'circle'; // circle, square, star, heart
      this.rotation = options.rotation || 0;
      this.rotationSpeed = options.rotationSpeed || 0;
      this.scale = options.scale || 1;
      this.scaleDecay = options.scaleDecay || 0;
    }
    
    update(deltaTime) {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.life -= this.decay;
      this.rotation += this.rotationSpeed;
      this.scale -= this.scaleDecay;
      if (this.scale < 0) this.scale = 0;
      return this.life > 0;
    }
    
    render(ctx) {
      const alpha = Math.max(0, Math.min(1, this.life / this.maxLife * this.alpha));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.scale, this.scale);
      
      ctx.fillStyle = this.color;
      
      switch (this.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'square':
          ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
          break;
          
        case 'star':
          this.drawStar(ctx, 0, 0, 5, this.size, this.size / 2);
          break;
          
        case 'heart':
          this.drawHeart(ctx, 0, 0, this.size);
          break;
          
        case 'diamond':
          ctx.beginPath();
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size, 0);
          ctx.lineTo(0, this.size);
          ctx.lineTo(-this.size, 0);
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.restore();
    }
    
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = Math.PI / 2 * 3;
      let step = Math.PI / spikes;
      
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      
      for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    }
    
    drawHeart(ctx, x, y, size) {
      ctx.beginPath();
      ctx.moveTo(x, y + size / 4);
      ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
      ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size);
      ctx.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
      ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
      ctx.fill();
    }
  }
  
  // 粒子系统类
  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.emitters = [];
    }
    
    // 添加单个粒子
    addParticle(x, y, options = {}) {
      this.particles.push(new Particle(x, y, options));
    }
    
    // 创建爆炸效果
    createExplosion(x, y, color, count = 20) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const speed = 2 + Math.random() * 4;
        this.addParticle(x, y, {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: color,
          size: 3 + Math.random() * 4,
          life: 0.8 + Math.random() * 0.4,
          decay: 0.02,
          gravity: 0.05,
          shape: 'circle'
        });
      }
    }
    
    // 创建消除效果
    createMatchEffect(x, y, color, type = 'normal') {
      const count = type === 'special' ? 30 : 15;
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        const shapes = ['circle', 'star', 'diamond'];
        
        this.addParticle(x, y, {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          color: color,
          size: 2 + Math.random() * 4,
          life: 0.5 + Math.random() * 0.5,
          decay: 0.025,
          gravity: 0.08,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
    }
    
    // 创建连击效果
    createComboEffect(x, y, level) {
      const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#00CED1'];
      const count = 10 + level * 5;
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 2 + level * 0.5;
        
        this.addParticle(x, y, {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 3 + Math.random() * 3,
          life: 0.6 + Math.random() * 0.4,
          decay: 0.015,
          gravity: -0.02,
          shape: 'star',
          rotationSpeed: (Math.random() - 0.5) * 0.3
        });
      }
    }
    
    // 创建宠物技能效果
    createPetSkillEffect(x, y, petType) {
      const colors = {
        fire: ['#FF4500', '#FF6347', '#FFD700', '#FFA500'],
        ice: ['#00BFFF', '#87CEEB', '#E0FFFF', '#FFFFFF'],
        thunder: ['#FFD700', '#FFFF00', '#FFFACD', '#FFFFFF']
      };
      
      const particleColors = colors[petType] || colors.fire;
      const count = 50;
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        const color = particleColors[Math.floor(Math.random() * particleColors.length)];
        
        this.addParticle(x, y, {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: color,
          size: 4 + Math.random() * 6,
          life: 0.8 + Math.random() * 0.4,
          decay: 0.015,
          gravity: petType === 'ice' ? 0.15 : -0.05,
          shape: petType === 'thunder' ? 'diamond' : 'circle',
          rotationSpeed: (Math.random() - 0.5) * 0.4
        });
      }
    }
    
    // 创建胜利效果
    createVictoryEffect(centerX, centerY) {
      const colors = ['#FFD700', '#FF69B4', '#00CED1', '#32CD32', '#FF4500', '#9370DB'];
      
      // 多波粒子
      for (let wave = 0; wave < 3; wave++) {
        setTimeout(() => {
          for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 / 30) * i;
            const speed = 4 + Math.random() * 3;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.addParticle(centerX, centerY, {
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 3,
              color: color,
              size: 5 + Math.random() * 5,
              life: 1 + Math.random() * 0.5,
              decay: 0.01,
              gravity: 0.1,
              shape: 'star',
              rotationSpeed: (Math.random() - 0.5) * 0.2
            });
          }
        }, wave * 200);
      }
    }
    
    // 创建失败效果
    createFailEffect(centerX, centerY) {
      for (let i = 0; i < 20; i++) {
        const x = centerX + (Math.random() - 0.5) * 200;
        const y = centerY + (Math.random() - 0.5) * 200;
        
        this.addParticle(x, y, {
          vx: (Math.random() - 0.5) * 2,
          vy: 1 + Math.random() * 2,
          color: '#808080',
          size: 8 + Math.random() * 8,
          life: 1.5,
          decay: 0.01,
          gravity: 0.05,
          shape: 'square',
          rotationSpeed: (Math.random() - 0.5) * 0.1
        });
      }
    }
    
    // 创建购买效果
    createPurchaseEffect(x, y) {
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        
        this.addParticle(x, y, {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: '#FFD700',
          size: 3 + Math.random() * 4,
          life: 0.8,
          decay: 0.02,
          gravity: -0.03,
          shape: 'star'
        });
      }
    }
    
    // 创建彩蛋效果
    createEasterEggEffect(centerX, centerY) {
      const colors = ['#FFD700', '#FF69B4', '#00CED1', '#32CD32', '#FF4500', '#9370DB', '#FFFFFF'];
      
      // 彩虹螺旋
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 6;
        const radius = i * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const color = colors[i % colors.length];
        
        setTimeout(() => {
          this.addParticle(x, y, {
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            color: color,
            size: 6,
            life: 1.5,
            decay: 0.01,
            gravity: 0,
            shape: 'star',
            rotationSpeed: 0.1
          });
        }, i * 10);
      }
    }
    
    // 创建拖尾效果
    createTrailEffect(x, y, color) {
      this.addParticle(x, y, {
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: color,
        size: 4 + Math.random() * 2,
        life: 0.3,
        decay: 0.03,
        gravity: 0,
        shape: 'circle'
      });
    }
    
    // 更新所有粒子
    update(deltaTime) {
      this.particles = this.particles.filter(p => p.update(deltaTime));
    }
    
    // 渲染所有粒子
    render(ctx) {
      this.particles.forEach(p => p.render(ctx));
    }
    
    // 清除所有粒子
    clear() {
      this.particles = [];
    }
    
    // 获取粒子数量
    getCount() {
      return this.particles.length;
    }
  }
  
  // 创建全局实例
  window.Particles = new ParticleSystem();
  
})();
