// Pages/shopSetting/shopSetting.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const validate = require('../../utils/validate.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    customClassifyInputIndex: -1,
    customClassifyInput: '',
    customClassify: [],
    deleteImg: '../../image/delete_img.png',
    shop: {},
    // 打烊时间
    closeTime: '',
    // 开店时间
    openTime: '',
    // 店铺名称
    shopName: '',
    // 店铺公告
    shopNotice: '',
    // 起送价格
    minPrice: '',
    // 店铺地址
    shopStreet: '',

    img1Base64: '',
    img2Base64: '',
    img3Base64: '',
    img4Base64: '',
    img5Base64: '',
    adList: [],
    adListLength: 1,

    isShow: false,
    classifyFlag: true,

    selectClassify: [],
    classifyArray: [],
    classifyArrayMap: [],
  },
  //添加广告图
  _adListLength() {
    let adListLength = this.data.adListLength;
    this.setData({
      adListLength: ++adListLength
    })
  },
  // 确定添加自定义分类
  _confirm() {
    if (this.data.customClassifyInput && /^[\u4e00-\u9fa5]{2,4}$/.test(this.data.customClassifyInput)) {
      let customClassifyInputIndex = this.data.customClassifyInputIndex;
      let customClassifyInput = this.data.customClassifyInput;
      let temp = `customClassify.customClassify${customClassifyInputIndex}`;

      this.popup.hidePopup();
      this.setData({
        [temp]: customClassifyInput
      });
      api._post('/myShop/insertShopCategory', {
        categoryName: customClassifyInput,
        categorySort: customClassifyInputIndex
      }).then(res => {
        this._getCustomClassify();
      });
    } else {
      util._toast("格式不正确");
    }
  },
  // 查询自定义分类
  _getCustomClassify() {
    api._post("/myShop/selectShopCategory").then(res => {
      let data = res.data;
      let result = [];
      let size = 6;
      data.forEach(elem => {
        result[Number(elem["categorySort"])] = elem;
      });
      size = result.length > size ? result.length : size;
      for (let i = 0; i < size; i++) {
        if (!result[i]) {
          result[i] = null;
        }
      }
      this.setData({
        customClassify: result
      });
    });
  },
  // 分类自定义删除
  _delSelectCustomClassify(e) {
    wx.showModal({
      title: '提示',
      content: '此操作将下架该分类所有商品',
      confirmColor: '#f00',
      success: res => {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index;
          let temp = this.data.customClassify[index];
          api._post('/myShop/deleteShopCategoryByparentId', {
            categoryId: temp.id
          }).then(res => {
            if (res.success) {
              util._toast("删除成功");
              this._getCustomClassify();
            } else {
              util._toast("删除失败");
            }
          });
        }
      }
    });
  },

  // 获取类型id
  _getClassifyIds() {
    let selectClassify = this.data.selectClassify;
    let ids = [];
    selectClassify.forEach(selectClassifyElem => {
      ids.push(selectClassifyElem.id);
    })
    return ids;
  },
  // 获取类型name
  _getClassifyNames() {
    let selectClassify = this.data.selectClassify;
    let names = [];
    selectClassify.forEach(selectClassifyElem => {
      names.push(selectClassifyElem.name);
    });
    return names.join(',');
  },

  // 获取分类
  _getClassify() {
    return new Promise((resolve, reject) => {
      api._post('/myShop/selectCategory').then(res => {
        let temp = res.data;
        let classifyArray = [];
        temp.forEach(elem => {
          classifyArray.push(elem.name)
        });
        this.setData({
          classifyArray: classifyArray,
          classifyArrayMap: res.data
        })
        resolve();
      })
    })
  },
  // 数据校验
  _saveValidate() {
    if (!this.data.img1Base64 && !this.data.shop.shopLogo) {
      return "请上传店铺LOGO";
    }
    if (this.data.selectClassify.length < 3) {
      return "请选择三个主营分类";
    }
    if (!this.data.shopName) {
      return "店铺名不能为空";
    }
    if (this.data.shopNotice) {
      if (this.data.shopNotice.length > 90) {
        return "店铺公告最多90个字符";
      }
    }
    if (!validate.validMoney(this.data.minPrice)) {
      return "起送价格式不正确";
    } else {
      if (this.data.minPrice < 20) {
        return "起送价不得低于20元";
      }
    }
    if (!this.data.shopStreet) {
      return "地址不能为空";
    }
    if (!this.data.img2Base64) {
      return '请上传门头照';
    }
    if (!this.data.img3Base64) {
      return '请上传营业资质';
    }
    if (!this.data.img4Base64) {
      return '请上传身份证正面';
    }
    if (!this.data.img5Base64) {
      return '请上传身份证反面';
    }
    return false;
  },

  // 保存
  _save() {
    let shopClassfy = this._getClassifyNames();
    let ids = this._getClassifyIds();
    let msg = this._saveValidate();

    if (msg) {
      util._toast(msg);
    } else {
      let shopNoticeImgId = "";
      let adList = this.data.adList;
      if (adList.length) {
        shopNoticeImgId = adList.join(",");
      }
      let data = {
        shopName: this.data.shopName,
        shopNotice: this.data.shopNotice,
        shopClassfy: shopClassfy,
        category1: ids[0],
        category2: ids[1],
        category3: ids[2],
        onDestributionPrice: this.data.minPrice,
        shopStreet: this.data.shopStreet,
        openShopTime: this.data.openTime == "null" ? '' : this.data.openTime,
        closeShopTime: this.data.closeTime == "null" ? '' : this.data.closeTime,
        shopLogo: this.data.img1Base64,
        operateImgId: this.data.img2Base64,
        aptitudeImgId: this.data.img3Base64,
        operateIdcardZmImgId: this.data.img4Base64,
        operateIdcardFmImgId: this.data.img5Base64,
        shopNoticeImgId: shopNoticeImgId
      }
      if (!this.data.classifyFlag) {
        data = {
          shopName: this.data.shopName,
          shopNotice: this.data.shopNotice,
          onDestributionPrice: this.data.minPrice,
          shopStreet: this.data.shopStreet,
          openShopTime: this.data.openTime == "null" ? '' : this.data.openTime,
          closeShopTime: this.data.closeTime == "null" ? '' : this.data.closeTime,
          shopLogo: this.data.img1Base64,
          operateImgId: this.data.img2Base64,
          aptitudeImgId: this.data.img3Base64,
          operateIdcardZmImgId: this.data.img4Base64,
          operateIdcardFmImgId: this.data.img5Base64,
          shopNoticeImgId: shopNoticeImgId
        }
      }
      util._loading('保存中...');
      api._post('/myShop/updateShopInformation', data).then(res => {
        wx.hideLoading();
        wx.switchTab({
          url: '../index/index'
        });
      });
    }
  },
  // 获取店铺信息 回显数据
  _getShop() {
    let classifyArrayMap = this.data.classifyArrayMap;
    api._post('/myShop/getShopInfo').then(res => {
      let shopClassfy = [res.dataDto.category1, res.dataDto.category2, res.dataDto.category3];
      let selectClassify = [];
      let classifyArray = this.data.classifyArray;
      // 展示主营分类
      if (res.dataDto.category1) {
        for (let i in shopClassfy) {
          classifyArrayMap.forEach(elem => {
            if (shopClassfy[i] && shopClassfy[i] == elem.id) {
              selectClassify.push(elem)
            }
          });
        }
        this.setData({
          classifyFlag: false,
          classifyArrayMap: classifyArrayMap,
        });
      }
      let adList = res.dataDto.shopNoticeImgId ? res.dataDto.shopNoticeImgId.split(",") : [];
      this.setData({
        shop: res.dataDto,
        closeTime: res.dataDto.closeShopTime && res.dataDto.closeShopTime != "null" ? res.dataDto.closeShopTime : "",
        openTime: res.dataDto.openShopTime && res.dataDto.openShopTime != "null" ? res.dataDto.openShopTime : "",
        openTime: res.dataDto.openShopTime,
        shopName: res.dataDto.shopName,
        shopNotice: res.dataDto.shopNotice,
        shopStreet: res.dataDto.shopStreet,
        selectClassify: selectClassify,
        classifyArray: classifyArray,
        minPrice: res.dataDto.onDestributionPrice,
        img1Base64: res.dataDto.shopLogo,
        img2Base64: res.dataDto.operateImgId,
        img3Base64: res.dataDto.aptitudeImgId,
        img4Base64: res.dataDto.operateIdcardZmImgId,
        img5Base64: res.dataDto.operateIdcardFmImgId,
        adList: adList,
        adListLength: adList.length ? adList.length : 1
      });
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getCustomClassify();
    this._getClassify().then(res => {
      this._getShop();
    });
  },
  // 开店时间
  _openTimeChange(e) {
    this.setData({
      openTime: e.detail.value
    });

  },
  // 关店时间
  _closeTimeChange(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      closeTime: e.detail.value
    });

  },
  // 是否显示分类框
  _isShow() {
    if (this.data.classifyFlag) {
      this.setData({
        isShow: !this.data.isShow
      });
    }
  },

  // 分类选择
  _checkboxChange: function (e) {
    let temp = e.detail.value;
    let classifyArrayMap = this.data.classifyArrayMap;
    let selectClassify = [];
    classifyArrayMap.forEach((elem, index) => {
      classifyArrayMap[index]['checked'] = false;
    });
    if (temp.length > 3) {
      util._toast("最多选三项")
      for (let i = 0; i < 3; i++) {
        classifyArrayMap.forEach((elem, index) => {
          if (temp[i] == elem.id) {
            classifyArrayMap[index]['checked'] = true;
          }
        });
      }
      this.setData({
        classifyArrayMap: classifyArrayMap
      })
    } else {
      temp.forEach(tmp => {
        classifyArrayMap.forEach((elem, index) => {
          if (tmp == elem.id) {
            classifyArrayMap[index]['checked'] = true;
            selectClassify.push(elem)
          }
        });
      });
      this.setData({
        classifyArrayMap: classifyArrayMap,
        selectClassify: selectClassify
      })
    }
  },
  // 设置参数
  _setParams(e) {
    let key = e.currentTarget.dataset.key;
    this.setData({
      [key]: e.detail.value
    });
  },

  // 显示添加自定义分类模态窗
  _showModal(e) {
    this.setData({
      customClassifyInputIndex: e.currentTarget.dataset.index,
      customClassifyInput: '',
    }, () => {
      this.popup.showPopup();
    });
  },

  // 删除商品图
  _delImg(e) {
    let baseUrl = e.currentTarget.dataset.baseurl;
    let type = e.currentTarget.dataset.type || "";
    if (type === "ad") {
      let adListLength = this.data.adListLength;
      let adList = this.data.adList;
      adList.splice(baseUrl, 1);
      this.setData({
        adList
      });
      if (adListLength > 1) {
        this.setData({
          adListLength: --adListLength
        })
      }
    } else {
      this.setData({
        [baseUrl]: ''
      })
    }
  },

  // 获取图片
  _getImage(e) {
    let baseUrl = e.currentTarget.dataset.baseurl;
    let type = e.currentTarget.dataset.type || "";
    wx.navigateTo({
      url: `../imageCropper/imageCropper?baseUrl=${baseUrl}&type=${type}`
    });
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
    let tempImage = wx.getStorageSync("tempImage") || false;
    let path = tempImage.baseUrl;
    if (tempImage) {
      if (tempImage.type === "ad") {
        path = `adList[${tempImage.baseUrl}]`;
      }
      //最终图片路径
      this.setData({
        [path]: tempImage.id
      }, () => {
        wx.setStorageSync("tempImage", false);
      });
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

  }
})