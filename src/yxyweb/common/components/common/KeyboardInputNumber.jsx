import React, { Component } from 'react';
import { InputNumber, Popover } from 'antd';
import InputButtonPanel from './InputButtonPanel';

export default class keyboardInputNumber extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }
  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }
  onOk = () => {
    this.props.onPressEnter();
    this.setState({ visible: false });
  }
  render() {
    const { value, onChange } = this.props;
    return (
      <div className="billing-inputpanel">
        <Popover trigger="click" onVisibleChange={this.handleVisibleChange} visible={this.state.visible} placement="bottom" content={<InputButtonPanel showOk mode='text' value={value} onChange={onChange} onOk={this.onOk} />} overlayClassName="inputpanel-pop touch-single-payment">
          <InputNumber {...this.props} />
        </Popover>
      </div>
    );
  }
}
