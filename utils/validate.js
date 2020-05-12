// 验证金钱格式
const validMoney = (money) => {
  var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
  return reg.test(money) ? true : false;
}
// 验证手机号格式
const validPhone = (phone) => {
  var reg = /^\d{11}$/;
  return reg.test(phone) ? true : false;
}
// 分销文案校验
const _noteValidate = value => {
  if (value) {
    if (value.indexOf('\n') > 0) {
      let vals = value.split('\n');
      if (vals.length > 8) {
        return "商品文案最多可输入8行";
      } else {
        let flag = vals.reduce((prev, elem) => {
          return prev && elem.length < 18 ? true : false;
        }, true)
        if (!flag) {
          return "商品文案每行最多可输入18字";
        }
        return false;
      }
    } else {
      if (value.length > 18) {
        return "商品文案每行最多可输入18字";
      }
    }
  }
  return false;
}
// 抛出
module.exports = {
  validMoney,
  validPhone,
  _noteValidate
}