/**
 * 宠物系统
 * 火龙/冰凤/雷猫三大宠物，消除充能释放技能
 */

(function() {
  'use strict';
  
  // 兼容性圆角矩形绘制
  function _drawRoundRect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
  
  // 宠物配置
  const petConfigs = {
    fire_dragon: {
      id: 'fire_dragon',
      name: '火龙',
      nameEn: 'Fire Dragon',
      description: '火焰攻击，造成范围伤害',
      element: 'fire',
      color: '#FF4500',
      skill: {
        name: '火焰吐息',
        description: '消除一行元素',
        energy: 100,
        damage: 30,
        effect: 'row'
      },
      stats: {
        attack: 35,
        defense: 20,
        speed: 25
      }
    },
    ice_phoenix: {
      id: 'ice_phoenix',
      name: '冰凤',
      nameEn: 'Ice Phoenix',
      description: '冰冻攻击，减缓敌人',
      element: 'ice',
      color: '#00BFFF',
      skill: {
        name: '冰霜之翼',
        description: '冻结随机元素',
        energy: 80,
        damage: 25,
        effect: 'freeze'
      },
      stats: {
        attack: 25,
        defense: 30,
        speed: 25
      }
    },
    thunder_cat: {
      id: 'thunder_cat',
      name: '雷猫',
      nameEn: 'Thunder Cat',
      description: '闪电攻击，连锁伤害',
      element: 'thunder',
      color: '#FFD700',
      skill: {
        name: '雷霆一击',
        description: '随机消除5个元素',
        energy: 60,
        damage: 35,
        effect: 'chain'
      },
      stats: {
        attack: 30,
        defense: 15,
        speed: 35
      }
    },
    rainbow_dragon: {
      id: 'rainbow_dragon',
      name: '彩虹龙',
      nameEn: 'Rainbow Dragon',
      description: '传说中的彩虹龙，全屏攻击',
      element: 'rainbow',
      color: '#FF69B4',
      rare: true,
      skill: {
        name: '彩虹毁灭',
        description: '消除所有元素',
        energy: 150,
        damage: 100,
        effect: 'all'
      },
      stats: {
        attack: 50,
        defense: 40,
        speed: 30
      }
    }
  };
  
  // 当前宠物状态
  let currentPet = null;
  let energy = 0;
  let maxEnergy = 100;
  let petLevel = 1;
  let petExp = 0;
  
  // 回调函数
  let callbacks = {
    onEnergyChange: null,
    onSkillReady: null,
    onSkillUse: null
  };
  
  // 初始化宠物
  function init(petId) {
    if (!window.Shop) {
      // 默认使用火龙
      currentPet = petConfigs.fire_dragon;
    } else {
      // 检查是否拥有该宠物
      const shopData = window.Shop.getShopData();
      const ownedPet = shopData.pets.find(p => p.id === petId && p.owned);
      
      if (ownedPet) {
        currentPet = petConfigs[petId];
      } else {
        // 使用第一个拥有的宠物
        const firstOwned = shopData.pets.find(p => p.owned);
        if (firstOwned) {
          currentPet = petConfigs[firstOwned.id];
        } else {
          currentPet = petConfigs.fire_dragon;
        }
      }
    }
    
    maxEnergy = currentPet.skill.energy;
    energy = 0;
    
    // 加载宠物等级
    loadPetData();
    
    return currentPet;
  }
  
  // 加载宠物数据
  function loadPetData() {
    if (!window.WX || !window.WX.storage) return;
    
    const saved = window.WX.storage.getItem('petData');
    if (saved && saved[currentPet.id]) {
      petLevel = saved[currentPet.id].level || 1;
      petExp = saved[currentPet.id].exp || 0;
    } else {
      petLevel = 1;
      petExp = 0;
    }
  }
  
  // 保存宠物数据
  function savePetData() {
    if (!window.WX || !window.WX.storage) return;
    
    const saved = window.WX.storage.getItem('petData') || {};
    saved[currentPet.id] = {
      level: petLevel,
      exp: petExp
    };
    window.WX.storage.setItem('petData', saved);
  }
  
  // 增加能量
  function addEnergy(amount) {
    if (!currentPet) return;
    
    // 根据宠物等级增加能量获取
    const levelBonus = 1 + (petLevel - 1) * 0.1;
    energy += Math.floor(amount * levelBonus);
    
    if (energy >= maxEnergy) {
      energy = maxEnergy;
      
      // 技能就绪
      if (callbacks.onSkillReady) {
        callbacks.onSkillReady(currentPet);
      }
    }
    
    if (callbacks.onEnergyChange) {
      callbacks.onEnergyChange(energy, maxEnergy);
    }
  }
  
  // 使用技能
  function useSkill(boardState) {
    if (!currentPet || energy < maxEnergy) {
      return { success: false, message: '能量不足' };
    }
    
    energy = 0;
    
    if (callbacks.onEnergyChange) {
      callbacks.onEnergyChange(energy, maxEnergy);
    }
    
    // 播放技能音效
    if (window.Sound) {
      window.Sound.playSound('petSkill');
    }
    
    // 创建技能粒子效果
    if (window.Particles) {
      window.Particles.createPetSkillEffect(
        boardState.centerX || 200,
        boardState.centerY || 300,
        currentPet.element
      );
    }
    
    // 震动反馈
    if (window.WX && window.WX.vibrate) {
      window.WX.vibrate.long();
    }
    
    // 触发技能回调
    if (callbacks.onSkillUse) {
      callbacks.onSkillUse(currentPet);
    }
    
    // 增加经验
    addExp(10);
    
    return {
      success: true,
      pet: currentPet,
      effect: currentPet.skill.effect,
      damage: currentPet.skill.damage * (1 + (petLevel - 1) * 0.1)
    };
  }
  
  // 检查技能是否就绪
  function isSkillReady() {
    return energy >= maxEnergy;
  }
  
  // 获取当前宠物
  function getCurrentPet() {
    return currentPet;
  }
  
  // 获取能量
  function getEnergy() {
    return { energy, maxEnergy };
  }
  
  // 获取宠物等级
  function getPetLevel() {
    return { level: petLevel, exp: petExp };
  }
  
  // 增加经验
  function addExp(amount) {
    petExp += amount;
    
    const expNeeded = petLevel * 100;
    
    while (petExp >= expNeeded) {
      petExp -= expNeeded;
      petLevel++;
      
      // 升级时减少能量需求
      maxEnergy = Math.max(50, currentPet.skill.energy - (petLevel - 1) * 5);
    }
    
    savePetData();
  }
  
  // 切换宠物
  function switchPet(petId) {
    if (!window.Shop) return false;
    
    const shopData = window.Shop.getShopData();
    const ownedPet = shopData.pets.find(p => p.id === petId && p.owned);
    
    if (!ownedPet) return false;
    
    currentPet = petConfigs[petId];
    maxEnergy = currentPet.skill.energy - (petLevel - 1) * 5;
    energy = 0;
    
    loadPetData();
    
    if (callbacks.onEnergyChange) {
      callbacks.onEnergyChange(energy, maxEnergy);
    }
    
    return true;
  }
  
  // 获取所有宠物配置
  function getAllPets() {
    return Object.values(petConfigs);
  }
  
  // 获取拥有的宠物
  function getOwnedPets() {
    if (!window.Shop) return [petConfigs.fire_dragon];
    
    const shopData = window.Shop.getShopData();
    return shopData.pets
      .filter(p => p.owned)
      .map(p => petConfigs[p.id])
      .filter(p => p);
  }
  
  // 绘制宠物
  function drawPet(ctx, x, y, size, options = {}) {
    if (!currentPet) return;
    
    ctx.save();
    
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    // 绘制光环
    if (options.showGlow || isSkillReady()) {
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.7);
      glowGradient.addColorStop(0, currentPet.color);
      glowGradient.addColorStop(0.5, currentPet.color + '80');
      glowGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 根据宠物类型绘制不同的形状
    switch (currentPet.element) {
      case 'fire':
        drawFireDragon(ctx, centerX, centerY, size * 0.4);
        break;
      case 'ice':
        drawIcePhoenix(ctx, centerX, centerY, size * 0.4);
        break;
      case 'thunder':
        drawThunderCat(ctx, centerX, centerY, size * 0.4);
        break;
      case 'rainbow':
        drawRainbowDragon(ctx, centerX, centerY, size * 0.4);
        break;
    }
    
    ctx.restore();
  }
  
  // 绘制火龙
  function drawFireDragon(ctx, cx, cy, radius) {
    // 身体
    const bodyGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    bodyGradient.addColorStop(0, '#FF6347');
    bodyGradient.addColorStop(0.7, '#FF4500');
    bodyGradient.addColorStop(1, '#CC3700');
    
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 翅膀
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.3, cy);
    ctx.lineTo(cx - radius * 1.2, cy - radius * 0.5);
    ctx.lineTo(cx - radius * 0.8, cy);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(cx + radius * 0.3, cy);
    ctx.lineTo(cx + radius * 1.2, cy - radius * 0.5);
    ctx.lineTo(cx + radius * 0.8, cy);
    ctx.closePath();
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.3, cy - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + radius * 0.3, cy - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.3, cy - radius * 0.2, radius * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + radius * 0.3, cy - radius * 0.2, radius * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    // 火焰
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI / 2 + (i - 1) * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * radius * 0.3, cy - radius * 0.8);
      ctx.lineTo(cx + Math.cos(angle - 0.2) * radius * 0.5, cy - radius * 1.3);
      ctx.lineTo(cx + Math.cos(angle + 0.2) * radius * 0.5, cy - radius * 1.3);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  // 绘制冰凤
  function drawIcePhoenix(ctx, cx, cy, radius) {
    // 身体
    const bodyGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    bodyGradient.addColorStop(0, '#87CEEB');
    bodyGradient.addColorStop(0.7, '#00BFFF');
    bodyGradient.addColorStop(1, '#0099CC');
    
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 翅膀
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.3, cy);
    ctx.quadraticCurveTo(cx - radius * 1.5, cy - radius * 0.8, cx - radius * 1.2, cy + radius * 0.3);
    ctx.lineTo(cx - radius * 0.5, cy + radius * 0.2);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(cx + radius * 0.3, cy);
    ctx.quadraticCurveTo(cx + radius * 1.5, cy - radius * 0.8, cx + radius * 1.2, cy + radius * 0.3);
    ctx.lineTo(cx + radius * 0.5, cy + radius * 0.2);
    ctx.closePath();
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.25, cy - radius * 0.15, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + radius * 0.25, cy - radius * 0.15, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#0066CC';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.25, cy - radius * 0.15, radius * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + radius * 0.25, cy - radius * 0.15, radius * 0.06, 0, Math.PI * 2);
    ctx.fill();
    
    // 冰晶
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI / 2 + (i - 1) * 0.4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * radius * 0.2, cy - radius * 0.7);
      ctx.lineTo(cx + Math.cos(angle) * radius * 0.4, cy - radius * 1.2);
      ctx.stroke();
    }
  }
  
  // 绘制雷猫
  function drawThunderCat(ctx, cx, cy, radius) {
    // 身体
    const bodyGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    bodyGradient.addColorStop(0, '#FFE066');
    bodyGradient.addColorStop(0.7, '#FFD700');
    bodyGradient.addColorStop(1, '#CCB000');
    
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 耳朵
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.5, cy - radius * 0.5);
    ctx.lineTo(cx - radius * 0.3, cy - radius * 1.1);
    ctx.lineTo(cx - radius * 0.1, cy - radius * 0.6);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(cx + radius * 0.5, cy - radius * 0.5);
    ctx.lineTo(cx + radius * 0.3, cy - radius * 1.1);
    ctx.lineTo(cx + radius * 0.1, cy - radius * 0.6);
    ctx.closePath();
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(cx - radius * 0.3, cy - radius * 0.1, radius * 0.18, radius * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + radius * 0.3, cy - radius * 0.1, radius * 0.18, radius * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(cx - radius * 0.3, cy - radius * 0.1, radius * 0.08, radius * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + radius * 0.3, cy - radius * 0.1, radius * 0.08, radius * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 闪电标记
    ctx.strokeStyle = '#FF6600';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + radius * 0.2);
    ctx.lineTo(cx - radius * 0.15, cy + radius * 0.5);
    ctx.lineTo(cx + radius * 0.05, cy + radius * 0.5);
    ctx.lineTo(cx - radius * 0.1, cy + radius * 0.8);
    ctx.stroke();
  }
  
  // 绘制彩虹龙
  function drawRainbowDragon(ctx, cx, cy, radius) {
    // 彩虹身体
    const rainbowColors = ['#FF4757', '#FF9F43', '#FFD32A', '#26DE81', '#45AAF2', '#A55EEA'];
    const segmentAngle = (Math.PI * 2) / rainbowColors.length;
    
    rainbowColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, i * segmentAngle, (i + 1) * segmentAngle);
      ctx.closePath();
      ctx.fill();
    });
    
    // 中心圆
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 翅膀
    ctx.fillStyle = 'rgba(255, 105, 180, 0.7)';
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.3, cy);
    ctx.quadraticCurveTo(cx - radius * 1.5, cy - radius * 0.5, cx - radius * 1.3, cy + radius * 0.4);
    ctx.lineTo(cx - radius * 0.5, cy + radius * 0.2);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(cx + radius * 0.3, cy);
    ctx.quadraticCurveTo(cx + radius * 1.5, cy - radius * 0.5, cx + radius * 1.3, cy + radius * 0.4);
    ctx.lineTo(cx + radius * 0.5, cy + radius * 0.2);
    ctx.closePath();
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.2, cy - radius * 0.1, radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + radius * 0.2, cy - radius * 0.1, radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // 星星装饰
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const starX = cx + Math.cos(angle) * radius * 0.3;
      const starY = cy + Math.sin(angle) * radius * 0.3;
      drawMiniStar(ctx, starX, starY, 5, radius * 0.08, radius * 0.04);
    }
  }
  
  // 绘制小星星
  function drawMiniStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
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
  
  // 绘制能量条
  function drawEnergyBar(ctx, x, y, width, height) {
    if (!currentPet) return;
    
    ctx.save();
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    _drawRoundRect(ctx, x, y, width, height, height / 2);
    ctx.fill();
    
    // 能量条
    const energyWidth = (energy / maxEnergy) * (width - 4);
    
    const energyGradient = ctx.createLinearGradient(x, y, x + width, y);
    energyGradient.addColorStop(0, currentPet.color);
    energyGradient.addColorStop(1, currentPet.color + '80');
    
    ctx.fillStyle = energyGradient;
    ctx.beginPath();
    _drawRoundRect(ctx, x + 2, y + 2, energyWidth, height - 4, (height - 4) / 2);
    ctx.fill();
    
    // 就绪时的闪烁效果
    if (isSkillReady()) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      _drawRoundRect(ctx, x, y, width, height, height / 2);
      ctx.stroke();
    }
    
    // 文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${height * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${energy}/${maxEnergy}`, x + width / 2, y + height / 2);
    
    ctx.restore();
  }
  
  // 设置回调
  function setCallbacks(cbs) {
    callbacks = { ...callbacks, ...cbs };
  }
  
  // 导出全局API
  window.Pet = {
    init,
    addEnergy,
    useSkill,
    isSkillReady,
    getCurrentPet,
    getEnergy,
    getPetLevel,
    addExp,
    switchPet,
    getAllPets,
    getOwnedPets,
    drawPet,
    drawEnergyBar,
    setCallbacks
  };
  
})();
