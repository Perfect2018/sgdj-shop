//小程序请求封装
const config = require('../config.js');
const RSA = require('rsa.js');
let custID = '';
const setCustID = (temp) => {
  custID = temp;
}
const http = ({
  url = '',
  param = {},
  type,
  ...other
} = {}) => {

  let header = {
    'Content-Type': 'application/json' // 默认值 ,另一种是 "content-type": "application/x-www-form-urlencoded"
  }
  if (custID) {
    header = {
      'Content-Type': 'application/json', // 默认值 ,另一种是 "content-type": "application/x-www-form-urlencoded"
      'CUST-ID': custID
    }
  }
  if (other.method == 'post') {
    if (type) {
      header = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'CUST-ID': custID
      }
    } else {
      header = {
        'Content-Type': 'application/json',
        'CUST-ID': custID
      }
    }
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: getUrl(url),
      data: param,
      header,
      ...other,
      complete: (res) => {
        wx.hideLoading();
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(res)
        }
      }
    })
  })
}
// 获取URL
const getUrl = (url) => {
  if (url.indexOf('://') == -1) {
    url = config.DOMAIN + url;
  }
  return url
}

// get 方法
const _get = (url, param = {}) => {
  return http({
    url,
    param,
    method: 'get'
  })
}
// post 方法
const _post = (url, param = {}, type = true) => {
  return http({
    url,
    param,
    method: 'post',
    type: type
  })
}
// 加密
const _getEncrypt = (word) => {
  let publicKey = `-----BEGIN PUBLIC KEY-----${config.PUBLICKEY}-----END PUBLIC KEY-----`;
  let encrypt_rsa = new RSA.RSAKey();
  encrypt_rsa = RSA.KEYUTIL.getKey(publicKey);
  let encStr = encrypt_rsa.encrypt(word)
  encStr = RSA.hex2b64(encStr);
  return encStr;
}

// 抛出
module.exports = {
  setCustID,
  _get,
  _post,
  _getEncrypt
}