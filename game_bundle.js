// Auto-generated bundle - do not edit manually
(function() {
"use strict";


// ==================== wechat.js ====================
(function() {
/**
 * 微信小游戏API适配层
 * 提供微信API的统一接口，支持Web预览
 */

(function() {
  'use strict';
  
  // 检测是否在微信小游戏环境
  const isWechat = typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function';
  
  // 存储系统
  const storage = {
    data: {},
    
    setItem(key, value) {
      try {
        if (isWechat) {
          wx.setStorageSync(key, value);
        } else {
          this.data[key] = value;
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (e) {
        console.error('Storage setItem error:', e);
      }
    },
    
    getItem(key, defaultValue = null) {
      try {
        if (isWechat) {
          const value = wx.getStorageSync(key);
          return value !== '' && value !== undefined ? value : defaultValue;
        } else {
          const value = this.data[key] || JSON.parse(localStorage.getItem(key) || 'null');
          return value !== null ? value : defaultValue;
        }
      } catch (e) {
        console.error('Storage getItem error:', e);
        return defaultValue;
      }
    },
    
    removeItem(key) {
      try {
        if (isWechat) {
          wx.removeStorageSync(key);
        } else {
          delete this.data[key];
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.error('Storage removeItem error:', e);
      }
    },
    
    clear() {
      try {
        if (isWechat) {
          wx.clearStorageSync();
        } else {
          this.data = {};
          localStorage.clear();
        }
      } catch (e) {
        console.error('Storage clear error:', e);
      }
    }
  };
  
  // 广告管理
  const ads = {
    rewardedVideoAd: null,
    interstitialAd: null,
    bannerAd: null,
    config: null,
    lastRewardTime: 0,
    
    async init() {
      if (!isWechat) return;
      
      try {
        // 加载广告配置
        const fs = wx.getFileSystemManager();
        const configStr = fs.readFileSync('ads.json', 'utf8');
        this.config = JSON.parse(configStr);
        
        if (!this.config.enableAds) return;
        
        // 创建激励视频广告
        if (this.config.rewardedVideoId) {
          this.rewardedVideoAd = wx.createRewardedVideoAd({
            adUnitId: this.config.rewardedVideoId
          });
          
          this.rewardedVideoAd.onClose((res) => {
            if (res && res.isEnded) {
              // 广告正常播放结束
              window.dispatchEvent && window.dispatchEvent({
                type: 'adRewardComplete',
                data: res
              });
            } else {
              // 广告播放中途退出
              window.dispatchEvent && window.dispatchEvent({
                type: 'adRewardCancelled'
              });
            }
          });
          
          this.rewardedVideoAd.onError((err) => {
            console.error('激励视频广告错误:', err);
          });
        }
        
        // 创建插屏广告
        if (this.config.interstitialId) {
          this.interstitialAd = wx.createInterstitialAd({
            adUnitId: this.config.interstitialId
          });
          
          this.interstitialAd.onError((err) => {
            console.error('插屏广告错误:', err);
          });
        }
        
        // 创建Banner广告
        if (this.config.bannerId) {
          this.bannerAd = wx.createBannerAd({
            adUnitId: this.config.bannerId,
            style: {
              left: 0,
              top: 0,
              width: 300
            }
          });
          
          this.bannerAd.onError((err) => {
            console.error('Banner广告错误:', err);
          });
        }
        
      } catch (e) {
        console.error('广告初始化失败:', e);
      }
    },
    
    async showRewardedVideo() {
      if (!isWechat || !this.rewardedVideoAd) {
        // Web环境下模拟广告完成
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ isEnded: true });
          }, 1000);
        });
      }
      
      // 检查冷却时间
      const now = Date.now();
      if (this.config && now - this.lastRewardTime < this.config.adSettings.rewardedAdCooldown) {
        throw new Error('广告冷却中，请稍后再试');
      }
      
      try {
        await this.rewardedVideoAd.show();
        this.lastRewardTime = now;
        return { isEnded: true };
      } catch (err) {
        console.error('显示激励视频广告失败:', err);
        // 预加载广告
        this.rewardedVideoAd.load();
        throw err;
      }
    },
    
    async showInterstitial() {
      if (!isWechat || !this.interstitialAd) {
        return;
      }
      
      try {
        await this.interstitialAd.show();
      } catch (err) {
        console.error('显示插屏广告失败:', err);
        this.interstitialAd.load();
      }
    },
    
    showBanner() {
      if (!isWechat || !this.bannerAd) return;
      
      try {
        const systemInfo = wx.getSystemInfoSync();
        this.bannerAd.style.left = (systemInfo.windowWidth - this.bannerAd.style.width) / 2;
        this.bannerAd.style.top = systemInfo.windowHeight - 80;
        this.bannerAd.show();
      } catch (err) {
        console.error('显示Banner广告失败:', err);
      }
    },
    
    hideBanner() {
      if (!isWechat || !this.bannerAd) return;
      this.bannerAd.hide();
    }
  };
  
  // 分享功能
  const share = {
    shareMenuShown: false,
    
    init() {
      if (!isWechat) return;
      
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
      
      wx.onShareAppMessage(() => {
        return {
          title: '三消奇缘 - 来和我一起冒险吧！',
          imageUrl: 'share.png',
          query: 'from=share'
        };
      });
      
      wx.onShareTimeline(() => {
        return {
          title: '三消奇缘 - 最好玩的三消游戏！',
          imageUrl: 'share.png'
        };
      });
    },
    
    shareToFriend(score, level) {
      if (!isWechat) {
        console.log('分享给好友:', { score, level });
        return;
      }
      
      wx.shareAppMessage({
        title: `我在三消奇缘第${level}关获得了${score}分！来挑战我吧！`,
        imageUrl: 'share.png',
        query: `level=${level}&score=${score}`
      });
    }
  };
  
  // 震动反馈
  const vibrate = {
    short() {
      if (isWechat) {
        wx.vibrateShort({ type: 'medium' });
      } else if (navigator && navigator.vibrate) {
        navigator.vibrate(15);
      }
    },
    
    long() {
      if (isWechat) {
        wx.vibrateLong();
      } else if (navigator && navigator.vibrate) {
        navigator.vibrate(100);
      }
    }
  };
  
  // 系统信息
  const getSystemInfo = () => {
    if (isWechat) {
      return wx.getSystemInfoSync();
    }
    return {
      windowWidth: window.innerWidth || 375,
      windowHeight: window.innerHeight || 667,
      pixelRatio: window.devicePixelRatio || 2,
      platform: 'web'
    };
  };
  
  // 用户信息
  const getUserInfo = () => {
    return new Promise((resolve, reject) => {
      if (!isWechat) {
        resolve({
          userInfo: {
            nickName: '玩家',
            avatarUrl: ''
          }
        });
        return;
      }
      
      wx.getUserInfo({
        success: resolve,
        fail: reject
      });
    });
  };
  
  // 登录
  const login = () => {
    return new Promise((resolve, reject) => {
      if (!isWechat) {
        resolve({ code: 'mock_code' });
        return;
      }
      
      wx.login({
        success: resolve,
        fail: reject
      });
    });
  };
  
  // 创建用户反馈按钮
  const createFeedbackButton = (x, y, width, height) => {
    if (!isWechat) return null;
    
    const button = wx.createGameClubButton({
      type: 'text',
      text: '反馈',
      style: {
        left: x,
        top: y,
        width: width,
        height: height,
        lineHeight: height,
        backgroundColor: '#ff0000',
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
        borderRadius: 4
      }
    });
    
    return button;
  };
  
  // 导出全局API
  window.WX = {
    isWechat,
    storage,
    ads,
    share,
    vibrate,
    getSystemInfo,
    getUserInfo,
    login,
    createFeedbackButton
  };
  
  // 初始化广告
  ads.init();
  share.init();
  
})();

})();

// ==================== sound.js ====================
(function() {
/**
 * 音效系统
 * 使用Web Audio API实现音效播放
 */

(function() {
  'use strict';
  
  // 音频上下文
  let audioContext = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  
  // 音效缓存
  const soundCache = {};
  
  // 当前播放的背景音乐
  let currentMusic = null;
  let currentMusicSource = null;
  
  // 音量设置
  let musicVolume = 0.5;
  let sfxVolume = 0.7;
  let isMuted = false;
  
  // 初始化音频系统
  function init() {
    try {
      if (typeof wx !== 'undefined' && wx.createWebAudioContext) {
        audioContext = wx.createWebAudioContext();
      } else if (window.AudioContext) {
        audioContext = new window.AudioContext();
      } else if (window.webkitAudioContext) {
        audioContext = new window.webkitAudioContext();
      }
      
      if (audioContext) {
        // 创建主音量控制
        masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
        
        // 创建音乐音量控制
        musicGain = audioContext.createGain();
        musicGain.connect(masterGain);
        musicGain.gain.value = musicVolume;
        
        // 创建音效音量控制
        sfxGain = audioContext.createGain();
        sfxGain.connect(masterGain);
        sfxGain.gain.value = sfxVolume;
      }
      
      // 从存储加载音量设置
      const savedSettings = window.WX && window.WX.storage.getItem('soundSettings');
      if (savedSettings) {
        musicVolume = savedSettings.musicVolume || 0.5;
        sfxVolume = savedSettings.sfxVolume || 0.7;
        isMuted = savedSettings.isMuted || false;
        
        if (musicGain) musicGain.gain.value = isMuted ? 0 : musicVolume;
        if (sfxGain) sfxGain.gain.value = isMuted ? 0 : sfxVolume;
      }
      
    } catch (e) {
      console.error('音频系统初始化失败:', e);
    }
  }
  
  // 生成简单的音效波形
  function generateTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!audioContext) return null;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(sfxGain);
    
    return { oscillator, gainNode, duration };
  }
  
  // 预定义音效
  const soundEffects = {
    // 消除音效
    match: () => {
      const tone = generateTone(880, 0.15, 'sine', 0.4);
      if (tone) {
        tone.oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.1);
        tone.oscillator.start();
        tone.oscillator.stop(audioContext.currentTime + tone.duration);
      }
    },
    
    // 连击音效
    combo: (level) => {
      const baseFreq = 600 + level * 100;
      const tone = generateTone(baseFreq, 0.2, 'triangle', 0.3);
      if (tone) {
        tone.oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, audioContext.currentTime + 0.15);
        tone.oscillator.start();
        tone.oscillator.stop(audioContext.currentTime + tone.duration);
      }
    },
    
    // 特殊糖果消除
    special: () => {
      [0, 0.1, 0.2].forEach((delay, i) => {
        setTimeout(() => {
          const tone = generateTone(800 + i * 200, 0.15, 'sine', 0.25);
          if (tone) {
            tone.oscillator.start();
            tone.oscillator.stop(audioContext.currentTime + tone.duration);
          }
        }, delay * 1000);
      });
    },
    
    // 移动音效
    move: () => {
      const tone = generateTone(440, 0.08, 'sine', 0.2);
      if (tone) {
        tone.oscillator.start();
        tone.oscillator.stop(audioContext.currentTime + tone.duration);
      }
    },
    
    // 无效移动
    invalid: () => {
      const tone = generateTone(200, 0.15, 'square', 0.15);
      if (tone) {
        tone.oscillator.start();
        tone.oscillator.stop(audioContext.currentTime + tone.duration);
      }
    },
    
    // 关卡完成
    levelComplete: () => {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const tone = generateTone(freq, 0.3, 'sine', 0.3);
          if (tone) {
            tone.oscillator.start();
            tone.oscillator.stop(audioContext.currentTime + tone.duration);
          }
        }, i * 150);
      });
    },
    
    // 关卡失败
    levelFail: () => {
      const notes = [400, 350, 300, 250];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const tone = generateTone(freq, 0.25, 'sine', 0.25);
          if (tone) {
            tone.oscillator.start();
            tone.oscillator.stop(audioContext.currentTime + tone.duration);
          }
        }, i * 200);
      });
    },
    
    // 按钮点击
    click: () => {
      const tone = generateTone(600, 0.05, 'sine', 0.15);
      if (tone) {
        tone.oscillator.start();
        tone.oscillator.stop(audioContext.currentTime + tone.duration);
      }
    },
    
    // 购买成功
    purchase: () => {
      const notes = [660, 880, 1100];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const tone = generateTone(freq, 0.15, 'sine', 0.25);
          if (tone) {
            tone.oscillator.start();
            tone.oscillator.stop(audioContext.currentTime + tone.duration);
          }
        }, i * 100);
      });
    },
    
    // 宠物技能
    petSkill: () => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const tone = generateTone(400 + i * 150, 0.1, 'sawtooth', 0.15);
          if (tone) {
            tone.oscillator.start();
            tone.oscillator.stop(audioContext.currentTime + tone.duration);
          }
        }, i * 50);
      }
    },
    
    // 获得奖励
    reward: () => {
      const notes = [523, 659, 784, 659, 784, 1047];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const tone = generateTone(freq, 0.15, 'sine', 0.25);
          if (tone) {
            tone.oscillator.start();
            tone.oscillator.stop(audioContext.currentTime + tone.duration);
          }
        }, i * 80);
      });
    },
    
    // 彩蛋触发
    easterEgg: () => {
      const notes = [523, 659, 784, 1047, 1319, 1568, 2093];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const tone = generateTone(freq, 0.2, 'sine', 0.3);
          if (tone) {
            tone.oscillator.start();
            tone.oscillator.stop(audioContext.currentTime + tone.duration);
          }
        }, i * 100);
      });
    }
  };
  
  // 播放音效
  function playSound(name, ...args) {
    if (isMuted || !audioContext) return;
    
    // 恢复音频上下文（移动端需要用户交互后才能播放）
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const effect = soundEffects[name];
    if (effect) {
      effect(...args);
    }
  }
  
  // 播放背景音乐（简单的程序生成音乐）
  function playMusic(name) {
    if (!audioContext || isMuted) return;
    
    // 恢复音频上下文
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    stopMusic();
    currentMusic = name;
    
    // 简单的背景音乐循环
    const musicPatterns = {
      main: {
        notes: [262, 294, 330, 294, 262, 330, 392, 330],
        tempo: 400
      },
      game: {
        notes: [330, 392, 440, 392, 330, 294, 262, 294],
        tempo: 350
      },
      shop: {
        notes: [392, 440, 494, 440, 392, 330, 294, 330],
        tempo: 500
      }
    };
    
    const pattern = musicPatterns[name] || musicPatterns.main;
    let noteIndex = 0;
    
    function playNextNote() {
      if (!currentMusic || currentMusic !== name) return;
      
      const freq = pattern.notes[noteIndex];
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + pattern.tempo / 1000 * 0.8);
      
      oscillator.connect(gainNode);
      gainNode.connect(musicGain);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + pattern.tempo / 1000);
      
      noteIndex = (noteIndex + 1) % pattern.notes.length;
      
      currentMusicSource = setTimeout(playNextNote, pattern.tempo);
    }
    
    playNextNote();
  }
  
  // 停止背景音乐
  function stopMusic() {
    if (currentMusicSource) {
      clearTimeout(currentMusicSource);
      currentMusicSource = null;
    }
    currentMusic = null;
  }
  
  // 设置音乐音量
  function setMusicVolume(volume) {
    musicVolume = Math.max(0, Math.min(1, volume));
    if (musicGain) {
      musicGain.gain.value = isMuted ? 0 : musicVolume;
    }
    saveSettings();
  }
  
  // 设置音效音量
  function setSfxVolume(volume) {
    sfxVolume = Math.max(0, Math.min(1, volume));
    if (sfxGain) {
      sfxGain.gain.value = isMuted ? 0 : sfxVolume;
    }
    saveSettings();
  }
  
  // 静音切换
  function toggleMute() {
    isMuted = !isMuted;
    if (musicGain) musicGain.gain.value = isMuted ? 0 : musicVolume;
    if (sfxGain) sfxGain.gain.value = isMuted ? 0 : sfxVolume;
    
    if (isMuted) {
      stopMusic();
    } else if (currentMusic) {
      playMusic(currentMusic);
    }
    
    saveSettings();
    return isMuted;
  }
  
  // 保存设置
  function saveSettings() {
    if (window.WX && window.WX.storage) {
      window.WX.storage.setItem('soundSettings', {
        musicVolume,
        sfxVolume,
        isMuted
      });
    }
  }
  
  // 暂停所有声音
  function pauseAllSounds() {
    stopMusic();
    if (audioContext) {
      audioContext.suspend();
    }
  }
  
  // 恢复所有声音
  function resumeAllSounds() {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    if (currentMusic && !isMuted) {
      playMusic(currentMusic);
    }
  }
  
  // 导出全局API
  window.Sound = {
    init,
    playSound,
    playMusic,
    stopMusic,
    setMusicVolume,
    setSfxVolume,
    toggleMute,
    pauseAllSounds,
    resumeAllSounds,
    getMusicVolume: () => musicVolume,
    getSfxVolume: () => sfxVolume,
    isMuted: () => isMuted
  };
  
  window.pauseAllSounds = pauseAllSounds;
  window.resumeAllSounds = resumeAllSounds;
  
})();

})();

// ==================== particles.js ====================
(function() {
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

})();

// ==================== candy.js ====================
(function() {
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

})();

// ==================== animals.js ====================
(function() {
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

})();

// ==================== desserts.js ====================
(function() {
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

})();

// ==================== fruits.js ====================
(function() {
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

})();

// ==================== themes.js ====================
(function() {
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

})();

// ==================== board.js ====================
(function() {
/**
 * 游戏棋盘系统
 * 处理元素匹配、消除、下落等核心逻辑
 */

(function() {
  'use strict';
  
  // 棋盘配置
  const config = {
    cellSize: 48,
    padding: 10,
    rows: 8,
    cols: 8,
    animationDuration: 200
  };
  
  // 棋盘状态
  let board = [];
  let selectedCell = null;
  let isAnimating = false;
  let combo = 0;
  let score = 0;
  let moves = 0;
  let currentTheme = 'candy';
  let currentLevel = 1;
  
  // 元素类型
  let elementTypes = [];
  
  // 回调函数
  let callbacks = {
    onMatch: null,
    onScoreChange: null,
    onMovesChange: null,
    onLevelComplete: null,
    onLevelFail: null,
    onCombo: null
  };
  
  // 初始化棋盘
  function init(level, theme) {
    currentLevel = level;
    currentTheme = theme;
    
    const levelConfig = window.Themes ? window.Themes.getLevelConfig(level) : null;
    
    if (levelConfig) {
      config.rows = levelConfig.boardSize;
      config.cols = levelConfig.boardSize;
      moves = levelConfig.moves;
      elementTypes = window.Themes.getThemeConfig(theme).elements;
    } else {
      moves = 25;
      elementTypes = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    }
    
    score = 0;
    combo = 0;
    selectedCell = null;
    isAnimating = false;
    
    // 创建棋盘
    createBoard();
    
    // 确保没有初始匹配
    while (findMatches().length > 0) {
      createBoard();
    }
    
    // 触发回调
    if (callbacks.onScoreChange) callbacks.onScoreChange(score);
    if (callbacks.onMovesChange) callbacks.onMovesChange(moves);
    
    return getBoardState();
  }
  
  // 创建棋盘
  function createBoard() {
    board = [];
    
    for (let row = 0; row < config.rows; row++) {
      board[row] = [];
      for (let col = 0; col < config.cols; col++) {
        board[row][col] = createCell(row, col);
      }
    }
  }
  
  // 创建单元格
  function createCell(row, col) {
    return {
      row,
      col,
      type: elementTypes[Math.floor(Math.random() * elementTypes.length)],
      special: null, // 'striped_h', 'striped_v', 'wrapped', 'bomb'
      x: col * config.cellSize + config.padding,
      y: row * config.cellSize + config.padding,
      targetX: col * config.cellSize + config.padding,
      targetY: row * config.cellSize + config.padding,
      scale: 1,
      alpha: 1,
      selected: false
    };
  }
  
  // 获取棋盘状态
  function getBoardState() {
    return {
      board: board.map(row => row.map(cell => ({ ...cell }))),
      score,
      moves,
      combo,
      rows: config.rows,
      cols: config.cols,
      cellSize: config.cellSize,
      padding: config.padding
    };
  }
  
  // 处理点击
  function handleClick(x, y) {
    if (isAnimating) return null;
    
    const col = Math.floor((x - config.padding) / config.cellSize);
    const row = Math.floor((y - config.padding) / config.cellSize);
    
    if (row < 0 || row >= config.rows || col < 0 || col >= config.cols) {
      return null;
    }
    
    const cell = board[row][col];
    if (!cell || !cell.type) return null;
    
    if (selectedCell === null) {
      // 第一次选择
      selectedCell = { row, col };
      cell.selected = true;
      
      // 播放音效
      if (window.Sound) window.Sound.playSound('click');
      
      // 震动反馈
      if (window.WX && window.WX.vibrate) window.WX.vibrate.short();
      
      return { type: 'select', cell };
    } else {
      // 第二次选择
      const prevCell = board[selectedCell.row][selectedCell.col];
      prevCell.selected = false;
      
      // 检查是否相邻
      const isAdjacent = (
        (Math.abs(selectedCell.row - row) === 1 && selectedCell.col === col) ||
        (Math.abs(selectedCell.col - col) === 1 && selectedCell.row === row)
      );
      
      if (isAdjacent) {
        // 尝试交换
        return trySwap(selectedCell.row, selectedCell.col, row, col);
      } else {
        // 选择新的单元格
        selectedCell = { row, col };
        cell.selected = true;
        
        if (window.Sound) window.Sound.playSound('click');
        
        return { type: 'select', cell };
      }
    }
  }
  
  // 尝试交换
  function trySwap(row1, col1, row2, col2) {
    selectedCell = null;
    
    // 交换元素
    swapCells(row1, col1, row2, col2);
    
    // 检查是否有匹配
    const matches = findMatches();
    
    if (matches.length > 0) {
      // 有效移动
      moves--;
      if (callbacks.onMovesChange) callbacks.onMovesChange(moves);
      
      // 播放移动音效
      if (window.Sound) window.Sound.playSound('move');
      
      // 处理匹配
      return processMatches(matches);
    } else {
      // 无效移动，交换回来
      swapCells(row1, col1, row2, col2);
      
      // 播放无效音效
      if (window.Sound) window.Sound.playSound('invalid');
      
      return { type: 'invalid' };
    }
  }
  
  // 交换单元格
  function swapCells(row1, col1, row2, col2) {
    const temp = board[row1][col1];
    board[row1][col1] = board[row2][col2];
    board[row2][col2] = temp;
    
    // 更新位置
    board[row1][col1].row = row1;
    board[row1][col1].col = col1;
    board[row2][col2].row = row2;
    board[row2][col2].col = col2;
  }
  
  // 查找匹配
  function findMatches() {
    const matches = [];
    const matched = new Set();
    
    // 检查水平匹配
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols - 2; col++) {
        const type = board[row][col].type;
        if (!type) continue;
        
        let matchLength = 1;
        while (col + matchLength < config.cols && board[row][col + matchLength].type === type) {
          matchLength++;
        }
        
        if (matchLength >= 3) {
          const match = {
            type: 'horizontal',
            cells: [],
            length: matchLength
          };
          
          for (let i = 0; i < matchLength; i++) {
            const key = `${row},${col + i}`;
            if (!matched.has(key)) {
              matched.add(key);
              match.cells.push({ row, col: col + i });
            }
          }
          
          if (match.cells.length >= 3) {
            matches.push(match);
          }
          
          col += matchLength - 1;
        }
      }
    }
    
    // 检查垂直匹配
    for (let col = 0; col < config.cols; col++) {
      for (let row = 0; row < config.rows - 2; row++) {
        const type = board[row][col].type;
        if (!type) continue;
        
        let matchLength = 1;
        while (row + matchLength < config.rows && board[row + matchLength][col].type === type) {
          matchLength++;
        }
        
        if (matchLength >= 3) {
          const match = {
            type: 'vertical',
            cells: [],
            length: matchLength
          };
          
          for (let i = 0; i < matchLength; i++) {
            const key = `${row + i},${col}`;
            if (!matched.has(key)) {
              matched.add(key);
              match.cells.push({ row: row + i, col });
            }
          }
          
          if (match.cells.length >= 3) {
            matches.push(match);
          }
          
          row += matchLength - 1;
        }
      }
    }
    
    return matches;
  }
  
  // 处理匹配
  function processMatches(matches) {
    isAnimating = true;
    combo++;
    
    // 计算得分
    let matchScore = 0;
    const allMatchedCells = [];
    
    matches.forEach(match => {
      match.cells.forEach(cell => {
        allMatchedCells.push(cell);
        
        // 基础分数
        matchScore += 10;
        
        // 特殊糖果额外分数
        const boardCell = board[cell.row][cell.col];
        if (boardCell.special) {
          matchScore += 40;
        }
      });
      
      // 匹配长度奖励
      if (match.length === 4) matchScore += 20;
      if (match.length >= 5) matchScore += 50;
    });
    
    // 连击加成
    matchScore = window.Shop ? window.Shop.calculateScore(matchScore, combo) : matchScore;
    
    score += matchScore;
    if (callbacks.onScoreChange) callbacks.onScoreChange(score);
    
    // 触发连击回调
    if (combo > 1 && callbacks.onCombo) {
      callbacks.onCombo(combo);
    }
    
    // 播放消除音效
    if (window.Sound) {
      window.Sound.playSound('match');
      if (combo > 1) {
        window.Sound.playSound('combo', combo);
      }
    }
    
    // 创建粒子效果
    allMatchedCells.forEach(cell => {
      const boardCell = board[cell.row][cell.col];
      if (window.Particles && boardCell.type) {
        const color = window.Themes ? 
          window.Themes.getElementColor(currentTheme, boardCell.type) : 
          '#FFFFFF';
        window.Particles.createMatchEffect(
          boardCell.x + config.cellSize / 2,
          boardCell.y + config.cellSize / 2,
          color,
          boardCell.special ? 'special' : 'normal'
        );
      }
    });
    
    // 触发匹配回调
    if (callbacks.onMatch) {
      callbacks.onMatch(allMatchedCells, matchScore, combo);
    }
    
    // 检查是否创建特殊糖果
    matches.forEach(match => {
      if (match.length === 4) {
        // 创建条纹糖果
        const centerCell = match.cells[Math.floor(match.cells.length / 2)];
        createSpecialCandy(centerCell.row, centerCell.col, 
          match.type === 'horizontal' ? 'striped_v' : 'striped_h');
      } else if (match.length >= 5) {
        // 创建彩色炸弹
        const centerCell = match.cells[Math.floor(match.cells.length / 2)];
        createSpecialCandy(centerCell.row, centerCell.col, 'bomb');
      }
    });
    
    // 清除匹配的单元格
    setTimeout(() => {
      removeMatchedCells(allMatchedCells);
      
      // 下落并填充
      setTimeout(() => {
        dropCells();
        fillBoard();
        
        setTimeout(() => {
          // 检查新的匹配
          const newMatches = findMatches();
          if (newMatches.length > 0) {
            processMatches(newMatches);
          } else {
            isAnimating = false;
            combo = 0;
            
            // 检查游戏状态
            checkGameState();
          }
        }, config.animationDuration);
      }, config.animationDuration);
    }, config.animationDuration);
    
    return {
      type: 'match',
      matches,
      score: matchScore,
      combo
    };
  }
  
  // 创建特殊糖果
  function createSpecialCandy(row, col, specialType) {
    if (board[row] && board[row][col]) {
      board[row][col].special = specialType;
    }
  }
  
  // 移除匹配的单元格
  function removeMatchedCells(cells) {
    cells.forEach(cell => {
      if (board[cell.row] && board[cell.row][cell.col]) {
        // 检查特殊糖果效果
        const special = board[cell.row][cell.col].special;
        
        if (special === 'striped_h') {
          // 消除整行
          for (let c = 0; c < config.cols; c++) {
            if (board[cell.row][c]) {
              board[cell.row][c].type = null;
            }
          }
        } else if (special === 'striped_v') {
          // 消除整列
          for (let r = 0; r < config.rows; r++) {
            if (board[r] && board[r][cell.col]) {
              board[r][cell.col].type = null;
            }
          }
        } else if (special === 'wrapped') {
          // 消除周围3x3
          for (let r = cell.row - 1; r <= cell.row + 1; r++) {
            for (let c = cell.col - 1; c <= cell.col + 1; c++) {
              if (r >= 0 && r < config.rows && c >= 0 && c < config.cols && board[r][c]) {
                board[r][c].type = null;
              }
            }
          }
        } else if (special === 'bomb') {
          // 消除所有同色
          const targetType = board[cell.row][cell.col].type;
          for (let r = 0; r < config.rows; r++) {
            for (let c = 0; c < config.cols; c++) {
              if (board[r][c] && board[r][c].type === targetType) {
                board[r][c].type = null;
              }
            }
          }
        }
        
        board[cell.row][cell.col].type = null;
        board[cell.row][cell.col].special = null;
      }
    });
  }
  
  // 下落单元格
  function dropCells() {
    for (let col = 0; col < config.cols; col++) {
      let emptyRow = config.rows - 1;
      
      for (let row = config.rows - 1; row >= 0; row--) {
        if (board[row][col].type) {
          if (row !== emptyRow) {
            // 移动到空位
            board[emptyRow][col].type = board[row][col].type;
            board[emptyRow][col].special = board[row][col].special;
            board[row][col].type = null;
            board[row][col].special = null;
          }
          emptyRow--;
        }
      }
    }
  }
  
  // 填充棋盘
  function fillBoard() {
    for (let col = 0; col < config.cols; col++) {
      for (let row = 0; row < config.rows; row++) {
        if (!board[row][col].type) {
          board[row][col].type = elementTypes[Math.floor(Math.random() * elementTypes.length)];
          board[row][col].special = null;
        }
      }
    }
  }
  
  // 检查游戏状态
  function checkGameState() {
    const levelConfig = window.Themes ? window.Themes.getLevelConfig(currentLevel) : null;
    
    if (!levelConfig) return;
    
    // 检查是否达成目标
    if (score >= levelConfig.starScores[0]) {
      // 计算星级
      let stars = 1;
      if (score >= levelConfig.starScores[1]) stars = 2;
      if (score >= levelConfig.starScores[2]) stars = 3;
      
      if (callbacks.onLevelComplete) {
        callbacks.onLevelComplete(stars, score);
      }
    } else if (moves <= 0) {
      // 游戏失败
      if (callbacks.onLevelFail) {
        callbacks.onLevelFail(score);
      }
    }
  }
  
  // 使用道具
  function useItem(itemId, row, col) {
    if (!window.Shop) return false;
    
    const result = window.Shop.useItem(itemId);
    if (!result.success) return false;
    
    switch (itemId) {
      case 'hammer':
        // 锤子：消除单个元素
        if (board[row] && board[row][col]) {
          const cell = board[row][col];
          if (window.Particles) {
            const color = window.Themes ? 
              window.Themes.getElementColor(currentTheme, cell.type) : '#FFFFFF';
            window.Particles.createMatchEffect(
              cell.x + config.cellSize / 2,
              cell.y + config.cellSize / 2,
              color
            );
          }
          cell.type = null;
          cell.special = null;
          dropCells();
          fillBoard();
        }
        break;
        
      case 'bomb':
        // 炸弹：消除3x3范围
        for (let r = row - 1; r <= row + 1; r++) {
          for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < config.rows && c >= 0 && c < config.cols && board[r][c]) {
              const cell = board[r][c];
              if (window.Particles && cell.type) {
                const color = window.Themes ? 
                  window.Themes.getElementColor(currentTheme, cell.type) : '#FFFFFF';
                window.Particles.createMatchEffect(
                  cell.x + config.cellSize / 2,
                  cell.y + config.cellSize / 2,
                  color
                );
              }
              cell.type = null;
              cell.special = null;
            }
          }
        }
        dropCells();
        fillBoard();
        break;
        
      case 'refresh':
        // 刷新：重新排列
        const allTypes = [];
        board.forEach(row => row.forEach(cell => {
          if (cell.type) allTypes.push({ type: cell.type, special: cell.special });
        }));
        
        // 打乱
        for (let i = allTypes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allTypes[i], allTypes[j]] = [allTypes[j], allTypes[i]];
        }
        
        // 重新分配
        let index = 0;
        board.forEach(row => row.forEach(cell => {
          if (index < allTypes.length) {
            cell.type = allTypes[index].type;
            cell.special = allTypes[index].special;
            index++;
          }
        }));
        break;
        
      case 'extra_moves':
        // +5步
        moves += 5;
        if (callbacks.onMovesChange) callbacks.onMovesChange(moves);
        break;
        
      case 'rainbow_candy':
        // 彩虹糖：消除所有同色
        if (board[row] && board[row][col]) {
          const targetType = board[row][col].type;
          for (let r = 0; r < config.rows; r++) {
            for (let c = 0; c < config.cols; c++) {
              if (board[r][c] && board[r][c].type === targetType) {
                const cell = board[r][c];
                if (window.Particles) {
                  const color = window.Themes ? 
                    window.Themes.getElementColor(currentTheme, cell.type) : '#FFFFFF';
                  window.Particles.createMatchEffect(
                    cell.x + config.cellSize / 2,
                    cell.y + config.cellSize / 2,
                    color
                  );
                }
                cell.type = null;
                cell.special = null;
              }
            }
          }
          dropCells();
          fillBoard();
        }
        break;
    }
    
    return true;
  }
  
  // 设置回调
  function setCallbacks(cbs) {
    callbacks = { ...callbacks, ...cbs };
  }
  
  // 获取配置
  function getConfig() {
    return { ...config };
  }
  
  // 设置配置
  function setConfig(newConfig) {
    Object.assign(config, newConfig);
  }
  
  // 导出全局API
  window.Board = {
    init,
    handleClick,
    getBoardState,
    useItem,
    setCallbacks,
    getConfig,
    setConfig,
    findMatches
  };
  
})();

})();

// ==================== pet.js ====================
(function() {
/**
 * 宠物系统
 * 火龙/冰凤/雷猫三大宠物，消除充能释放技能
 */

(function() {
  'use strict';
  
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
    ctx.roundRect(x, y, width, height, height / 2);
    ctx.fill();
    
    // 能量条
    const energyWidth = (energy / maxEnergy) * (width - 4);
    
    const energyGradient = ctx.createLinearGradient(x, y, x + width, y);
    energyGradient.addColorStop(0, currentPet.color);
    energyGradient.addColorStop(1, currentPet.color + '80');
    
    ctx.fillStyle = energyGradient;
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, energyWidth, height - 4, (height - 4) / 2);
    ctx.fill();
    
    // 就绪时的闪烁效果
    if (isSkillReady()) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, height / 2);
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

})();

// ==================== roguelike.js ====================
(function() {
/**
 * Roguelike系统
 * 每关随机修饰符，增加游戏变化性
 */

(function() {
  'use strict';
  
  // 修饰符类型
  const modifiers = {
    // 正面修饰符
    lucky_star: {
      id: 'lucky_star',
      name: '幸运星',
      description: '本关得分+50%',
      type: 'positive',
      effect: { scoreMultiplier: 1.5 },
      icon: 'star'
    },
    extra_moves: {
      id: 'extra_moves',
      name: '额外步数',
      description: '本关+5步',
      type: 'positive',
      effect: { extraMoves: 5 },
      icon: 'moves'
    },
    double_energy: {
      id: 'double_energy',
      name: '能量激增',
      description: '宠物能量获取翻倍',
      type: 'positive',
      effect: { energyMultiplier: 2 },
      icon: 'energy'
    },
    starting_bomb: {
      id: 'starting_bomb',
      name: '起始炸弹',
      description: '开局获得1个炸弹',
      type: 'positive',
      effect: { startItems: [{ id: 'bomb', count: 1 }] },
      icon: 'bomb'
    },
    
    // 负面修饰符
    gravity_reverse: {
      id: 'gravity_reverse',
      name: '重力反转',
      description: '元素向上掉落',
      type: 'negative',
      effect: { gravityDirection: 'up' },
      icon: 'gravity'
    },
    poison_fog: {
      id: 'poison_fog',
      name: '毒雾',
      description: '每步-10分',
      type: 'negative',
      effect: { scorePerMove: -10 },
      icon: 'poison'
    },
    time_pressure: {
      id: 'time_pressure',
      name: '时间压力',
      description: '限时30秒',
      type: 'negative',
      effect: { timeLimit: 30 },
      icon: 'time'
    },
    blind_mode: {
      id: 'blind_mode',
      name: '盲眼模式',
      description: '元素类型隐藏',
      type: 'negative',
      effect: { hideTypes: true },
      icon: 'blind'
    },
    
    // 特殊修饰符
    mystery_box: {
      id: 'mystery_box',
      name: '神秘盒子',
      description: '随机效果',
      type: 'special',
      effect: { randomEffect: true },
      icon: 'mystery'
    },
    chain_reaction: {
      id: 'chain_reaction',
      name: '连锁反应',
      description: '消除后自动触发相邻消除',
      type: 'special',
      effect: { chainReaction: true },
      icon: 'chain'
    },
    color_blind: {
      id: 'color_blind',
      name: '色盲模式',
      description: '所有元素变成灰色',
      type: 'special',
      effect: { grayscale: true },
      icon: 'color'
    }
  };
  
  // 当前关卡修饰符
  let currentModifiers = [];
  let activeEffects = {};
  
  // Roguelike状态
  let roguelikeState = {
    currentStage: 1,
    maxStage: 5,
    health: 100,
    maxHealth: 100,
    gold: 0,
    artifacts: [],
    visitedRooms: []
  };
  
  // 初始化Roguelike模式
  function initRoguelike() {
    roguelikeState = {
      currentStage: 1,
      maxStage: 5,
      health: 100,
      maxHealth: 100,
      gold: 0,
      artifacts: [],
      visitedRooms: []
    };
    
    loadRoguelikeData();
    return roguelikeState;
  }
  
  // 加载数据
  function loadRoguelikeData() {
    if (!window.WX || !window.WX.storage) return;
    
    const saved = window.WX.storage.getItem('roguelikeData');
    if (saved) {
      roguelikeState = { ...roguelikeState, ...saved };
    }
  }
  
  // 保存数据
  function saveRoguelikeData() {
    if (!window.WX || !window.WX.storage) return;
    
    window.WX.storage.setItem('roguelikeData', roguelikeState);
  }
  
  // 为关卡生成随机修饰符
  function generateModifiers(level, difficulty = 'normal') {
    currentModifiers = [];
    activeEffects = {};
    
    const positiveCount = difficulty === 'easy' ? 2 : 1;
    const negativeCount = difficulty === 'hard' ? 2 : 1;
    const specialChance = 0.3;
    
    // 添加正面修饰符
    const positiveModifiers = Object.values(modifiers).filter(m => m.type === 'positive');
    for (let i = 0; i < positiveCount; i++) {
      const randomIndex = Math.floor(Math.random() * positiveModifiers.length);
      const modifier = positiveModifiers.splice(randomIndex, 1)[0];
      if (modifier) {
        currentModifiers.push(modifier);
        applyModifierEffects(modifier);
      }
    }
    
    // 添加负面修饰符
    const negativeModifiers = Object.values(modifiers).filter(m => m.type === 'negative');
    for (let i = 0; i < negativeCount; i++) {
      const randomIndex = Math.floor(Math.random() * negativeModifiers.length);
      const modifier = negativeModifiers.splice(randomIndex, 1)[0];
      if (modifier) {
        currentModifiers.push(modifier);
        applyModifierEffects(modifier);
      }
    }
    
    // 随机添加特殊修饰符
    if (Math.random() < specialChance) {
      const specialModifiers = Object.values(modifiers).filter(m => m.type === 'special');
      const randomIndex = Math.floor(Math.random() * specialModifiers.length);
      const modifier = specialModifiers[randomIndex];
      if (modifier) {
        currentModifiers.push(modifier);
        applyModifierEffects(modifier);
      }
    }
    
    return currentModifiers;
  }
  
  // 应用修饰符效果
  function applyModifierEffects(modifier) {
    Object.keys(modifier.effect).forEach(key => {
      activeEffects[key] = modifier.effect[key];
    });
  }
  
  // 获取当前修饰符
  function getCurrentModifiers() {
    return currentModifiers;
  }
  
  // 获取活动效果
  function getActiveEffects() {
    return { ...activeEffects };
  }
  
  // 检查是否有特定效果
  function hasEffect(effectName) {
    return activeEffects[effectName] !== undefined;
  }
  
  // 获取效果值
  function getEffectValue(effectName, defaultValue = null) {
    return activeEffects[effectName] !== undefined ? activeEffects[effectName] : defaultValue;
  }
  
  // 计算得分倍数
  function calculateScoreMultiplier() {
    let multiplier = 1;
    
    if (activeEffects.scoreMultiplier) {
      multiplier *= activeEffects.scoreMultiplier;
    }
    
    // 检查彩蛋加成
    if (window.Eggs) {
      const bonusMultiplier = window.Eggs.getBonusMultiplier();
      multiplier *= bonusMultiplier;
    }
    
    return multiplier;
  }
  
  // 处理移动效果
  function processMoveEffects() {
    const effects = [];
    
    if (activeEffects.scorePerMove) {
      effects.push({
        type: 'score',
        value: activeEffects.scorePerMove,
        message: activeEffects.scorePerMove > 0 ? 
          `获得 ${activeEffects.scorePerMove} 分` : 
          `失去 ${Math.abs(activeEffects.scorePerMove)} 分`
      });
    }
    
    return effects;
  }
  
  // 获取时间限制
  function getTimeLimit() {
    return activeEffects.timeLimit || null;
  }
  
  // 检查重力方向
  function isGravityReversed() {
    return activeEffects.gravityDirection === 'up';
  }
  
  // 检查是否隐藏类型
  function shouldHideTypes() {
    return activeEffects.hideTypes === true;
  }
  
  // 检查是否灰度模式
  function isGrayscale() {
    return activeEffects.grayscale === true;
  }
  
  // 检查连锁反应
  function hasChainReaction() {
    return activeEffects.chainReaction === true;
  }
  
  // 处理神秘盒子
  function processMysteryBox() {
    if (!activeEffects.randomEffect) return null;
    
    const effects = [
      { type: 'bonus', value: 100, message: '获得100分！' },
      { type: 'penalty', value: -50, message: '失去50分...' },
      { type: 'item', id: 'hammer', count: 1, message: '获得锤子x1！' },
      { type: 'energy', value: 30, message: '宠物能量+30！' },
      { type: 'moves', value: 3, message: '获得3步！' }
    ];
    
    return effects[Math.floor(Math.random() * effects.length)];
  }
  
  // Roguelike房间类型
  const roomTypes = {
    battle: {
      name: '战斗',
      description: '完成三消关卡',
      icon: 'sword'
    },
    shop: {
      name: '商店',
      description: '购买道具和升级',
      icon: 'shop'
    },
    treasure: {
      name: '宝箱',
      description: '获得随机奖励',
      icon: 'chest'
    },
    event: {
      name: '事件',
      description: '随机事件',
      icon: 'event'
    },
    boss: {
      name: 'BOSS',
      description: '挑战BOSS',
      icon: 'boss'
    },
    rest: {
      name: '休息',
      description: '恢复生命值',
      icon: 'rest'
    }
  };
  
  // 生成地图
  function generateMap(stage) {
    const rooms = [];
    const roomCount = 4 + stage;
    
    for (let i = 0; i < roomCount; i++) {
      const roomType = getRandomRoomType(i, roomCount, stage);
      rooms.push({
        id: i,
        type: roomType,
        visited: false,
        cleared: false,
        modifiers: roomType === 'battle' ? generateModifiers(stage, stage > 3 ? 'hard' : 'normal') : []
      });
    }
    
    // 最后一个房间是BOSS
    rooms[rooms.length - 1].type = 'boss';
    
    return rooms;
  }
  
  // 获取随机房间类型
  function getRandomRoomType(index, total, stage) {
    if (index === 0) return 'battle';
    if (index === total - 1) return 'boss';
    
    const weights = {
      battle: 40,
      shop: 15,
      treasure: 15,
      event: 20,
      rest: 10
    };
    
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (const [type, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) return type;
    }
    
    return 'battle';
  }
  
  // 进入房间
  function enterRoom(roomId) {
    const room = roguelikeState.rooms ? roguelikeState.rooms[roomId] : null;
    if (!room) return null;
    
    room.visited = true;
    roguelikeState.currentRoom = roomId;
    
    saveRoguelikeData();
    
    return room;
  }
  
  // 清理房间
  function clearRoom(roomId, success = true) {
    const room = roguelikeState.rooms ? roguelikeState.rooms[roomId] : null;
    if (!room) return;
    
    room.cleared = success;
    
    if (success) {
      // 奖励
      roguelikeState.gold += 10 + Math.floor(Math.random() * 20);
      
      if (room.type === 'boss') {
        roguelikeState.currentStage++;
      }
    }
    
    saveRoguelikeData();
  }
  
  // 受到伤害
  function takeDamage(amount) {
    roguelikeState.health -= amount;
    
    if (roguelikeState.health <= 0) {
      roguelikeState.health = 0;
      // 游戏结束
      return { gameOver: true };
    }
    
    saveRoguelikeData();
    return { health: roguelikeState.health };
  }
  
  // 恢复生命
  function heal(amount) {
    roguelikeState.health = Math.min(roguelikeState.maxHealth, roguelikeState.health + amount);
    saveRoguelikeData();
    return roguelikeState.health;
  }
  
  // 获取Roguelike状态
  function getRoguelikeState() {
    return { ...roguelikeState };
  }
  
  // 添加神器
  function addArtifact(artifact) {
    roguelikeState.artifacts.push(artifact);
    saveRoguelikeData();
  }
  
  // 绘制修饰符图标
  function drawModifierIcon(ctx, x, y, size, modifier) {
    ctx.save();
    
    // 背景
    const bgColor = modifier.type === 'positive' ? '#32CD32' : 
                    modifier.type === 'negative' ? '#FF4500' : '#9370DB';
    
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 图标
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${size * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const icons = {
      star: '★',
      moves: '↻',
      energy: '⚡',
      bomb: '●',
      gravity: '↑',
      poison: '☠',
      time: '⏱',
      blind: '?',
      mystery: '?',
      chain: '∞',
      color: '◐'
    };
    
    ctx.fillText(icons[modifier.icon] || '?', x + size / 2, y + size / 2);
    
    ctx.restore();
  }
  
  // 导出全局API
  window.Roguelike = {
    init: initRoguelike,
    generateModifiers,
    getCurrentModifiers,
    getActiveEffects,
    hasEffect,
    getEffectValue,
    calculateScoreMultiplier,
    processMoveEffects,
    getTimeLimit,
    isGravityReversed,
    shouldHideTypes,
    isGrayscale,
    hasChainReaction,
    processMysteryBox,
    generateMap,
    enterRoom,
    clearRoom,
    takeDamage,
    heal,
    getRoguelikeState,
    addArtifact,
    drawModifierIcon,
    modifiers,
    roomTypes
  };
  
})();

})();

// ==================== evolve.js ====================
(function() {
/**
 * 合成进化系统
 * 特殊糖果合成升级，毁灭之光全屏消除
 */

(function() {
  'use strict';
  
  // 进化类型
  const evolutionTypes = {
    // 基础进化
    striped_h: {
      id: 'striped_h',
      name: '水平条纹',
      description: '消除整行',
      recipe: { match4: true },
      effect: 'clearRow'
    },
    striped_v: {
      id: 'striped_v',
      name: '垂直条纹',
      description: '消除整列',
      recipe: { match4: true },
      effect: 'clearCol'
    },
    wrapped: {
      id: 'wrapped',
      name: '包装糖果',
      description: '消除周围3x3',
      recipe: { matchLorT: true },
      effect: 'clear3x3'
    },
    
    // 高级进化
    color_bomb: {
      id: 'color_bomb',
      name: '彩色炸弹',
      description: '消除所有同色',
      recipe: { match5: true },
      effect: 'clearColor'
    },
    
    // 终极进化
    destruction_light: {
      id: 'destruction_light',
      name: '毁灭之光',
      description: '全屏消除',
      recipe: { special: 'bomb+bomb' },
      effect: 'clearAll'
    },
    rainbow_wave: {
      id: 'rainbow_wave',
      name: '彩虹波',
      description: '消除所有元素',
      recipe: { special: 'bomb+striped' },
      effect: 'clearAllColor'
    },
    supernova: {
      id: 'supernova',
      name: '超新星',
      description: '大范围爆炸',
      recipe: { special: 'bomb+wrapped' },
      effect: 'clear5x5'
    }
  };
  
  // 合成配方
  const synthesisRecipes = [
    {
      ingredients: ['striped_h', 'striped_v'],
      result: 'wrapped',
      name: '十字合成'
    },
    {
      ingredients: ['striped_h', 'wrapped'],
      result: 'color_bomb',
      name: '条纹包装合成'
    },
    {
      ingredients: ['striped_v', 'wrapped'],
      result: 'color_bomb',
      name: '条纹包装合成'
    },
    {
      ingredients: ['color_bomb', 'color_bomb'],
      result: 'destruction_light',
      name: '毁灭之光'
    },
    {
      ingredients: ['color_bomb', 'striped_h'],
      result: 'rainbow_wave',
      name: '彩虹波'
    },
    {
      ingredients: ['color_bomb', 'striped_v'],
      result: 'rainbow_wave',
      name: '彩虹波'
    },
    {
      ingredients: ['color_bomb', 'wrapped'],
      result: 'supernova',
      name: '超新星'
    }
  ];
  
  // 进化等级
  const evolutionLevels = [
    { level: 1, name: '初级', bonus: 1.0 },
    { level: 2, name: '中级', bonus: 1.2 },
    { level: 3, name: '高级', bonus: 1.5 },
    { level: 4, name: '大师', bonus: 2.0 },
    { level: 5, name: '传奇', bonus: 3.0 }
  ];
  
  // 进化经验
  let evolutionExp = {};
  let evolutionLevel = {};
  
  // 初始化
  function init() {
    evolutionExp = {};
    evolutionLevel = {};
    
    Object.keys(evolutionTypes).forEach(type => {
      evolutionExp[type] = 0;
      evolutionLevel[type] = 1;
    });
    
    loadEvolutionData();
  }
  
  // 加载数据
  function loadEvolutionData() {
    if (!window.WX || !window.WX.storage) return;
    
    const saved = window.WX.storage.getItem('evolutionData');
    if (saved) {
      evolutionExp = saved.exp || evolutionExp;
      evolutionLevel = saved.level || evolutionLevel;
    }
  }
  
  // 保存数据
  function saveEvolutionData() {
    if (!window.WX || !window.WX.storage) return;
    
    window.WX.storage.setItem('evolutionData', {
      exp: evolutionExp,
      level: evolutionLevel
    });
  }
  
  // 检查合成
  function checkSynthesis(special1, special2) {
    if (!special1 || !special2) return null;
    
    for (const recipe of synthesisRecipes) {
      if ((recipe.ingredients.includes(special1) && recipe.ingredients.includes(special2)) &&
          (special1 !== special2 || recipe.ingredients.filter(i => i === special1).length === 2)) {
        return {
          success: true,
          result: evolutionTypes[recipe.result],
          recipe: recipe
        };
      }
    }
    
    return null;
  }
  
  // 执行进化效果
  function executeEvolution(type, boardState, centerRow, centerCol) {
    const evolution = evolutionTypes[type];
    if (!evolution) return null;
    
    const level = evolutionLevel[type] || 1;
    const levelBonus = evolutionLevels.find(l => l.level === level)?.bonus || 1;
    
    let affectedCells = [];
    let score = 0;
    
    switch (evolution.effect) {
      case 'clearRow':
        // 清除整行
        for (let col = 0; col < boardState.cols; col++) {
          affectedCells.push({ row: centerRow, col });
        }
        score = affectedCells.length * 10 * levelBonus;
        break;
        
      case 'clearCol':
        // 清除整列
        for (let row = 0; row < boardState.rows; row++) {
          affectedCells.push({ row, col: centerCol });
        }
        score = affectedCells.length * 10 * levelBonus;
        break;
        
      case 'clear3x3':
        // 清除3x3范围
        for (let row = centerRow - 1; row <= centerRow + 1; row++) {
          for (let col = centerCol - 1; col <= centerCol + 1; col++) {
            if (row >= 0 && row < boardState.rows && col >= 0 && col < boardState.cols) {
              affectedCells.push({ row, col });
            }
          }
        }
        score = affectedCells.length * 15 * levelBonus;
        break;
        
      case 'clearColor':
        // 清除所有同色
        const targetType = boardState.board[centerRow]?.[centerCol]?.type;
        if (targetType) {
          for (let row = 0; row < boardState.rows; row++) {
            for (let col = 0; col < boardState.cols; col++) {
              if (boardState.board[row]?.[col]?.type === targetType) {
                affectedCells.push({ row, col });
              }
            }
          }
        }
        score = affectedCells.length * 20 * levelBonus;
        break;
        
      case 'clearAll':
        // 毁灭之光：全屏消除
        for (let row = 0; row < boardState.rows; row++) {
          for (let col = 0; col < boardState.cols; col++) {
            affectedCells.push({ row, col });
          }
        }
        score = affectedCells.length * 50 * levelBonus;
        
        // 特效
        if (window.Particles) {
          window.Particles.createVictoryEffect(
            boardState.cellSize * boardState.cols / 2,
            boardState.cellSize * boardState.rows / 2
          );
        }
        break;
        
      case 'clearAllColor':
        // 彩虹波：消除所有元素
        for (let row = 0; row < boardState.rows; row++) {
          for (let col = 0; col < boardState.cols; col++) {
            affectedCells.push({ row, col });
          }
        }
        score = affectedCells.length * 40 * levelBonus;
        break;
        
      case 'clear5x5':
        // 超新星：5x5范围
        for (let row = centerRow - 2; row <= centerRow + 2; row++) {
          for (let col = centerCol - 2; col <= centerCol + 2; col++) {
            if (row >= 0 && row < boardState.rows && col >= 0 && col < boardState.cols) {
              affectedCells.push({ row, col });
            }
          }
        }
        score = affectedCells.length * 25 * levelBonus;
        break;
    }
    
    // 增加进化经验
    addEvolutionExp(type, affectedCells.length);
    
    // 播放特效音效
    if (window.Sound) {
      window.Sound.playSound('special');
    }
    
    return {
      type,
      evolution,
      affectedCells,
      score: Math.floor(score),
      level,
      levelBonus
    };
  }
  
  // 增加进化经验
  function addEvolutionExp(type, amount) {
    if (!evolutionExp[type]) {
      evolutionExp[type] = 0;
      evolutionLevel[type] = 1;
    }
    
    evolutionExp[type] += amount;
    
    // 检查升级
    const currentLevel = evolutionLevel[type];
    const expNeeded = currentLevel * 100;
    
    while (evolutionExp[type] >= expNeeded) {
      evolutionExp[type] -= expNeeded;
      evolutionLevel[type]++;
    }
    
    saveEvolutionData();
  }
  
  // 获取进化等级
  function getEvolutionLevel(type) {
    return {
      level: evolutionLevel[type] || 1,
      exp: evolutionExp[type] || 0,
      expNeeded: (evolutionLevel[type] || 1) * 100
    };
  }
  
  // 获取所有进化等级
  function getAllEvolutionLevels() {
    const result = {};
    Object.keys(evolutionTypes).forEach(type => {
      result[type] = getEvolutionLevel(type);
    });
    return result;
  }
  
  // 绘制进化效果
  function drawEvolutionEffect(ctx, x, y, size, type, progress = 0) {
    const evolution = evolutionTypes[type];
    if (!evolution) return;
    
    ctx.save();
    
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    // 光环效果
    const glowSize = size * (1 + Math.sin(progress * Math.PI * 2) * 0.1);
    
    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    glow.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 根据类型绘制不同效果
    switch (type) {
      case 'destruction_light':
        drawDestructionLight(ctx, centerX, centerY, size, progress);
        break;
      case 'rainbow_wave':
        drawRainbowWave(ctx, centerX, centerY, size, progress);
        break;
      case 'supernova':
        drawSupernova(ctx, centerX, centerY, size, progress);
        break;
      default:
        drawBasicEffect(ctx, centerX, centerY, size, type);
    }
    
    ctx.restore();
  }
  
  // 绘制毁灭之光
  function drawDestructionLight(ctx, cx, cy, size, progress) {
    // 光束
    const beamCount = 8;
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    
    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2 + progress * Math.PI;
      const length = size * (0.8 + Math.sin(progress * Math.PI * 4) * 0.2);
      
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(angle) * length,
        cy + Math.sin(angle) * length
      );
      ctx.stroke();
    }
    
    // 中心光球
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.3);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.5, '#FFD700');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 绘制彩虹波
  function drawRainbowWave(ctx, cx, cy, size, progress) {
    const colors = ['#FF4757', '#FF9F43', '#FFD32A', '#26DE81', '#45AAF2', '#A55EEA'];
    const waveRadius = size * (0.3 + progress * 0.7);
    
    colors.forEach((color, i) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 1 - progress * 0.5;
      
      ctx.beginPath();
      ctx.arc(cx, cy, waveRadius * (1 - i * 0.1), 0, Math.PI * 2);
      ctx.stroke();
    });
    
    ctx.globalAlpha = 1;
  }
  
  // 绘制超新星
  function drawSupernova(ctx, cx, cy, size, progress) {
    // 爆炸效果
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const dist = size * 0.3 * progress;
      
      ctx.fillStyle = `hsl(${(i / particleCount) * 360}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(angle) * dist,
        cy + Math.sin(angle) * dist,
        size * 0.05 * (1 - progress * 0.5),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // 中心闪光
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.15 * (1 - progress), 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 绘制基础效果
  function drawBasicEffect(ctx, cx, cy, size, type) {
    let color = '#FFD700';
    
    switch (type) {
      case 'striped_h':
      case 'striped_v':
        color = '#00CED1';
        break;
      case 'wrapped':
        color = '#FF69B4';
        break;
      case 'color_bomb':
        color = '#9370DB';
        break;
    }
    
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.4);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 获取进化类型配置
  function getEvolutionType(type) {
    return evolutionTypes[type] || null;
  }
  
  // 获取所有进化类型
  function getAllEvolutionTypes() {
    return { ...evolutionTypes };
  }
  
  // 获取合成配方
  function getSynthesisRecipes() {
    return [...synthesisRecipes];
  }
  
  // 初始化
  init();
  
  // 导出全局API
  window.Evolve = {
    init,
    checkSynthesis,
    executeEvolution,
    getEvolutionLevel,
    getAllEvolutionLevels,
    drawEvolutionEffect,
    getEvolutionType,
    getAllEvolutionTypes,
    getSynthesisRecipes,
    evolutionTypes,
    evolutionLevels
  };
  
})();

})();

// ==================== shop.js ====================
(function() {
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

})();

// ==================== eggs.js ====================
(function() {
/**
 * 彩蛋系统
 * 隐藏关卡/神秘宠物/节日惊喜等
 */

(function() {
  'use strict';
  
  // 彩蛋类型
  const easterEggTypes = {
    // 神秘关卡
    mysteryLevel: {
      id: 'mystery_level',
      name: '神秘关卡',
      description: '元素全部变成金色！',
      trigger: (gameState) => {
        // 每10关后随机出现
        if (gameState.level % 10 === 0 && Math.random() < 0.3) {
          return true;
        }
        return false;
      },
      effect: (gameState) => {
        gameState.goldenMode = true;
        gameState.bonusMultiplier = 2;
        return {
          message: '神秘关卡出现！所有元素变成金色！',
          bonus: '双倍积分'
        };
      }
    },
    
    // 幸运转盘
    luckyWheel: {
      id: 'lucky_wheel',
      name: '幸运转盘',
      description: '每天首次登录弹出转盘',
      trigger: (gameState) => {
        const today = new Date().toDateString();
        return gameState.lastWheelSpin !== today;
      },
      effect: (gameState) => {
        const rewards = [
          { type: 'points', value: 50, name: '50积分' },
          { type: 'points', value: 100, name: '100积分' },
          { type: 'points', value: 200, name: '200积分' },
          { type: 'item', id: 'hammer', count: 1, name: '锤子x1' },
          { type: 'item', id: 'bomb', count: 1, name: '炸弹x1' },
          { type: 'item', id: 'rainbow_candy', count: 1, name: '彩虹糖x1' }
        ];
        
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        
        // 发放奖励
        if (reward.type === 'points') {
          if (window.Shop) {
            window.Shop.addPoints(reward.value, '幸运转盘');
          }
        } else if (reward.type === 'item') {
          if (window.Shop) {
            const item = window.Shop.getShopData().items.find(i => i.id === reward.id);
            if (item) {
              window.Shop.purchaseItem('items', reward.id, 0); // 免费获得
              // 直接增加数量
              const shopData = window.Shop.getShopData();
              const targetItem = shopData.items.find(i => i.id === reward.id);
              if (targetItem) {
                targetItem.count += reward.count;
              }
            }
          }
        }
        
        gameState.lastWheelSpin = new Date().toDateString();
        
        return {
          message: '恭喜获得奖励！',
          reward: reward
        };
      }
    },
    
    // 连续登录奖励
    loginStreak: {
      id: 'login_streak',
      name: '连续登录奖励',
      description: '连续登录获得特殊奖励',
      trigger: (gameState) => {
        return true; // 在Shop系统中处理
      },
      effect: (gameState) => {
        return null;
      }
    },
    
    // 隐藏宠物：彩虹龙
    hiddenPet: {
      id: 'hidden_pet',
      name: '彩虹龙',
      description: '第50关后随机出现稀有宠物',
      trigger: (gameState) => {
        if (gameState.level >= 50 && !gameState.rainbowDragonFound && Math.random() < 0.05) {
          return true;
        }
        return false;
      },
      effect: (gameState) => {
        gameState.rainbowDragonFound = true;
        
        // 解锁彩虹龙
        if (window.Shop) {
          const shopData = window.Shop.getShopData();
          const pet = shopData.pets.find(p => p.id === 'rainbow_dragon');
          if (pet && !pet.owned) {
            pet.owned = true;
            window.Shop.saveData();
          }
        }
        
        return {
          message: '发现稀有宠物：彩虹龙！',
          pet: 'rainbow_dragon'
        };
      }
    },
    
    // 幸运时刻
    luckyMoment: {
      id: 'lucky_moment',
      name: '幸运时刻',
      description: '连续5关无失败触发双倍积分',
      trigger: (gameState) => {
        return gameState.consecutiveWins >= 5;
      },
      effect: (gameState) => {
        gameState.luckyMomentActive = true;
        gameState.consecutiveWins = 0;
        
        return {
          message: '幸运时刻！接下来30秒双倍积分！',
          duration: 30000
        };
      }
    },
    
    // 开发者彩蛋
    developerEgg: {
      id: 'developer_egg',
      name: '开发者彩蛋',
      description: '点击标题5次触发',
      trigger: (gameState) => {
        return gameState.titleClickCount >= 5;
      },
      effect: (gameState) => {
        gameState.titleClickCount = 0;
        gameState.developerMode = true;
        
        // 奖励
        if (window.Shop) {
          window.Shop.addPoints(500, '发现开发者彩蛋');
        }
        
        return {
          message: '你发现了开发者彩蛋！获得500积分！',
          bonus: 500
        };
      }
    },
    
    // 完美通关奖励
    perfectClear: {
      id: 'perfect_clear',
      name: '完美通关大师',
      description: '完美通关累计10次解锁金色皮肤',
      trigger: (gameState) => {
        return gameState.perfectClearCount >= 10 && !gameState.goldenSkinUnlocked;
      },
      effect: (gameState) => {
        gameState.goldenSkinUnlocked = true;
        
        if (window.Shop) {
          const shopData = window.Shop.getShopData();
          const skin = shopData.skins.find(s => s.id === 'golden_candy');
          if (skin && !skin.owned) {
            skin.owned = true;
            window.Shop.saveData();
          }
        }
        
        return {
          message: '完美通关大师！解锁金色皮肤！',
          skin: 'golden_candy'
        };
      }
    },
    
    // 节日彩蛋
    holidayEgg: {
      id: 'holiday_egg',
      name: '节日惊喜',
      description: '节假日特殊UI和奖励',
      trigger: (gameState) => {
        return isHoliday();
      },
      effect: (gameState) => {
        const holiday = getCurrentHoliday();
        
        if (window.Shop) {
          window.Shop.addPoints(holiday.bonus, `${holiday.name}节日奖励`);
        }
        
        return {
          message: `${holiday.name}快乐！获得${holiday.bonus}积分！`,
          holiday: holiday
        };
      }
    }
  };
  
  // 节日检测
  function isHoliday() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 定义节日
    const holidays = [
      { month: 1, day: 1 },    // 元旦
      { month: 2, day: 14 },   // 情人节
      { month: 4, day: 1 },    // 愚人节
      { month: 5, day: 1 },    // 劳动节
      { month: 10, day: 1 },   // 国庆节
      { month: 12, day: 25 },  // 圣诞节
      { month: 12, day: 31 }   // 跨年夜
    ];
    
    return holidays.some(h => h.month === month && h.day === day);
  }
  
  // 获取当前节日
  function getCurrentHoliday() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    const holidayMap = {
      '1-1': { name: '元旦', bonus: 100, theme: 'newyear' },
      '2-14': { name: '情人节', bonus: 150, theme: 'valentine' },
      '4-1': { name: '愚人节', bonus: 50, theme: 'aprilfool' },
      '5-1': { name: '劳动节', bonus: 100, theme: 'labor' },
      '10-1': { name: '国庆节', bonus: 200, theme: 'national' },
      '12-25': { name: '圣诞节', bonus: 150, theme: 'christmas' },
      '12-31': { name: '跨年夜', bonus: 200, theme: 'newyear' }
    };
    
    const key = `${month}-${day}`;
    return holidayMap[key] || { name: '普通日', bonus: 0, theme: 'normal' };
  }
  
  // 游戏状态
  let gameState = {
    level: 1,
    lastWheelSpin: '',
    titleClickCount: 0,
    consecutiveWins: 0,
    perfectClearCount: 0,
    rainbowDragonFound: false,
    goldenSkinUnlocked: false,
    luckyMomentActive: false,
    developerMode: false,
    goldenMode: false,
    bonusMultiplier: 1
  };
  
  // 加载游戏状态
  function loadGameState() {
    if (!window.WX || !window.WX.storage) return;
    
    const saved = window.WX.storage.getItem('easterEggState');
    if (saved) {
      gameState = { ...gameState, ...saved };
    }
  }
  
  // 保存游戏状态
  function saveGameState() {
    if (!window.WX || !window.WX.storage) return;
    
    window.WX.storage.setItem('easterEggState', gameState);
  }
  
  // 检查并触发彩蛋
  function checkEasterEggs(context = {}) {
    const triggeredEggs = [];
    
    Object.values(easterEggTypes).forEach(egg => {
      // 更新游戏状态
      if (context.level !== undefined) gameState.level = context.level;
      
      // 检查触发条件
      if (egg.trigger(gameState)) {
        const result = egg.effect(gameState);
        if (result) {
          triggeredEggs.push({
            type: egg.id,
            name: egg.name,
            ...result
          });
          
          // 播放彩蛋音效
          if (window.Sound) {
            window.Sound.playSound('easterEgg');
          }
          
          // 创建彩蛋粒子效果
          if (window.Particles && context.centerX !== undefined) {
            window.Particles.createEasterEggEffect(context.centerX, context.centerY);
          }
        }
      }
    });
    
    saveGameState();
    
    return triggeredEggs;
  }
  
  // 更新游戏状态
  function updateGameState(updates) {
    gameState = { ...gameState, ...updates };
    saveGameState();
  }
  
  // 标题点击
  function onTitleClick() {
    gameState.titleClickCount++;
    
    if (gameState.titleClickCount >= 5) {
      const eggs = checkEasterEggs();
      return eggs.find(e => e.type === 'developer_egg') || null;
    }
    
    return null;
  }
  
  // 关卡胜利
  function onLevelWin(isPerfect) {
    gameState.consecutiveWins++;
    
    if (isPerfect) {
      gameState.perfectClearCount++;
    }
    
    return checkEasterEggs();
  }
  
  // 关卡失败
  function onLevelFail() {
    gameState.consecutiveWins = 0;
  }
  
  // 获取幸运转盘奖励
  function spinLuckyWheel() {
    gameState.lastWheelSpin = new Date().toDateString();
    saveGameState();
    
    return easterEggTypes.luckyWheel.effect(gameState);
  }
  
  // 检查是否是金色模式
  function isGoldenMode() {
    return gameState.goldenMode;
  }
  
  // 设置金色模式
  function setGoldenMode(enabled) {
    gameState.goldenMode = enabled;
    saveGameState();
  }
  
  // 获取奖励倍数
  function getBonusMultiplier() {
    return gameState.bonusMultiplier;
  }
  
  // 重置奖励倍数
  function resetBonusMultiplier() {
    gameState.bonusMultiplier = 1;
    saveGameState();
  }
  
  // 获取当前节日主题
  function getHolidayTheme() {
    if (isHoliday()) {
      return getCurrentHoliday().theme;
    }
    return null;
  }
  
  // 获取游戏状态
  function getGameState() {
    return { ...gameState };
  }
  
  // 初始化
  loadGameState();
  
  // 导出全局API
  window.Eggs = {
    checkEasterEggs,
    updateGameState,
    onTitleClick,
    onLevelWin,
    onLevelFail,
    spinLuckyWheel,
    isGoldenMode,
    setGoldenMode,
    getBonusMultiplier,
    resetBonusMultiplier,
    getHolidayTheme,
    getGameState,
    isHoliday,
    getCurrentHoliday
  };
  
})();

})();

// ==================== ui.js ====================
(function() {
/**
 * UI系统
 * 处理所有界面渲染和交互
 */

(function() {
  'use strict';
  
  // 兼容性roundRect函数（微信小游戏原生roundRect参数不兼容，统一用手动绘制）
  function roundRect(ctx, x, y, width, height, radius) {
    var r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.arcTo(x + width, y, x + width, y + r, r);
    ctx.lineTo(x + width, y + height - r);
    ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
    ctx.lineTo(x + r, y + height);
    ctx.arcTo(x, y + height, x, y + height - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
  
  // UI状态
  let currentScreen = 'menu'; // menu, levelSelect, game, shop, pause, result
  let selectedLevel = 1;
  let hoveredButton = null;
  
  // 游戏状态
  let gameState = {
    score: 0,
    moves: 0,
    combo: 0,
    level: 1,
    stars: 0,
    paused: false
  };
  
  // 屏幕尺寸
  let screenWidth = 375;
  let screenHeight = 667;
  
  // 按钮配置
  const buttons = {
    menu: [
      { id: 'play', text: '开始游戏', x: 0, y: 0, width: 200, height: 50 },
      { id: 'shop', text: '商城', x: 0, y: 0, width: 200, height: 50 },
      { id: 'settings', text: '设置', x: 0, y: 0, width: 200, height: 50 }
    ],
    game: [
      { id: 'pause', text: '⏸', x: 0, y: 0, width: 40, height: 40 },
      { id: 'item_hammer', text: '🔨', x: 0, y: 0, width: 50, height: 50 },
      { id: 'item_bomb', text: '💣', x: 0, y: 0, width: 50, height: 50 },
      { id: 'item_refresh', text: '🔄', x: 0, y: 0, width: 50, height: 50 }
    ],
    pause: [
      { id: 'resume', text: '继续游戏', x: 0, y: 0, width: 180, height: 45 },
      { id: 'settings', text: '游戏设置', x: 0, y: 0, width: 180, height: 45 },
      { id: 'quit', text: '退出游戏', x: 0, y: 0, width: 180, height: 45 }
    ],
    result: [
      { id: 'retry', text: '重试', x: 0, y: 0, width: 120, height: 45 },
      { id: 'next', text: '下一关', x: 0, y: 0, width: 120, height: 45 },
      { id: 'menu', text: '主菜单', x: 0, y: 0, width: 120, height: 45 }
    ],
    shop: [
      { id: 'back', text: '返回', x: 0, y: 0, width: 80, height: 40 }
    ]
  };
  
  // 初始化UI
  function init(width, height) {
    screenWidth = width;
    screenHeight = height;
    updateButtonPositions();
  }
  
  // 更新按钮位置
  function updateButtonPositions() {
    const centerX = screenWidth / 2;
    
    // 主菜单按钮
    buttons.menu.forEach((btn, i) => {
      btn.x = centerX - btn.width / 2;
      btn.y = screenHeight * 0.5 + i * 70;
    });
    
    // 游戏界面按钮
    buttons.game.forEach((btn, i) => {
      if (btn.id === 'pause') {
        btn.x = screenWidth - 50;
        btn.y = 10;
      } else {
        btn.x = 10 + i * 60;
        btn.y = screenHeight - 70;
      }
    });
    
    // 暂停菜单按钮
    buttons.pause.forEach((btn, i) => {
      btn.x = centerX - btn.width / 2;
      btn.y = screenHeight * 0.35 + i * 60;
    });
    
    // 结果界面按钮
    buttons.result[0].x = centerX - 130;
    buttons.result[0].y = screenHeight * 0.7;
    buttons.result[1].x = centerX + 10;
    buttons.result[1].y = screenHeight * 0.7;
    buttons.result[2].x = centerX - 60;
    buttons.result[2].y = screenHeight * 0.7 + 60;
    
    // 商城按钮
    buttons.shop[0].x = 10;
    buttons.shop[0].y = 10;
  }
  
  // 设置当前屏幕
  function setScreen(screen) {
    currentScreen = screen;
    updateButtonPositions();
  }
  
  // 获取当前屏幕
  function getScreen() {
    return currentScreen;
  }
  
  // 更新游戏状态
  function updateGameState(state) {
    gameState = { ...gameState, ...state };
  }
  
  // 处理点击
  function handleClick(x, y) {
    const currentButtons = buttons[currentScreen] || [];
    
    for (const btn of currentButtons) {
      if (x >= btn.x && x <= btn.x + btn.width &&
          y >= btn.y && y <= btn.y + btn.height) {
        return btn.id;
      }
    }
    
    return null;
  }
  
  // 处理悬停
  function handleHover(x, y) {
    const currentButtons = buttons[currentScreen] || [];
    hoveredButton = null;
    
    for (const btn of currentButtons) {
      if (x >= btn.x && x <= btn.x + btn.width &&
          y >= btn.y && y <= btn.y + btn.height) {
        hoveredButton = btn.id;
        break;
      }
    }
    
    return hoveredButton;
  }
  
  // 绘制主菜单
  function drawMenu(ctx) {
    const centerX = screenWidth / 2;
    
    // 背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight);
    bgGradient.addColorStop(0, '#FF6B9D');
    bgGradient.addColorStop(0.5, '#C44569');
    bgGradient.addColorStop(1, '#6B2D5C');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    // 装饰元素
    drawMenuDecorations(ctx);
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 标题阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText('三消奇缘', centerX + 2, screenHeight * 0.2 + 2);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('三消奇缘', centerX, screenHeight * 0.2);
    
    // 英文副标题
    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Triple Match Saga', centerX, screenHeight * 0.28);
    
    // 积分显示
    const points = window.Shop ? window.Shop.getPoints() : 0;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`积分: ${points}`, centerX, screenHeight * 0.38);
    
    // 按钮
    buttons.menu.forEach(btn => {
      drawButton(ctx, btn);
    });
    
    // 版本信息
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('v1.0.0', centerX, screenHeight - 20);
  }
  
  // 绘制菜单装饰
  function drawMenuDecorations(ctx) {
    // 糖果装饰
    const candyColors = ['#FF4757', '#FF9F43', '#FFD32A', '#26DE81', '#45AAF2', '#A55EEA'];
    
    for (let i = 0; i < 10; i++) {
      const x = (i * 47 + 20) % screenWidth;
      const y = (i * 31 + 50) % screenHeight;
      const size = 15 + (i % 3) * 5;
      
      ctx.fillStyle = candyColors[i % candyColors.length];
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }
  
  // 绘制关卡选择
  function drawLevelSelect(ctx) {
    // 背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight);
    bgGradient.addColorStop(0, '#4ECDC4');
    bgGradient.addColorStop(1, '#2C3E50');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('选择关卡', screenWidth / 2, 40);
    
    // 关卡网格
    const cols = 5;
    const cellSize = 55;
    const padding = 15;
    const startX = (screenWidth - cols * (cellSize + padding)) / 2;
    const startY = 80;
    
    for (let i = 0; i < 80; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (cellSize + padding);
      const y = startY + row * (cellSize + padding);
      
      const level = i + 1;
      const theme = window.Themes ? window.Themes.getThemeByLevel(level) : 'candy';
      const themeConfig = window.Themes ? window.Themes.getThemeConfig(theme) : null;
      
      // 背景
      const isUnlocked = level <= (gameState.maxUnlockedLevel || 1);
      const isSelected = level === selectedLevel;
      
      if (isSelected) {
        ctx.fillStyle = '#FFD700';
      } else if (isUnlocked) {
        ctx.fillStyle = themeConfig ? themeConfig.colors.primary : '#FFFFFF';
      } else {
        ctx.fillStyle = '#666666';
      }
      
      ctx.beginPath();
      roundRect(ctx, x, y, cellSize, cellSize, 8);
      ctx.fill();
      
      // 关卡号
      ctx.fillStyle = isUnlocked ? '#FFFFFF' : '#999999';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(level.toString(), x + cellSize / 2, y + cellSize / 2);
      
      // 主题图标
      if (isUnlocked && themeConfig) {
        ctx.font = '12px Arial';
        ctx.fillText(themeConfig.name.charAt(0), x + cellSize / 2, y + cellSize - 10);
      }
    }
    
    // 返回按钮
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← 返回', 20, screenHeight - 30);
  }
  
  // 绘制游戏界面
  function drawGame(ctx, boardState) {
    const theme = window.Themes ? window.Themes.getThemeByLevel(gameState.level) : 'candy';
    
    // 背景
    if (window.Themes) {
      window.Themes.drawBackground(ctx, theme, screenWidth, screenHeight);
    }
    
    // HUD
    drawHUD(ctx);
    
    // 棋盘
    if (boardState) {
      drawBoard(ctx, boardState, theme);
    }
    
    // 宠物
    drawPetUI(ctx);
    
    // 道具栏
    drawItemBar(ctx);
    
    // 暂停按钮
    const pauseBtn = buttons.game.find(b => b.id === 'pause');
    if (pauseBtn) {
      drawButton(ctx, pauseBtn);
    }
  }
  
  // 绘制HUD
  function drawHUD(ctx) {
    // 顶部栏背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, screenWidth, 60);
    
    // 关卡
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`关卡 ${gameState.level}`, 15, 25);
    
    // 分数
    ctx.font = '16px Arial';
    ctx.fillText(`分数: ${gameState.score}`, 15, 48);
    
    // 步数
    ctx.textAlign = 'right';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${gameState.moves}`, screenWidth - 15, 35);
    ctx.font = '12px Arial';
    ctx.fillText('步数', screenWidth - 15, 52);
    
    // 连击显示
    if (gameState.combo > 1) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`${gameState.combo}连击!`, screenWidth / 2, 35);
    }
  }
  
  // 绘制棋盘
  function drawBoard(ctx, boardState, theme) {
    const { board, rows, cols, cellSize, padding } = boardState;
    
    // 棋盘背景
    const boardWidth = cols * cellSize + padding * 2;
    const boardHeight = rows * cellSize + padding * 2;
    const boardX = (screenWidth - boardWidth) / 2;
    const boardY = 70;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    roundRect(ctx, boardX, boardY, boardWidth, boardHeight, 10);
    ctx.fill();
    
    // 绘制元素
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = board[row][col];
        if (!cell || !cell.type) continue;
        
        const x = boardX + cell.x;
        const y = boardY + cell.y;
        
        // 检查是否是金色模式
        const isGolden = window.Eggs && window.Eggs.isGoldenMode();
        
        if (isGolden) {
          if (window.Themes) {
            window.Themes.drawGoldenElement(ctx, x, y, cellSize, theme, cell.type, {
              scale: cell.scale,
              alpha: cell.alpha
            });
          }
        } else {
          if (window.Themes) {
            window.Themes.drawElement(ctx, x, y, cellSize, theme, cell.type, {
              scale: cell.scale,
              alpha: cell.alpha
            });
          }
        }
        
        // 选中效果
        if (cell.selected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 3;
          ctx.beginPath();
          roundRect(ctx, x + 2, y + 2, cellSize - 4, cellSize - 4, 5);
          ctx.stroke();
        }
      }
    }
  }
  
  // 绘制宠物UI
  function drawPetUI(ctx) {
    const petX = screenWidth - 80;
    const petY = screenHeight - 150;
    const petSize = 60;
    
    // 宠物背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(petX + petSize / 2, petY + petSize / 2, petSize / 2 + 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制宠物
    if (window.Pet) {
      window.Pet.drawPet(ctx, petX, petY, petSize, { showGlow: true });
      
      // 能量条
      window.Pet.drawEnergyBar(ctx, petX - 10, petY + petSize + 10, petSize + 20, 15);
    }
  }
  
  // 绘制道具栏
  function drawItemBar(ctx) {
    const barY = screenHeight - 60;
    const itemSize = 45;
    const padding = 10;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, barY - 10, screenWidth, 70);
    
    // 道具
    const items = [
      { id: 'hammer', icon: '🔨', name: '锤子' },
      { id: 'bomb', icon: '💣', name: '炸弹' },
      { id: 'refresh', icon: '🔄', name: '刷新' },
      { id: 'extra_moves', icon: '+5', name: '+5步' }
    ];
    
    items.forEach((item, i) => {
      const x = padding + i * (itemSize + padding);
      const y = barY;
      
      // 获取道具数量
      const count = window.Shop ? window.Shop.getItemCount(item.id) : 0;
      
      // 背景
      ctx.fillStyle = count > 0 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(100, 100, 100, 0.3)';
      ctx.beginPath();
      roundRect(ctx, x, y, itemSize, itemSize, 8);
      ctx.fill();
      
      // 图标
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, x + itemSize / 2, y + itemSize / 2);
      
      // 数量
      ctx.font = '12px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(count.toString(), x + itemSize - 8, y + itemSize - 8);
    });
  }
  
  // 绘制暂停菜单
  function drawPauseMenu(ctx) {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    // 菜单框
    const menuWidth = 250;
    const menuHeight = 300;
    const menuX = (screenWidth - menuWidth) / 2;
    const menuY = (screenHeight - menuHeight) / 2;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    roundRect(ctx, menuX, menuY, menuWidth, menuHeight, 15);
    ctx.fill();
    
    // 标题
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏暂停', screenWidth / 2, menuY + 40);
    
    // 当前状态
    ctx.font = '16px Arial';
    ctx.fillText(`当前得分: ${gameState.score}`, screenWidth / 2, menuY + 80);
    ctx.fillText(`剩余步数: ${gameState.moves}`, screenWidth / 2, menuY + 110);
    
    // 按钮
    buttons.pause.forEach(btn => {
      drawButton(ctx, btn);
    });
  }
  
  // 绘制结果界面
  function drawResult(ctx) {
    // 背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight);
    bgGradient.addColorStop(0, '#2C3E50');
    bgGradient.addColorStop(1, '#1A252F');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    const centerX = screenWidth / 2;
    
    // 结果标题
    const isSuccess = gameState.stars > 0;
    ctx.fillStyle = isSuccess ? '#FFD700' : '#FF4500';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isSuccess ? '关卡完成!' : '关卡失败', centerX, screenHeight * 0.15);
    
    // 星星
    if (isSuccess) {
      const starY = screenHeight * 0.28;
      for (let i = 0; i < 3; i++) {
        const starX = centerX + (i - 1) * 60;
        ctx.fillStyle = i < gameState.stars ? '#FFD700' : '#666666';
        ctx.font = '40px Arial';
        ctx.fillText('★', starX, starY);
      }
    }
    
    // 分数
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`得分: ${gameState.score}`, centerX, screenHeight * 0.45);
    
    // 目标分数
    const levelConfig = window.Themes ? window.Themes.getLevelConfig(gameState.level) : null;
    if (levelConfig) {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#AAAAAA';
      ctx.fillText(`目标: ${levelConfig.starScores[0]}`, centerX, screenHeight * 0.52);
    }
    
    // 按钮
    buttons.result.forEach(btn => {
      drawButton(ctx, btn);
    });
  }
  
  // 绘制商城界面
  function drawShop(ctx) {
    // 背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight);
    bgGradient.addColorStop(0, '#667eea');
    bgGradient.addColorStop(1, '#764ba2');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    const centerX = screenWidth / 2;
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('商城', centerX, 50);
    
    // 积分
    const points = window.Shop ? window.Shop.getPoints() : 0;
    ctx.font = '18px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`积分: ${points}`, centerX, 85);
    
    // 标签页
    const tabs = ['皮肤', '道具', '宠物'];
    const tabWidth = screenWidth / 3;
    
    tabs.forEach((tab, i) => {
      const x = i * tabWidth;
      ctx.fillStyle = i === 0 ? 'rgba(255, 255, 255, 0.3)' : 'transparent';
      ctx.fillRect(x, 100, tabWidth, 40);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.fillText(tab, x + tabWidth / 2, 125);
    });
    
    // 物品列表
    const shopData = window.Shop ? window.Shop.getShopData() : null;
    if (shopData) {
      const startY = 160;
      const itemHeight = 70;
      
      shopData.skins.slice(0, 4).forEach((item, i) => {
        const y = startY + i * itemHeight;
        
        // 物品背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        roundRect(ctx, 20, y, screenWidth - 40, itemHeight - 10, 10);
        ctx.fill();
        
        // 物品名称
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, 80, y + 25);
        
        // 描述
        ctx.font = '12px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText(item.description, 80, y + 45);
        
        // 价格/状态
        ctx.textAlign = 'right';
        if (item.owned) {
          ctx.fillStyle = '#32CD32';
          ctx.fillText('已拥有', screenWidth - 30, y + 35);
        } else {
          ctx.fillStyle = '#FFD700';
          ctx.fillText(`${item.price} 积分`, screenWidth - 30, y + 35);
        }
      });
    }
    
    // 返回按钮
    const backBtn = buttons.shop[0];
    if (backBtn) {
      drawButton(ctx, backBtn);
    }
  }
  
  // 绘制按钮
  function drawButton(ctx, btn) {
    const isHovered = hoveredButton === btn.id;
    
    // 按钮背景
    ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    roundRect(ctx, btn.x, btn.y, btn.width, btn.height, 10);
    ctx.fill();
    
    // 边框
    ctx.strokeStyle = isHovered ? '#FFD700' : 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${btn.height * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);
  }
  
  // 绘制设置界面
  function drawSettings(ctx) {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    const centerX = screenWidth / 2;
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('设置', centerX, 80);
    
    // 音效开关
    const isMuted = window.Sound ? window.Sound.isMuted() : false;
    
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('音效', 50, 150);
    
    ctx.fillStyle = isMuted ? '#FF4500' : '#32CD32';
    ctx.beginPath();
    roundRect(ctx, screenWidth - 120, 130, 70, 30, 15);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isMuted ? '关闭' : '开启', screenWidth - 85, 150);
    
    // 音量滑块
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('音乐音量', 50, 210);
    
    const musicVolume = window.Sound ? window.Sound.getMusicVolume() : 0.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    roundRect(ctx, 50, 230, screenWidth - 100, 10, 5);
    ctx.fill();
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    roundRect(ctx, 50, 230, (screenWidth - 100) * musicVolume, 10, 5);
    ctx.fill();
    
    // 返回按钮
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    roundRect(ctx, centerX - 60, screenHeight - 100, 120, 45, 10);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('返回', centerX, screenHeight - 75);
  }
  
  // 渲染UI
  function render(ctx, boardState = null) {
    switch (currentScreen) {
      case 'menu':
        drawMenu(ctx);
        break;
      case 'levelSelect':
        drawLevelSelect(ctx);
        break;
      case 'game':
        drawGame(ctx, boardState);
        break;
      case 'pause':
        drawGame(ctx, boardState);
        drawPauseMenu(ctx);
        break;
      case 'result':
        drawResult(ctx);
        break;
      case 'shop':
        drawShop(ctx);
        break;
      case 'settings':
        drawSettings(ctx);
        break;
    }
    
    // 绘制粒子
    if (window.Particles) {
      window.Particles.render(ctx);
    }
  }
  
  // 导出全局API
  window.UI = {
    init,
    setScreen,
    getScreen,
    updateGameState,
    handleClick,
    handleHover,
    render,
    buttons,
    getSelectedLevel: () => selectedLevel,
    setSelectedLevel: (level) => { selectedLevel = level; }
  };
  
})();

})();

// ==================== main.js ====================
(function() {
/**
 * 主入口文件
 * 游戏主循环和状态管理
 */

(function() {
  'use strict';
  
  // 游戏状态
  const game = {
    canvas: null,
    ctx: null,
    width: 375,
    height: 667,
    dpr: 2,
    
    // 游戏状态
    state: 'menu', // menu, levelSelect, game, pause, result, shop, settings
    currentLevel: 1,
    maxUnlockedLevel: 1,
    score: 0,
    moves: 0,
    combo: 0,
    stars: 0,
    
    // 棋盘状态
    boardState: null,
    
    // 时间相关
    lastTime: 0,
    deltaTime: 0,
    gameTime: 0,
    
    // 触摸状态
    touchStart: null,
    isDragging: false,
    selectedItem: null,
    
    // 设置
    settings: {
      musicVolume: 0.5,
      sfxVolume: 0.7,
      isMuted: false
    }
  };
  
  // 初始化游戏
  function init() {
    // 获取画布
    if (typeof wx !== 'undefined') {
      game.canvas = window.canvas || wx.createCanvas();
      game.ctx = window.ctx || game.canvas.getContext('2d');
    } else {
      game.canvas = document.getElementById('gameCanvas');
      if (!game.canvas) {
        console.error('Canvas not found');
        return;
      }
      game.ctx = game.canvas.getContext('2d');
    }
    
    // 设置画布尺寸
    setupCanvas();
    
    // 初始化各模块
    initModules();
    
    // 加载游戏数据
    loadGameData();
    
    // 设置事件监听
    setupEventListeners();
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
    
    console.log('三消奇缘 - Triple Match Saga 初始化完成');
  }
  
  // 设置画布
  function setupCanvas() {
    const systemInfo = window.WX ? window.WX.getSystemInfo() : {
      windowWidth: window.innerWidth || 375,
      windowHeight: window.innerHeight || 667,
      pixelRatio: window.devicePixelRatio || 2
    };
    
    game.width = systemInfo.windowWidth;
    game.height = systemInfo.windowHeight;
    game.dpr = systemInfo.pixelRatio || 2;
    
    game.canvas.width = game.width * game.dpr;
    game.canvas.height = game.height * game.dpr;
    game.canvas.style.width = game.width + 'px';
    game.canvas.style.height = game.height + 'px';
    
    game.ctx.scale(game.dpr, game.dpr);
    
    // 初始化UI
    if (window.UI) {
      window.UI.init(game.width, game.height);
    }
  }
  
  // 初始化模块
  function initModules() {
    // 初始化音效
    if (window.Sound) {
      window.Sound.init();
    }
    
    // 初始化商城
    if (window.Shop) {
      // 商城已在加载时初始化
    }
    
    // 初始化宠物
    if (window.Pet) {
      window.Pet.init('fire_dragon');
    }
    
    // 预渲染精灵
    if (window.Candy) {
      window.Candy.prerender(48);
    }
    if (window.Animals) {
      window.Animals.prerender(48);
    }
    if (window.Desserts) {
      window.Desserts.prerender(48);
    }
    if (window.Fruits) {
      window.Fruits.prerender(48);
    }
  }
  
  // 加载游戏数据
  function loadGameData() {
    if (!window.WX || !window.WX.storage) return;
    
    const saved = window.WX.storage.getItem('gameData');
    if (saved) {
      game.currentLevel = saved.currentLevel || 1;
      game.maxUnlockedLevel = saved.maxUnlockedLevel || 1;
      game.settings = { ...game.settings, ...saved.settings };
    }
  }
  
  // 保存游戏数据
  function saveGameData() {
    if (!window.WX || !window.WX.storage) return;
    
    window.WX.storage.setItem('gameData', {
      currentLevel: game.currentLevel,
      maxUnlockedLevel: game.maxUnlockedLevel,
      settings: game.settings
    });
  }
  
  // 设置事件监听
  function setupEventListeners() {
    if (typeof wx !== 'undefined') {
      // 微信小游戏事件
      wx.onTouchStart(handleTouchStart);
      wx.onTouchMove(handleTouchMove);
      wx.onTouchEnd(handleTouchEnd);
    } else {
      // Web事件
      game.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTouchStart(e.touches[0]);
      });
      game.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        handleTouchMove(e.touches[0]);
      });
      game.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleTouchEnd(e.changedTouches[0]);
      });
      
      // 鼠标事件（用于PC测试）
      game.canvas.addEventListener('mousedown', (e) => {
        handleTouchStart({ clientX: e.clientX, clientY: e.clientY });
      });
      game.canvas.addEventListener('mousemove', (e) => {
        handleTouchMove({ clientX: e.clientX, clientY: e.clientY });
      });
      game.canvas.addEventListener('mouseup', (e) => {
        handleTouchEnd({ clientX: e.clientX, clientY: e.clientY });
      });
    }
  }
  
  // 处理触摸开始
  function handleTouchStart(touch) {
    const x = touch.clientX || touch.pageX || 0;
    const y = touch.clientY || touch.pageY || 0;
    
    game.touchStart = { x, y };
    game.isDragging = true;
    
    // 处理UI点击
    if (window.UI) {
      const buttonId = window.UI.handleClick(x, y);
      if (buttonId) {
        handleButtonClick(buttonId);
        return;
      }
    }
    
    // 游戏中的触摸处理
    if (game.state === 'game' && window.Board) {
      const result = window.Board.handleClick(x, y);
      if (result) {
        handleBoardClick(result);
      }
    }
  }
  
  // 处理触摸移动
  function handleTouchMove(touch) {
    if (!game.isDragging || !game.touchStart) return;
    
    const x = touch.clientX || touch.pageX || 0;
    const y = touch.clientY || touch.pageY || 0;
    
    // 更新UI悬停状态
    if (window.UI) {
      window.UI.handleHover(x, y);
    }
  }
  
  // 处理触摸结束
  function handleTouchEnd(touch) {
    game.isDragging = false;
    game.touchStart = null;
  }
  
  // 处理按钮点击
  function handleButtonClick(buttonId) {
    // 播放点击音效
    if (window.Sound) {
      window.Sound.playSound('click');
    }
    
    // 震动反馈
    if (window.WX && window.WX.vibrate) {
      window.WX.vibrate.short();
    }
    
    switch (buttonId) {
      // 主菜单按钮
      case 'play':
        game.state = 'levelSelect';
        if (window.UI) window.UI.setScreen('levelSelect');
        break;
      case 'shop':
        game.state = 'shop';
        if (window.UI) window.UI.setScreen('shop');
        break;
      case 'settings':
        game.state = 'settings';
        if (window.UI) window.UI.setScreen('settings');
        break;
        
      // 游戏按钮
      case 'pause':
        game.state = 'pause';
        if (window.UI) window.UI.setScreen('pause');
        break;
        
      // 道具按钮
      case 'item_hammer':
      case 'item_bomb':
      case 'item_refresh':
        const itemId = buttonId.replace('item_', '');
        game.selectedItem = itemId;
        break;
        
      // 暂停菜单按钮
      case 'resume':
        game.state = 'game';
        if (window.UI) window.UI.setScreen('game');
        break;
      case 'quit':
        game.state = 'menu';
        if (window.UI) window.UI.setScreen('menu');
        break;
        
      // 结果界面按钮
      case 'retry':
        startLevel(game.currentLevel);
        break;
      case 'next':
        startLevel(game.currentLevel + 1);
        break;
      case 'menu':
        game.state = 'menu';
        if (window.UI) window.UI.setScreen('menu');
        break;
        
      // 商城按钮
      case 'back':
        game.state = 'menu';
        if (window.UI) window.UI.setScreen('menu');
        break;
    }
  }
  
  // 处理棋盘点击
  function handleBoardClick(result) {
    if (result.type === 'select') {
      // 选择元素
    } else if (result.type === 'match') {
      // 匹配成功
      game.score += result.score;
      game.combo = result.combo;
      
      // 更新UI状态
      if (window.UI) {
        window.UI.updateGameState({
          score: game.score,
          combo: game.combo
        });
      }
      
      // 增加宠物能量
      if (window.Pet) {
        window.Pet.addEnergy(result.matches[0].cells.length * 5);
      }
      
      // 更新任务进度
      if (window.Shop) {
        window.Shop.updateTaskProgress('combo_master', result.combo >= 5 ? 1 : 0);
      }
    } else if (result.type === 'invalid') {
      // 无效移动
    }
  }
  
  // 开始关卡
  function startLevel(level) {
    if (level < 1 || level > 80) return;
    
    game.currentLevel = level;
    game.state = 'game';
    game.score = 0;
    game.combo = 0;
    game.stars = 0;
    
    // 获取主题
    const theme = window.Themes ? window.Themes.getThemeByLevel(level) : 'candy';
    
    // 初始化棋盘
    if (window.Board) {
      game.boardState = window.Board.init(level, theme);
      game.moves = game.boardState.moves;
      
      // 设置回调
      window.Board.setCallbacks({
        onScoreChange: (score) => {
          game.score = score;
          if (window.UI) {
            window.UI.updateGameState({ score });
          }
        },
        onMovesChange: (moves) => {
          game.moves = moves;
          if (window.UI) {
            window.UI.updateGameState({ moves });
          }
        },
        onCombo: (combo) => {
          game.combo = combo;
          if (window.UI) {
            window.UI.updateGameState({ combo });
          }
        },
        onLevelComplete: (stars, score) => {
          onLevelComplete(stars, score);
        },
        onLevelFail: (score) => {
          onLevelFail(score);
        }
      });
    }
    
    // 初始化宠物
    if (window.Pet) {
      window.Pet.init('fire_dragon');
    }
    
    // 生成Roguelike修饰符
    if (window.Roguelike) {
      window.Roguelike.generateModifiers(level);
    }
    
    // 更新UI
    if (window.UI) {
      window.UI.setScreen('game');
      window.UI.updateGameState({
        level,
        score: game.score,
        moves: game.moves,
        combo: game.combo
      });
    }
    
    // 播放背景音乐
    if (window.Sound) {
      window.Sound.playMusic('game');
    }
  }
  
  // 关卡完成
  function onLevelComplete(stars, score) {
    game.stars = stars;
    game.state = 'result';
    
    // 更新最大解锁关卡
    if (game.currentLevel >= game.maxUnlockedLevel) {
      game.maxUnlockedLevel = Math.min(80, game.currentLevel + 1);
    }
    
    // 添加积分
    if (window.Shop) {
      window.Shop.addPoints(score, `关卡 ${game.currentLevel} 完成`);
      
      // 更新任务进度
      window.Shop.updateTaskProgress('complete_levels', 1);
      if (stars === 3) {
        window.Shop.updateTaskProgress('perfect_clear', 1);
      }
    }
    
    // 检查彩蛋
    if (window.Eggs) {
      const eggs = window.Eggs.onLevelWin(stars === 3);
      // 处理彩蛋...
    }
    
    // 播放胜利音效
    if (window.Sound) {
      window.Sound.playSound('levelComplete');
    }
    
    // 创建胜利粒子效果
    if (window.Particles) {
      window.Particles.createVictoryEffect(game.width / 2, game.height / 2);
    }
    
    // 保存数据
    saveGameData();
    
    // 更新UI
    if (window.UI) {
      window.UI.setScreen('result');
      window.UI.updateGameState({
        stars,
        score
      });
    }
  }
  
  // 关卡失败
  function onLevelFail(score) {
    game.stars = 0;
    game.state = 'result';
    
    // 检查彩蛋
    if (window.Eggs) {
      window.Eggs.onLevelFail();
    }
    
    // 播放失败音效
    if (window.Sound) {
      window.Sound.playSound('levelFail');
    }
    
    // 创建失败粒子效果
    if (window.Particles) {
      window.Particles.createFailEffect(game.width / 2, game.height / 2);
    }
    
    // 更新UI
    if (window.UI) {
      window.UI.setScreen('result');
      window.UI.updateGameState({
        stars: 0,
        score
      });
    }
  }
  
  // 游戏循环
  function gameLoop(timestamp) {
    // 计算帧时间
    game.deltaTime = timestamp - game.lastTime;
    game.lastTime = timestamp;
    game.gameTime += game.deltaTime;
    
    // 更新
    update(game.deltaTime);
    
    // 渲染
    render();
    
    // 继续循环
    requestAnimationFrame(gameLoop);
  }
  
  // 更新
  function update(deltaTime) {
    // 更新粒子
    if (window.Particles) {
      window.Particles.update(deltaTime);
    }
    
    // 更新棋盘状态
    if (game.state === 'game' && window.Board) {
      game.boardState = window.Board.getBoardState();
    }
  }
  
  // 渲染
  function render() {
    // 清空画布
    if (!game.ctx || !game.canvas) return;
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    
    // 渲染UI
    if (window.UI) {
      window.UI.render(game.ctx, game.boardState);
    }
  }
  
  // 导出全局函数
  window.gameInit = init;
  window.update = update;
  window.render = render;
  window.handleTouchStart = handleTouchStart;
  window.handleTouchMove = handleTouchMove;
  window.handleTouchEnd = handleTouchEnd;
  
  // 游戏控制函数
  window.Game = {
    init,
    startLevel,
    getState: () => game.state,
    getCurrentLevel: () => game.currentLevel,
    getMaxUnlockedLevel: () => game.maxUnlockedLevel,
    getScore: () => game.score,
    getMoves: () => game.moves
  };
  
  // 自动初始化（Web环境）
  if (typeof wx === 'undefined') {
    if (document.readyState === 'complete') {
      init();
    } else {
      window.addEventListener('load', init);
    }
  }
  
})();

})();

// ==================== 启动游戏 ====================
window.addEventListener('load', function() {
  console.log('三消奇缘 - Triple Match Saga 初始化完成');
  if (window._main && window._main.init) {
    window._main.init();
  }
});

})();