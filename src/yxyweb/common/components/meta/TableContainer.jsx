import React, { Component } from 'react';
// import { Table } from '../basic';

import env from '../../helpers/env';
let Table = null;

export default class TableContainer extends Component {
  constructor(props) {
    super(props);
    Table = env.INTERACTIVE_MODE === 'touch' ? require('../grid-touch').default : require('../basic/table').default;
    const { meta, viewModel } = props;
    const { controls, cGroupCode, containers, childrenField, cCode } = meta;
    const columns = {};
    if (controls) {
      const { billNo } = viewModel.getParams();
      controls.forEach(column => {
        const { cItemName } = column;
        column.index = `${billNo}|${cGroupCode}|${cItemName}`;
        columns[cItemName] = column;
      })
    }
    const actions = containers && containers.length ? containers[0] : null;
    if (actions && actions.controls) {
      actions.controls.forEach(item => {
        if (!item.cParameter) return;
        try {
          const config = JSON.parse(item.cParameter);
          config.model = viewModel.get(item.cItemName);
          Object.assign(item, config);
        } catch (e) {

        }
      });
    }
    const controlModel = viewModel.get(childrenField || cCode);
    controlModel.setCache('actions', actions && actions.controls || []);
    this.state = {
      listHeaderHeight: 0,
      controlModel,
      columns,
      actions,
      height: props.height
    };
  }
  componentDidMount() {
    this.props.viewModel.on('listHeaderHeightUpdate', height => {
      this.setState({ height: this.props.height - height, listHeaderHeight: height });
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.height != nextProps.height) {
      this.setState({ height: nextProps.height - this.state.listHeaderHeight });
    }
  }
  render() {
    const { meta, width } = this.props;
    const style = meta.cStyle ? JSON.parse(meta.cStyle) : {};
    const tableWidth = style.width || width;
    const { controlModel, columns, actions, height, listHeaderHeight } = this.state;
    return (
      <Table
        width={tableWidth}
        height={height}
        listHeaderHeight={listHeaderHeight}
        code={meta.cGroupCode}
        action={actions}
        columns={columns}
        style={style}
        model={controlModel} />
    );
  }
}
