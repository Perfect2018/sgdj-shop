//app.js
const api = require('./utils/api.js');
App({
  globalData: {
    classification: null,
    tempImage: false,
    userInfo: null,
    openId: '',
    session_key: '',
    lat: '',
    lng: '',
    shopInfo: '',
    custId: ''
  },
  realTimeData: {
    isShow: true,
    count: 0,
    oldGlobalOrder: 0,
    oldTimelyOrder: 0,
    newOrderState: '',
  },
  onLaunch: function () {
    this.appShare();
    // 检测版本更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              cancelColor: '#666',
              confirmColor: '#fdad00',
              success(res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          });
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
        cancelColor: '#666',
        confirmColor: '#fdad00',
      })
    }
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        api._post('/wxpay/getOpenId', {
          code: res.code
        }).then(res => {
          this.globalData.custId = res.data['CUST-ID'];
          this.globalData.isShow = res.data.isShow;
          this.globalData.openId = res.data.json.openid;
          this.globalData.session_key = res.data.json.session_key;
          // 获取用户信息
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: res => {
                    // 可以将 res 发送给后台解码出 unionId
                    // console.log(res)
                    this.globalData.userInfo = res.userInfo;
                    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    // 所以此处加入callback 以防止这种情况
                    if (this.userInfoReadyCallback) {
                      this.userInfoReadyCallback(res)
                    }
                  }
                });
              }
            }
          });
        }).catch(err => {
          // console.log(err);
        });
      }
    });

  },
  //全局分享方法
  appShare() {
    //监听路由切换
    //间接实现全局设置分享内容
    wx.onAppRoute(function (res) {
      //获取加载的页面
      let pages = getCurrentPages(),
        //获取当前页面的对象
        view = pages[pages.length - 1],
        data;
      if (view) {
        data = view.data;
        view.onShareAppMessage = function () {
          //分享配置
          return {
            title: "蔬果到家商户端", // 子页面的title
            path: '/pages/login/login'
          };
        }
      }
    });
  }

});