//index.js
//获取应用实例
const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const validate = require('../../utils/validate.js');
// import config from '../../config.js'

Page({
  data: {
    isShow: app.globalData.isShow,
    logo: "../../image/sgdj.jpg",
    motto: '欢迎使用蔬果到家商户后台！',
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo: '',
    isShowOtherLogin: false,
    phone: '',
    password: ''
  },
  //事件处理函数
  onLoad: function() {
    // 获取userinfo
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  // 登录验证
  _validateLogin() {
    if (!validate.validPhone(this.data.phone)) {
      return "手机号格式不正确";
    } else if (6 > this.data.password.length || !this.data.password.length > 12) {
      return "密码格式不正确";
    }
    return false;
  },
  // 手机号密码登录
  _login() {
    let msg = this._validateLogin();
    if (!msg) {
      let password = this.data.password;
      api._post("/appLogin", {
        userName: this.data.phone,
        passWord: api._getEncrypt(password)
      }).then(res => {
        if (res.data) {
          api.setCustID(res.data['CUST-ID']);
          wx.switchTab({
            url: '../index/index'
          });
        } else {
          util._toast("登录失败");
        }
      })
    } else {
      util._toast(msg);
    }
  },
  // 手机号
  _phone(e) {
    this.setData({
      phone: e.detail.value
    });
  },
  // 密码
  _password(e) {
    this.setData({
      password: e.detail.value
    });
  },
  // 其他登录方式
  _otherLogin() {
    this.setData({
      isShowOtherLogin: !this.data.isShowOtherLogin
    });
  },
  _toIndex(encryptedData, iv) {
    util._loading('登陆中...');
    //获取用户敏感数据密文和偏移向量
    // let RequestTask = wx.request({
    //   url: config.DOMAIN + '/wxcust/wxuserinfo',
    //   data: {
    //     session_key: app.globalData.session_key,
    //     encryptedData: encryptedData,
    //     iv: iv
    //   },
    //   success: res => {
    //     wx.switchTab({
    //       url: '../index/index'
    //     });
    //   }
    // })
    // // 监听 HTTP Response Header 事件。会比请求完成事件更早
    // RequestTask.onHeadersReceived(res => {
    //   api.setCustID(res.header['CUST-ID']);
    // });
    let sessionKey = app.globalData.session_key;
    // if (sessionKey) {
    api._post('/wxcust/wxuserinfo', {
      session_key: sessionKey,
      encryptedData: encryptedData,
      iv: iv
    }).then(res => {
      if (res.data) {
        if (res.data.isShop || res.data.isShop === "01") {
          api.setCustID(res.data['CUST-ID']);
          wx.switchTab({
            url: '../index/index'
          });
        } else if (res.data.isShop === "99") {
          util._toast("该店已关闭，请联系029-81115971");
        } else if (res.data.isShop === "03") {
          util._toast("此账号不是商户");
        }
      }
    });
    // } else {
    //   wx.reLaunch({
    //     url: '../login/login'
    //   });
    // }


  },
  _getUserInfo(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
    if (e.detail.encryptedData && e.detail.iv) {
      //获取用户敏感数据密文和偏移向量
      this._toIndex(e.detail.encryptedData, e.detail.iv);
    }
  },
  // 页面跳转
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    if (navigatePath) {
      wx.navigateTo({
        url: `../${navigatePath}/${navigatePath}`
      });
    }
  },
  _experience() {
    api.setCustID(app.globalData.custId);
    wx.switchTab({
      url: '../index/index'
    });
  }
})