// pages/bill/bill.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    pageNum:1
  },


  getList(){
    api._post('/myShop/selectOutOrder',{
      pageNum:this.data.pageNum
    }).then(res=>{
      if(res.success){
        let arr = this.data.list
        if(res.data.list){
          arr = arr.concat(res.data.list)
          this.setData({
            list:arr
          })
        }else{
          util._toast("暂无更多数据")
        }
        
        // console.log(this.data.list)
      }else{
        util._toast('操作异常')
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList()
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
    this.setData({
      pageNum:this.data.pageNum+1
    })
    console.log(this.data.pageNum)
    this.getList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})