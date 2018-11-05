import React, { Component } from 'react';
import { Popover, Input, Modal, Icon, Button, Checkbox, Radio, Transfer, Select } from 'antd';
import { Format } from '../../../helpers/formatDate';
import Row from '../../basic/row';
import Col from '../../basic/col';
import * as  eChartCommon from '../eChartCommon';
import * as eChartDemoData from '../eChartDemoData';
import * as  eChartProxy from '../eChartProxy';
import SvgIcon from 'SvgIcon';
const Option = Select.Option;
const RadioGroup = Radio.Group;
let ConvenientQuery = null;
export default class eChartPanelSetSum extends React.Component {
  constructor(props) {
    super(props);
    ConvenientQuery = require('../../filter').default;
    // curOperateType == "setImageText"
    let self = this;
    let sumConfig = self.props.colEle.sumConfig || {};
    self.state = {
      panelType: self.props.panelType ? self.props.panelType : 1,
      reportArray: [],
      subType: sumConfig.subType || "sum",//"sum" "count"
      bUseQianSplit: sumConfig.hasOwnProperty("bUseQianSplit") ? sumConfig.bUseQianSplit : true,
      title: sumConfig.title,
      billnum: sumConfig.billnum,
      billName: sumConfig.billName,
      filterId: sumConfig.filterId,
      solutionId: sumConfig.solutionId,
      condition: sumConfig.condition,
      sumFieldsArray: [],
      sumFields: sumConfig.sumFields || [],
      fontSize: sumConfig.fontSize || 12,
      fontFamily: 'STKaiti',// STSong = 华文宋体 // LiSu = 隶书 // YouYuan = 幼圆 // STXihei = 华文细黑 // STKaiti = 华文楷体 // STZhongsong = 华文中宋 // STFangsong = 华文仿宋 // FZShuTi = 方正舒体 // FZYaoti = 方正姚体 // STCaiyun = 华文彩云 // STHupo = 华文琥珀 // STLiti = 华文隶书 // STXingkai = 华文行楷 // STXinwei = 华文新魏
      valueFontSize: sumConfig.valueFontSize || 24,
      refreshInterval: sumConfig.hasOwnProperty("refreshInterval") ? sumConfig.refreshInterval : 3600,
      editFieldName: ""
    };
    this.initModelForFilter();
  }

  render() {
    let self = this;
    let content = self.getCardContent();

    return <Modal
      className="eChartPanelDesign_SetChart eChartPanelDesign_SetSum"
      title="添加汇总"
      onOk={(e) => self.doFunc(true)}
      onCancel={(e) => self.doFunc(false)}
      visible={true}
    >
      {content}
    </Modal>;
  }


  getCardContent() {
    let self = this;
    let options1 = self.getReportListContent();
    let options2 = self.getSumContent();
    let filter = undefined;
    if (self.state.filterId) {
      filter = <div key={self.state.filterId} className="eChartPanelDesign" style={{ display: '' }}>
        <ConvenientQuery model={self.model} cols={2} />
      </div>;
    }
    let content = <div className="hz">
      <Row className="width-less">
        <Col >
          汇总
        </Col>
        <Col  >
          <Select
            value={self.state.billnum}
            onSelect={(billnum) => self.setReportInfo(billnum)}
          >
            {options1}
          </Select>
        </Col>
      </Row>
      <Row className="width-less" style={{ display: (self.state.billnum ? "" : "none") }}>
        <Col>
          数据项
        </Col>
        <Col className="ckeck" >
          {options2}
        </Col>
      </Row>

      {self.state.panelType == 1 ?
        <Row className="width-less">
          <Col >
            显示样式
        </Col>
          <Col >
            <RadioGroup
              onChange={(e) => self.displayStyleChange(e.target.value)}
              value={self.state.subType ? self.state.subType : "sum"}
            >
              <Radio value={"sum"}>普通汇总显示</Radio>
              <Radio value={"count"}>滚动计数显示</Radio>
            </RadioGroup>
          </Col>
        </Row> : null}

      <Row className="width-less" style={{ display: (self.state.subType == "count" ? "" : "none") }} >
        <Col >
          显示千分位
        </Col>
        <Col >
          <RadioGroup
            onChange={(e) => this.setState({ "bUseQianSplit": e.target.value })}
            value={self.state.bUseQianSplit}
          >
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </RadioGroup>
        </Col>
      </Row>
      <Row className="width-less-pl">
        <Col >
          数值字体大小
        </Col>
        <Col >
          <Input defaultValue={self.state.valueFontSize} onChange={(e) => this.setState({ "valueFontSize": e.target.value })} />
        </Col>
      </Row>
      <Row className="width-less-pl">
        <Col >
          标题字体大小
        </Col>
        <Col >
          <Input defaultValue={self.state.fontSize} onChange={(e) => this.setState({ "fontSize": e.target.value })} />
        </Col>
      </Row>
      <Row className="width-less-pl">
        <Col>
          刷新频率
        </Col>
        <Col>
          <Input defaultValue={self.state.refreshInterval} onChange={(e) => self.setState({ "refreshInterval": e.target.value })} />
        </Col>
        <Col className="tips">
          秒<span>(提示:刷新太频繁会造成服务器压力过大)</span>
        </Col>
      </Row>

      <Row className="gltj">
        <Col >
          过滤条件
        </Col>
        <Col >
          {filter}
        </Col>
      </Row>
    </div >;
    return content;
  }

  initModelForFilter() {

    let self = this;
    this.model = new cb.models.SimpleModel({});
    this.model.getParams = function () {
      let tmp = {
        filterId: self.state.filterId,
        condition: self.state.condition,
        isInPanelDesign: true,
        solutionId: self.state.solutionId,
        bHasNullDate: true
      };
      return tmp;
    };
    this.model.on('filterClick', function (args) {
      eChartCommon.LogChartInfo("监控视图汇总设置 触发事件 filterClick", JSON.stringify(args.condition), 7);
      self.state.condition = args.condition;
    });
    this.model.setName("监控视图汇总设置");
  }

  getSumContent() {
    let self = this;
    let arr = [];
    self.state.sumFields.forEach((ele) => {
      arr.push(
        <div className="eChartPanelSetSum-Field">
          <Checkbox
            checked={ele.bSelected}
            key={ele.key}
            onChange={e => self.onChecked(e.target.checked, ele.key)}>
            <Input
              id={ele.key}
              defaultValue={ele.showCaption}
              onChange={(e) => self.setShowCaption(ele.key, e.target.value)}
              readOnly={self.state.editFieldName != ele.key}
              className={self.state.editFieldName == ele.key ? "eChartPanelSetSum_CanEdit" : "eChartPanelSetSum_CanNotEdit"}
            />
          </Checkbox>
          <div className="eChartPanelSetSum-FieldEdit" onClick={(e) => self.setEditFieldName(e, ele.key)}>
            <SvgIcon type="edit" />
          </div>
        </div>);
    });
    // if (arr.length > 0) {
    return <div>{arr}</div>;
    // }
    // else {
    //   arr.push(<div>无汇总信息可选择</div>);
    //   return arr;
    // }

  }

  displayStyleChange(value) {
    this.setState({ subType: value });
  }
  setEditFieldName(e, fieldName) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ "editFieldName": fieldName })
  }
  setShowCaption(key, value) {
    let sumFields = this.state.sumFields;
    let ele = _.find(sumFields, (ele) => { return ele.key == key });
    if (value)
      ele.showCaption = value;
    else
      ele.showCaption = ele.caption;

    this.setState({ sumFields });
  }
  onChecked = (checked, key) => {
    let self = this;

    let sumFields = self.state.sumFields;
    let ele = _.find(sumFields, (o) => { return o.key == key });
    if (checked) {
      let tmpOrder = 1;
      _.forEach(sumFields, (eleTmp) => {
        if (eleTmp.iOrder > tmpOrder && eleTmp.iOrder != 9999)
          tmpOrder = eleTmp.iOrder;
      });
      ele.bSelected = true;
      ele.iOrder = tmpOrder;
    }
    else {
      ele.bSelected = false;
      ele.iOrder = 9999;
    }
    self.setState({ sumFields });
  }
  getReportListContent() {
    let arrArr = this.state.reportArray;
    arrArr.sort(function (a, b) { return a.name.length - b.name.length });
    let arr = [];
    arrArr.forEach((ele) => {
      arr.push(<Option value={ele.billnum}>{ele.name}</Option>);
    });
    return arr;
  }
  setReportInfo(billnum) {
    let self = this;
    let ele = _.find(self.state.reportArray, function (o) { return o.billnum == billnum });
    if (ele) {
      let state = {};
      state.billnum = billnum;
      state.billName = ele.name;
      state.filterId = ele.filterId;
      state.solutionId = ele.solutionId;
      state.condition = undefined;
      state.sumFields = [];
      self.setState(state);
      self.getSumFieldsArray(billnum);
    }
  }


  getReportList() {
    let self = this;
    let param = {};
    let callback = (json) => {
      if (json.code === 200) {
        if (json.data) {
          self.setState({ reportArray: json.data });
        }
      }
    }
    eChartProxy.doProxy(eChartProxy.url.getReportList, 'GET', param, callback);
  }

  getSumFieldsArray(billnum) {
    let self = this;
    if (billnum) {
      let param = { billnum, isOnlySelected: true };
      let callback = (json) => {
        if (json.code === 200) {
          if (json.data) {
            let sumFieldsArray = json.data.items || [];
            let title = json.data.name;
            let sumFields = self.state.sumFields;

            _.remove(sumFields, function (o) {
              let tmp = _.filter(sumFieldsArray, function (o2) { return o.key == o2.fieldname });
              return tmp.length < 1 ? true : false;
            });
            _.forEach(sumFieldsArray, (ele) => {
              let tmp = _.find(sumFields, function (ele2) { return ele2.key == ele.fieldname });
              if (tmp) {
                tmp.caption = ele.caption;
              }
              else {
                sumFields.push({ key: ele.fieldname, caption: ele.caption, showCaption: ele.caption, bSelected: false, iOrder: 9999, postfix: "" });
              }
            });
            // sumFieldsArray  {fieldname: "fOrderPrice", controlType: "price", columnDefine: "{"function":"max"}", caption: "客单价",…}
            //  sumFields  key: fieldname, caption: caption, iOrder: 1, postfix: ""

            self.setState({ sumFields, sumFieldsArray, title });
          }
        }
      }
      eChartProxy.doProxy(eChartProxy.url.getTotalSetting, 'GET', param, callback);
    }
    else {
      self.setState({ sumFieldsArray: [] });
    }
  }
  checkInteger(fieldValue, bCanZero, bCanSmallThanZero, bCanNumPoint) {

    if (fieldValue.toString().trim() == "") {
      return false;
    }
    else if (isNaN(fieldValue) == true) {
      return false;
    }
    else if (bCanZero == false && Number(fieldValue) == 0) {
      return false;
    }
    else if (bCanSmallThanZero == false && Number(fieldValue) < 0) {
      return false;
    }
    else if (bCanNumPoint == false && fieldValue.toString().indexOf(".") >= 0) {
      return false;
    }
    return true;
  }



  doFunc(bOK) {
    this.model.execute('eChartPanel_GetCondition');
    if (bOK) {
      let info = {};
      info.subType = this.state.subType;
      info.bUseQianSplit = this.state.bUseQianSplit;
      info.chartKey = eChartCommon.getNewChartKey();
      info.title = this.state.title;
      info.billnum = this.state.billnum;
      info.billName = this.state.billName;
      info.filterId = this.state.filterId;
      info.solutionId = this.state.solutionId;
      info.condition = this.state.condition;
      info.refreshInterval = this.state.refreshInterval;
      info.sumFields = this.state.sumFields;
      info.sumFields.forEach(
        (ele, index) => {
          if (ele.bSelected)
            ele.iOrder = index + 1
          else
            ele.iOrder = 9999;
        }
      );
      info.fontSize = this.state.fontSize;
      info.valueFontSize = this.state.valueFontSize;

      info.fontFamily = this.state.fontFamily;
      let selNum = _.filter(info.sumFields, function (ele) { return ele.bSelected == true }).length;
      if (info.refreshInterval == "") {
        info.refreshInterval = 0;
      }
      if (info.billnum == "") {
        cb.utils.alert('请设置报表', 'error');
      }
      else if (info.filterId == "") {
        cb.utils.alert('请设置filterId', 'error');
      }
      else if (info.solutionId == "") {
        cb.utils.alert('请设置solutionId', 'error');
      }
      else if (_.isEmpty(info.condition)) {
        cb.utils.alert('请设置condition', 'error');
      }
      else if (_.isEmpty(info.sumFields) || selNum < 1) {
        cb.utils.alert('请设置汇总字段', 'error');
      }
      else if (info.subType == "count" && selNum > 1) {
        cb.utils.alert('滚动计数显示方式只能显示一个字段', 'error');
      }
      else if (this.checkInteger(info.fontSize, false, false, false) == false) {
        cb.utils.alert('标题字体大小设置不正确', 'error');
      }
      else if (this.checkInteger(info.valueFontSize, false, false, false) == false) {
        cb.utils.alert('数值字体大小设置不正确', 'error');
      }
      else if (this.checkInteger(info.refreshInterval, true, false, false) == false) {
        cb.utils.alert('刷新频率设置不正确', 'error');
      }
      else {
        this.props.doFunc(bOK, info);
      }
    }
    else {
      this.props.doFunc(bOK);
    }
  }

  componentDidMount() {
    this.getReportList();
    if (this.state.billnum) {
      this.getSumFieldsArray(this.state.billnum);
    }
    document.body.addEventListener('click', this.handleBodyClick);
  }
  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleBodyClick);
  }

  handleBodyClick = (e) => {
    if (this.state.editFieldName != "" && e.target.id != this.state.editFieldName)
      this.setState({ editFieldName: "" });
  }
}


