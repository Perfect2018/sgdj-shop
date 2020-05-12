// pages/goods/goods.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsType: true,
    goodsCount: 0,
    newDate: util.timeFmt(new Date()),
    isPutaway: true,
    kw: '',
    classifyList: [],
    classifyIndex: '',
    goodsList: [],
    pageNum: 1
    // notPutawayGoodsList: [],
    // putawayGoodsList: [],
  },
  // 即时送 全球臻选切换
  _isType(e) {
    let state = e.currentTarget.dataset.state;
    // console.log(state)
    let flag = true;
    if (state == "01") {
      flag = false;
    }else if(state == "02"){
      flag = true
    }
    if (flag != this.data.goodsType) {
      this.setData({
        goodsType: flag,
        goodsList: [],
        pageNum: 1,
        isPutaway: true
      }, () => {
        this._getGoodsList();
        this._getCount();
      });
    }
  },
  // 类型切换
  _isClassify(e) {
    let id = e.currentTarget.dataset.id;
    if (id != this.data.classifyIndex) {
      this.setData({
        classifyIndex: id,
        pageNum: 1,
        goodsList: []
      });
      this._getGoodsList();
      // this._getCount();
    }
  },
  // 搜索
  _searchKW() {
    this.setData({
      goodsList: []
    });
    let isPutaway = this.data.isPutaway;
    api._post('/shopgoods/fuzzyQueryGoods', {
      state: isPutaway ? "00" : "99",
      isGlobalGoods: this.data.goodsType ? "02" : "01",
      goodsName: this.data.kw
    }).then(res => {
      let temp = this.data.goodsList;
      if (res.dataDto || res.data.length) {
        temp = temp.concat(res.data);
        this.setData({
          kw: "",
          goodsList: temp
        });
      } else {
        util._toast('暂无数据')
      }
    });
  },
  // 获取商品总量
  _getCount() {
    api._post('/shopgoods/getCount', {
      isGlobalGoods: this.data.goodsType ? "02" : "01",
    }).then(res => {
      this.setData({
        goodsCount: res.data
      });
    });
  },
  // 搜索回填
  _search(e) {
    this.setData({
      kw: e.detail.value
    });
  },
  // 获取商品
  _getGoodsList() {
    let goodsType = this.data.goodsType;
    let isPutaway = this.data.isPutaway;
    let classifyIndex = this.data.classifyIndex;
    let pageNum = this.data.pageNum;
    let isGlobalGoods = "02";
    let state = "00";
    if (!goodsType) {
      isGlobalGoods = "01";
    }
    if (!isPutaway) {
      state = "99";
    }
    util._loading('加载中...');
    api._post('/shopgoods/selectByShopIdStateKey', {
      state,
      shopCategory: classifyIndex,
      pageNum: pageNum,
      isGlobalGoods: isGlobalGoods
    }).then(res => {
      let goodsList = this.data.goodsList;
      if (res.dataDto.list.length) {
        goodsList = goodsList.concat(res.dataDto.list)
        this.setData({
          kw: "",
          goodsList: goodsList,
          pageNum: this.data.pageNum + 1
        });
      } else {
        util._toast('暂无数据');
      }
    })
  },
  // 下架商品
  _soldOut(e) {
    let index = e.currentTarget.dataset.index;
    let goodsList = this.data.goodsList;
    api._post('/shopgoods/downselfgoods', {
      goodsId: goodsList[index].id
    }).then(res => {
      goodsList.splice(index, 1);
      this.setData({
        goodsList: goodsList
      });
      util._toast('已下架');
    })
  },
  // 上架商品
  _putaway(e) {
    let index = e.currentTarget.dataset.index;
    let goodsList = this.data.goodsList;
    if (goodsList[index].categoryId) {
      api._post('/shopgoods/upselfgoods', {
        goodsId: goodsList[index].id
      }).then(res => {
        goodsList.splice(index, 1);
        this.setData({
          goodsList: goodsList
        });
        util._toast('已上架');
      })
    } else {
      util._toast("请选择商品分类")
    }

  },
  // 删除商品
  _delete(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: res => {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index;
          let goodsList = this.data.goodsList;
          api._post('/shopgoods/delGoods', {
            goodsId: goodsList[index].id
          }).then(res => {
            goodsList.splice(index, 1);
            this.setData({
              goodsList: goodsList
            });
            util._toast('已删除');
          })
        } else if (sm.cancel) {
          util.toast('已取消');
        }
      }
    })
  },
  // 页面跳转
  _toView(e) {
    let id = e.currentTarget.dataset.id;
    let navigatePath = e.currentTarget.dataset.navigate;
    wx.navigateTo({
      url: `/pages/${navigatePath}/${navigatePath}?id=${id}`,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let classifyList = app.globalData.classification.goods_classificationArrayMap;
    this.setData({
      classifyList: classifyList,
      classifyIndex: classifyList[0].id
    });
    this._getCount();
    this._getGoodsList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  //上传商品页面跳转
  addGoods: function() {
    wx.navigateTo({
      url: '../addGoods/addGoods?type=' + this.data.goodsType,
    })
  },

  // 编辑商品页面跳转
  _editGoods(e) {
    wx.navigateTo({
      url: `../editGoods/editGoods?goodsId=${e.currentTarget.dataset.goodsid}&type=${this.data.goodsType}`
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      newDate: util.timeFmt(new Date())
    });
    let addMsg = wx.getStorageSync("addMsg") || false;
    if (addMsg) {
      wx.setStorageSync("addMsg", false);
      wx.showModal({
        title: '提示',
        content: '检测到商品内容发生变化，是否刷新',
        showCancel: true,
        cancelText: "忽略",
        cancelColor: '#666',
        confirmText: "刷新",
        confirmColor: '#fdad00',
        success: (res) => {
          if (!res.cancel) {
            this.setData({
              goodsList: [],
              pageNum: 1,
            }, () => {
              this._getGoodsList();
            })
          }
        }
      });
    }
  },

  //上下架的商品查看
  _isPutaway: function(e) {
    let flag = e.currentTarget.dataset.flag;
    if (flag != this.data.isPutaway) {
      this.setData({
        goodsList: [],
        pageNum: 1,
        isPutaway: e.currentTarget.dataset.flag
      }, () => {
        this._getGoodsList();
      })
    }
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
    this._getGoodsList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})