//index.js
//获取应用实例
const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const realTime = require('../../utils/realTime.js');

Page({
  data: {
    shop: {
      shopState: "01"
    },
    disableShop: true,
    isNew:true,
    userInfo: {},
    todayData: {},
    shopState: [{
        name: '开店',
        state: '01'
      },
      {
        name: '打烊',
        state: '00'
      },
    ],
    statistics: [{
        navigateTo: 'replyComment',
        src: '../../image/h1.png',
        title: '待回复/评论',
        message: '未回复订单'
      },
      {
        navigateTo: 'businessStatistics',
        src: '../../image/h2.png',
        title: '营业统计',
        message: '营业数据统计'
      },
      {
        navigateTo: 'storeAnalysis',
        src: '../../image/h3.png',
        title: '店铺分析',
        message: '运营数据分析'
      },
      {
        navigateTo: 'passengerFlowAnalysis',
        src: '../../image/h4.png',
        title: '客流分析',
        message: '客户流量分析'
      },
      {
        navigateTo: 'customerAnalysis',
        src: '../../image/h5.png',
        title: '顾客分析',
        message: '顾客增速分析'
      },
      {
        navigateTo: 'commodityAnalysis',
        src: '../../image/h6.png',
        title: '商品分析',
        message: '商品维度分析'
      },
    ]
  },
  onLoad: function() {
    // 获取店铺信息
    // this._getShop();
    // 获取今日订单数据
    this._getTodayData();
    // 开启新订单查询
    realTime._openOrderToast();
    // 身份验证
    // this.userIdentify();
  },
  // 页面跳转
  _toView: function(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    util._toast("暂未开放")
    // wx.navigateTo({
    //   url: `../${navigatePath}/${navigatePath}`
    // });
  },
  //事件处理函数
  bindState: function(e) {

    if (this.data.disableShop) {
      let state = e.currentTarget.dataset.state;
      // console.log(state)
      api._get('/myShop/updateShopState', {
        shopState: state,
      }).then(res => {
        if (state !== "01") {
          wx.showModal({
            title: '提示',
            content: '若需开店，请手动点击开店',
            showCancel: false,
            confirmColor: "#fdad00"
          });
        }
        this._getShop();
      });
    } else {
      util._toast("您的店铺已经强制关闭！请与客服联系！");
    }
  },
  // 获取店铺信息
  _getShop() {
    // 获取店铺分类
    realTime._getClassify();
    api._post('/myShop/getShopInfo').then(res => {
      app.globalData.shopInfo = res.dataDto;
      // console.log(res)
      this.setData({
        shop: res.dataDto
      });
      app.globalData.userInfo = res.dataDto;
      if (res.dataDto.state != "00") {
        this.setData({
          disableShop: false
        });
      }
    });
  },
  // 获取今日订单数据
  _getTodayData() {
    api._post('/myShop/orderCountAndMoney').then(res => {
      this.setData({
        todayData: res.data
      });
    });
  },

  // 身份验证
  userIdentify: function() {
    if (app.globalData.openId) {
      api._get('/wxcust/sgdjLoginTest1', {
        openId: app.globalData.openId,
      }).then(res => {
        this.setData({
          currentIndex: index
        });
      });
    }

  },

  // 关闭提示
  close(){
    this.setData({
      isNew:false
    })
  },
  onReady: function() {
    /**初始化页面的数据**/
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 获取店铺信息
    this._getShop();
    // 获取今日订单数据
    this._getTodayData();
  },

})