// pages/orderRedemption/orderRedemption.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyCode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  // 核销
  _writeOff() {
    if (this.data.keyCode) {
      api._post('/myShop/shopCashMessage', {
        messageCode: this.data.keyCode
      }).then(res => {
        this.setData({
          keyCode: ""
        }, () => {
          util._toast(res.error.msg);
        });
      });
    } else {
      util._toast("请输入核销码");
    }

  },
  // 设置参数
  _setParams(e) {
    let key = e.currentTarget.dataset.key;
    let value = e.detail.value;
    this.setData({
      [key]: value
    });
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