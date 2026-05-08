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
