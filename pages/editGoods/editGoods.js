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
    cWidth: 0,
    cHeight: 0,
    deleteImg: '../../image/delete_img.png',
    goodsType: 'true',
    tempGoodsName: '',
    img1Base64: '',
    img2Base64: '',
    img3Base64: '',
    img4Base64: '',
    img5Base64: '',
    img6Base64: '',

    form: {
      goods_id: '',
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
      goods_inventory: '',
      // 产地 
      goods_origin: '',

      // 生产日期 
      goods_production: '2019-01-01',
      // 保质期 
      goods_shelfLife: '2019-01-01',
      // 发货时间
      goods_deliveryTime: '20',
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
      goods_note: ''
    },
    goods_specificationsIndex: [0],
    goods_specificationsArray: ['g', 'kg', 'L', 'ml', '份', '件', ],
    goods_commissionIndex: [0],
    goods_commissionArray: ['不设置', '10%', '15%', '20%', '25%', '30%'],
    goods_classificationValue: '',
    goods_classificationIndex: [0],
    goods_classificationArray: [],
    goods_classificationArrayMap: []
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
    if (form.goods_spec < 0) {
      return "请输入商品规格";
    }
    if (!form.goods_specifications) {
      return "请选择商品规格(单位)";
    }
    if (!form.goods_classification || !this.data.goods_classificationValue) {
      return "请选择商品分类";
    }
    if (!validate.validMoney(form.goods_marketPrice)) {
      return "请输入市场价";
    }
    if (!validate.validMoney(form.goods_platformPrice)) {
      return "请输入平台价";
    }
    if (form.goods_fight === "01") {
      if (!validate.validMoney(form.goods_fightPrice)) {
        return "请输入拼单价格";
      }
    }
    if (!form.goods_inventory) {
      return "请输入库存";
    }
    if (!form.goods_origin) {
      return "请输入产地";
    }

    if (!this.data.img1Base64) {
      return "请上传商品图";
    }

    if (this.data.goodsType == 'false') {
      if (!this.data.img2Base64 || !this.data.img3Base64 || !this.data.img4Base64 || !this.data.img5Base64 || !this.data.img6Base64) {
        return "请选择商品详情图 ";
      }
      if (!form.goods_freight) {
        return "请输入商品运费";
      }
      if (!form.goods_deliveryTime) {
        return "请选择发货时间";
      }

    }
    return false;

  },
  // 点击提交
  _editGoods() {
    let form = this.data.form;
    let msg = this._addGoodsValidate(form);
    msg = msg ? msg : validate._noteValidate(form.goods_note); //分销验证
    if (msg) {
      util._toast(msg);
    } else {
      util._loading('保存中...');
      let goodsTypes = "";
      if (form.goods_distribution == "01") {
        goodsTypes = "01";
      }
      api._post('/shopgoods/updategoodsinfo', {
        id: form.goods_id,
        goodsName: form.goods_name,
        categoryId: form.goods_classification,
        noeUnit: form.goods_spec,
        twoNuit: form.goods_specifications,
        priceone: form.goods_marketPrice,
        couponRate: form.goods_platformPrice,
        coinNuit: '元',
        stockSize: form.goods_inventory,
        yieldly: form.goods_origin,

        product: form.goods_production,
        shelfLifeDate: form.goods_shelfLife,
        goodsDescribe: form.goods_describe,
        deliveryTime: form.goods_deliveryTime,
        freight: form.goods_freight,
        distribution: form.goods_distribution == null ? "" : form.goods_distribution,
        isSeason: form.goods_isSeason,
        goodsTypes: goodsTypes,
        note: form.goods_note,
        fightPrice: form.goods_fightPrice,

        img1: this.data.img1Base64,
        img2: this.data.img2Base64,
        img3: this.data.img3Base64,
        img4: this.data.img4Base64,
        img5: this.data.img5Base64,
        img6: this.data.img6Base64,
      }).then(res => {
        if (res.success) {
          wx.setStorageSync("addMsg", true);
          wx.switchTab({
            url: '../goods/goods'
          })
        } else {
          util._toast("修改失败");
        }
      });
    }
  },
  //获取名称离开
  _goods_name_blur(e) {
    let name = this.data.form.goods_name;
    if (name != this.data.tempGoodsName) {
      if (name) {
        api._post('/shopgoods/checkingGoodsName', {
          goodsName: name
        }).then(res => {
          if (res.success) {
            util._toast("商品名重复");
            this.setData({
              ['form.goods_name']: ''
            })
          }
        })
      }
    }

  },
  // 获取商品信息
  getGoodsData(id) {
    api._post('/shopgoods/getgoodsdetail', {
      id
    }).then(res => {
      let goods_classificationValue = "";
      this.data.goods_classificationArrayMap.forEach(elem => {
        if (elem.id == res.dataDto.categoryId) {
          goods_classificationValue = elem.name;
        }
      });
      this.setData({
        goods_classificationValue: goods_classificationValue,
        ['form.goods_id']: res.dataDto.id,
        ['form.goods_name']: res.dataDto.goodsName,
        ['tempGoodsName']: res.dataDto.goodsName,
        ['form.goods_classification']: res.dataDto.categoryId,

        ['form.goods_spec']: res.dataDto.noeUnit,
        ['form.goods_specifications']: res.dataDto.twoNuit,
        ['form.goods_marketPrice']: res.dataDto.price,
        ['form.goods_platformPrice']: res.dataDto.couponRate,
        ['form.goods_inventory']: res.dataDto.stockSize,
        ['form.goods_origin']: res.dataDto.yieldly,
        ['form.goods_production']: util.formatDate(res.dataDto.productDate),
        ['form.goods_shelfLife']: util.formatDate(res.dataDto.shelfLife),
        ['form.goods_describe']: res.dataDto.goodsDescribe,

        ['form.goods_deliveryTime']: res.dataDto.deliveryTime,
        ['form.goods_freight']: res.dataDto.freight,
        ['form.goods_distribution']: res.dataDto.distribution,
        ['form.goods_isSeason']: res.dataDto.isSeason,
        ['form.goods_note']: res.dataDto.note,
        ['form.goods_fightPrice']: res.dataDto.groupPrice && res.dataDto.groupPrice != 'null' ? res.dataDto.groupPrice : '',
        ['form.goods_fight']: res.dataDto.groupPrice && res.dataDto.groupPrice != 'null' ? '01' : '',

        img1Base64: res.dataDto.img1,
        img2Base64: res.dataDto.img2,
        img3Base64: res.dataDto.img3,
        img4Base64: res.dataDto.img4,
        img5Base64: res.dataDto.img5,
        img6Base64: res.dataDto.img6
      })
    })
  },
  // 获取分类
  _getClassify() {
    return new Promise((resolve, reject) => {
      api._post('/myShop/selectAllShopCategory').then(res => {
        let temp = res.data;
        let goods_classificationArray = [];
        temp.forEach(elem => {
          goods_classificationArray.push(elem.name)
        });
        this.setData({
          goods_classificationArray: goods_classificationArray,
          goods_classificationArrayMap: res.data
        })
        resolve();
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getClassify().then(res => {
      this.getGoodsData(options.goodsId);
    })
    this.setData({
      goodsType: options.type
    })
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
  // 删除商品图
  _delImg(e) {
    let baseurl = e.currentTarget.dataset.baseurl;
    // let tempPath = baseurl.split('.')[1] + "Base64";
    this.setData({
      [baseurl]: '',
      // [tempPath]: ''
    })
  },
  //获取名称
  _goods_name(e) {
    let value = e.detail.value;
    this.setData({
      ['form.goods_name']: value
    })
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
  //获取规格
  _goods_spec(e) {
    let value = e.detail.value;
    this.setData({
      ['form.goods_spec']: value
    })
  },
  //获取市场价
  _goods_marketPrice(e) {
    let value = e.detail.value;
    this.setData({
      ['form.goods_marketPrice']: value
    })
  },
  //获取平台价
  _goods_platformPrice(e) {
    let value = e.detail.value;
    this.setData({
      ['form.goods_platformPrice']: value
    })
  },
  //获取库存
  _goods_inventory(e) {
    let value = e.detail.value;
    this.setData({
      ['form.goods_inventory']: value
    })
  },
  //获取产地
  _goods_origin(e) {
    let value = e.detail.value;
    this.setData({
      ['form.goods_origin']: value
    })
  },

  //获取运费
  _goods_freight(e) {
    let value = e.detail.value;
    console.log(value)
    this.setData({
      ['form.goods_freight']: value
    })
  },
  //获取发货时间
  _goods_deliveryTime(e) {
    let value = e.detail.value;

    this.setData({
      ['form.goods_deliveryTime']: value
    })
  },
  //获取商品描述
  _goods_describe(e) {
    let value = e.detail.value;
    this.setData({
      ['form.goods_describe']: value
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
  // },
  // 生产日期
  _goods_productionChange(e) {
    this.setData({
      ['form.goods_production']: e.detail.value
    })
  },
  // 保质期
  _goods_shelfLifeChange(e) {
    this.setData({
      ['form.goods_shelfLife']: e.detail.value
    })
  },
  // 设置参数
  _setParams(e) {
    let key = e.currentTarget.dataset.key;
    let value = e.detail.value;
    let data = {
      [key]: value
    }
    if (key == "form.goods_fight") {
      data["form.goods_fightPrice"] = "";
    }
    this.setData(data);
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

})