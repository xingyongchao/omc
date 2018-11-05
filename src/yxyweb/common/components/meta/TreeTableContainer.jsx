import React, { Component } from 'react';
import { TreeTable } from '../basic';

export default class TreeTableContainer extends Component {
  constructor(props) {
    super(props);
    const columns = {};
    const controls = props.meta.controls ? props.meta.controls : null;
    if (controls) {
      controls.forEach(column => {
        columns[column.cItemName] = column;
      })
    }
    this.state = {
      height: props.height,
      columns
    };
  }
  render() {
    const { meta, viewModel, height, width } = this.props;
    const controlModel = viewModel.get(meta.cCode);
    let toolbarMeta = null;
    if (meta.containers && meta.containers[0])
      toolbarMeta = meta.containers[0];
    return (
      <TreeTable model={controlModel} columns={this.state.columns} code={meta.cGroupCode} actionMeta={toolbarMeta} width={width} height={height} />
    );
  }
}
