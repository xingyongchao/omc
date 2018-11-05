import React, { Component } from 'react'
import * as lineChart from '../options/lineChart';
import * as barChart from '../options/barChart';
import * as pieChart from '../options/pieChart';
import * as rankTableChart from '../options/rankTableChart_Mobile';
import * as pieChart_SingleValue from '../options/pieChart_SingleValue';
import * as scatterChart from '../options/scatterChart';
import * as barlineChart from '../options/barlineChart';
import * as  eChartCommon from '../eChartCommon';
import * as  eChartProxy from '../eChartProxy';
import SvgIcon from 'SvgIcon';
// import { Icon } from 'antd';
import _ from 'lodash';
import { Format } from '../../../helpers/formatDate';
// import ReactEcharts from '../../AsyncComponents/AsyncEchartsForReact';
import ReactEcharts from 'echarts-for-react';
// let ReactEcharts = null;
const echarts = require('echarts/lib/echarts');

export default class EChartDisplay_Mobile extends Component {
  constructor(props) {
    eChartCommon.LogChartInfo("eChartDisplay constructor", "", 3);
    super(props);
    // ReactEcharts = require('../../AsyncComponents/AsyncEchartsForReact').default;

    this.serieNum = Math.random();
    this.state = {
      chartDisplayType: "mobile",
      billnum: this.props.billnum,
      groupSchemaId: this.props.groupSchemaId,
      config: eChartCommon.upgradeConfig(this.props.config),
      condition: this.props.condition || null,
      data: null,
      bMounted: false,
      firstQueryDone: this.props.firstQueryDone || false
    };
    this.bUpdated = false;
    this.chinaMapTreeData = null;//参照所需要的省市县数据
    this.scatterData = {
      option: {},
      regionInfo: {}
    };
    this.regionRegistering = [];
    this.regionRegistered = [];
    this.getData();
  }

  componentDidMount() {
    if (this.props.viewModel) {
      this.props.viewModel.on("filterClick", (params) => {
        // this.setState({ condition: params.condition });
        this.state.condition = params.condition;
        this.getData();
      });
    }

    this.props.viewModel.on('firstQueryDone', (params) => {
      if (!!params)
        this.state.firstQueryDone = params;
      // this.setState({ firstQueryDone: params });
    });
    this.state.bMounted = true;
  }

  componentWillReceiveProps(nextProps) {
    if (_.isEqual(nextProps.groupSchemaId, this.props.groupSchemaId) == false) {
      this.scatterData = {
        option: {},
        regionInfo: {}
      }
    }
    if (
      _.isEqual(nextProps.billnum, this.props.billnum) == false
      || _.isEqual(nextProps.groupSchemaId, this.props.groupSchemaId) == false
      || _.isEqual(nextProps.config, this.props.config) == false
      // || _.isEqual(nextProps.condition, this.props.condition) == false
    ) {
      this.state.billnum = nextProps.billnum;
      this.state.groupSchemaId = nextProps.groupSchemaId;
      this.state.config = eChartCommon.upgradeConfig(nextProps.config);
      this.state.data = undefined;
      // this.state.condition = nextProps.condition;
      this.getData();
    }
  }

  getData() {
    if (this.state.firstQueryDone == false)
      return;
    let self = this;
    let config = this.state.config;
    let queryParams = {
      billnum: this.state.billnum,
      groupSchemaId: this.state.groupSchemaId,
      condition: this.state.condition
    };
    let dataParams = [];
    let dimensionX = _.get(config, "yySetting.dataField.dimensionX");
    let dimensionSub = _.get(config, "yySetting.dataField.dimensionSub");
    let measure = _.get(config, "yySetting.dataField.measure");
    let topn = _.get(config, "yySetting.orderInfo.bUseDimensionXRows") ? _.get(config, "yySetting.orderInfo.dimensionXRows") : _.get(config, "yySetting.orderInfo.dimensionSubRows");
    let orderField = _.get(config, "yySetting.orderInfo.orderField")
    let topnOrderBy = _.get(config, "yySetting.orderInfo.orderBy")
    let LngAndLat = _.get(config, "yySetting.dataField.LngAndLat");
    if (dimensionX && dimensionX.length > 0) {
      dimensionX.forEach(eleItem => {
        let ele = {};
        ele.fieldname = eleItem.nameField;
        ele.groupType = eleItem.groupType;
        ele.depends = eleItem.depends;
        // if (dataParams.length == dimensionX.length - 1)
        ele.topn = topn;
        dataParams.push(ele);
      });
    }
    ;
    if (dimensionSub && dimensionSub.length > 0) {
      dimensionSub.forEach(eleItem => {
        let ele = {};
        ele.fieldname = eleItem.nameField;
        ele.groupType = eleItem.groupType;
        ele.depends = eleItem.depends;
        dataParams.push(ele);
      });
    }
    ;
    if (measure && measure.length > 0) {
      measure.forEach(eleItem => {
        let ele = {};
        ele.fieldname = eleItem.valueField;
        ele.groupType = eleItem.groupType;
        ele.depends = eleItem.depends;
        if (ele.fieldname == orderField) {
          ele.topnOrderBy = topnOrderBy;
        }
        dataParams.push(ele);
      });
    }
    if (LngAndLat && LngAndLat.longitude) {
      dataParams.push({ fieldname: LngAndLat.longitude.longitudeField, groupType: 3 });
      dataParams.push({ fieldname: LngAndLat.latitude.latitudeField, groupType: 3 });
    };
    queryParams.data = JSON.stringify(dataParams);
    let date1;
    let date2;
    let callback = (json) => {
      date2 = new Date().getTime();
      eChartCommon.LogChartInfo("获取图形报表 /report/list 本次List请求结束 时间 （秒） =" + parseInt(date2 - date1) / 1000 + " json.code = " + json.code + " json.message = " + json.message + "  queryParams   ", JSON.stringify(queryParams), 900);
      if (json.code === 200) {
        eChartCommon.LogChartInfo("获取图形报表数据OK  ", "", 900);
        let data = json.data.recordList;
        self.setState({ data });
      }
      else {
        eChartCommon.LogChartInfo("获取图形报表数据Err  查询参数 =" + JSON.stringify(queryParams) + "  errMsg  ", json.message, 999);
      }
    }
    date1 = new Date().getTime();
    eChartCommon.LogChartInfo("获取图形报表 /report/list 本次List请求开始 时间 =" + Date() + "  queryParams   ", JSON.stringify(queryParams), 900);
    eChartProxy.doProxy(eChartProxy.url.reportList, 'POST', eChartCommon.trimCondition(queryParams), callback);
  }

  render() {
    let self = this;
    let config = this.state.config;
    let data = _.cloneDeep(this.state.data);
    let outId = self.getOutId();

    // let filter = <div style={{ display: self.state.bShowFilter ? '' : 'none' }}>
    //   <ConvenientQuery model={this.model} cols={1} />
    // </div>;
    if (!config || !data || data.length < 1 || this.state.firstQueryDone == false) {
      return <div style={{ width: "100%", height: "250" }} >
        <div className='eChartMobile-nodata'>
          <SvgIcon type="huanxingtu" />
          <div className='eChartMobile-nodata-text' > 暂时没有数据哦~</div>
        </div>
      </div>;

    }
    else {
      let yySetting = _.cloneDeep(config.yySetting);
      let chartType = yySetting.type || "bar";
      if (chartType == "ranktable") {
        let ranktable = rankTableChart.getRankTable(yySetting, data, false, self.state.panelType, self.props.skinConfig);
        return <div
          id={outId}
          className={"echarts eChartMobile echarts_type_" + chartType}
          style={self.getEChartSizeStyle(null, chartType, outId)} >
          {ranktable}
        </div>;
      }
      else {
        let option = _.cloneDeep(config.eChartSetting);
        let unionedData = eChartCommon.UnionDimensionName(yySetting, data);
        if (chartType == "bar") {
          option = barChart.setOption(this.state.chartDisplayType, option, yySetting, unionedData, this.props.skinConfig);
        }
        else if (chartType == "line") {
          option = lineChart.setOption(this.state.chartDisplayType, option, yySetting, unionedData, this.props.skinConfig);
        }
        else if (chartType == "pie") {
          let isSingleValue = yySetting.isSingleValue;
          if (isSingleValue)
            option = pieChart_SingleValue.setOption(this.state.chartDisplayType, option, yySetting, unionedData, this.props.skinConfig);
          else
            option = pieChart.setOption(this.state.chartDisplayType, option, yySetting, unionedData, this.props.skinConfig);
        }
        else if (chartType == "scatter") {
          option = scatterChart.setOption(self.state.chartDisplayType, option, yySetting, unionedData, this.props.skinConfig);
          if (_.isEmpty(self.scatterData.regionInfo)) {
            self.scatterData.regionInfo = _.cloneDeep(yySetting.regionInfo);
          }
          option.geo.map = self.scatterData.regionInfo.geoName;
          self.scatterData.option = option;
          self.importMap(self.scatterData.regionInfo);
        }
        else if (chartType == "barline") {
          option = barlineChart.setOption(this.state.chartDisplayType, option, yySetting, unionedData, this.props.skinConfig);
        }
        let saveAsImage = _.get(option, "toolbox.feature.saveAsImage");
        if (_.isEmpty(saveAsImage) == false)
          delete option.toolbox.feature.saveAsImage;
        self.calcAddLength(option);
        return (
          <div id={outId}
            style={self.getEChartSizeStyle(option, chartType, outId)}
            className={"echarts eChartMobile echarts_type_" + chartType}>
            {/* react_for_echarts */}
            <ReactEcharts
              option={option}
              notMerge={true}
              lazyUpdate={true}
              style={self.getEChartSizeStyle(option, chartType, outId, true)}
              onEvents={{
                "click": (params, curChart) => self.onChartClick(params, curChart),
              }}
            />
          </div>
        );

      }
    }
  }

  calcAddLength(option) {
    let length = 0;
    if (option.addLengthInfo) {
      length = (option.addLengthInfo.charLength - 1) * Math.sin(option.addLengthInfo.rotate * 0.017453293);  // 必需。一个以弧度表示的角。将角度乘以 0.017453293 （2PI/360）即可转换为弧度。
      length = length * 10;//字符高度
    }
    _.set(option, "addLengthInfo.addLength", length);
  }
  getEChartSizeStyle(option, chartType, outId, onlyHeight) {

    let RotateAddLength = 0;
    if (option && option.addLengthInfo) {
      RotateAddLength = option.addLengthInfo.addLength;
      eChartCommon.LogChartInfo("图形报表 因为x轴坐标信息倾斜需要增加的高度 ", RotateAddLength, 903);
      // delete option.RotateAddLength;
    }
    if (this.state.bMounted == false || !chartType) {
      return { width: "100%", height: "auto" };
    }
    else {
      let divEle = document.getElementById(outId);
      let width = 100;
      if (divEle)
        width = divEle.clientWidth;
      else if (window)
        width = window.innerWidth;

      let height = width * 0.8;
      if (width == 0) {
        width = "100%";
        height = "auto";
      }
      else if (chartType == "bar") {
        height = width * 0.8 + RotateAddLength;
      }
      else if (chartType == "line") {
        height = width * 0.8 + RotateAddLength;
      }
      else if (chartType == "pie") {
        height = width * 0.95;
      }
      else if (chartType == "scatter") {
        height = width * 0.9;
      }
      else if (chartType == "barline") {
        height = width * 0.9 + RotateAddLength;
      }
      // if (chartType == "bar") {
      //   height = width * 0.3;
      // }
      // if (chartType == "line") {
      //   height = width * 0.3;
      // }

      // if (chartType == "scatter") {
      //   height = width * 0.6;
      // }
      // if (chartType == "barline") {
      //   height = width * 0.3;
      // }
      if (chartType == "ranktable") {
        height = undefined;
      }
      if (onlyHeight)
        return { height: height };
      else
        return { width: width, height: height };

    }
  }
  getOutId() {
    let chartKey = _.get(this.state.panelChartConfig, "chartKey")
    if (chartKey)
      return "eChartDiv_" + this.state.panelChartConfig.chartKey;
    else
      return "eChartDiv_" + this.serieNum;
  }

  importMap(regionInfo, callback2, callback3) {
    // // 最初解决方式
    // require('echarts/map/js/' + (importKey == "china" ? "" : "province/") + importKey + '.js');
    //  // 修改后解决方式
    let self = this;
    if (self.regionRegistered.indexOf(regionInfo.region) >= 0) {
      if (callback2) {
        callback2();
      }
      return;
    }
    else if (self.regionRegistering.indexOf(regionInfo.region) >= 0) {
      return;
    }
    else {
      self.regionRegistering.push(regionInfo.region);
      if (regionInfo) {
        let region = regionInfo.region;
        let parent = regionInfo.parent;
        let params = {};
        let subUrl = 'china.json';
        if (parent == "0")//中国
        {
          subUrl = 'china.json';
        }
        else if (parent == "100000")//省+直辖市
        {
          let ele = eChartCommon.getMapProvinceArr("", regionInfo.shortName);
          if (ele) {
            subUrl = 'province/' + ele.importKey + '.json';
          }
        }
        else//其他
        {
          subUrl = 'citys/' + region + '.json';
        }
        params.subUrl = subUrl;
        let callback = (data) => {
          if (data.code == 200 && !data.data.code) {
            eChartCommon.LogChartInfo("eChartDisplay 散点图地图信息正确    return ", JSON.stringify(data), 16);
            echarts.registerMap(regionInfo.geoName, data.data);
            self.regionRegistered.push(regionInfo.region);
            setTimeout(() => {
              if (self.bUpdated == false) {
                self.bUpdated = true;
                self.forceUpdate();
              }
              if (callback2) {
                callback2();
              }
            }, 1);
          }
          else {
            let errInfo = data.message || data.data.message || "无明确信息";
            eChartCommon.LogChartInfo("eChartDisplay 散点图地图信息不正确  errInfo = " + errInfo + "regionInfo = " + JSON.stringify(regionInfo) + "  return ", JSON.stringify(data), 999);
            if (callback3) {
              callback3();
            }
          }
        }
        eChartProxy.doProxy('getMap', 'GET', params, callback);
      }
    }
  }
  getRegion(regionArr, fatherId, childName) {
    let self = this;
    let child;
    regionArr.forEach(ele => {
      if (ele.id == fatherId) {
        if (ele.children) {
          ele.children.forEach(ele2 => {
            if (ele2.name == childName || ele2.shortname == childName)
              child = child || ele2;
          });
        }
      }
      else {
        if (ele.children) {
          let tmp = self.getRegion(ele.children, fatherId, childName);
          child = child || tmp;
        }
      }
    }
    )
    return child;
  }
  goBackToSettingArea(self, curChart) {

    let callback = () => {
      let config = self.state.config;
      self.scatterData.regionInfo = _.cloneDeep(config.yySetting.regionInfo);
      self.scatterData.option.geo.map = self.scatterData.regionInfo.geoName;
      curChart.setOption(self.scatterData.option, true);
    }
    return callback;
  }

  setNewMap(chinaMapTreeData, params, curChart) {
    let self = this;
    eChartCommon.LogChartInfo("----------- 点击事件 选择区域 params.name = " + params.name + " 当前regionInfo ", JSON.stringify(self.scatterData.regionInfo), 900);
    let selectRegion = self.getRegion(chinaMapTreeData, self.scatterData.regionInfo.region, params.name);
    let tmpRegionInfo = {};
    if (selectRegion && _.isEmpty(selectRegion) == false) {
      let tmpRegionInfo = {};
      tmpRegionInfo.region = selectRegion.id;
      tmpRegionInfo.shortName = selectRegion.shortname;
      tmpRegionInfo.parent = selectRegion.parent;
      tmpRegionInfo.geoName = tmpRegionInfo.shortName + tmpRegionInfo.region;
      let callback = () => {
        self.scatterData.regionInfo = tmpRegionInfo;
        self.scatterData.option.geo.map = self.scatterData.regionInfo.geoName;
        eChartCommon.LogChartInfo("-----------点击事件  scatterData ", JSON.stringify(self.scatterData), 16);
        curChart.setOption(self.scatterData.option, true);
      }
      self.importMap(tmpRegionInfo, callback, self.goBackToSettingArea(self, curChart));
    }
    else {
      self.goBackToSettingArea(self, curChart)();
    }
  }

  onChartClick(params, curChart) {
    return;
    // let self = this;
    // if (this.state.config.yySetting.type == "scatter") {
    //   if (self.chinaMapTreeData) {
    //     self.setNewMap(self.chinaMapTreeData, params, curChart);
    //   }
    //   else {
    //     let callback = (json) => {
    //       if (json.code === 200) {
    //         self.chinaMapTreeData = json.data;
    //         self.setNewMap(self.chinaMapTreeData, params, curChart);
    //       }
    //     }
    //     eChartProxy.doProxy(eChartProxy.url.getAllregion, 'POST', {}, callback);
    //   }
    // }
  }
}
