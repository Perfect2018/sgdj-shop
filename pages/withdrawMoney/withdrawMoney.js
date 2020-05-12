// pages/withdrawMoney/withdrawMoney.js
const api = require('../../utils/api.js');
const validate = require('../../utils/validate.js');
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: '0.00',
    name: '',
    amount: ''
  },
  //获取姓名
  _name(e) {
    let value = e.detail.value;
    this.setData({
      name: value
    })
  },
  //获取提现金额
  _amount(e) {
    let value = e.detail.value;
    this.setData({
      amount: value
    })
  },
  // 提现
  _getMoney() {
    let flag = true;
    console.log(this.data.amount)
    if (!this.data.amount){
      util._toast('提现金额不能为空');
      flag = false;
    }
    if (!validate.validMoney(this.data.amount)) {
      util._toast('格式有误，请重新输入');
      flag = false;
    } else if (this.data.amount < 100) {
      util._toast('提现今额不可小于100元');
      flag = false;
    } else if (!this.data.name) {
      util._toast('请输入合法姓名');
      flag = false;
    }
    if (flag) {
      let amount = this.data.amount;
      api._post('/shopstate/merchantWithdrawals', {
        state: "01",
        name: this.data.name,
        amount: amount
      }).then(res => {
        if (res.success) {
          this.setData({
            name: '',
            amount: '',
            money: Number(this.data.money - amount).toFixed(2)
          }, () => {
            util._toast('提现成功');
          });
        } else {
          util._toast('提现失败');
        }
      });
    }
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
        myShop: temp,
        money: temp.withdrawDepositMenoy ? temp.withdrawDepositMenoy : '0.00'
      });
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getMyShop();
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