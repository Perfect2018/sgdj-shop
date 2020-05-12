// pages/marketingCampaign/marketingCampaign.js
Page({
  // 页面跳转
  _toView: function (e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: `../${navigatePath}/${navigatePath}?name=${name}`
    });
  },
  /**
   * 页面的初始数据
   */
  data: {
    marketList: [{
        market: "fullReductionSetting",
        name: "优惠券"
      },
      // {
      //   market: "fullReductionSetting",
      //   name: "现金券"
      // },
      // {
      // market: "salesPresentSetting",
      // name: "买赠设置"
      // },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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