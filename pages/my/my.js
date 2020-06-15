// pages/my/my.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const realTime = require('../../utils/realTime.js');
Page({
  // 跳转至提现页面
  _toWithdrawMoneyView(e) {
    wx.navigateTo({
      url: `../withdrawMoney/withdrawMoney?money=${e.currentTarget.dataset.money}`
    });
  },
  // 页面跳转
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let name = e.currentTarget.dataset.name;
    // console.log(name)
    if (navigatePath) {
      wx.navigateTo({
        url: `../${navigatePath}/${navigatePath}?name=${name}`
      });
    } else {
      util._toast("暂未开放");
    }
  },
  // 切换账号
  _reLaunch() {
    wx.showModal({
      title: '提示',
      content: '是否退出当前账号',
      cancelText: "取消",
      cancelColor: '#666',
      confirmText: "退出",
      confirmColor: '#f00',
      success(res) {
        if (res.confirm) {
          // 关闭新订单查询
          realTime._closeOrderToast();
          app.globalData.userInfo = null;
          wx.reLaunch({
            url: '../login/login'
          });

        }
      }
    });

  },
  /**
   * 页面的初始数据
   */
  data: {
    shop: {},
    myShop: {},
    shopSourcePhone:'',
    isNew:true
  },
  // 获取店铺信息
  _getShop() {
    api._post('/myShop/getShopInfo').then(res => {
      // console.log(res)
      this.setData({
        shop: res.dataDto,
        shopSourcePhone: res.dataDto.shopSource.split(',', 2)[1]
      });
    });
  },
  // 拨打电话  
  _callCusPhone() {
    if(this.data.shopSourcePhone == ''){
      this.setData({
        shopSourcePhone:'029-81115971'
      })
    }
    wx.makePhoneCall({
      phoneNumber: this.data.shopSourcePhone
    });
  },
  // 获取店铺金额
  _getMyShop() {
    api._post('/myShop/orderCount').then(res => {
      let temp = {
        staySettleAccountsMenoy: res.data.staySettleAccountsMenoy ? Number(res.data.staySettleAccountsMenoy).toFixed(2) : '0.00',
        withdrawDepositMenoy: res.data.withdrawDepositMenoy ? Number(res.data.withdrawDepositMenoy).toFixed(2) : '0.00',
        totalWithdrawDepositMenoy: res.data.totalWithdrawDepositMenoy ? Number(res.data.totalWithdrawDepositMenoy).toFixed(2) : '0.00',
        totalSalesToday: res.data.totalSalesToday ? Number(res.data.totalSalesToday).toFixed(2) : 0,
      }
      this.setData({
        myShop: temp
      })
    });
  },

  // 关闭提示
  close(){
    this.setData({
      isNew:false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},
  setting() {
    wx.navigateTo({
      url: '../shopSetting/shopSetting',
    })

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
    if (app.globalData.userInfo) {
      // 获取店铺信息
      this._getShop();
    } else {
      this.setData({
        shop: app.globalData.userInfo
      });
    }
    // 获取店铺金额
    this._getMyShop();
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