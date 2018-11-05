import React, { Component } from 'react'
import * as lineChart from '../options/lineChart';
import * as barChart from '../options/barChart';
import * as pieChart from '../options/pieChart';
import * as rankTableChart from '../options/rankTableChart';
import * as pieChart_SingleValue from '../options/pieChart_SingleValue';
import * as scatterChart from '../options/scatterChart';
import * as barlineChart from '../options/barlineChart';
import * as  eChartDemoData from '../eChartDemoData';
import * as  eChartCommon from '../eChartCommon';
import * as  eChartProxy from '../eChartProxy';
import _ from 'lodash';
import { Format } from '../../../helpers/formatDate';
// import ReactEcharts from '../../AsyncComponents/AsyncEchartsForReact';
// import ReactEcharts from 'echarts-for-react';
// import echarts from "echarts";
// let ConvenientQuery = null;
// import 'echarts/map/js/china';
// import 'echarts/map/js/province/shandong';
let ReactEcharts = null;
const echarts = require('echarts/lib/echarts');

export default class EChartDisplay extends Component {
  constructor(props) {
    eChartCommon.LogChartInfo("eChartDisplay constructor", "", 3);
    super(props);
    ReactEcharts = require('../../AsyncComponents/AsyncEchartsForReact').default;
    // ConvenientQuery = require('../../filter').default;
    let chartDisplayType = this.props.chartDisplayType;// 展现方式 rpt 在报表中展现 panel 监控视图
    this.serieNum = Math.random();
    if (chartDisplayType == "rpt") {
      let bPublished = this.props.viewid ? true : false;
      let config = this.props.config || null;
      eChartCommon.upgradeConfig(config);
      this.state = {
        data: this.props.data || null,
        config: config,
        queryParams: this.props.queryParams,
        chartDisplayType: chartDisplayType,
        isPreview: this.props.isPreview ? this.props.isPreview : false,
        bPublished,
        firstQueryDone: false
      };
      this.getData();
    }
    else if (chartDisplayType == "panel") {
      // eChartDisplay Init Panel
      let panelChartConfig = this.props.panelChartConfig;
      eChartCommon.LogChartInfo("监控视图的图形报表 panelChartConfig", JSON.stringify(panelChartConfig), 14);
      let queryParams = {
        billnum: panelChartConfig.billnum,
        groupSchemaId: panelChartConfig.groupSchemaId,
        condition: panelChartConfig.condition
      };
      this.state = {
        data: null,
        config: null,
        queryParams: queryParams,
        chartDisplayType: chartDisplayType,
        isPreview: this.props.isPreview ? this.props.isPreview : false,
        bShowFilter: panelChartConfig.bShowFilter,
        panelChartConfig: panelChartConfig
      };
      // this.initModelForFilter();
      this.panelType = this.props.panelType ? this.props.panelType : 1;
      this.billName = panelChartConfig.billName;
      this.groupSchemaName = panelChartConfig.groupSchemaName;
      this.getConfig();
    }
    else if (chartDisplayType == "mobile") {
      let config = this.props.config || null;
      this.state = {
        data: this.props.data || null,
        config: config,
        queryParams: this.props.queryParams,
        chartDisplayType: chartDisplayType
      };
    }
    this.state.renderTime = Format(new Date(), 'yyyy-MM-dd hh:mm:ss');
    this.state.bMounted = false;
    this.bUpdated = false;
    this.chinaMapTreeData = null;//参照所需要的省市县数据
    this.scatterData = {
      option: {},
      regionInfo: {}
    };
    this.regionRegistering = [];
    this.regionRegistered = [];
  }


  componentDidMount() {
    eChartCommon.LogChartInfo("监控视图的图形报表 eChartDisplay componentDidMount", "", 2);
    if (this.isInRpt()) {
      this.props.viewModel.on('firstQueryDone', (params) => {
        this.state.firstQueryDone = params;
      });
      this.props.viewModel.on("filterClick", (params) => {
        this.state.queryParams.condition = params.condition;
        this.getData();
      });
      if (eChartDemoData.demoConfig.isDemoData == true && eChartDemoData.demoConfig.demoGroupSchemaId == this.state.queryParams.groupSchemaId) {
        let data = eChartDemoData.getChartDemoData();
        this.setState({ data });
      }
    }
    else if (this.isInPanel()) {
    }
    else if (this.isInMobile()) {
    }
    this.setState({ bMounted: true });
  }

  getConfig() {

    eChartCommon.LogChartInfo("监控视图的图形报表 getConfig", "", 2);
    let param = { billnum: this.state.queryParams.billnum, groupSchemaId: this.state.queryParams.groupSchemaId };
    let callback = (json) => {
      if (json.code === 200) {
        if (json.data) {
          eChartCommon.LogChartInfo("数据库 eChartConfig", json.data.chartConfig);
          if (json.data.isCrossTable == false && (json.data.displayStyle == 2 || json.data.displayStyle == 3)) {
            if (_.isEmpty(json.data.chartConfig) == false) {
              let eChartConfig = JSON.parse(json.data.chartConfig);
              let keys = Object.keys(eChartConfig)
              let config = eChartConfig[keys[0]];
              eChartCommon.upgradeConfig(config);
              this.state.config = config;
              this.getData()
            }
            return;
          }
        }
      }
    }
    eChartProxy.doProxy(eChartProxy.url.getGroupSetting, 'GET', param, callback);
  }
  componentWillUnmount() {
    let self = this;
    eChartCommon.LogChartInfo("eChartDisplay componentWillUnmount", "", 3);
    if (self._timer) {
      eChartCommon.LogChartInfo("监控视图 删除刷新频率定时器 renderTime ", self.state.renderTime + "   panelChartConfig = " + JSON.stringify(self.state.panelChartConfig), 3);
      clearInterval(self._timer);
      self._timer = null;
    };
    self._unmount = true
  }

  checkTimer() {
    let self = this;
    if (self._timer == undefined && self.isInPanel() == true && self.panelType == 1) {
      let refreshInterval = self.state.panelChartConfig.refreshInterval;
      if (isNaN(refreshInterval))
        return;
      refreshInterval = Number(refreshInterval);
      if (Number.isInteger(refreshInterval) == false)
        return;
      if (refreshInterval == 0) {
        eChartCommon.LogChartInfo("报表设置不自动刷新。 refreshInterval ", refreshInterval, 2);
        return;
      }
      if (refreshInterval < 5) {
        eChartCommon.LogChartInfo("报表设置的自动刷新间隔太短。 refreshInterval ", refreshInterval, 999);
        return;
      }
      eChartCommon.LogChartInfo("监控视图 设置自动刷新频率定时器 renderTime ", self.state.renderTime + "   panelChartConfig = " + JSON.stringify(self.state.panelChartConfig), 3);
      // refreshInterval = 2222;
      self._timer = setInterval(() => {
        if (self.props.showIt == true) {
          eChartCommon.LogChartInfo("监控视图自动定时刷新。 renderTime ", self.state.renderTime + "   panelChartConfig = " + JSON.stringify(self.state.panelChartConfig), 3);
          self.getData()
        }
      }, refreshInterval * 1000);
    }
  }
  // 真正显示时轮播时间
  getData() {
    let bGetData = this.props.chartDisplayType == "panel" ||
      this.state.bPublished == true ||
      this.state.firstQueryDone == true;
    eChartCommon.LogChartInfo("eChartDisplay getData bGetData ", bGetData, 900);
    if (bGetData == false)
      return;
    let self = this;
    //根据dataParams获取数据，不再使用 addListener setDataSource方法
    // {
    //   "fieldname": "fRetailMoney",
    //     "groupType": 3,
    //       "topn": "5",
    //         "topnOrderBy": "desc"
    // }
    if (eChartDemoData.demoConfig.isDemoData == true && eChartDemoData.demoConfig.demoGroupSchemaId == this.state.queryParams.groupSchemaId)
      return;
    eChartCommon.LogChartInfo("eChartDisplay getData bGetData 2", bGetData, 900);
    let config = this.state.config;
    let queryParams = this.state.queryParams;
    let dataParams = [];
    if (queryParams && (_.isEmpty(queryParams.condition) == false) && config) {
      eChartCommon.LogChartInfo("eChartDisplay getData bGetData 3", bGetData, 900);
      this.checkTimer();
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
      if (this.isInPanel() == true) {
        eChartCommon.LogChartInfo("监控视图图形报表GetData renderTime ", self.state.renderTime + "   panelChartConfig = " + JSON.stringify(self.state.panelChartConfig), 900);
      }
      date1 = new Date().getTime();
      eChartCommon.LogChartInfo("获取图形报表 /report/list 本次List请求开始 时间 =" + Date() + "  queryParams   ", JSON.stringify(queryParams), 900);
      if (this.isInPanel() == true) {
        queryParams.isFromKanban = true;
      }
      eChartProxy.doProxy(eChartProxy.url.reportList, 'POST', eChartCommon.trimCondition(queryParams), callback);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {

    eChartCommon.LogChartInfo("eChartDisplay状态改变 shouldComponentUpdate Begin", "", 900);
    if (this.isInRpt()) {
      if (
        _.isEqual(nextProps.queryParams.billnum, this.props.queryParams.billnum) == false ||
        _.isEqual(nextProps.queryParams.groupSchemaId, this.props.queryParams.groupSchemaId) == false ||
        _.isEqual(nextProps.config, this.props.config) == false) {
        this.scatterData.regionInfo = {};//可能用户在报表展示过程中，修改报表分组条件中气泡图的显示区域信息
        this.state.config = nextProps.config;
        this.state.queryParams = nextProps.queryParams;
        if (this.state.bPublished)
          this.getData();
        else
          this.getData();
        eChartCommon.LogChartInfo("eChartDisplay状态改变 shouldComponentUpdate  params changed End True", "", 900);
        return true;
      }
      else if (this.state.bPublished == false && _.isEqual(nextProps.queryParams.condition, this.props.queryParams.condition) == false) {
        this.state.queryParams = nextProps.queryParams;
        this.getData();
        eChartCommon.LogChartInfo("eChartDisplay状态改变 shouldComponentUpdate  查询条件 changed End True", "", 900);
        return true;
      }
      else if (_.isEqual(this.state.data, nextState.data) == false) {
        eChartCommon.LogChartInfo("eChartDisplay状态改变 shouldComponentUpdate  data changed End True", "");
        return true;
      }
      else {
        eChartCommon.LogChartInfo("eChartDisplay状态改变 shouldComponentUpdate  End false", "", 900);
        return false;
      }
    }
    else if (this.isInPanel()) {
      if (_.isEqual(this.state.config, nextState.config) == false ||
        _.isEqual(this.state.queryParams, nextState.queryParams) == false
      ) {
        this.state.config = nextState.config;
        this.state.queryParams = nextState.queryParams;
        this.getData();
        return true;
      }
      else if (_.isEqual(this.state.data, nextState.data) == false) {
        return true;
      }
      else {
        return true;
      }
    }
  }
  isInPanel = () => {
    return this.state.chartDisplayType == "panel";
  }
  isInRpt = () => {
    return this.state.chartDisplayType == "rpt";
  }
  isInMobile = () => {
    return this.state.chartDisplayType == "mobile";
  }
  componentWillUpdate(nextProps, nextState) {
  }

  render() {
    let self = this;
    let config = this.state.config;
    let data = _.cloneDeep(this.state.data);
    eChartCommon.LogChartInfo("eChartDisplay render  bMounted ", self.state.bMounted, 900);

    // let filter = <div style={{ display: self.state.bShowFilter ? '' : 'none' }}>
    //   <ConvenientQuery model={this.model} cols={1} />
    // </div>;
    if (!config || !data || data.length < 1) {
      if (self.isInPanel()) {
        return <div id={self.getOutId()}
          style={{ width: "100%" }} >
          <div className='eChart-nodata' tooltip style={self.props.skinConfig ? { color: self.props.skinConfig.displaySkin.textColor } : {}} >暂时没有数据哦~</div>
        </div>;
      }
      else {
        return <div id={self.getOutId()}
          style={{ width: "100%" }}>
          <div className='eChart-nodata' tooltip>暂时没有数据哦~</div>
        </div>;
      }
    }
    else {
      let yySetting = _.cloneDeep(config.yySetting);
      let chartType = yySetting.type || "bar";
      if (chartType == "ranktable") {
        let ranktable = rankTableChart.getRankTable(yySetting, data, self.isInPanel(), self.panelType, self.props.skinConfig);
        if (self.isInPanel()) {
          return <div
            id={self.getOutId()}
            style={self.getPanelSizeStyle()} >
            <div style={self.getPanelSizeStyle()} >
              {ranktable}
            </div>
          </div>;
        }
        else if (self.isInMobile()) {
          return <div
            id={self.getOutId()}
            className={"echarts echarts_type_" + chartType}
            style={{ width: "100%", height: "100%" }} >
            <div className="react_for_echarts" >
              {ranktable}
            </div>
          </div>;
        }
        else {
          return <div
            id={self.getOutId()}
            className={"echarts echarts_type_" + chartType}
            style={{ width: "100%", height: "100%" }} >
            <div className="react_for_echarts" >
              {ranktable}
            </div>
          </div>;
        }
      }
      else {
        let option = _.cloneDeep(config.eChartSetting);
        let unionedData = eChartCommon.UnionDimensionName(yySetting, data);
        if (chartType == "bar") {
          option = barChart.setOption(this.state.chartDisplayType, option, yySetting, unionedData, this.props.skinConfig, this.panelType);
        }
        else if (chartType == "line") {
          option = lineChart.setOption(this.state.chartDisplayType, option, yySetting, unionedData, this.props.skinConfig, this.panelType);
        }
        else if (chartType == "pie") {
          let isSingleValue = yySetting.isSingleValue;
          if (isSingleValue)
            option = pieChart_SingleValue.setOption(this.state.chartDisplayType, option, yySetting, unionedData, this.props.skinConfig);
          else
            option = pieChart.setOption(this.state.chartDisplayType, option, yySetting, unionedData, this.props.skinConfig);
        }
        else if (chartType == "scatter") {
          option = scatterChart.setOption(self.state.chartDisplayType, option, yySetting, unionedData, this.props.skinConfig, this.panelType);
          if (_.isEmpty(self.scatterData.regionInfo)) {
            self.scatterData.regionInfo = _.cloneDeep(yySetting.regionInfo);
          }
          option.geo.map = self.scatterData.regionInfo.geoName;
          self.scatterData.option = option;
          self.importMap(self.scatterData.regionInfo);
        }
        else if (chartType == "barline") {
          option = barlineChart.setOption(this.state.chartDisplayType, option, yySetting, unionedData, this.props.skinConfig, this.panelType);
        }
        if (self.isInPanel()) {
          let saveAsImage = _.get(option, "toolbox.feature.saveAsImage");
          if (_.isEmpty(saveAsImage) == false)
            delete option.toolbox.feature.saveAsImage;
          if (_.isEmpty(self.state.panelChartConfig.title) == false)
            option.title.text = self.state.panelChartConfig.title;

          return <div
            id={self.getOutId()}
            style={self.getPanelSizeStyle()}
          >
            {
              chartType == "scatter" && self.regionRegistered.length < 1 ?
                <div />
                :
                <ReactEcharts
                  option={option}
                  notMerge={true}
                  lazyUpdate={true}
                  style={{ width: "100%", height: "100%" }}
                  onEvents={{
                    "click": (params, curChart) => self.onChartClick(params, curChart)
                    // 'legendselectchanged': self.onChartLegendselectchanged,
                    // 'datazoom ': self.onDataZoom,
                    // 'mapselectchanged': self.onMapSelectChanged,
                    // 'geoselectchanged': self.ongeoselectchanged
                  }}
                />
            }
          </div>;

        }
        else if (self.isInMobile()) {
          return (
            <div id={self.getOutId()}
              className={"echarts echarts_type_" + chartType} style={{ width: "100%", height: "100%" }} >
              <div className="react_for_echarts"  >
                <ReactEcharts
                  option={option}
                  notMerge={true}
                  lazyUpdate={true}
                  style={{ width: "100%", height: "100%" }}
                  onEvents={{
                    "click": (params, curChart) => self.onChartClick(params, curChart),
                    // 'legendselectchanged': self.onChartLegendselectchanged,
                    // 'datazoom ': self.onDataZoom,
                    // 'mapselectchanged': self.onMapSelectChanged,
                    // 'geoselectchanged': self.ongeoselectchanged
                  }}
                />
              </div>
            </div>
          );
        }
        else {
          return (
            <div id={self.getOutId()}
              className={"echarts echarts_type_" + chartType} style={{ width: "100%", height: "100%" }} >
              <div className="react_for_echarts"  >
                <ReactEcharts
                  option={option}
                  notMerge={true}
                  lazyUpdate={true}
                  style={{ width: "100%", height: "100%" }}
                  onEvents={{
                    "click": (params, curChart) => self.onChartClick(params, curChart),
                    // 'legendselectchanged': self.onChartLegendselectchanged,
                    // 'datazoom ': self.onDataZoom,
                    // 'mapselectchanged': self.onMapSelectChanged,
                    // 'geoselectchanged': self.ongeoselectchanged
                  }}
                />
              </div>
            </div>
          );
        }
      }
    }
  }
  getOutId() {
    let chartKey = _.get(this.state.panelChartConfig, "chartKey")
    if (chartKey)
      return "eChartDiv_" + this.state.panelChartConfig.chartKey;
    else
      return "eChartDiv_" + this.serieNum;
  }
  getPanelSizeStyle() {
    let chartType = _.get(this.state.config, "yySetting.type");
    let style = {};
    if (this.isInPanel() == true) {
      if (this.panelType == 1) {
        style = { width: "100%", height: "100%" };
      }
      else {
        if (this.state.bMounted == false || !chartType) {
          style = { width: "100%", height: "auto" };
        }
        else {
          let divEle = document.getElementById(this.getOutId());
          if (divEle) {
            let width = divEle.clientWidth;
            let height = width * 0.5;
            if (width == 0) {
              style = { width: "100%", height: "auto" };
            }
            else {
              // if (chartType == "bar") {
              //   height = width * 0.4;
              // }
              // if (chartType == "line") {
              //   height = width * 0.4;
              // }
              // if (chartType == "pie") {
              //   height = width * 0.5;
              // }
              // if (chartType == "scatter") {
              //   height = width * 0.6;
              // }
              // if (chartType == "barline") {
              //   height = width * 0.4;
              // }

              if (chartType == "ranktable") {
                height = undefined;
              }
              style = { width: width, height: height }
            }
          }
        }
      }
    }
    eChartCommon.LogChartInfo("getPanelSizeStyle style  ", JSON.stringify(style), 900);

    return style;
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
    let self = this;
    if (this.state.config.yySetting.type == "scatter") {
      if (self.chinaMapTreeData) {
        self.setNewMap(self.chinaMapTreeData, params, curChart);
      }
      else {
        let callback = (json) => {
          if (json.code === 200) {
            self.chinaMapTreeData = json.data;
            self.setNewMap(self.chinaMapTreeData, params, curChart);
          }
        }
        eChartProxy.doProxy(eChartProxy.url.getAllregion, 'POST', {}, callback);
      }
    }
  }
  // onChartLegendselectchanged(params, curChart) {
  //   console.log("onChartLegendselectchanged");
  // }
  // onDataZoom(params, curChart) {
  //   console.log("onDataZoom");
  // }
  // onMapSelectChanged(params, curChart) {
  //   console.log("onMapSelectChanged");
  // }
  // ongeoselectchanged(params, curChart) {
  //   console.log("ongeoselectchanged");
  // }

  // importMap(yySetting, option) {
  //   // // 最初解决方式
  //   // require('echarts/map/js/' + (yySetting.importKey == "china" ? "" : "province/") + yySetting.importKey + '.js');
  //   //  // 修改后解决方式
  //   if (yySetting.regionInfo) {
  //     let region = yySetting.regionInfo.region;
  //     let shortName = yySetting.regionInfo.shortName;
  //     let parent = yySetting.regionInfo.parent;
  //     let req;
  //     if (parent == "0")//中国
  //     {
  //       req = this.getRequire('china.json');
  //     }
  //     else if (parent == "100000")//省+直辖市
  //     {
  //       let ele = eChartCommon.getMapProvinceArr("", shortName);
  //       if (ele) {
  //         req = this.getRequire('province/' + ele.importKey + '.json');
  //       }
  //     }
  //     else//其他
  //     {
  //       req = this.getRequire('citys/' + region + '.json');
  //     }
  //     try {
  //       echarts.registerMap(shortName, req);
  //     }
  //     catch (e) {
  //       eChartCommon.LogChartInfo("eChartDisplay 散点图地图信息不正确 yySetting.regionInfo", JSON.stringify(yySetting.regionInfo), 999);
  //     }
  //   }
  // }

  // getRequire(url) {
  //   if (eChartDemoData.demoConfig.getMapFromLocal == true) {
  //     try {
  //       return require('echarts/map/json/' + url);
  //     }
  //     catch (e) {
  //       eChartCommon.LogChartInfo("eChartDisplay 散点图地图信息不正确 yySetting.regionInfo", JSON.stringify(yySetting.regionInfo), 999);
  //     }
  //   }
  //   else {
  //     var proxy = cb.rest.DynamicProxy.create({ loadData: { url: 'http://yxy-lsy.oss-cn-beijing.aliyuncs.com/echartmap/json/' + url, method: 'GET', options: { async: false } } });
  //     var data = proxy.loadData();
  //     return data;
  //     // let tmp1 = require('echarts/map/json/' + url);
  //     // let tmp2 = cb.requireInner(['http://yxy-lsy.oss-cn-beijing.aliyuncs.com/echartmap/json/' + url], (a, b) => { });
  //     // return tmp2;
  //   }
  //   // cb.requireInner(['http://api.map.baidu.com/getscript?v=2.0&ak=Xc0b88CMj1YgLa1rTLvLungBPKmIaoMo'], () => {
  //   //   this.map = new BMap.Map(this.refs.allmap);
  //   //   this.setState({ flag: true });
  //   // });}
  // }

  // importMap(yySetting, option) {
  //   // // 最初解决方式
  //   // require('echarts/map/js/' + (yySetting.importKey == "china" ? "" : "province/") + yySetting.importKey + '.js');
  //   //  // 修改后解决方式
  //   // echarts.registerMap('江西', require('echarts/map/json/province/jiangxi.json')); // 注册地图
  //   let importKey = yySetting.importKey;
  //   let geoMapKey = option.geo.map;
  //   echarts.registerMap(geoMapKey, require('echarts/map/json/' + (importKey == "china" ? "" : "province/") + importKey + '.json')); // 注册地图
  // }

}
