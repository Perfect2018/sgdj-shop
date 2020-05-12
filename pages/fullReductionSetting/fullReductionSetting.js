// pages/fullReductionSetting/fullReductionSetting.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const validate = require('../../utils/validate.js');
Page({
  //满
  _setParam(e) {
    let key = e.currentTarget.dataset.key;
    key = this.data.flag === 0 && `temp.${key}`
    this.setData({
      [key]: e.detail.value
    });
  },
  // 保存
  _save() {
    let msg = false;
    let flag = this.data.flag;
    if (flag === 0) {
      let {
        totalAmt,
        fullAmtToUse
      } = this.data.temp;
      if (!validate.validMoney(fullAmtToUse)) {
        msg = "格式有误，请重新输入";
      } else if (!validate.validMoney(totalAmt)) {
        msg = "格式有误，请重新输入";
      }
    } else if (flag === 1) {
      console.log(this.data.full)
      if (!validate.validMoney(this.data.full)) {
        msg = "格式有误，请重新输入";
      } else if (!validate.validMoney(this.data.subtract)) {
        msg = "格式有误，请重新输入";
      }
    }
    // console.log(flag)
    if (!msg) {
      util._loading();
      if (flag === 0) {
        let {
          fullAmtToUse,
          totalAmt
        } = this.data.temp;
        api._post('/myShop/addShopCoupon', {
          fullAmtToUse: fullAmtToUse,
          totalAmt: totalAmt
        }).then(res => {
          if (res.success) {
            // this._getData();
            util._toast("设置成功");
          }
        });
      } else if (flag === 1) {
        api._post('/myShop/fullReductionActivity', {
          id: this.data.id,
          fullAmt: this.data.fullAmt,
          minusAmt: this.data.subtract,
          state: '00'
        }).then(res => {
          if (res.success) {
            // this._getData();
            util._toast("设置成功");
          }
        });
      }

    } else {
      util._toast(msg);
    }
  },
  // 增加

  _addItem(){
    this.setData({
      showFlag:true,
    })
    this._getData()
  },

  // 删除
  _delete(e) {
    let that = this;
    let flag = this.data.flag;
    let deleteId = e.currentTarget.dataset.id
    console.log(e)
    // console.log(flag)
    if(deleteId == 5){
      this.setData({
        showFlag:false
      })
      util._toast('删除成功')
      console.log(deleteId)
    }
    if (flag === 0) {
      api._post('/myShop/deleteShopCoupon', {
        id: e.currentTarget.dataset.id
      }).then(res => {
        if (res.success) {
          
          util._toast("删除成功");
          that.onLoad()
          this._getData();
        } else {
          util._toast("删除失败");
        }

      });
    } else if (flag === 1) {
      api._post('/myShop/fullReductionActivity', {
        id: this.data.id,
        state: "99"
      }).then(res => {
        if (res.success) {
          this.setData({
            id: '',
            full: '',
            subtract: ''
          });
          this.onLoad()
          util._toast("删除成功");
        } else {
          util._toast("删除失败");
        }

      });
    }


  },
  // 查询之前满减
  _getData() {
    let flag = this.data.flag;
    console.log(flag)
    if (flag === 0) {
      api._post('/myShop/selectShopCouponList').then(res => {
        console.log(res)
        if (res.data && res.data.length) {
          console.log(res.data)
          this.setData({
            list: res.data,
            temp: {
              fullAmtToUse: '',
              totalAmt: ''
            }
          });
        }else{
          this.setData({
            list: res.data,
            temp: {
              fullAmtToUse: '',
              totalAmt: ''
            }
          })
        }
      });
    } else if (flag === 1) {
      api._post('/myShop/selectFullReduction', {
        state: "00"
      }).then(res => {
        if (res.data && res.data.length) {
          this.setData({
            id: res.data[res.data.length - 1].id,
            full: res.data[res.data.length - 1].fullAmt,
            subtract: res.data[res.data.length - 1].minusAmt
          });
        }
      });
    }

  },
  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    full: '',
    subtract: '',
    flag: 0,
    list: [],
    showFlag: true,
    temp: {
      full: '',
      subtract: ''
    },
    isShow:true,
    deleteId:5
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.setNavigationBarTitle({
    //   title: options.name || "",
    // });
    // this.setData({
    //   flag: options.name === "营销活动" ? 0 : 1
    // }, () => {
    //   this._getData();
    // });
    this._getData()
    // console.log(111)
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
    // this._getData();
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