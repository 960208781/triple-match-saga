/**
 * 商城系统
 * 积分兑换皮肤/道具/宠物
 */

(function() {
  'use strict';
  
  // 积分系统
  let points = 0;
  let dailyPoints = 0;
  let lastDailyReset = Date.now();
  
  // 商城物品配置
  const shopItems = {
    // 皮肤类（永久）
    skins: [
      {
        id: 'golden_candy',
        name: '金色糖果皮肤',
        description: '所有糖果变成金色！',
        price: 500,
        icon: 'golden',
        owned: false
      },
      {
        id: 'rainbow_effect',
        name: '彩虹特效皮肤',
        description: '消除时产生彩虹特效',
        price: 1000,
        icon: 'rainbow',
        owned: false
      },
      {
        id: 'dark_style',
        name: '暗黑风格皮肤',
        description: '酷炫的暗黑主题',
        price: 800,
        icon: 'dark',
        owned: false
      },
      {
        id: 'cute_animal',
        name: '可爱动物皮肤',
        description: '所有元素变成可爱动物',
        price: 600,
        icon: 'cute',
        owned: false
      }
    ],
    
    // 道具类（消耗）
    items: [
      {
        id: 'hammer',
        name: '锤子',
        description: '消除单个元素',
        price: 20,
        count: 0,
        icon: 'hammer'
      },
      {
        id: 'bomb',
        name: '炸弹',
        description: '消除周围3x3范围',
        price: 30,
        count: 0,
        icon: 'bomb'
      },
      {
        id: 'refresh',
        name: '刷新',
        description: '重新排列所有元素',
        price: 15,
        count: 0,
        icon: 'refresh'
      },
      {
        id: 'extra_moves',
        name: '+5步',
        description: '增加5步移动机会',
        price: 10,
        count: 0,
        icon: 'moves'
      },
      {
        id: 'rainbow_candy',
        name: '彩虹糖',
        description: '消除所有同色元素',
        price: 40,
        count: 0,
        icon: 'rainbow'
      }
    ],
    
    // 宠物类
    pets: [
      {
        id: 'fire_dragon',
        name: '火龙皮肤',
        description: '火焰攻击，造成范围伤害',
        price: 300,
        owned: false,
        icon: 'fire_dragon',
        skill: {
          name: '火焰吐息',
          description: '消除一行元素',
          damage: 30
        }
      },
      {
        id: 'ice_phoenix',
        name: '冰凤皮肤',
        description: '冰冻攻击，减缓敌人',
        price: 300,
        owned: false,
        icon: 'ice_phoenix',
        skill: {
          name: '冰霜之翼',
          description: '冻结随机元素',
          damage: 25
        }
      },
      {
        id: 'thunder_cat',
        name: '雷猫皮肤',
        description: '闪电攻击，连锁伤害',
        price: 300,
        owned: false,
        icon: 'thunder_cat',
        skill: {
          name: '雷霆一击',
          description: '随机消除5个元素',
          damage: 35
        }
      },
      {
        id: 'rainbow_dragon',
        name: '彩虹龙（稀有）',
        description: '传说中的彩虹龙，全屏攻击',
        price: 1000,
        owned: false,
        icon: 'rainbow_dragon',
        rare: true,
        skill: {
          name: '彩虹毁灭',
          description: '消除所有元素',
          damage: 100
        }
      }
    ]
  };
  
  // 每日任务
  const dailyTasks = [
    {
      id: 'complete_levels',
      name: '完成3关',
      description: '完成任意3个关卡',
      target: 3,
      progress: 0,
      reward: 100,
      completed: false
    },
    {
      id: 'perfect_clear',
      name: '完美通关',
      description: '获得3星评价',
      target: 1,
      progress: 0,
      reward: 50,
      completed: false
    },
    {
      id: 'combo_master',
      name: '连击大师',
      description: '达成5连击',
      target: 1,
      progress: 0,
      reward: 30,
      completed: false
    },
    {
      id: 'use_items',
      name: '道具使用',
      description: '使用任意道具3次',
      target: 3,
      progress: 0,
      reward: 20,
      completed: false
    }
  ];
  
  // 连续登录奖励
  const loginRewards = [
    { day: 1, reward: { points: 50 } },
    { day: 2, reward: { points: 80 } },
    { day: 3, reward: { points: 100, item: 'hammer', count: 3 } },
    { day: 4, reward: { points: 120 } },
    { day: 5, reward: { points: 150 } },
    { day: 6, reward: { points: 180 } },
    { day: 7, reward: { points: 200, skin: 'golden_candy' } },
    { day: 15, reward: { points: 500, pet: 'rainbow_dragon' } }
  ];
  
  // 当前登录状态
  let loginStreak = 0;
  let lastLoginDate = '';
  
  // 初始化商城
  function init() {
    // 从存储加载数据
    loadData();
    
    // 检查每日重置
    checkDailyReset();
  }
  
  // 加载数据
  function loadData() {
    if (!window.WX || !window.WX.storage) return;
    
    const savedData = window.WX.storage.getItem('shopData');
    if (savedData) {
      points = savedData.points || 0;
      loginStreak = savedData.loginStreak || 0;
      lastLoginDate = savedData.lastLoginDate || '';
      
      // 加载物品拥有状态
      if (savedData.skins) {
        savedData.skins.forEach(skinId => {
          const skin = shopItems.skins.find(s => s.id === skinId);
          if (skin) skin.owned = true;
        });
      }
      
      if (savedData.items) {
        Object.keys(savedData.items).forEach(itemId => {
          const item = shopItems.items.find(i => i.id === itemId);
          if (item) item.count = savedData.items[itemId];
        });
      }
      
      if (savedData.pets) {
        savedData.pets.forEach(petId => {
          const pet = shopItems.pets.find(p => p.id === petId);
          if (pet) pet.owned = true;
        });
      }
    }
  }
  
  // 保存数据
  function saveData() {
    if (!window.WX || !window.WX.storage) return;
    
    const data = {
      points,
      loginStreak,
      lastLoginDate,
      skins: shopItems.skins.filter(s => s.owned).map(s => s.id),
      items: {},
      pets: shopItems.pets.filter(p => p.owned).map(p => p.id)
    };
    
    shopItems.items.forEach(item => {
      if (item.count > 0) {
        data.items[item.id] = item.count;
      }
    });
    
    window.WX.storage.setItem('shopData', data);
  }
  
  // 检查每日重置
  function checkDailyReset() {
    const today = new Date().toDateString();
    
    if (lastLoginDate !== today) {
      // 检查连续登录
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastLoginDate === yesterday.toDateString()) {
        loginStreak++;
      } else if (lastLoginDate !== '') {
        loginStreak = 1;
      } else {
        loginStreak = 1;
      }
      
      lastLoginDate = today;
      dailyPoints = 0;
      
      // 重置每日任务
      dailyTasks.forEach(task => {
        task.progress = 0;
        task.completed = false;
      });
      
      saveData();
      
      // 返回登录奖励信息
      return checkLoginReward();
    }
    
    return null;
  }
  
  // 检查登录奖励
  function checkLoginReward() {
    const reward = loginRewards.find(r => r.day === loginStreak);
    if (reward) {
      // 发放奖励
      if (reward.reward.points) {
        points += reward.reward.points;
      }
      if (reward.reward.item) {
        const item = shopItems.items.find(i => i.id === reward.reward.item);
        if (item) {
          item.count += reward.reward.count || 1;
        }
      }
      if (reward.reward.skin) {
        const skin = shopItems.skins.find(s => s.id === reward.reward.skin);
        if (skin) {
          skin.owned = true;
        }
      }
      if (reward.reward.pet) {
        const pet = shopItems.pets.find(p => p.id === reward.reward.pet);
        if (pet) {
          pet.owned = true;
        }
      }
      
      saveData();
      return reward;
    }
    return null;
  }
  
  // 获取积分
  function getPoints() {
    return points;
  }
  
  // 添加积分
  function addPoints(amount, reason = '') {
    points += amount;
    dailyPoints += amount;
    saveData();
    
    console.log(`获得 ${amount} 积分${reason ? ` (${reason})` : ''}，当前积分: ${points}`);
    
    return points;
  }
  
  // 消费积分
  function spendPoints(amount) {
    if (points < amount) {
      return false;
    }
    points -= amount;
    saveData();
    return true;
  }
  
  // 购买物品
  function purchaseItem(category, itemId, quantity = 1) {
    const categoryItems = shopItems[category];
    if (!categoryItems) return { success: false, message: '无效的分类' };
    
    const item = categoryItems.find(i => i.id === itemId);
    if (!item) return { success: false, message: '物品不存在' };
    
    const totalPrice = item.price * quantity;
    
    if (item.owned && category !== 'items') {
      return { success: false, message: '已拥有此物品' };
    }
    
    if (!spendPoints(totalPrice)) {
      return { success: false, message: '积分不足' };
    }
    
    // 发放物品
    if (category === 'items') {
      item.count += quantity;
    } else {
      item.owned = true;
    }
    
    saveData();
    
    // 播放购买音效
    if (window.Sound) {
      window.Sound.playSound('purchase');
    }
    
    return { 
      success: true, 
      message: `购买成功！获得 ${item.name}${quantity > 1 ? ` x${quantity}` : ''}` 
    };
  }
  
  // 使用道具
  function useItem(itemId) {
    const item = shopItems.items.find(i => i.id === itemId);
    if (!item || item.count <= 0) {
      return { success: false, message: '道具不足' };
    }
    
    item.count--;
    saveData();
    
    // 更新每日任务
    updateTaskProgress('use_items', 1);
    
    return { success: true, message: `使用了 ${item.name}` };
  }
  
  // 获取道具数量
  function getItemCount(itemId) {
    const item = shopItems.items.find(i => i.id === itemId);
    return item ? item.count : 0;
  }
  
  // 检查皮肤是否拥有
  function hasSkin(skinId) {
    const skin = shopItems.skins.find(s => s.id === skinId);
    return skin ? skin.owned : false;
  }
  
  // 检查宠物是否拥有
  function hasPet(petId) {
    const pet = shopItems.pets.find(p => p.id === petId);
    return pet ? pet.owned : false;
  }
  
  // 更新任务进度
  function updateTaskProgress(taskId, progress) {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;
    
    task.progress += progress;
    
    if (task.progress >= task.target) {
      task.completed = true;
      addPoints(task.reward, `完成任务: ${task.name}`);
    }
    
    saveData();
  }
  
  // 计算得分（含连击加成）
  function calculateScore(baseScore, combo) {
    const comboMultiplier = {
      0: 1,
      1: 1,
      2: 1.5,
      3: 2,
      4: 3,
      5: 5
    };
    
    const multiplier = comboMultiplier[Math.min(combo, 5)] || 5;
    return Math.floor(baseScore * multiplier);
  }
  
  // 看广告获得积分
  async function watchAdForPoints() {
    if (!window.WX || !window.WX.ads) {
      // Web环境模拟
      addPoints(50, '观看广告');
      return { success: true, points: 50 };
    }
    
    try {
      await window.WX.ads.showRewardedVideo();
      addPoints(50, '观看广告');
      return { success: true, points: 50 };
    } catch (err) {
      return { success: false, message: '广告播放失败' };
    }
  }
  
  // 获取商城数据（用于UI显示）
  function getShopData() {
    return {
      points,
      dailyPoints,
      loginStreak,
      skins: shopItems.skins.map(s => ({ ...s })),
      items: shopItems.items.map(i => ({ ...i })),
      pets: shopItems.pets.map(p => ({ ...p })),
      dailyTasks: dailyTasks.map(t => ({ ...t }))
    };
  }
  
  // 初始化
  init();
  
  // 导出全局API
  window.Shop = {
    getPoints,
    addPoints,
    spendPoints,
    purchaseItem,
    useItem,
    getItemCount,
    hasSkin,
    hasPet,
    updateTaskProgress,
    calculateScore,
    watchAdForPoints,
    getShopData,
    checkDailyReset,
    checkLoginReward,
    saveData
  };
  
})();
