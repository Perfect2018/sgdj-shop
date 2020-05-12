// pages/orderStatistics/orderStatistics.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date:'',
    shopId:'',
    orderList:''
  },

  // 查询订单
  getOrder(){
    let date = this.data.date
    let shopId = this.data.shopId
    api._post('/shopHeadPage/salesGoods',{
      date,
      shopId
    }).then(res=>{
      if(res.data.length>0){
        this.setData({
          orderList:res.data
        })
      }else{
        util._toast('未查询到订单')
        this.setData({
          orderList:''
        })
      }
    })
  },

  comfirm(){
    this.getOrder()
  },

  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
    // console.log(this.data.date)
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var time = util.formatDate(new Date())
    this.setData({
      shopId:app.globalData.shopInfo.id,
      date:time
    },()=>{
      this.getOrder()
    })
    // console.log(this.data.shopId)
    // console.log(this.data.date)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})