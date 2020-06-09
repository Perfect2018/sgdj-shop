// pages/order/order.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const bluetooth = require('../../utils/bluetooth.js');
const app = getApp();
Page({
  // 静态数据
  staticData: {
    // 临时数据
    tempId: '',
    tempIndex: ''
  },
  /**
   * 页面的初始数据
   */
  data: {
    orderCount: 0,
    newDate: util.timeFmt(new Date()),
    flag: false,
    // 快递单号
    isShow:'true',
    trackingNumber: '',
    state: '02',
    timely_order: [{
        name: '新订单',
        state: '07'
      },
      {
        name: '待发货',
        state: '00'
      },
      {
        name: '配送中',
        state: '09'
      },
      {
        name: '已完成',
        state: '10'
      },
      {
        name: '退款/售后',
        state: '14'
      },
    ],
    currentIndex: '0',
    showOrder: -1,
    orderList: [],
    pageNum: 1,
    orderState: "00",
    selectOrder: false,
    selectOrderList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // this.handleOrderList()
    if (app.realTimeData.newOrderState) {
      let flag;
      if (app.realTimeData.newOrderState == '02') {
        flag = false;
      } else {
        flag = true;
      }
      this.setData({
        flag: flag,
        currentIndex: '0',
        orderList: [],
        state: app.realTimeData.newOrderState
      }, () => {
        app.realTimeData.newOrderState = "";
        //获取订单总量
        this.getCount(this.data.state);
        // 获取订单
        this.getStateOrder(this.data.state, "07");
      });

    } else {
      //获取订单总量
      this.getCount(this.data.state);
      // 获取订单
      this.getStateOrder(this.data.state, "07");
    }
    // this.getStateOrder(this.data.state, "14");
    // console.log(this.data.currentIndex)
    // console.log(this.data.state)
  },

  // 订单统计页面
  statistics(){
    // util._toast('跳转到订单统计页面')
    wx.navigateTo({
      url: '/pages/orderStatistics/orderStatistics',
    })
  },

  // 确认快递单号
  _confirm(e) {
    let trackingNumber = this.data.trackingNumber;
    if (trackingNumber) {
      let id = this.staticData.tempId;
      let index = this.staticData.tempIndex;
      util._loading("加载中");
      api._post('/shopOrder/changeOrderState', {
        id: id,
        orderState: "09",
        expressNumber: trackingNumber
      }).then(res => {
        // 获取订单
        let temp = this.data.orderList.concat([]);
        temp.splice(index, 1);
        this.setData({
          orderList: temp,
          trackingNumber: ''
        });
        this.popup.hidePopup();
      });
    } else {
      util._toast("请输入快递单号");
    }
  },
  // 复制
  _copyright(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.content,
      success(res) {
        wx.hideToast();
        setTimeout(() => {
          util._toast("已复制");
        });
      }
    })
  },
  // 设置参数
  _setParams(e) {
    let key = e.currentTarget.dataset.key;
    this.setData({
      [key]: e.detail.value
    });
  },
  // 选中打印订单
  _selectOrder() {
    let selectOrder = this.data.selectOrder
    let selectOrderList = this.data.selectOrderList
    if (selectOrder) {
      if (selectOrderList.length) {
        try {
          // 有值 并打印订单
          util._loading("打印中...");
          // console.log('打印订单')
          bluetooth.print(selectOrderList, 1);
         
        } catch (e) {
          wx.hideLoading();
          util._toast("打印失败");
        }
      } else {
        this.setData({
          selectOrder: false
        });
      }
    } else {
      this.setData({
        selectOrderList: [],
        showOrder: -1,
        selectOrder: true
      });
    }
  },
  // 打印订单
  _printOrder(e) {
    try {
      let index = e.currentTarget.dataset.index;
      let temp = this.data.orderList[index];
      // 有值 并打印订单
      util._loading("打印中...");
      bluetooth.print(temp);
    } catch (e) {
      wx.hideLoading();
      util._toast("打印失败");
    }
  },
  // 全球臻选
  _setGlobal() {
    let state = '01';
    if (state != this.data.state) {
      // 获取订单
      this.getStateOrder(state, "07");
      //获取订单总量
      this.getCount(state)
      this.setData({
        pageNum: 1,
        showOrder: -1,
        state: state,
        flag: true,
        orderList: [],
        currentIndex: '0'
      });
    }
  },
  // 即时送
  _setTimely() {
    let state = '02';
    if (state != this.data.state) {
      this.setData({
        pageNum: 1,
        showOrder: -1,
        flag: false,
        state: state,
        orderList: [],
        currentIndex: '0'
      }, () => {
        // 获取订单
        this.getStateOrder(state, "07");
        //获取订单总量
        this.getCount(state)
      });

    }
  },
  _toGoodsView(e) {
    wx.navigateTo({
      url: `../goodsDetail/goodsDetail?goodsId=${e.currentTarget.dataset.goodsid}`
    });
  },
  // 确认订单 并申请配送
  _confirmOrderDispatch(e) {
    let id = e.currentTarget.dataset.orderid;
    let index = e.currentTarget.dataset.index;
    api._post('/shopOrder/changeOrderStateAndPushOrder', {
      id: id,
      orderState: "00"
    }).then(res => {
      // 获取订单
      let temp = this.data.orderList.concat([]);
      temp.splice(index, 1);
      this.setData({
        orderList: temp
      });
    });
  },
  // 确认订单 即时送
  _confirmOrder(e) {
    let id = e.currentTarget.dataset.orderid;
    let index = e.currentTarget.dataset.index;

    api._post('/shopOrder/changeOrderState', {
      id: id,
      orderState: "00"
    }).then(res => {
      // 获取订单
      let temp = this.data.orderList.concat([]);
      temp.splice(index, 1);
      this.setData({
        orderList: temp
      });
    })
  },
  // 拨打电话  
  _callCusPhone(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    });
  },
  // 确认退款、申请
  _confirmRefund(e) {
    let id = e.currentTarget.dataset.orderid;
    let index = e.currentTarget.dataset.index;
    api._post('/wxpay/orderRefund', {
      id: id
    }).then(res => {
      // 获取订单
      // console.log(res)
      let temp = this.data.orderList.concat([]);
      temp.splice(index, 1);
      this.setData({
        isShow:false,
        orderList: temp
      });
      
    });
  },
  // 确认发货 即时送 全球甄选
  _confirmDelivery(e) {
    let id = e.currentTarget.dataset.orderid;
    let index = e.currentTarget.dataset.index;
    if (this.data.flag) { //全球甄选需要填写快递单号
      this.staticData.tempId = id;
      this.staticData.tempIndex = index;
      this.popup.showPopup();
      return;
    }
    api._post('/shopOrder/changeOrderState', {
      id: id,
      orderState: "09"
    }).then(res => {
      // 获取订单
      let temp = this.data.orderList.concat([]);
      temp.splice(index, 1);
      this.setData({
        orderList: temp
      });
    });
  },

  // 显示隐藏 订单信息
  _showDetail(e) {
    let index = e.currentTarget.dataset.index;
    if (!this.data.selectOrder) { //是否为打印订单
      if (index == this.data.showOrder) {
        this.setData({
          showOrder: -1
        });
      } else {
        this.setData({
          showOrder: index
        });
      }
    } else {
      let temp = this.data.orderList[index];
      let selectOrderList = this.data.selectOrderList;
      let path = `orderList[${index}].checked`;
      if (temp.checked) {
        selectOrderList = selectOrderList.filter(elem => elem.id != temp.id);
      } else {
        selectOrderList = selectOrderList.concat([temp]);
      }
      this.setData({
        selectOrderList: selectOrderList,
        [path]: !temp.checked
      });
    }

  },

  //获取订单总量
  getCount(globalOrder) {
    api._post('/shopOrder/getCount', {
      globalOrder: globalOrder
    }).then(res => {
      this.setData({
        orderCount: res.data
      })
    })
  },
  // 获取订单
  getStateOrder(globalOrder, orderState) {
    util._loading('加载中...');
    api._post('/shopOrder/getStateOrder', {
      globalOrder: globalOrder,
      orderState: orderState,
      pageNum: this.data.pageNum
    }).then(res => {
      let temp = this.data.orderList;
      // console.log(res.data)
      if (res.data) {
        // console.log(res.data)
        let tempList = res.data.list.map(elem => {
          elem.checked = false;
          return elem;
        });
        // console.log(tempList)
        temp = temp.concat(tempList)
        this.setData({
          orderState: orderState,
          orderList: temp
        })
        // console.log(this.data.orderState)
      } else {
        util._toast('暂无数据');
      }
      // this.setData({
      //   orderState: res.data.list[0].orderState
      // })
    })
  }, 
  // 订单列表
  handleOrderList: function (e) {
    let orderState = e.currentTarget.dataset.state;
    let index = e.currentTarget.dataset.index;
    this.setData({
      orderList: [],
      selectOrder: false,
      pageNum: 1,
      showOrder: -1,
      currentIndex: index
    });
    // 获取订单
    this.getStateOrder(this.data.state, orderState);
    // console.log(this.data.currentIndex)
    // console.log(this.data.state)
  },

  // 待提货
  goMption(){
    wx.navigateTo({
      url: '../orderRedemption/orderRedemption',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获得popup组件
    this.popup = this.selectComponent("#popup");
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      newDate: util.timeFmt(new Date())
    });
    // console.log(this.data.orderState)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

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
      pageNum: this.data.pageNum + 1
    });
    this.getStateOrder(this.data.state, this.data.orderState);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})