// pages/pickup/pickup.js
const BMap = require('../../libs/bmap-wx.min.js');
const api = require('../../utils/api.js');
const validate = require('../../utils/validate.js');
const util = require('../../utils/util.js');
const app = getApp();
let bmap, timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSuggestion: true,
    searchResult: [], //搜索列表
    pickup:'',
    phone:'',
    addr:'',
    addReceiver: {
      receiverName: '',
      receiverSex: '男',
      receiverAddress: '',
      receiverTel1: '',
      receiverProvince: '',
      receiverCity: '',
      receiverCounty: '',
      receiverTown: '',
      address: '',
      receiverLong: '',
      receiverLat: ''
    },
    list:[]
  },

  getParams(e){
    let key = e.currentTarget.dataset.key
    let value = e.detail.value
    this.setData({
      [key]:value
    })
  },

  verify(){
    if(!this.data.pickup){
      return "请输入提货点名称"
    }
    if(!this.data.phone){
      return "请输入联系电话"
    }
    if(!this.data.addReceiver.address){
      return "请输入提货点具体位置"
    }
  },

// 获取提货点列表
  getList(){
    api._get('/manager/selectGroupReceiverList').then(res=>{
      if(res.success){
        this.setData({
          list:res.data
        })
      }
    })
  },

  // 取消
  cancel(){
    this.setData({
      pickup:'',
      phone:'',
      ['addReceiver.address']:''
    })
  },

  // 确定
  confirm(){
    let msg = this.verify()
    let item = {groupName:this.data.pickup,groupTel:this.data.phone,groupAddress:this.data.addReceiver.address,address:this.data.addr}
    // console.log(item)
    if(msg){
      util._toast(msg)
    }else{
      // this.cancel()
      api._post('/manager/insertGroupReceiver',{
        // shopId:,
        groupName:this.data.pickup,
        groupTel:this.data.phone,
        groupAddress:this.data.addReceiver.address,
        lng:this.data.addReceiver.receiverLong,
        lat:this.data.addReceiver.receiverLat,
        address:this.data.addr
      }).then(res=>{
        if(res.success){
          this.data.list.unshift(item)
          this.setData({
            list:this.data.list
          })
          this.cancel()
          util._toast('添加成功')
        }else{
          util._toast('添加失败')
        }
      })
    }
  },

  // 删除
  delete(e){
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.id
    api._post('/manager/deleteGroupReceiver',{
      id
    }).then(res=>{
      if(res.success){
        this.data.list.splice(index,1)
        this.setData({
          list:this.data.list
        })
        util._toast('删除成功')
      }else{
        util._toast('删除失败')
      }
    })
  },

  // suggestion检索--模糊查询
  _setSearchList(e) {
    // console.log(e)
    let kw = e.detail.value;
    if (this.data.isSuggestion) {
      this.setData({
        ['addReceiver.address']: kw,
        searchResult: [],
      });
      if (timer) {
        clearTimeout(timer);
      }
      // console.log('000') 
      timer = setTimeout(() => {
        // console.log(kw)
        bmap.suggestion({
          query: kw,
          city_limit: false,
          success: (res) => {
            this.setData({
              searchResult: res.result
            });
            // console.log(res)
          }
        });
      }, 300);
    } else {
      this.setData({
        ['addReceiver.address']: this.data.addReceiver.address,
        isSuggestion: true
      });
    }
  },

  // 选中地址
  _pitchOnAddress(e) {
    let uid = e.currentTarget.dataset.uid;
    let address = this.data.searchResult.filter(elem => {
      return elem.uid == uid ? elem : '';
    });
    address = address[0];
    // this._setIsReceiverAddressInput();
    this.setData({
      isSuggestion: false,
      ['addReceiver.receiverProvince']: address.province,
      ['addReceiver.receiverCity']: address.city,
      ['addReceiver.receiverCounty']: address.district,
      ['addReceiver.receiverTown']: address.name,
      ['addReceiver.address']: `${address.province}${address.city}${address.district}${address.name}`,
      ['addReceiver.receiverLong']: address.location.lng,
      ['addReceiver.receiverLat']: address.location.lat,
      searchResult: []
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    bmap = new BMap.BMapWX({
      ak: app.globalData.ak
    });
    // console.log(bmap)
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})