'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setOption = setOption;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _eChartDemoData = require('../eChartDemoData');

var eChartDemoData = _interopRequireWildcard(_eChartDemoData);

var _eChartCommon = require('../eChartCommon');

var eChartCommon = _interopRequireWildcard(_eChartCommon);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import SvgIcon from 'SvgIcon';
function setOption(chartDisplayType, option, yySetting, data, skinConfig, panelType) {
  // let dimensionCodeFileld = yySetting.dataField.dimensionX[0].codeField;///store_code
  // let dimensionNameFileld = yySetting.dataField.dimensionX[0].nameField;//store_name

  var dimensionCodeFileld = eChartCommon.eChartLabel.unionedXCode; ///store_code
  var dimensionNameFileld = eChartCommon.eChartLabel.unionedXName; //store_name


  var legendData = [];
  var series = [];
  var xAxisData = [];
  var dimensionX = _lodash2.default.get(yySetting, 'dataField.dimensionX');
  var dimensionSub = _lodash2.default.get(yySetting, 'dataField.dimensionSub');
  var measure = _lodash2.default.get(yySetting, 'dataField.measure');
  var barWidth = _lodash2.default.get(yySetting, 'series.barWidth') ? _lodash2.default.get(yySetting, 'series.barWidth') : 10;
  var barMaxWidth = _lodash2.default.get(yySetting, 'series.barMaxWidth') ? _lodash2.default.get(yySetting, 'series.barMaxWidth') : 10;
  var barGap = _lodash2.default.get(yySetting, 'series.barGap') ? _lodash2.default.get(yySetting, 'series.barGap') : '100%';
  var barCategoryGap = _lodash2.default.get(yySetting, 'series.barCategoryGap') ? _lodash2.default.get(yySetting, 'series.barCategoryGap') : '20%';
  var eChartSubType = yySetting.subType;

  var maxNameLength = 0;
  // barWidth = 10;
  // let allLength = 1050;//像素
  // let barAll = data.length * measureLength;
  // if (dimensionSubLength > 0) {
  //   barAll = data.length * dimensionSubLength;
  // }

  // let barAllLength = barAll * barWidth * 2;//默认barWidth=10 ,barGap=100%，barCategoryGap=默认barGap

  // let zoomRate = 100 * allLength / (barAllLength == 0 ? 1 : barAllLength);

  // if (zoomRate < 100) {
  //   option.dataZoom = [{ type: 'slider', end: zoomRate }];
  // }
  // barWidth: 10;
  // barGap: '100%';
  // barCategoryGap: '20%';//类目间柱形距离，默认为类目间距的20%，可设固定值
  var colorList = eChartCommon.getChartColorArr(100);
  if (dimensionSub.length > 0) {
    //如果存在次维度
    // let dimensionSubCodeFileld = yySetting.dataField.dimensionSub[0].codeField;///store_code
    // let dimensionSubNameFileld = yySetting.dataField.dimensionSub[0].nameField;//store_name
    var dimensionSubCodeFileld = eChartCommon.eChartLabel.unionedSubCode;
    var dimensionSubNameFileld = eChartCommon.eChartLabel.unionedSubName;
    // let dimensionSubStack = yySetting.dataField.dimensionSub[0].hasOwnProperty("stack") ? yySetting.dataField.dimensionSub[0].stack : yySetting.stack;
    var dimensionSubStack = yySetting.stack;
    var measureValueField = measure[0].valueField;
    var xAxisItems = [];
    var seriesItems = [];
    data.forEach(function (itemData) {
      if (xAxisItems.indexOf(itemData[dimensionNameFileld]) < 0) {
        xAxisItems.push(itemData[dimensionNameFileld]);
        if (maxNameLength < itemData[dimensionNameFileld].length) maxNameLength = itemData[dimensionNameFileld].length;
      }
      itemData[dimensionSubNameFileld] = eChartCommon.trimCaptionForLegend(itemData[dimensionSubNameFileld], "barChart");
      if (seriesItems.indexOf(itemData[dimensionSubNameFileld]) < 0) {
        seriesItems.push(itemData[dimensionSubNameFileld]);
      }
    });

    seriesItems.forEach(function (eleS) {
      legendData.push({ name: eleS, textStyle: { width: '10px', height: '10px' } });
      var seriesData = [];
      xAxisItems.forEach(function (eleX) {
        if (xAxisData.indexOf(eleX) < 0) xAxisData.push(eleX);
        var itemDataValue = "0";
        data.forEach(function (itemData) {
          if (itemData[dimensionNameFileld] == eleX && itemData[dimensionSubNameFileld] == eleS) itemDataValue = itemData[measureValueField];
        });
        seriesData.push(itemDataValue);
      });
      series.push({
        name: eleS,
        type: 'bar',
        stack: dimensionSubStack,
        silent: true, //图形是否不响应和触发鼠标事件，默认为 false，即响应和触发鼠标事件
        barMaxWidth: barMaxWidth,
        // barWidth: barWidth,
        // barGap: barGap,// 百分比或者数字，表示bar宽度的百分之多少或者几倍
        // barCategoryGap: barCategoryGap,
        data: seriesData,
        itemStyle: {
          normal: {
            color: function color(params) {
              return colorList[params.seriesIndex];
            },
            barBorderRadius: yySetting.bVertical == true ? [5, 5, 0, 0] : [0, 5, 5, 0], //圆角半径，单位px，支持传入数组分别指定 4 个圆角半径
            opacity: 1 //图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
          }
        }
      });
    });
  } else {
    if (measure.length == 1 && eChartSubType == "3") {
      var orderInfo = yySetting.orderInfo;
      var orderField = orderInfo.orderField;
      if (orderInfo.orderBy == "asc") {
        data.sort(function (a, b) {
          return b[orderField] - a[orderField];
        });
      } else if (orderInfo.orderBy == "desc") {
        data.sort(function (a, b) {
          return a[orderField] - b[orderField];
        });
      }
    }
    measure.forEach(function (itemMeasure) {
      legendData.push({ name: itemMeasure.caption, textStyle: { width: '10px', height: '10px' } });
      var seriesData = [];
      data.forEach(function (itemData) {
        if (!!itemData[dimensionNameFileld] == true) {
          // seriesData.push(itemData[itemMeasure.valueField]);
          seriesData.push(_lodash2.default.get(itemData, itemMeasure.valueField, 0));
          if (xAxisData.indexOf(itemData[dimensionNameFileld]) < 0) {
            if (maxNameLength < itemData[dimensionNameFileld].length) maxNameLength = itemData[dimensionNameFileld].length;
            xAxisData.push(itemData[dimensionNameFileld]);
          }
        }
      });
      series.push({
        name: itemMeasure.caption,
        type: 'bar',
        // stack: itemMeasure.hasOwnProperty("stack") ? itemMeasure.stack : yySetting.stack,
        stack: yySetting.stack,
        silent: true, //图形是否不响应和触发鼠标事件，默认为 false，即响应和触发鼠标事件
        barMaxWidth: barMaxWidth,
        // barWidth: barWidth,
        // barGap: barGap,// 百分比或者数字，表示bar宽度的百分之多少或者几倍
        // barCategoryGap: barCategoryGap,
        data: seriesData,
        itemStyle: {
          normal: {
            color: function color(params) {
              return colorList[params.seriesIndex];
            },
            barBorderRadius: yySetting.bVertical == true ? [5, 5, 0, 0] : [0, 5, 5, 0], //圆角半径，单位px，支持传入数组分别指定 4 个圆角半径
            opacity: 1 //图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
          }
        }
        // lineStyle: {
        //   normal: {
        //     color: function (params) { return colorList[params.seriesIndex] }
        //   }
        // },
      });
    });
  }
  option.legend.data = legendData;
  option.series = series;
  var needWrap = _lodash2.default.get(yySetting, 'xAxis.axisLabel.needWrap');
  var wrapRowLen = _lodash2.default.get(yySetting, 'xAxis.axisLabel.wrapRowLen');
  if (needWrap && wrapRowLen) {
    option.xAxis.axisLabel.formatter = function (value) {
      return eChartCommon.wrapString(value, wrapRowLen);
    };
  }
  option.xAxis.data = xAxisData;
  if (yySetting.bVertical == false) {
    option.xAxis.axisLabel.formatter = null;
    var tmp = option.xAxis;
    option.xAxis = option.yAxis;
    option.yAxis = tmp;
  }

  option.tooltip.formatter = function (params) {
    var result = '';
    params.forEach(function (item) {
      if (result == '') result = item.name;
      result = result + "</br>" + '<span style="display:inline-block;margin-right:5px;border-radius:9px;width:8px;height:8px;background-color:' + item.color + '"></span>' + " " + item.seriesName + " : " + item.value;
    });
    return result;
  };

  if (dimensionX.length == 1) {
    if (yySetting.bVertical) option.xAxis.name = option.xAxis.name || dimensionX[0].caption;else option.yAxis.name = option.yAxis.name || dimensionX[0].caption;
  }
  if (measure.length == 1) {
    if (yySetting.bVertical) option.yAxis.name = option.yAxis.name || measure[0].caption;else option.xAxis.name = option.xAxis.name || measure[0].caption;
  }
  // option.legend.itemWidth = 10;
  // option.legend.itemWidth = 10;
  // option.grid.top = option.legend.top + option.legend.height + 30;
  // option.tooltip.padding = [5, 15, 5, 15,];// 上右 下左
  // option.tooltip.textStyle = { fontSize: 12 };
  // option.grid = {
  //   top: 0,
  //   left: 0,// grid 组件离容器左侧的距离。
  //   right: 0,// default: '10%'  grid 组件离容器右侧的距离
  //   bottom: 30,//grid 组件离容器下侧的距离
  //   containLabel: true
  // }
  // option.xAxis.axisLabel.inside = false;
  //
  // option.toolbox.feature.saveAsImage.icon = 'path://M432.45,595.444c0,2.177-4.661,6.82-11.305,6.82c-6.475,0-11.306-4.567-11.306-6.82s4.852-6.812,11.306-6.812C427.841,588.632,432.452,593.191,432.45,595.444L432.45,595.444z M421.155,589.876c-3.009,0-5.448,2.495-5.448,5.572s2.439,5.572,5.448,5.572c3.01,0,5.449-2.495,5.449-5.572C426.604,592.371,424.165,589.876,421.155,589.876L421.155,589.876z M421.146,591.891c-1.916,0-3.47,1.589-3.47,3.549c0,1.959,1.554,3.548,3.47,3.548s3.469-1.589,3.469-3.548C424.614,593.479,423.062,591.891,421.146,591.891L421.146,591.891zM421.146,591.891';
  // option.toolbox.feature.saveAsImage.icon = <SvgIcon type={"baocunweitupian"} />;
  // symbol: 'image://./echarts/themes/default/images/icon-shop.png',
  // option.toolbox.feature.saveAsImage.icon = 'image://http://echarts.baidu.com/images/favicon.png';
  // option.toolbox.feature.saveAsImage.iconStyle = { textPosition: 'top', textAlign: 'left' };
  // option.toolbox.orient = "vertical";
  // option.toolbox.height = 14;
  // option.toolbox.width = 81;
  // option.legend.padding = [55, 10, 5, 10]
  // option.toolbox.iconStyle = {
  //   normal: {
  //     color: 'red',//设置颜色
  //   }
  // }
  // option.toolbox.emphasis.iconStyle.borderColor = "red";
  // option.toolbox.emphasis = { iconStyle: { color: "red" } };
  // option.dataZoom = [{ type: 'inside' }];
  // option.grid.height = 500;

  if (legendData.length * xAxisData.length > 100) {
    //超过100可缩放
    option.dataZoom = [{ type: 'inside', zoomOnMouseWheel: 'shift' }];
  }

  if (chartDisplayType == "panel") //如果在大屏展现，则需要特殊调整参数
    {
      option.grid.left = '5%';
      option.grid.right = '5%';
      option.grid.bottom = '5%';
      option.grid.containLabel = true;
      option.xAxis.nameLocation = "start";
      option.yAxis.nameLocation = "start";
      if (panelType == 3) {
        option.title.left = 10;
        option.legend.left = 10;
      } else if (panelType == 2) {
        option.tooltip.position = function (point, params, dom, rect, size) {
          //其中point为当前鼠标的位置，size中有两个属性：viewSize和contentSize，分别为外层div和tooltip提示框的大小
          var x = point[0]; //
          var y = point[1];
          var viewWidth = size.viewSize[0];
          var viewHeight = size.viewSize[1];
          var boxWidth = size.contentSize[0];
          var boxHeight = size.contentSize[1];
          var posX = 0; //x坐标位置
          var posY = 0; //y坐标位置
          if (x < boxWidth) {
            //左边放不开
            posX = 5;
          } else {
            //左边放的下
            posX = x - boxWidth;
          }
          if (y < boxHeight) {
            //上边放不开
            posY = 5;
          } else {
            //上边放得下
            posY = y - boxHeight;
          }
          return [posX, posY];
        };
      }
    } else if (chartDisplayType == "mobile") //如果在移动端展现，则需要特殊调整参数
    {
      option.grid.left = '2%';
      option.grid.right = '2%';
      option.grid.bottom = '5%';
      option.grid.containLabel = true;

      option.xAxis.nameLocation = "start";
      option.yAxis.nameLocation = "start";

      option.legend.top = 35;

      option.tooltip.position = function (point, params, dom, rect, size) {
        //其中point为当前鼠标的位置，size中有两个属性：viewSize和contentSize，分别为外层div和tooltip提示框的大小
        var x = point[0]; //
        var y = point[1];
        var viewWidth = size.viewSize[0];
        var viewHeight = size.viewSize[1];
        var boxWidth = size.contentSize[0];
        var boxHeight = size.contentSize[1];
        var posX = 0; //x坐标位置
        var posY = 0; //y坐标位置
        if (x < boxWidth) {
          //左边放不开
          posX = 5;
        } else {
          //左边放的下
          posX = x - boxWidth;
        }
        if (y < boxHeight) {
          //上边放不开
          posY = 5;
        } else {
          //上边放得下
          posY = y - boxHeight;
        }
        return [posX, posY];
      };
    } else if (chartDisplayType == "rpt") {
    option.grid.containLabel = true;
    option.grid.left = '2%';
    option.grid.right = '2%';
  }
  if (!!skinConfig && skinConfig.displaySkin) {
    _lodash2.default.set(option, "title.textStyle.color", skinConfig.displaySkin.textColor);
    _lodash2.default.set(option, "legend.textStyle.color", skinConfig.displaySkin.textColor);

    _lodash2.default.set(option, "xAxis.nameTextStyle.color", skinConfig.displaySkin.textColor);
    _lodash2.default.set(option, "yAxis.nameTextStyle.color", skinConfig.displaySkin.textColor);

    _lodash2.default.set(option, "xAxis.axisLine.lineStyle.color", skinConfig.displaySkin.axisLineColor);
    _lodash2.default.set(option, "yAxis.axisLine.lineStyle.color", skinConfig.displaySkin.axisLineColor);

    _lodash2.default.set(option, "xAxis.splitLine.lineStyle.color", skinConfig.displaySkin.splitLineColor);
    _lodash2.default.set(option, "yAxis.splitLine.lineStyle.color", skinConfig.displaySkin.splitLineColor);

    _lodash2.default.set(option, "xAxis.axisLabel.textStyle.color", skinConfig.displaySkin.textColor);
    _lodash2.default.set(option, "yAxis.axisLabel.textStyle.color", skinConfig.displaySkin.textColor);

    // let xAxisData2 = [];
    // _.forEach(option.xAxis.data, (ele, key) => {
    //   let newData = {
    //     value: ele,
    //     textStyle: { color: skinConfig.displaySkin.textColor }
    //   };
    //   xAxisData2.push(newData);
    // });
    // option.xAxis.data = xAxisData2;
  }

  option.legend.pageIconColor = "#949CA6";
  option.legend.pageIconInactiveColor = "#C9CDD3";
  option.legend.pageIconSize = 10;

  setAddLengthInfoByRotate(option, yySetting, chartDisplayType, panelType, maxNameLength, _lodash2.default.get(option, 'xAxis.axisLabel.rotate'));

  // option.title.left = "0";
  // option.legend.left = "0";
  // option.grid.left = '0';
  return option;
}

var setAddLengthInfoByRotate = function setAddLengthInfoByRotate(option, yySetting, chartDisplayType, panelType, charLength, rotate) {
  // if (!charLength || charLength == 1 || !rotate || !yySetting.bVertical || chartDisplayType != "mobile") {
  //   return;
  // }
  // else {
  //   option.addLengthInfo = { charLength, rotate };
  // }
  if (!!charLength && charLength > 1 && !!rotate && yySetting.bVertical && (chartDisplayType == "mobile" || chartDisplayType == "panel" && panelType == 3)) {
    option.addLengthInfo = { charLength: charLength, rotate: rotate };
  }
};

// const setRotateAddLength = (option, yySetting, chartDisplayType, charLength, rotate) => {
//   let length = 0;
//   if (!charLength || !rotate || !yySetting.bVertical || chartDisplayType != "mobile")
//     length = 0;
//   else
//     length = (charLength - 1) * Math.sin(rotate * 0.017453293);  // 必需。一个以弧度表示的角。将角度乘以 0.017453293 （2PI/360）即可转换为弧度。

//   length = length * 10;//字符高度
//   if (length)
//     option.RotateAddLength = length;
// }