import React, { Component } from 'react';
import { Input, Button } from 'antd';
import Row from '../../basic/row';
import Col from '../../basic/col';
import * as  eChartCommon from '../eChartCommon';
import EChartDisplay from '../echart/eChartDisplay';
import { Format } from '../../../helpers/formatDate';
import * as eChartDemoData from '../eChartDemoData';
import EChartWeather from './component/eChartWeather';
import EChartSum from './component/eChartSum';
import EChartSumCountUp from './component/eChartSumCountUp';
import EChartDateTime from './component/eChartDateTime';
import * as  eChartProxy from '../eChartProxy';
import SvgIcon from 'SvgIcon';

export default class eChartPanelDisplay2 extends React.Component {
  constructor(props) {
    super(props);
    this.serieNum = Math.random();
    this.state = {
      panelConfig: props.panelConfig ? props.panelConfig : undefined,
      isPreview: props.isPreview ? props.isPreview : false,
      previewId: props.previewId
    };
    eChartCommon.LogChartInfo("大屏方案2 eChartPanelDisplay2 展现 constructor    ", "", 900);
  }

  render() {
    eChartCommon.LogChartInfo("大屏方案2 eChartPanelDisplay2展现Render Begin ", "", 900);
    let self = this;
    if (self.state.panelConfig) {
      let content;
      let style = self.getStyle_Edit("all", "", self.state.panelConfig);
      let innerStyle = self.getInnerStyle_Edit("all", "", self.state.panelConfig);

      // style = {}
      // style.width = '100%';
      // style.border = "0px ";
      // style.padding = "0px";
      // style.margin = "0px";
      // innerStyle = {}
      // innerStyle.width = '100%';
      // innerStyle.backgroundColor = "#f2efee"


      content = self.getRows(self.state.panelConfig.panelLayOutConfig.rows, true);
      let tmp = <div
        className={"eChartPanel2 panelLayer2-all-outer " + (style.padding == "0px" ? " panelLayer2-all-outer-nopadding " : " panelLayer2-all-outer-haspadding")}
        style={style}
      // onDoubleClick={(e) => self.goBack(e)}
      >
        {self.state.isPreview == true ? <div className="Tabletop-Kanban">  <Button className="ant-btn no-border-radius" onClick={() => self.goBack()}><SvgIcon type="rollback" /> 返回</Button></div> : <div />}
        <div className="panelLayer2-all-inner" style={innerStyle} >
          {content}
        </div>
      </div>;
      eChartCommon.LogChartInfo("大屏方案2 eChartPanelDisplay2展现Render End ", "", 900);
      return tmp;
    }
    else {
      return <div className='eChart-nodata'  >暂时没有数据哦~(监控视图)</div>;
    }
  }

  getImageText(config, colEle) {
    let self = this;
    let style = {};
    if (config.subType == "title") {
      if (config.hasOwnProperty("fontSize")) style.fontSize = config.fontSize;
      // if (config.hasOwnProperty("backgroundColor")) style.backgroundColor = config.backgroundColor;
      // if (config.hasOwnProperty("height")) style.height = config.height;
      if (config.hasOwnProperty("width")) style.width = config.width;
      if (config.hasOwnProperty("color"))
        style.color = config.color;
      if (config.hasOwnProperty("textAlign")) style.textAlign = config.textAlign;
      if (config.hasOwnProperty("fontFamily")) style.fontFamily = config.fontFamily;
      if (config.hasOwnProperty("alignItems")) style.alignItems = config.alignItems;
      if (config.hasOwnProperty("display")) style.display = config.display;
      return <div style={style}>
        <div style={{ textAlign: 'center', width: '100%' }} >{config.title}</div>
      </div>;
    }
    else {
      let imgStyle = { display: "block", width: "100%" };
      return <div
        style={style}
        className={config.logoImg ? "eChartPanelDisplay2_HasImg" : "eChartPanelDisplay2_NoImg"}  >
        <img id={colEle.colKey + "_img"}
          style={imgStyle}
          src={config.logoImg}
        />
      </div>
    }
  }

  componentDidMount() {
    let self = this;
    if (self.state.isPreview == false) {
      self.getPanel(self.state.previewId);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.previewId != this.state.previewId)
      this.getPanel(nextProps.previewId);
  }
  getPanel(previewId) {
    let self = this;
    let param = { reportViewId: previewId };
    let callback = (json) => {
      if (json.code === 200) {
        let data = json.data;
        if (data) {
          let editPanel = eChartCommon.restoreEditPanel(data.pageLayout, data.items, "query", previewId);
          self.setState({ previewId, panelConfig: editPanel });
        }
      }
    }
    eChartProxy.doProxy(eChartProxy.url.getReportView, 'GET', param, callback);
  }

  getStyle_Edit(eleType, innerType, ele) {
    let style = {};
    if (eleType == "row") {
      style.width = '100%';
      // style.height = ele.height;
    }
    else if (eleType == "col") {
      // style.height = '100%';
      style.width = ele.width;
      style.float = 'left';
      style.overflow = "hidden"
    }
    else if (eleType == "all") {
      style.width = '100%';
      style.backgroundColor = eChartCommon.panelDefaultValue.panel2AllBackgroundColor;
      // style.height = '100%';
    }
    style.border = "0px";
    style.padding = "0px";
    style.margin = "0px";
    // if (eleType == "all" || (eleType == "col" && innerType == "control") || ele.bOuterMargin) {
    //   if (ele.hasOwnProperty("margin"))
    //     style.padding = ele.margin;
    // }
    if (eleType == "col" && innerType == "control") {
      style.padding = "0 10px 10px 0";
    }
    return style;
  }

  getInnerStyle_Edit(eleType, innerType, ele) {

    let style = {};
    style.width = '100%';
    // style.height = '100%';
    style.padding = 0;
    style.margin = 0;
    // if (eleType == "all" || (eleType == "col" && innerType == "control") || ele.bOuterBorder) {
    //   let borderType = "solid";
    //   let borderWidth = ele.borderWidth ? ele.borderWidth : eChartCommon.panelDefaultValue.borderWidth;
    //   let borderColor = eChartCommon.panelDefaultValue.borderColor;
    //   style.border = borderWidth + " " + borderType + " " + borderColor;
    // }
    // else {
    style.border = "0px";
    // }
    // if (eleType == "all" && ele.hasOwnProperty("padding")) {
    //   style.padding = ele.padding;
    // }
    if (eleType == "col" && innerType == "control" && ele.widgetType != "imagetext" && ele.widgetType != "component") {
      // style.padding = "2px";//eChartCommon.panelDefaultValue.finalControlPadding;
      style.backgroundColor = "white";
      style.padding = "15px 15px 15px 15px";
    }
    // if (ele.hasOwnProperty("backgroundColor")) style.backgroundColor = ele.backgroundColor;
    // if (ele.hasOwnProperty("backgroundImage") && _.isEmpty(ele.backgroundImage) == false) {
    //   style.backgroundImage = 'url(' + ele.backgroundImage + ')';
    // }
    // if (!!style.backgroundImage) {
    //   style.backgroundSize = '100% 100%';
    //   style.backgroundRepeat = 'no-repeat';
    //   style.backgroundPosition = 'center';
    // }
    return style;
  }

  addBorderClassName(bNoBorder) {
    if (bNoBorder)
      return " panelLayer2-noborder";
    else
      return " panelLayer2-hasborder";
  }

  getRows(rows, bOutRow) {
    let self = this;
    let rowArr = [];
    rows.forEach(rowEle => {
      let colArr = [];
      let rowStyle = self.getStyle_Edit("row", "", rowEle);
      let rowInnerStyle = self.getInnerStyle_Edit("row", "", rowEle);
      // if (bOutRow) {
      //   rowStyle.border = "0px";
      //   // rowStyle.padding = "2px";
      //   rowStyle.margin = "0px";
      //   rowStyle.width = '100%';

      //   // rowInnerStyle.border = "1px solid " + eChartCommon.panelDefaultValue.borderColor;
      //   // rowInnerStyle.padding = "2px";
      //   // rowInnerStyle.backgroundColor = "white";
      //   rowInnerStyle.width = '100%';
      //   rowInnerStyle.float = "left";
      // }
      rowEle.cols.forEach(colEle => {
        let colStyle;
        let colInnerStyle;
        let curCol;
        let content;
        let colNoBorder;
        let isTitleArea = colEle.isTitleArea ? colEle.isTitleArea : false;
        if (colEle.widgetType == "chart") {
          colStyle = self.getStyle_Edit("col", "control", colEle);
          colInnerStyle = self.getInnerStyle_Edit("col", "control", colEle);
          colNoBorder = colInnerStyle.border.indexOf("0px") == 0 || colInnerStyle.border.indexOf(" 0px") >= 0;
          content = self.getChartRender(colEle);
          curCol = <div
            className={
              "panelLayer2-col-inner panelLayer2-col-final "
              + self.addBorderClassName(colNoBorder)
            }
            style={colInnerStyle} >
            {content}
          </div>;
        }
        else if (colEle.widgetType == "rows") {
          colStyle = self.getStyle_Edit("col", "rows", colEle);
          colInnerStyle = self.getInnerStyle_Edit("col", "rows", colEle);
          colNoBorder = colInnerStyle.border.indexOf("0px") == 0 || colInnerStyle.border.indexOf(" 0px") >= 0;
          content = self.getRows(colEle.widgetValue, false);
          curCol = <div
            className={
              "panelLayer2-col-inner"
              + self.addBorderClassName(colNoBorder)
            }
            style={colInnerStyle} >
            {content}
          </div>;
        }
        else if (colEle.widgetType == "imagetext") {
          // curCol = self.getTextTitle(colEle.panelImageTextConfig);
          colStyle = self.getStyle_Edit("col", "control", colEle);
          colInnerStyle = self.getInnerStyle_Edit("col", "control", colEle);
          colNoBorder = colInnerStyle.border.indexOf("0px") == 0 || colInnerStyle.border.indexOf(" 0px") >= 0;
          if (colEle.panelImageTextConfig.subType == "logo") {
            colInnerStyle.position = "relative";
          }
          content = self.getImageText(colEle.panelImageTextConfig, colEle);
          curCol = <div
            className={
              "panelLayer2-col-inner panelLayer2-col-final "
              + self.addBorderClassName(colNoBorder)
            }
            style={colInnerStyle}
            id={colEle.colKey + "_div"}>
            {content}
          </div>;
        }
        else if (colEle.widgetType == "sum") {
          colStyle = self.getStyle_Edit("col", "control", colEle);
          colInnerStyle = self.getInnerStyle_Edit("col", "control", colEle);
          colNoBorder = colInnerStyle.border.indexOf("0px") == 0 || colInnerStyle.border.indexOf(" 0px") >= 0;
          if (colEle.sumConfig.subType == "count") {
            content = <EChartSumCountUp showIt={true} sumConfig={colEle.sumConfig} panelType={2}></EChartSumCountUp>;
          }
          else {
            content = <EChartSum showIt={true} sumConfig={colEle.sumConfig} panelType={2}></EChartSum>;
          }
          curCol = <div
            className={
              "panelLayer2-col-inner panelLayer2-col-final "
              + self.addBorderClassName(colNoBorder)
            }
            style={colInnerStyle}>
            {content}
          </div>;
        }
        else if (colEle.widgetType == "component") {
          colStyle = self.getStyle_Edit("col", "control", colEle);
          colInnerStyle = self.getInnerStyle_Edit("col", "control", colEle);
          colNoBorder = colInnerStyle.border.indexOf("0px") == 0 || colInnerStyle.border.indexOf(" 0px") >= 0;
          if (colEle.componentConfig.subType == "weather")
            content = <EChartWeather
              componentConfig={colEle.componentConfig}
              panelType={2}
            />;
          else if (colEle.componentConfig.subType == "datetime")
            content = <EChartDateTime componentConfig={colEle.componentConfig} panelType={2} />;
          curCol = <div
            className={
              "panelLayer2-col-inner panelLayer2-col-final "
              + self.addBorderClassName(colNoBorder)
            }
            style={colInnerStyle}>
            {content}
          </div>;
        }
        else if (colEle.widgetType == "none") {
          colStyle = self.getStyle_Edit("col", "control", colEle);
          colInnerStyle = self.getInnerStyle_Edit("col", "control", colEle);
          colStyle.display = "none";
          colNoBorder = colInnerStyle.border.indexOf("0px") == 0 || colInnerStyle.border.indexOf(" 0px") >= 0;
          content = <div className="panelLayer2-nocontrol">{self.state.isPreview ? " 无控件" : ""}</div>;
          curCol = <div
            className={
              "panelLayer2-col-inner panelLayer2-col-final "
              + self.addBorderClassName(colNoBorder)
            }
            style={colInnerStyle}>
          </div>;

        }
        else {
          colStyle = self.getStyle_Edit("col", "control", colEle);
          colInnerStyle = self.getInnerStyle_Edit("col", "control", colEle);
          colNoBorder = colInnerStyle.border.indexOf("0px") == 0 || colInnerStyle.border.indexOf(" 0px") >= 0;
          content = <div >未知控件</div>;
          curCol = <div
            className={"panelLayer2-col-inner panelLayer2-col-final "
              + self.addBorderClassName(colNoBorder)
            }
            style={colInnerStyle}>
            {content}
          </div>;
        }
        if (colStyle.padding == "0px" || colStyle.padding == "") {
          colArr.push(<Col
            className={"panelLayer2-col-outer panelLayer2-col-outer-nopadding"}
            style={colStyle}
          >
            {curCol}
          </Col>);
        }
        else {
          colArr.push(
            <Col
              className={"panelLayer2-col-outer panelLayer2-col-outer-haspadding"}
              style={colStyle}
            >
              {curCol}
            </Col>);
        }
      });
      let rowNoBorder = rowInnerStyle.border.indexOf("0px") == 0 || rowInnerStyle.border.indexOf(" 0px") >= 0;
      let isTitleArea_Row = rowEle.isTitleArea ? rowEle.isTitleArea : false;
      if (rowStyle.padding == "0px" || rowStyle.padding == "") {
        rowArr.push(<Row className={"panelLayer2-row-outer panelLayer2-row-outer-nopadding"} style={rowStyle} >
          <div className={"panelLayer2-row-inner " + self.addBorderClassName(rowNoBorder)} style={rowInnerStyle}>
            {colArr}
          </div>
        </Row>);
      }
      else {
        rowArr.push(
          <Row className={"panelLayer2-row-outer panelLayer2-row-outer-haspadding"} style={rowStyle} >
            <div className={"panelLayer2-row-inner " + self.addBorderClassName(rowNoBorder)} style={rowInnerStyle}>
              {colArr}
            </div>
          </Row>);
      }
    });
    return rowArr;
  }
  getSelectedCol(colKey) {
    let self = this;
    let rows = self.state.panelConfig.panelLayOutConfig.rows;
    let colsInfo = self.getColParentInfo(rows, colKey);
    let cols = colsInfo.cols;
    let colIndex = colsInfo.colIndex;
    if (cols && colIndex != undefined)
      return cols[colIndex];
    else
      return {};
  }
  getColParentInfo(rows, colKey) {
    let self = this;
    let obj = {}
    rows.forEach((rowEle, rowIndex) => {
      let curRow = [];
      rowEle.cols.forEach((colEle, colIndex) => {
        if (colEle.colKey === colKey) {
          // obj.col = colEle;
          obj.rows = rows;
          obj.rowIndex = rowIndex;
          obj.cols = rowEle.cols;
          obj.colIndex = colIndex;
        }
        else if (colEle.widgetType == "rows") {
          let obj2 = self.getColParentInfo(colEle.widgetValue, colKey);
          obj = _.isEmpty(obj2) ? obj : obj2;
        }
      }
      );
    });

    return obj;
  }
  getChartRender(colEle) {
    let self = this;
    let tmp = <div
      className='eChartPanel2-Chart'
      style={{ width: '100%' }}
    >
      <EChartDisplay
        chartDisplayType={"panel"}
        panelType={2}
        isPreview={self.state.isPreview}
        panelChartConfig={colEle.panelChartConfig}
        showIt={true}
      />
    </div>
    return tmp;
  }
  getChartEleByKey(rows, chartKey) {
    let self = this;
    let obj = undefined;
    rows.forEach(rowEle => {
      let curRow = [];
      rowEle.forEach(colEle => {
        if (colEle.widgetType == "chart" && colEle.panelChartConfig.chartKey === chartKey) {
          obj = colEle;
        }
        else if (colEle.widgetType == "rows") {
          if (obj === undefined) {
            obj = self.getChartEleByKey(colEle.widgetValue, chartKey);
          }
        }
      });
    });
    return obj;
  }
  goBack(e) {
    if (this.state.isPreview == true) {
      this.props.doFunc();
    }
  }
}
