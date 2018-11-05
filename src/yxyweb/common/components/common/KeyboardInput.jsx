import React, { Component } from 'react';
import Keyboard from '../keyboard';
import '../keyboard/Keyboard.css';

export default class keyboardInput extends Component {
  render() {
    return (
      <div className="keyboard-box">
        {this.props.prefix}
        <Keyboard
          enabled
          required
          type={this.props.type}
          onChange={this.props.onChange}
          onBlur={this.props.onBlur}
          onFocus={this.props.onFocus}
          value={this.props.value}
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          name={this.props.name}
          inputClassName={this.props.inputClassName}
          keyboardClassName={this.props.keyboardClassName}
          placeholder={this.props.placeholder}
          defaultKeyboard='us'
          isFirstLetterUppercase={false}
          isDraggable={false} // optional, default is `true`
          readOnly={this.props.readOnly} // optional
          opacity={1} // optional
        />
      </div>
    );
  }
}
