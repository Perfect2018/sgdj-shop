// pages/orderStatistics/orderStatistics.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startDate:'',
    endtDate:'',
    shopId:'',
    orderList:''
  },

  // 查询订单
  getOrder(){
    let date = this.data.startDate
    let shopId = this.data.shopId
    let endDate = this.data.endDate
    if(date === endDate){
      endDate=''
    }
    api._post('/shopHeadPage/salesGoods',{
      date,
      endDate,
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
    // console.log(this.data.endDate == this.data.startDate)
    this.getOrder()
  },

  bindStartDateChange: function(e) {
    this.setData({
      startDate: e.detail.value
    })
  },

  bindEndDateChange: function(e) {
    this.setData({
      endDate: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var time = util.formatDate(new Date())
    this.setData({
      shopId:app.globalData.shopInfo.id,
      endDate:time,
      startDate:time
    },()=>{
      this.getOrder()
    })
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