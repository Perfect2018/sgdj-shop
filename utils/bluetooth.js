const util = require('./util.js');
let k = 0;
let strArray = [];
let devices = [];
let connected = false;
let canWrite = false;
let chs = [];
let _discoveryStarted = false;
let _name = '';
let _deviceId = '';
let _serviceId = '';
let _characteristicId = '';

const inArray = (arr, key, val) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
const ab2hex = (buffer) => {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2);
    }
  )
  return hexArr.join('');
}

const strToBinary = (str) => {
  var result = [];
  var list = str.split("");
  for (var i = 0; i < list.length; i++) {
    if (i != 0) {
      result.push(" ");
    }
    var item = list[i];
    var binaryStr = item.charCodeAt().toString(2);
    if (binaryStr) {
      result.push(binartStr);
    }
  }
  return result.join("");
}

//初始化蓝牙模块
const openBluetoothAdapter = () => {
  return new Promise((resolve, reject) => {
    wx.openBluetoothAdapter({
      success: (res) => {
        resolve(res);
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function(res) {
            if (res.available) {
              resolve(res);
            }
          })
        } else {
          wx.hideLoading();
          util._toast("蓝牙不可用");
        }
      }
    });
  });

}
//获取本机蓝牙适配器状态
const getBluetoothAdapterState = () => {
  wx.getBluetoothAdapterState({
    success: (res) => {
      if (res.discovering) {
        onBluetoothDeviceFound();
      } else if (res.available) {
        startBluetoothDevicesDiscovery();
      }
    },
    fail: (res) => {
      wx.hideLoading();
      util._toast("蓝牙不可用");
    }
  })
}
//开始搜寻附近的蓝牙外围设备
const startBluetoothDevicesDiscovery = () => {
  return new Promise((resolve, reject) => {
    if (_discoveryStarted) {
      return
    }
    _discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        wx.hideLoading();
        util._toast("搜索蓝牙失败");
        reject(err);
      }
    });
  });
}
// 停止搜索蓝牙
const stopBluetoothDevicesDiscovery = () => {
  wx.stopBluetoothDevicesDiscovery()
}
//寻找到新设备的事件的回调函数
const onBluetoothDeviceFound = () => {
  return new Promise((resolve, reject) => {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return;
        }
        const foundDevices = devices;
        const idx = inArray(foundDevices, 'deviceId', device.deviceId);
        if (idx === -1) {
          devices[foundDevices.length] = device
        } else {
          devices[idx] = device
        }
        resolve(devices);
      })
    });
  });
}

//连接低功耗蓝牙设备
const createBLEConnection = (device) => {
  return new Promise((resolve, reject) => {
    const DEVICEID = device.deviceId;
    const NAME = device.name;
    wx.createBLEConnection({
      deviceId: DEVICEID,
      success: (res) => {
        connected = true;
        _name = NAME;
        _deviceId = DEVICEID;
        resolve(_deviceId);
      },
      fail: (res) => {
        wx.hideLoading();
        util._toast("蓝牙连接失败");
      }
    });
    stopBluetoothDevicesDiscovery();
  });
}

//获取蓝牙设备所有服务(service)
const getBLEDeviceServices = (deviceId) => {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            resolve(res.services[i].uuid);
          }
        }
      },
      fail: (res) => {
        wx.hideLoading();
        util._toast("蓝牙连接失败");
      }
    });
  });
}
//获取蓝牙设备某个服务中所有特征值(characteristic)
const getBLEDeviceCharacteristics = (deviceId, serviceId) => {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            canWrite = true;
            // 设置打印时需要的参数
            _deviceId = deviceId
            _serviceId = serviceId
            _characteristicId = item.uuid
            resolve();
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true
            })
          }
        }
      },
      fail(res) {
        wx.hideLoading();
        util._toast("蓝牙连接失败");
        console.error('获取特征值失败：', res);
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      const idx = inArray(data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      if (idx === -1) {
        data[`chs[${data.chs.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      }
      // data[`chs[${data.chs.length}]`] = {
      //   uuid: characteristic.characteristicId,
      //   value: ab2hex(characteristic.value)
      // }
      setData(data)
    })
  });
}


//断开与低功耗蓝牙设备的连接
const closeBLEConnection = () => {
  wx.closeBLEConnection({
    deviceId: _deviceId
  })
  connected = false;
  chs = [];
  canWrite = false;

}
//关闭蓝牙模块
const closeBluetoothAdapter = () => {
  wx.closeBluetoothAdapter();
  _discoveryStarted = false
}
const sendStr = (bufferstr, success, failed) => {
  wx.writeBLECharacteristicValue({
    deviceId: _deviceId,
    serviceId: _serviceId,
    characteristicId: _characteristicId,
    value: bufferstr,
    success: (res) => {
      success(res);
    },
    fail: (err) => {
      fail(err);
    }
  });

}

const hexCharCodeToStr = (hexCharCodeStr) => {
  let trimedStr = hexCharCodeStr.trim();
  let rawStr = trimedStr.substr(0, 2).toLowerCase() === '0x' ? trimedStr.substr(2) : trimedStr;
  let len = rawStr.length;
  let curCharCode;
  let resultStr = [];
  for (let i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16);
    resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join('');
}


// 获取打印机字段长度 中文2 英文1
const getLength = (str) => {
  let length = 0;
  for (let i = 0; i < str.length; i++) {
    if (util.isCN(str[i])) {
      length += 2;
    } else {
      length += 1;
    }
  }
  return length;
}

// 打印机输出一行 type 0为需要格式化 1为默认内容
const outLine = (str, type = 0) => {
  if (type === 0) {
    let lineSize = 10;
    let count = Math.ceil(str.length / lineSize);
    let temp = "";
    for (let i = 0; i < count; i++) {
      if ((i + 1) === count) {
        temp = str.substr(i * lineSize, lineSize) + "\n";
      } else {
        temp = str.substr(i * lineSize, lineSize);
      }
      strArray.push(util.hexStringToBuff(temp));
    }
  } else if (type === 1) {
    strArray.push(util.hexStringToBuff(str));
  }

}
// 逻辑输出一行
const printLine = (str, type = 0, note = " ") => {
  const lineSize = 32;
  //居中打印
  if (type === 1) {
    let tempLength = Math.floor((lineSize - getLength(str)) / 2);
    let tempStr = "";
    for (let i = 0; i < tempLength; i++) {
      tempStr += note;
    }
    return `${tempStr}${str}${tempStr}`;
  }
  // 打印一行同一字符
  if (type === 2) {
    let strTemp = "";
    for (let i = 0; i < lineSize; i++) {
      strTemp += str;
    }
    return strTemp;
  }
  // 订单列表打印
  if (type === 3) {
    let [goodsName, goodsCount, couponRate] = str.split("#");
    // 20 4 8
    let goodsNameSize = 20;
    let goodsCountSize = 4;
    let couponRateSize = 8;
    // 多出商品名
    let overGoodsName = "";
    let goodsNameLength = getLength(goodsName);
    let goodsCountLength = getLength(goodsCount);
    let couponRateLength = getLength(couponRate);

    if (goodsNameLength < goodsNameSize) {
      let temp = goodsNameSize - goodsNameLength;
      for (let i = 0; i < temp; i++) {
        goodsName += note;
      }
    } else if (goodsNameLength > goodsNameSize) {
      let lastIndex = goodsNameSize / 2;
      let tempName = "",
        tempNameLength = 0;
      do {
        overGoodsName = goodsName.substr(lastIndex);
        tempName = goodsName.substr(0, lastIndex);
        tempNameLength = getLength(tempName);
        lastIndex++;
      } while (tempNameLength < goodsNameSize);
      goodsName = tempName;
    }
    if (goodsCountLength < goodsCountSize) {
      let temp = goodsCountSize - goodsCountLength;
      for (let i = 0; i < temp; i++) {
        goodsCount = note + goodsCount;
      }
    }
    if (couponRateLength < couponRateSize) {
      let temp = couponRateSize - couponRateLength;
      for (let i = 0; i < temp; i++) {
        couponRate = note + couponRate;
      }
    }
    return `${goodsName}${goodsCount}${couponRate}${overGoodsName}`;
  }
  // 默认
}
const writeBLECharacteristicValue = () => {
  // 一次可打印10个汉字 12个数字
  // 一行可打印16个汉字 32个数字
  if (k < strArray.length) {
    // let bufferstr = util.hexStringToBuff();
    sendStr(strArray[k], (success) => {
      k++;
      writeBLECharacteristicValue();
    }, (error) => {
      wx.hideLoading();
      util._toast("打印失败");
    });
  } else {
    wx.hideLoading();
    util._toast("打印完成");
    closeBLEConnection();
    closeBluetoothAdapter();
  }
}

const formatPrint = (data) => {
  // outLine(printLine("*****", 1, "*"));
  outLine(printLine("*", 2));
  // 头
  outLine(printLine(" 蔬果到家 ", 1));
  outLine("\n", 1);
  outLine(printLine("健康 新鲜 足量 低价 便捷", 1));
  outLine("\n", 1);
  // 客户信息
  outLine(printLine("客户信息", 1, "-"));
  outLine(`订单编号: ${data.orderNo}`);
  outLine(`下单时间: ${util.formatTime(data.createDate)}`);
  outLine(`客户名称: ${data.receiver.receiverName}`.replace(/null/g, ''));
  outLine(`联系电话: ${data.receiver.receiverTel1}`.replace(/null/g, ''));
  outLine(`配送地址: ${data.receiver.receiverProvince}${data.receiver.receiverCity}${data.receiver.receiverCounty}${data.receiver.receiverAddress}`.replace(/null/g, ''));
  outLine(`备注: ${data.remark}`.replace(/null/g, ''));

  // 订单列表
  outLine(printLine("订单列表", 1, "-"));
  data.list.forEach(elem => {
    outLine(printLine(`${elem.goodsName}#x${elem.goodsCount}#${elem.couponRate.toFixed(2)}`, 3));
  })
  outLine(printLine("-", 2));
  outLine(`配送费: ${data.knightAmt.toFixed(2)}元`);
  outLine(`订单总额: ${(data.originalAmt + data.knightAmt).toFixed(2)}元`);
  outLine(printLine("-", 2));

  outLine(printLine("*", 2));
  // outLine(printLine("end", 1, "*"));
  outLine("\n\n\n", 1);
}

const print = (data, type = 0) => {
  // 初始化数组
  strArray = [];
  // 初始化当前打印下表
  k = 0;
  if (type === 1) {
    for (let i = 0; i < 2; i++) {
      data.forEach(elem => {
        formatPrint(elem);
      });
    }
  } else {
    formatPrint(data);
  }


  try {
    // 初始化蓝牙
    openBluetoothAdapter().then(res => {
      //开始搜寻附近的蓝牙外围设备
      return startBluetoothDevicesDiscovery();
    }).then(res => {
      //寻找到新设备的事件的回调函数
      return onBluetoothDeviceFound();
    }).then(res => {
      // 连接低功耗蓝牙设备 需要参数
      createBLEConnection(res[0]).then(deviceId => {
        getBLEDeviceServices(deviceId).then(uuid => {
          //获取蓝牙设备某个服务中所有特征值(characteristic)
          getBLEDeviceCharacteristics(deviceId, uuid).then(res => {
            writeBLECharacteristicValue();
          });
        });
      });
    });
  } catch (e) {

  }

}
module.exports = {
  print
}