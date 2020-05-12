// pages/purchaseHi/purchaseHi.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const validate = require('../../utils/validate.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: {},
    originalPrice: '',
    currentPrice: "",
    discount: ''
  },
  // 获取商品详情
  _getGoodsDetail(id = this.data.goods.id) {
    api._post('/shopgoods/getgoodsdetail', {
      id
    }).then(res => {
      this.setData({
        goods: res.dataDto,
        originalPrice: res.dataDto.price,
        currentPrice: res.dataDto.discountPrice ? res.dataDto.discountPrice : '',
        discount: res.dataDto.discount ? res.dataDto.discount : '',
      })
    })
  },
  // 保存
  _save() {
    let currentPrice = this.data.currentPrice;
    let discount = this.data.discount;
    if (currentPrice) {
      api._post("/shopgoods/updategoodsinfo", {
        id: this.data.goods.id,
        discountPrice: currentPrice,
        discount: discount,
        isRecommendGoods: '03'
      }).then(res => {
        wx.showLoading({
          title: '保存中...',
          mask: true
        });
        if (res.success) {
          wx.hideLoading();
          util._toast("保存成功");
          wx.switchTab({
            url: '/pages/goods/goods',
          })
        }
      })
    }
  },
  //设置折扣
  _currentPrice(e) {
    let temp = e.detail.value;
    if (temp > 0 || temp) {
      if (validate.validMoney(temp)) {
        let originalPrice = this.data.originalPrice;
        this.setData({
          currentPrice: temp,
          discount: (temp / originalPrice).toFixed(2)
        })
      } else {
        util._toast("折扣价格式不正确");
      }
    } else {
      this.setData({
        discount: ""
      })
      util._toast("请输入折扣价");
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._getGoodsDetail(options.id);
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