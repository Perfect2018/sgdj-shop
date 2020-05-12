const util = require('./util.js');
const api = require('./api.js');
const app = getApp();

const innerAudioContext = wx.createInnerAudioContext();
innerAudioContext.autoplay = true; //音频自动播放设置
const urlSrc = '/voice/sgdj_msg.mp3';
let getOrderNowTimer = null;
// 请求是否开始 默认开始
let requestEnd = true;

// 请求订单数据
const _getNewOrderList = () => {
  Promise.all([
    api._post('/shopOrder/getStateOrder', {
      globalOrder: "01",
      orderState: "07",
      pageNum: 1
    }), api._post('/shopOrder/getStateOrder', {
      globalOrder: "02",
      orderState: "07",
      pageNum: 1
    })
  ]).then(res => {
    // 请求结束 可以开始下一个请求了
    requestEnd = true;
    let globalOrder = res[0].data ? res[0].data.list : [];
    let timelyOrder = res[1].data ? res[1].data.list : [];

    let oldGlobalOrder = app.realTimeData.oldGlobalOrder;
    let oldTimelyOrder = app.realTimeData.oldTimelyOrder;

    if ((globalOrder && globalOrder ? globalOrder.length > oldGlobalOrder : false) || (timelyOrder && timelyOrder ? timelyOrder.length > oldTimelyOrder : false)) {
      _getNewOrderState();
    }
    if (timelyOrder && timelyOrder ? timelyOrder.length > oldTimelyOrder : false) {
      app.realTimeData.oldTimelyOrder = timelyOrder.length;
      app.realTimeData.newOrderState = "02";
    } else if (globalOrder && globalOrder ? globalOrder.length > oldGlobalOrder : false) {
      app.realTimeData.oldGlobalOrder = globalOrder.length;
      app.realTimeData.newOrderState = "01";
    }
  });
}
// 新订单提示显示
const _getNewOrderState = () => {
  if (app.realTimeData.isShow) {
    app.realTimeData.isShow = false;
    // 播放提示音
    _audio();
    wx.showModal({
      title: '消息',
      content: '您有新的订单，请确认订单。',
      showCancel: true,
      cancelText: "忽略",
      cancelColor: '#666',
      confirmText: "查看",
      confirmColor: '#fdad00',
      success: function(res) {
        if (res.cancel) {
          app.realTimeData.isShow = true;
          //点击取消,默认隐藏弹框
          app.realTimeData.oldGlobalOrder = 0;
          app.realTimeData.oldTimelyOrder = 0;
        } else {
          app.realTimeData.isShow = true;
          app.realTimeData.oldGlobalOrder = 0;
          app.realTimeData.oldTimelyOrder = 0;
          //点击确定
          innerAudioContext.stop();
          wx.switchTab({
            url: `/pages/order/order`,
            success: () => {
              var page = getCurrentPages().pop();
              if (page == undefined || page == null) return;
              page.onLoad();
              // page.handleOrderList()
            }
          });
        }
      }
    });
  }
}

// 播放提示音
const _audio = () => {
  innerAudioContext.src = urlSrc; //链接到音频的地址
  innerAudioContext.play();
  // wx.playBackgroundAudio({
  //   dataUrl: this.data.urlSrc,
  //   title: "新订单提示"
  // });
}

// 获取分类
const _getClassify = () => {
  return new Promise((resolve, reject) => {
    api._post('/myShop/selectAllShopCategory').then(res => {
      let temp = res.data;
      let goods_classificationArray = [];
      temp.forEach(elem => {
        goods_classificationArray.push(elem.name)
      });
      app.globalData.classification = {
        goods_classificationArray: goods_classificationArray,
        goods_classificationArrayMap: res.data
      }
      resolve(res)
    });
  });
}
// 开启订单查询
const _openOrderToast = () => {
  getOrderNowTimer = setInterval(() => {
    if (requestEnd) {
      requestEnd = false;
      _getNewOrderList();
    }
  }, 30000);
}
// 关闭订单查询
const _closeOrderToast = () => {
  if (getOrderNowTimer) {
    clearInterval(getOrderNowTimer);
  }
}
export {
  _openOrderToast,
  _closeOrderToast,
  _getClassify
}