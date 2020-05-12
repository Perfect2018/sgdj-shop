// pages/addGoods/addGoods.js
const api = require('../../utils/api.js');
const validate = require('../../utils/validate.js');
const util = require('../../utils/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deleteImg: '../../image/delete_img.png',
    goodsType: 'false',
    img1Base64: '',
    img2Base64: '',
    img3Base64: '',
    img4Base64: '',
    img5Base64: '',
    img6Base64: '',
    img7Base64: '',
    img8Base64: '',

    goods_classificationValue: '',
    form: {
      // 名称 
      goods_name: '',
      // 分类 
      goods_classification: '',
      // 规格
      goods_spec: '',
      // 规格(单位)
      goods_specifications: '',
      // 市场价 
      goods_marketPrice: '',
      // 平台价 
      goods_platformPrice: '',
      // 佣金 
      // goods_commission: '',
      // 库存 
      goods_inventory: '99',
      // 产地 
      goods_origin: '',
      // 预包装食品 
      goods_prepackaged: '02',
      // 许可证编号 
      goods_licenseNumber: '',
      // 生产日期 
      goods_production: '',
      // 保质期 
      goods_shelfLife: '',
      // 发货时间
      goods_deliveryTime: '',
      // 运费 
      goods_freight: '',
      // 商品描述
      goods_describe: '',
      // 分销商品
      goods_distribution: '',
      // 拼单商品
      goods_fight: '',
      // 拼单价格
      goods_fightPrice: '',
      // 到店体验商品
      goods_isSeason: '',
      //分销文案
      goods_note: '',
      goods_type:'',
      // 限时抢购
      goods_discount: '02',
      // 最大抢购数量
      goods_number:'',
      // 社区团购
      goods_group: '02'
    },

    goods_classificationIndex: [0],
    goods_classificationArray: [],
    goods_classificationArrayMap: [],
    goods_specificationsIndex: [0],
    goods_specificationsArray: ['g', 'kg', 'L', 'ml', '份', '件', ],
    goods_commissionIndex: [0],
    goods_commissionArray: ['不设置', '10%', '15%', '20%', '25%', '30%'],

  },
  // 数据校验
  _addGoodsValidate(form) {
    if (form.goods_name) {
      if (form.goods_name.length > 14 & form.goods_name.length < 4) {
        return "商品名称有误";
      }
    } else {
      return "请输入商品名称";
    }

    if (!form.goods_classification) {
      return "请选择商品分类";
    }
    if (form.goods_spec < 0) {
      return "请输入商品规格";
    }
    if (!form.goods_specifications) {
      return "请选择商品规格(单位)";

    }
    if (!validate.validMoney(form.goods_marketPrice)) {
      return "请输入市场价";

    }
    if (!validate.validMoney(form.goods_platformPrice)) {
      return "请输入平台价";

    }
    if (!form.goods_inventory) {
      return "请输入库存";
    }
    if (form.goods_fight === "01") {
      if (!validate.validMoney(form.goods_fightPrice)) {
        return "请输入拼单价格";
      }
    }
    if (!form.goods_origin) {
      return "请输入产地";

    } else if (form.goods_origin.length > 4) {
      return "产地最多输入四个字符";
    }

    if(form.goods_discount=='01' && form.goods_group=='01'){
      return "请选择限时抢购与社区团购中的一种"
    }

    if(form.goods_discount == '01'){
      if(!form.goods_number){
        return '请输入最大抢购数量'
      }
    }

    if (form.goods_prepackaged == '01') {
      if (!form.goods_licenseNumber) {
        return "请输入商品许可证编号";

      }
    }
    if (!this.data.img1Base64) {
      return "请选择商品图片";
    }

    if (this.data.goodsType == 'false' && form.goods_isSeason != '01') {
      if (!this.data.img2Base64 || !this.data.img3Base64 || !this.data.img4Base64 || !this.data.img5Base64 || !this.data.img6Base64) {
        return "请选择商品详情图 ";
      }
      if (!form.goods_freight) {
        if (form.goods_isSeason != '01') {
          return "请输入商品运费";
        }

      }
      if (!form.goods_deliveryTime) {
        return "请选择发货时间";

      }
      if (!this.data.img1Base64) {
        return "请上传商品图";
      }
    }

    return false;
  },
  // 点击添加商品
  _addGoods() {
    let form = this.data.form;
    let msg = this._addGoodsValidate(form);
    msg = msg ? msg : validate._noteValidate(form.goods_note); //分销验证
    if (msg) {
      util._toast(msg);
    } else {
      util._loading('保存中...');
      api._post('/shopgoods/addgoods', {
        goodsName: form.goods_name,
        categoryId: form.goods_classification,
        noeUnit: form.goods_spec,
        twoNuit: form.goods_specifications,
        priceone: form.goods_marketPrice,
        couponRate: form.goods_platformPrice,
        coinNuit: '元',
        stockSize: form.goods_inventory,
        yieldly: form.goods_origin,
        upMarket: form.goods_licenseNumber,
        product: form.goods_production,
        shelfLifeDate: form.goods_shelfLife,
        goodsDescribe: form.goods_describe,
        deliveryTime: form.goods_deliveryTime,
        freight: form.goods_freight,
        distribution: form.goods_distribution == null ? "" : form.goods_distribution,
        isSeason: form.goods_isSeason,
        note: form.goods_note,
        fightPrice: form.goods_fightPrice,
        goodsTypes: form.goods_discount == '01' ? '01' : form.goods_group == '01' ? '02' : '00',
        maxBuy:form.goods_number,
        
        img1: this.data.img1Base64,
        img2: this.data.img2Base64,
        img3: this.data.img3Base64,
        img4: this.data.img4Base64,
        img5: this.data.img5Base64,
        img6: this.data.img6Base64,
        // img7: this.data.img7Base64,
        // img8: this.data.img8Base64,
      }).then(res => {
        wx.hideLoading();
        if (res.success) {
          wx.setStorageSync("addMsg", true);
          this._toGoodsDeatil(res.expandParam);
        } else {
          util._toast('添加失败');
        }
      });
    }
  },
  // 去商品详情页
  _toGoodsDeatil(id) {
    wx.showModal({
      title: '提示',
      content: '分享此商品，获取更多订单',
      confirmColor: '#fdad00',
      confirmText: "去分享",
      success: (res) => {
        if (res.confirm) {
          wx.navigateToMiniProgram({
            appId: 'wx5eeec1e222f5ee3f',
            path: `pages/goodsDetail/goodsDetail?id=${id}`,
            // envVersion: "develop",
            fail: () => {
              wx.switchTab({
                url: '../goods/goods'
              });
            }
          });
        } else {
          wx.switchTab({
            url: '../goods/goods'
          });
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let classification = app.globalData.classification;
    // if (!classification) {
    //   // 获取店铺分类
    //   api._getClassify().then(res => {
    //     classification = app.globalData.classification;
    //     this.setData({
    //       goods_classificationArray: classification.goods_classificationArray,
    //       goods_classificationArrayMap: classification.goods_classificationArrayMap
    //     });
    //   });
    // }else{
    // this.setData({
    //   goods_classificationArray: classification.goods_classificationArray,
    //   goods_classificationArrayMap: classification.goods_classificationArrayMap
    // });
    // }
    // console.log(classification)
    this.setData({
      goods_classificationArray: classification.goods_classificationArray,
      goods_classificationArrayMap: classification.goods_classificationArrayMap,
      goodsType: options.type
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let addMsg = wx.getStorageSync("addMsg") || false;
    if (addMsg) {
      wx.switchTab({
        url: '../goods/goods'
      });
    }
    let tempImage = wx.getStorageSync("tempImage");
    if (tempImage) {
      //最终图片路径
      this.setData({
        [tempImage.baseUrl]: tempImage.id
      });
      wx.setStorageSync("tempImage", false);
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  // 删除商品图
  _delImg(e) {
    let baseurl = e.currentTarget.dataset.baseurl;
    let tempPath = baseurl.split('.')[1] + "Base64";
    this.setData({
      [baseurl]: '',
      [tempPath]: ''
    });
  },

  // 获取图片
  _getImage(e) {
    let baseUrl = e.currentTarget.dataset.baseurl;
    let flag = "";
    if (this.data.form.goods_distribution == '01') {
      flag = "1";
    }
    wx.navigateTo({
      url: `../imageCropper/imageCropper?baseUrl=${baseUrl}&flag=${flag}`
    });
  },
  // 设置分销文案（自动换行）
  _goods_note(e) {
    let value = e.detail.value;
    if (value.length) {
      let start = value.lastIndexOf('\n');
      let res = value;
      if (start > 0) {
        if (start > 17) {
          start++;
        }
        res = value.substring(0, start);
        let temp = value.slice(start);
        if (temp.length >= 18) {
          if (temp.length == 18) {
            temp += '\n';
          } else {
            let star = temp.substring(0, 18);
            let end = temp.slice(18);
            temp += star + '\n' + end;
          }
        }
        res += temp;
      } else if (value.length >= 18) {
        if (value.length == 18) {
          res += '\n';
        } else {
          let star = value.substring(0, 18);
          let end = value.slice(18);
          res = star + '\n' + end;
        }
      }
      this.setData({
        ['form.goods_note']: res
      });
    }
  },
  // 设置分销文案（离开时判断）
  _goods_note_blur() {
    let msg = validate._noteValidate();
    if (msg) {
      util._toast(msg);
    }
  },
  // 设置参数
  _setParams(e) {
    let key = e.currentTarget.dataset.key;
    let value = e.detail.value;
    // let discount = this.data.form.goods_discount;
    // let group = this.data.form.goods_group
    let data = {
      [key]: value
    }
    if (key == "form.goods_fight") {
      data["form.goods_fightPrice"] = "";
    }
    this.setData(data);
    // console.log(key + value)
    // if(this.data.form.goods_discount == '01'){
    //   this.setData({
    //     [group]:'02'
    //   })
    //   console.log(this.data.form.goods_group)
    // }else if(this.data.form.goods_discount == '01' && this.data.form.goods_group == '02'){
    //   this.setData({
    //     [discount]:'02'
    //   })
    //   console.log(this.data.form.goods_discount)
    // }
   
    // console.log(this.data.form.goods_group)
    console.log(this.data.form.goods_number)
  },
  //获取名称离开
  _goods_name_blur(e) {
    let name = this.data.form.goods_name;
    if (name) {
      api._post('/shopgoods/checkingGoodsName', {
        goodsName: name
      }).then(res => {
        if (res.success) {
          util._toast("商品名重复");
          this.setData({
            ['form.goods_name']: ''
          });
        }
      });
    }
  },

  // 分类选择
  _goods_classificationChange(e) {
    let temp = e.detail.value;
    this.setData({
      ['form.goods_classification']: this.data.goods_classificationArrayMap[temp[0]].id,
      goods_classificationValue: this.data.goods_classificationArrayMap[temp[0]].name,
      goods_classificationIndex: temp
    })
  },
  // 规格(单位)
  _goods_specificationsChange(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    let temp = e.detail.value;
    this.setData({
      ['form.goods_specifications']: this.data.goods_specificationsArray[temp[0]],
      goods_specificationsIndex: temp
    })
  },
  // // 佣金选择
  // _goods_commissionChange(e) {
  //   console.log('picker发送选择改变，携带值为', e.detail.value)
  //   let temp = e.detail.value;
  //   this.setData({
  //     ['form.goods_commission']: this.data.goods_commissionArray[temp[0]],
  //     goods_commissionIndex: e.detail.value
  //   })
  // }
})