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
