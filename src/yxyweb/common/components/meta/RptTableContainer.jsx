import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Col } from '../basic';
import RptTable from '../rpttable';
import TotalContainer from './TotalContainer';
import EChartDisplay from '../echart/echart/eChartDisplay';
import * as  eChartDemoData from '../echart/eChartDemoData';
import { genAction, proxy } from '../../helpers/util';
import * as  eChartCommon from '../echart/eChartCommon';
import * as groupConditionRedux from '../../redux/groupCondition';
import { Input, Modal, Button } from 'antd';


class RptTableContainer extends Component {
  constructor(props) {
    super(props);
    let viewid = _.get(props.viewModel.getParams(), 'query.viewid');
    if (!viewid)
      viewid = "";
    this.state = {
      displayType: 1,// 1 单表 2 单图 3 多图+表
      layOutConfig: {},
      eChartConfig: {},
      billnum: "",
      groupSchemaId: "",
      groupSchemaName: "",
      condition: {},
      firstQueryDone: false,
      // publishMenu: false,
      viewid: viewid,
      isPc: true,
      isMobile: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    // RptTableContainer shouldComponentUpdate
    const { groupConditionState, groupConditionRedux } = this.props;
    let id = _.get(nextProps.groupConditionState[this.state.billnum], "refreshGroupSchemaId");
    if (id && id == this.state.groupSchemaId) {
      this.getConfig();
      groupConditionRedux.setValue(this.state.billnum, { refreshGroupSchemaId: "" });
      return true;
    }
    return true;
  }
  componentDidMount() {
    let self = this;
    //注册分组方案切换事件
    this.props.viewModel.on('refreshEChartConfig', (params) => {
      if (eChartDemoData.demoConfig.isDemoConfig == true && params.groupSchemaId == eChartDemoData.demoConfig.demoGroupSchemaId) {
        this.getConfigDemo(params);
      }
      else {
        this.getConfig(params);
      }
    });
    //注册点击过滤事件
    this.props.viewModel.on("filterClick", (params) => {
      this.setState({ condition: params.condition });
    }
    );

    this.props.viewModel.on('firstQueryDone', (params) => {
      this.state.firstQueryDone = params;
    });

    this.props.viewModel.on('getPublishMenuInfo', () => {
      let viewModel = self.props.viewModel;
      let params = {};
      params.name = viewModel.getParams().name;
      params.groupSchemaName = self.state.groupSchemaName;
      params.billnum = viewModel.getParams().billNo;// self.state.billnum;
      params.isPc = self.state.isPc;
      params.isMobile = self.state.isMobile;
      if (!!self.state.groupSchemaId)
        params.groupSchemaId = self.state.groupSchemaId;
      params.condition = self.state.condition;
      viewModel.execute('setPublishMenuInfo', params);
    });

    // this.props.viewModel.on('publishMenu', (params) => {
    //   this.setState({ publishMenu: true });
    // });
  }
  // getPublishMenuCard(viewModel) {

  //   let self = this;
  //   let content;
  //   if (self.state.publishMenu == true) {
  //     let name = viewModel.getParams().name;
  //     let groupSchemaName = self.state.groupSchemaName;

  //     let card;
  //     card = <div className="publishMenu_count">
  //       <span>方案名称:</span>
  //       <Input
  //         id="publishMenu_Title"
  //         placeholder="请输入"
  //         defaultValue={name + "_" + groupSchemaName}
  //       />
  //     </div>;

  //     content =
  //       <Modal
  //         className="publishMenu"
  //         title={"发布菜单"}
  //         onOk={(e) => this.handleOk(e)}
  //         onCancel={(e) => this.handleCancel(e)}
  //         visible={true}
  //       >
  //         {card}
  //       </Modal>;
  //   }
  //   return content;
  // }



  // handleOk = (e) => {
  //   let ele = document.getElementById('publishMenu_Title')
  //   let name = ele.value;
  //   if (name == "" || name.length > 16) {
  //     cb.utils.alert("名称不可为空且长度小于16个字。");
  //     return;
  //   }
  //   let billnum = this.state.billnum;
  //   let groupSchemaId = this.state.groupSchemaId;
  //   let condition = JSON.stringify(this.state.condition);
  //   let params = { billnum, name, groupSchemaId, condition };

  //   let callback = (json) => {
  //     if (json.code === 200) {
  //       cb.utils.alert("报表方案已发布。");
  //       this.setState({ publishMenu: false });
  //     }
  //     else {
  //       cb.utils.alert(json.message);
  //     }
  //   }
  //   this.actionsProxy('/report/publishMenu', 'POST', params, callback);


  // }
  // handleCancel = (e) => {
  //   this.setState({ publishMenu: false });
  // }

  componentWillUnmount() {
    // //重写组件的setState方法，直接返回空
    // this.setState = (state, callback) => {
    //   return;
    // };
  }

  actionsProxy(url, method, params, callback) {
    const config = { url: url, method: method, params: params };
    proxy(config)
      .then(json => {
        callback(json);
      });
  }
  getConfigDemo(params) {
    let billnum = params.billnum;
    let groupSchemaId = params.groupSchemaId;
    let groupSchemaName = params.groupSchemaName;

    let displayType = eChartDemoData.demoConfig.demoDisplayType;
    let layOutConfig = eChartDemoData.getlayOutConfig();
    let eChartConfig;
    eChartConfig = eChartCommon.getEChartConfig_Template("");
    // eChartConfig = eChartDemoData.getEChartConfig();
    eChartCommon.LogChartInfo("假数据 displayType", displayType);
    eChartCommon.LogChartInfo("假数据 layOutConfig", JSON.stringify(layOutConfig));
    eChartCommon.LogChartInfo("假数据 eChartConfig", JSON.stringify(eChartConfig));
    this.setState({ displayType, layOutConfig, eChartConfig, billnum, groupSchemaId, groupSchemaName });
  }

  getConfig(params) {
    let billnum = params ? params.billnum : this.state.billnum;
    let groupSchemaId = params ? params.groupSchemaId : this.state.groupSchemaId;
    let groupSchemaName = params ? params.groupSchemaName : this.state.groupSchemaName;
    let param = { billnum: billnum, groupSchemaId: groupSchemaId };
    let callback = (json) => {
      if (json.code === 200) {
        if (json.data) {
          eChartCommon.LogChartInfo("数据库 displayType", json.data.displayStyle);
          eChartCommon.LogChartInfo("数据库 layOutConfig", json.data.pageLayout);
          eChartCommon.LogChartInfo("数据库 eChartConfig", json.data.chartConfig);


          let isCrossTable = json.data.isCrossTable;
          if (isCrossTable == false) {
            if (json.data.displayStyle) {
              let displayType = json.data.displayStyle;
              let layOutConfig = json.data.pageLayout ? JSON.parse(json.data.pageLayout) : {};
              let eChartConfig = json.data.chartConfig ? JSON.parse(json.data.chartConfig) : {};
              let isPc = json.data.hasOwnProperty("isPc") ? json.data.isPc : true;
              let isMobile = json.data.hasOwnProperty("isMobile") ? json.data.isMobile : false;
              this.setState({ displayType, layOutConfig, eChartConfig, isMobile, isPc, billnum, groupSchemaId, groupSchemaName });
              return;
            }
          }
        }
      }
      console.log("图形报表_配置信息读取失败或者交叉表不支持 json.message = " + json.message);
      this.setState({ displayType: 1, layOutConfig: {}, eChartConfig: {}, isMobile: true, isPc: true, billnum, groupSchemaId, groupSchemaName });
    }
    this.actionsProxy('/report/getGroupSetting', 'GET', param, callback);
  }



  render() {
    const { meta, viewModel } = this.props;
    let otherCom = null;
    if (this.state.displayType == 1)//单表
    {
      otherCom = this.renderTable();
    }
    else if (this.state.displayType == 2)//单图
    {
      otherCom = this.renderChart();
    }
    else if (this.state.displayType == 3)//表和多图。也可能只有多图
    {
      otherCom = this.renderTableAndChart();
    }
    // let publishMenu = this.getPublishMenuCard(viewModel);
    return (
      <Row>
        <TotalContainer
          meta={meta}
          billnum={this.state.billnum}
          viewModel={viewModel}
          // firstQueryDone={this.state.firstQueryDone}
          viewid={this.state.viewid} />
        {/* <SumAreaSetting viewModel={viewModel} /> */}
        {otherCom}
        {/* {publishMenu} */}
      </Row>
    );
  }

  renderTable() {
    const { meta, width, viewModel } = this.props;
    const style = meta.cStyle ? JSON.parse(meta.cStyle) : {};
    const tableWidth = style.width || width;
    const columns = {};
    if (meta.controls) {
      meta.controls.forEach(column => {
        columns[column.cItemName] = column;
      })
    }
    const controlModel = viewModel.get(meta.childrenField || meta.cCode);
    return (
      <RptTable
        width={tableWidth}
        code={meta.cGroupCode}
        columns={columns}
        style={style}
        model={controlModel} tableClass="rptTable" tableTyep={'rptTable'} />
    );
  }

  renderChart() {
    const { meta, width, viewModel } = this.props;
    const controlModel = viewModel.get(meta.childrenField || meta.cCode);
    let key = Object.keys(this.state.eChartConfig)[0];
    let queryParams = {
      billnum: this.state.billnum,
      groupSchemaId: this.state.groupSchemaId,
      condition: this.state.condition,

    };

    return (
      <div id={eChartCommon.getEChartElementId("")}>
        <EChartDisplay
          config={this.state.eChartConfig[key]}
          viewModel={viewModel}
          queryParams={queryParams}
          firstQueryDone={this.state.firstQueryDone}
          chartDisplayType={"rpt"}
          viewid={this.state.viewid}
        />
      </div>
    );

  }

  renderTableAndChart() {
    let self = this;
    const { meta, width, viewModel } = this.props;
    const style = meta.cStyle ? JSON.parse(meta.cStyle) : {};
    const tableWidth = style.width || width;
    const columns = {};
    if (meta.controls) {
      meta.controls.forEach(column => {
        columns[column.cItemName] = column;
      })
    }
    const controlModel = viewModel.get(meta.childrenField || meta.cCode);
    let rpt = <RptTable width={tableWidth} code={meta.cGroupCode} columns={columns}
      style={style} model={controlModel} tableClass="rptTable" tableTyep={'rptTable'} />;
    let content = [];
    content = self.getRows(this.state.layOutConfig.rows, content, rpt, controlModel);
    return (
      <div>{content}</div>
    );
  }


  getRows(config, content, rpt, controlModel) {
    let self = this;
    config.forEach(rowEle => {
      let curRow = [];
      rowEle.forEach(colEle => {
        if (colEle.widgetType == "rpt") {
          curRow.push(<Col span={colEle.colspan}> {rpt}</Col>);
        }
        else if (colEle.widgetType == "chart") {
          let queryParams = {
            billnum: self.state.billnum,
            groupSchemaId: self.state.groupSchemaId,
            condition: self.state.condition
          };

          let chart = <div id={eChartCommon.getEChartElementId(colEle.widgetValue)}>
            <EChartDisplay
              config={self.state.eChartConfig[colEle.widgetValue]}
              viewModel={self.props.viewModel}
              queryParams={queryParams}
              firstQueryDone={self.state.firstQueryDone}
              chartDisplayType={"rpt"}
              viewid={self.state.viewid}
            />
          </div>;
          curRow.push(<Col span={colEle.colspan}> {chart}</Col>);
        }
        else if (colEle.widgetType == "rows") {
          let innerContent = [];
          innerContent = self.getRows(colEle.widgetValue, innerContent, rpt, controlModel);
          curRow.push(<Col span={colEle.colspan}> {innerContent}</Col>);
        }
      });
      content.push(<Row colCount={12}>{curRow}</Row>);
    });
    return content;
  }

}

function mapStateToProps(state) {
  return {
    groupConditionState: state.groupCondition.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    groupConditionRedux: bindActionCreators(groupConditionRedux, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RptTableContainer);
