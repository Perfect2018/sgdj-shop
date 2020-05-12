// pages/forgetPassword/forgetPassword.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const validate = require('../../utils/validate.js');
let timer = null;
Page({
  staticData: {
    phone: "",
    password: "",
    code: "",
  },
  /**
   * 页面的初始数据
   */
  data: {
    // phone: "",
    // password: "",
    // code: "",
    stateTime: 0
  },
  // 获取验证码
  _getCode() {
    if (this.data.stateTime > 0) {
      return;
    }
    let msg = false;
    let phone = this.staticData.phone;
    if (!phone) {
      msg = "请输入手机号";
    } else if (!validate.validPhone(phone)) {
      msg = "手机号格式有误";
    }
    if (!msg) {
      this.setData({
        stateTime: 60
      });
      timer = setInterval(() => {
        let stateTime = this.data.stateTime;
        if (stateTime > 0) {
          stateTime -= 1;
          this.setData({
            stateTime: stateTime
          })
        } else {
          clearInterval(timer);
        }
      }, 1000)
      api._post("/sendSms", {
        mobile: phone
      }).then(res => {
        if (!res.success) {
          clearInterval(timer);
          util._toast("发送失败");
        }
      })
    } else {
      util._toast(msg);
    }

  },
  // 提交忘记密码
  _forget() {
    let msg = false;
    let password = this.staticData.password;
    let code = this.staticData.code;
    let phone = this.staticData.phone;
    if (!phone) {
      msg = "请输入手机号";
    } else if (!code) {
      msg = "请输入验证码";
    } else if (!password.length || !password.length > 12) {
      msg = "新密码格式不正确";
    }
    if (!msg) {
      api._post('/resetPassword', {
        vcode: code,
        username: phone,
        newPassword: api._getEncrypt(password)
      }).then(res => {
        if (res.success) {
          util._toast("修改成功");
          wx.navigateBack();
          // wx.redirectTo({
          //   url: '/pages/login/login',
          // })
        } else {
          util._toast("修改失败");
        }

      });
    } else {
      util._toast(msg);
    }
  },
  // 设置参数
  _setParams(e) {
    let key = e.currentTarget.dataset.key;
    let value = e.detail.value;
    this.staticData[key] = value;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})