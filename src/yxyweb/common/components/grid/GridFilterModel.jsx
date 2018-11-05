import React from 'react';
import { Checkbox, Popover, Icon } from 'antd';
import {
  Row, Col, Button, Input, InputNumber,
  DatePicker, Select, Refer, Switch, label
} from '../basic';

export default class GridFilterModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible,
      bshowpop: false,
    };
    this.sorttext = '';
  }
  componentWillReceiveProps(nextProps) {

  }
  onMouseEnter(e) {
    let fixedtableState = this.props.fixedtable ? this.props.fixedtable.state : null;
    if (fixedtableState && fixedtableState.isColumnResizing) return
    this.setState({
      bshowpop: true
    });
  }
  onMouseLeave(e) {
    let fixedtableState = this.props.fixedtable ? this.props.fixedtable.state : null;
    if (fixedtableState && fixedtableState.isColumnResizing) return
    if (!this.state.visible) {
      this.setState({
        bshowpop: false
      });
    }
  }
  //表头排序点击事件
  filterClick(key) {
    var filterdata = { sort: '', key, search: '', filter: [] };
    var cItemName = this.props.Column.cItemName;
    if (key === 'ASC') {
      this.sorttext = 'DESC';
      filterdata.sort = 'DESC';
    } else if (key == 'DESC') {
      this.sorttext = 'ASC';
      filterdata.sort = 'ASC';
    } else {
      if (this.sorttext == 'DESC') {
        this.sorttext = 'ASC';
        filterdata.sort = 'ASC';
      } else if (this.sorttext == '' || this.sorttext == 'init') {
        this.sorttext = 'DESC';
        filterdata.sort = 'DESC';
      } else {/*恢复*/
        this.sorttext = 'init';
        filterdata.sort = 'init';
        cItemName = "";
      }
    }
    this.props.onSortChange(cItemName);
    this.setState({
      bshowpop: false
    });
    this.props.model.setFilter(this.props.attr, this.props.Column, filterdata);
  }
  //表头 升序 降序 无序 组织
  Sort(bSort) {
    let upClass = '', downClass = '', display = 'none';
    if (this.sorttext == 'DESC') {
      upClass = 'ant-btn-icon-active';
    }
    if (this.sorttext == 'ASC') {
      downClass = 'ant-btn-icon-active';
    }
    if (this.state.bshowpop && this.props.readOnly)
      display = 'block';
    if (bSort) display = 'block';
    return (
      <div className='btn-caret' style={{ "display": display }}>
        <Button className={upClass} style={{ borderWidth: 0 }} type="ghost" icon="caret-up" onClick={() => this.filterClick('ASC')} />
        <Button className={downClass} style={{ borderWidth: 0 }} type="ghost" icon="caret-down" onClick={() => this.filterClick('DESC')} />
      </div>
    )
  }
  getStringLength = (str) => {
    if (!str) str = '';
    let realLength = 0, len = str.length, charCode = -1;
    for (var i = 0; i < len; i++) {
      charCode = str.charCodeAt(i);
      if (charCode >= 0 && charCode <= 128) {
        realLength += 1;
      } else {
        realLength += 2;
      }
    }
    return realLength
  }
  render() {
    let control, Column = this.props.Column;
    var bSort = this.props.sortColumn == Column.cItemName ? true : false;
    var Sort = this.Sort(bSort);
    let bIsNull = Column.bIsNull;
    const id = Column.index;
    let textColWidth = this.props.width - 25;
    let nameLen = this.getStringLength(this.props.name);
    if (textColWidth > nameLen * 6.5) {
      textColWidth = nameLen * 6.5;
      if (bIsNull == false && !this.props.readOnly) textColWidth += 9;
    }
    let headerName = this.props.name;
    if (!bIsNull && this.props.readOnly != true) {
      headerName = <div><span className="headerNameTips">* </span>{this.props.name}</div>;
    }
    if (bSort) {
      control = (
        // <div style={{ textAlign: 'left', width: this.props.width, display: "flex" }} id={id}>
        //   <span style={{ width: textColWidth }} onClick={() => this.filterClick('')} className="textCol table-header-name">{headerName}</span>
        //   {Sort}
        // </div>
        <div style={{ textAlign: 'left', width: this.props.width, display: "flex" }} id={id}>
        <span onClick={() => this.filterClick('')} className="textCol table-header-name">{headerName}</span>
        {Sort}
      </div>
      );
    } else {
      control = (
        // bshowpop && this.props.readOnly ?
        // <div style={{ textAlign: 'left', width: this.props.width, display: "flex" }} onMouseEnter={(e) => this.onMouseEnter(e)} onMouseLeave={(e) => this.onMouseLeave(e)} id={id}>
        //   <span style={{ width: textColWidth }} onClick={() => this.filterClick('')} className="textCol table-header-name sort-header">{headerName}</span>
        //   {Sort}
        // </div>
        // :
        // <div style={{ textAlign: 'left', width: this.props.width }} onMouseEnter={(e) => this.onMouseEnter(e)} onMouseLeave={(e) => this.onMouseLeave(e)} id={id}>
        //   <div className="textCol table-header-name sort-header" onClick={() => this.filterClick('')} >{headerName}</div>
        // </div>
        <div style={{ textAlign: 'left', width: this.props.width, display: "flex" }} onMouseEnter={(e) => this.onMouseEnter(e)} onMouseLeave={(e) => this.onMouseLeave(e)} id={id}>
        <span onClick={() => this.filterClick('')} className="textCol table-header-name sort-header">{headerName}</span>
        {Sort}
      </div>
      );
    }
    if (this.props.tableClass == 'rptTable' || !this.props.multiSort) {
      control = (
        <div style={{ textAlign: 'left', width: this.props.width }}>
          <div className="textCol table-header-name">{headerName}</div>
        </div>
      );
    }
    return control;
  }
}
