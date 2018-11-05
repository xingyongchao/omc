import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Input, Icon, Tag } from 'antd';
import Label from '../basic/label';

import * as formulaActions from '../../redux/formula';

const TextArea = Input.TextArea;

class Operator extends Component {
  render() {
    const { dataSource } = this.props;
    if (!dataSource || !dataSource.length)
      return null;
    const items = [];
    dataSource.forEach(item => {
      const { key, value } = item;
      items.push(<Tag key={key} onClick={() => this.props.onClick(key)}>{value}</Tag>);
    });
    return (
      <div>{items}</div>
    );
  }
}

class RightContent extends Component {
  componentDidMount() {
    this.props.formulaActions.initOperator();
  }
  onCaptionChange = (e) => {
    this.props.formulaActions.changeCaption(e.target.value);
  }
  onChange = (e) => {
    this.props.formulaActions.change(e.target.value, e.target.selectionStart);
  }
  onFocus = () => {
    setTimeout(() => {
      const input = findDOMNode(this.input);
      this.props.formulaActions.focus(input.selectionStart);
    }, 0);
  }
  handleOperatorSelect = (key) => {
    this.props.formulaActions.selectOperator(key);
  }
  getControl(control, caption, required) {
    const title = required ? <label><Icon type='star' />{caption}</label> : <label>{caption}</label>;
    return (
      <Label control={control} title={title} />
    );
  }
  render() {
    const { operatorData, caption, expression, errorInfo } = this.props.formula;
    const columnNameCom = <Input value={caption} onChange={this.onCaptionChange} />
    const operatorCom = <Operator dataSource={operatorData} onClick={this.handleOperatorSelect} />
    const expressionCom = <TextArea ref={node => this.input = node} onFocus={this.onFocus} value={expression} onChange={this.onChange} />
    return (
      <div>
        {this.getControl(columnNameCom, '栏目名称', true)}
        {this.getControl(operatorCom, '运算符')}
        <div className="formula-editing">
          {this.getControl(expressionCom, '编辑区', true)}
          <label className="error">{errorInfo}</label>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    formula: state.formula.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    formulaActions: bindActionCreators(formulaActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RightContent);
