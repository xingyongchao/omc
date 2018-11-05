import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Checkbox, Input, Icon } from 'antd';
import Row from '../basic/row';
import Col from '../basic/col';
import Table from '../basic/table'
import PortalSetting from './PortalSetting';
import Button from '../basic/button'
import * as portalactions from '../../redux/portal';
const CheckboxGroup = Checkbox.Group;


if (process.env.__CLIENT__ === true) {
  require('./role.less')
}
class Role extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authList: [],
      kbList: [],/*看板权限*/
      InputValues: { name: "", desc: "", code: "" },
      activeKey: 'default'
    };
    this.viewModel = cb.loader.initMetaCommonViewModel(
      'RoleViewModel',
      'roleViewModel',
      this.props.data.params,
      this.props.data.parentViewModel,
      ['refresh']
    );
    // this.
  }
  componentWillMount() {
    if (this.viewModel) {
      this.viewModel.addListener(this);
      const self = this;
      const gridModel = this.viewModel.getGridModel();
      gridModel.on('beforeCellValueChange', function (data) {
        switch (data.cellName) {
          case "execdiscount": {
            if (this.getCellValue(data.rowIndex, 'productclass_name')) //判断当前行产品大类是否填写
            {
              var length = this.getRows().length;
              for (var i = 0; i < length; i++) {
                if (i != data.rowIndex) {
                  if (self.booltostr(this.getCellValue(i, 'execdiscount')) == self.booltostr(data.value.value) && this.getCellValue(i, 'productclass') == this.getCellValue(data.rowIndex, 'productclass')) {
                    cb.utils.alert("[" + gridModel.getColumn("productclass_name").cShowCaption + "]与[" + gridModel.getColumn("execdiscount").cShowCaption + "]唯一性校验失败，请检查后重试！");
                    return false;
                  }
                }
              }
            }
            break;
          }
          case "productclass":
          case "productclass_name": {
            if (this.getCellValue(data.rowIndex, 'execdiscount')) //判断当前行执行会员折扣是否填写
            {
              var length = this.getRows().length;
              for (var i = 0; i < length; i++) {
                if (i != data.rowIndex) {
                  var StrField;
                  StrField = "id";
                  if (this.getCellValue(i, 'execdiscount') == this.getCellValue(data.rowIndex, 'execdiscount') && this.getCellValue(i, "productclass") == data.value[StrField]) {
                    cb.utils.alert("[" + gridModel.getColumn("productclass_name").cShowCaption + "]与[" + gridModel.getColumn("execdiscount").cShowCaption + "]唯一性校验失败，请检查后重试！");
                    return false;
                  }
                }
              }
            }
            break;
          }
          case "discountdlimit":
            if (data.value < 0 || data.value > 100 || data.value == '-') {
              cb.utils.alert("[" + gridModel.getColumn("discountdlimit").cShowCaption + "]只能录入0~100之间的数据，请检查后重试！");
              return false;
            }
            break;
          case "ratediscountdlimit":
            if (data.value < 0 || data.value > 100 || data.value == '-') {
              cb.utils.alert("[" + gridModel.getColumn("ratediscountdlimit").cShowCaption + "]只能录入0~100之间的数据，请检查后重试！");
              return false;
            }
            break;
        }
      });
    }
  }
  componentWillUnmount() {
    if (this.viewModel) {
      this.viewModel.removeListener(this);
      let gridModel = this.viewModel.getGridModel();
      gridModel.clear();
    }

  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.callback || nextProps.callback === this.props.callback) return;
    cb.utils.confirm(`确定要${nextProps.caption}么`, function () {
      nextProps.callback();
    });
  }
  booltostr = (value) => {
    var returnvalue = '';
    if (cb.utils.isEmpty(value)) return returnvalue;
    returnvalue = String(value).toLowerCase();
    return returnvalue;
  }
  initRole(data) {
    let authList = data.authes, kbList = data.kanbans;
    if (authList && authList.length > 0) {
      authList.forEach(ele => {
        ele.checked = false;
        if (!ele.children) return;
        ele.children.forEach(ele1 => {
          ele1.checked = false;
          if (!ele1.children) return;
          ele1.children.forEach(ele2 => {
            ele2.checked = false;
          })
        })
      });
    } else {
      authList = [];
    }
    if (kbList && kbList.length > 0) {
      kbList = [
        {
          name: "看板",
          children: kbList
        }
      ];
      kbList.forEach(ele => {
        ele.checked = false;
        if (!ele.children) return;
        ele.children.forEach(ele1 => {
          ele1.checked = false;
          if (!ele1.children) return;
          ele1.children.forEach(ele2 => {
            ele2.checked = false;
          })
        })
      });
    } else {
      kbList = [];
    }
    this.setState({ authList, kbList });
  }
  initRoleData(roleData) {
    const { roleportals } = roleData
    const settingDataSource = roleportals && roleportals.length ? JSON.parse(roleportals[0]) : null;
    let InputValues = this.state.InputValues;
    let authList = cb.utils.extend(true, [], this.state.authList);
    let kbList = cb.utils.extend(true, [], this.state.kbList);
    InputValues.name = roleData.name;
    InputValues.code = roleData.code;
    InputValues.desc = roleData.note;
    let auths = roleData.auths;
    let rolekanbans = roleData.rolekanbans;
    let rolediscounts = roleData.rolediscounts ? roleData.rolediscounts : [];
    if (auths && authList && authList.length > 0) {
      auths.forEach(function (ele) {
        const checkedAuth = ele.auth;
        let isFind = false;
        authList.forEach(ele => {
          if (!isFind) {/*已匹配*/
            if (ele.code == checkedAuth) {
              ele.checked = true;
              isFind = true;
            } else {
              if (ele.children) {
                ele.children.forEach(ele1 => {
                  if (ele1.code == checkedAuth) {
                    ele1.checked = true;
                    isFind = true;
                  } else {
                    if (ele1.children) {
                      ele1.children.forEach(ele2 => {
                        if (ele2.code == checkedAuth) {
                          ele2.checked = true;
                          isFind = true;
                        }
                      })
                    }
                  }
                })
              }
            }
          }
        })
      }, this);
    }
    if (rolekanbans && kbList && kbList.length > 0) {
      rolekanbans.forEach(function (ele) {
        const checkedAuth = ele.kanban;
        let isFind = false;
        kbList.forEach(ele1 => {
          if (!isFind) {/*已匹配*/
            if (ele1.children) {
              ele1.children.forEach(ele2 => {
                if (ele2.children) {
                  ele2.children.forEach(ele3 => {
                    if (ele3.id == checkedAuth) {
                      ele3.checked = true;
                      isFind = true;
                    }
                  })
                }

              })
            }

          }
        })
      }, this);
    }
    authList = this.setIndeterminate(authList);
    kbList = this.setIndeterminate(kbList);
    this.setState({ InputValues, settingDataSource, authList, rolediscounts, kbList });
  }
  rollBackClick(e) {
    const { portalactions, index } = this.props;
    portalactions.delItem(index);
    this.viewModel.execute('refresh');
  }
  getHeaderControl() {
    // return (
    //     <Row colCount={12} className='list-title-1'>
    //         <Col className='list-title-left' span={1}>
    //             <Button onClick={(e) => this.rollBackClick(e)} icon="rollback">返回</Button>
    //         </Col>
    //         {/*<Col className='list-title-right' span={10}>新增角色</Col>*/}
    //     </Row>

    // );
  }
  getBodyControl() {
    let { InputValues, activeKey, errCode, errName } = this.state;
    let values = InputValues;
    let bodyControl = []
    bodyControl.push(
      <Row colCount={12} className="roleRow">
        <label><Icon type='star' />角色编码</label>
        <Col span={5} className={errCode ? "width-400 err" : "width-400"}>
          <Input onChange={(e) => this.onInputChange(e, "code")} value={values.code} type="text" placeholder="请输入角色编码" />
        </Col>
        <Col span={4}>{errCode ? <div className="errInfo">角色编码必输</div> : ""}</Col>
      </Row>
    )
    bodyControl.push(
      <Row colCount={12} className="roleRow">
        <label><Icon type='star' />角色名称</label>
        <Col span={5} className={errName ? "width-400 err" : "width-400"}>
          <Input onChange={(e) => this.onInputChange(e, "name")} value={values.name} type="text" placeholder="请输入角色名称" />
        </Col>
        <Col span={4}>{errCode ? <div className="errInfo">角色名称必输</div> : ""}</Col>
      </Row>
    )
    bodyControl.push(
      <Row colCount={12} className="roleRow p-b-0">
        <label>角色描述</label>
        <Col span={5} className="width-400">
          <Input onChange={(e) => this.onInputChange(e, "desc")} value={values.desc} type="textarea" placeholder="请输入对角色的简单描述" />
          <span style={{ float: "right", color: "#e6e6e6" }}>100字以内</span>
        </Col>
        <Col span={4}></Col>
      </Row>
    )
    if (cb.rest.toolbarHotfix !== false)
      bodyControl.push(
        <Row colCount={12} className='roleRow'>
          <label>门户控件</label>
          <Col className='role-select' span={2}>
            <PortalSetting ref='setting' dataSource={this.state.settingDataSource} />
          </Col>
        </Row>
      )
    let authControl = this.getAuthControl();
    bodyControl.push(
      <Row colCount={12} className="roleRow function-limit">
        <label>权限</label>
        <Col className='role-select' span={10}>
          <div className="role-tabs clearfix">
            <div className="tabs-control">
              <div className={activeKey == 'default' ? 'role-tab-active' : ''} onClick={() => this.onTabsChange('default')}>功能权限</div>
              {cb.rest.toolbarHotfix !== false && <div className={activeKey == 'discount' ? 'role-tab-active' : ''} onClick={() => this.onTabsChange('discount')}>现场折扣权限</div>}
              {cb.rest.toolbarHotfix !== false && <div className={activeKey == 'kanban' ? 'role-tab-active' : ''} onClick={() => this.onTabsChange('kanban')}>看板权限</div>}
            </div>
            <div className="tabs-button">
              {
                activeKey == 'discount' ?
                  <Button icon="plus" model={this.viewModel.get('addRow')} onClick={this.addRow} value="增行" />
                  :
                  ""
              }
            </div>
          </div>
          {authControl}
        </Col>
      </Row>
    )
    return bodyControl;
  }
  onTabsChange = (activeKey) => {
    this.setState({ activeKey });
  }
  addRow = () => {
    this.viewModel.get('addRow').fireEvent('click', {});
  }
  onInputChange(e, type) {
    let InputValues = this.state.InputValues;
    let value = e.target.value;
    if (type == 'desc' && value.length > 100) {
      cb.utils.alert("最多支持100字哦！", 'warning');
      return
    }
    InputValues[type] = value;
    this.setState({ InputValues });
  }
  getAuthControl() {
    let { authList, activeKey, kbList } = this.state;
    let authControl = [];
    if (activeKey == 'default') {/*功能权限*/
      authList.forEach(function (ele) {
        let options = [], lastAuth = [];
        let second = ele.children ? ele.children : [];
        second.forEach(function (item) {
          let last = item.children ? item.children : [];
          lastAuth = [];
          last.forEach(function (item1) {
            lastAuth.push(
              <Checkbox checked={item1.checked} onChange={(e) => this.onChecked(e, item1.code, 'last', item1.parent)}>
                {item1.name}
              </Checkbox>
            );
          }, this);
          options.push(
            <Row >
              <div className='second-auth'>
                <Checkbox checked={item.checked} indeterminate={item.indeterminate} onChange={(e) => this.onChecked(e, item.code, 'second', item.parent)}>
                  {item.name}
                </Checkbox>
              </div>
              <div className='last-auth'>{lastAuth}</div>
            </Row>
          );
        }, this);
        authControl.push(
          <Row className='roleRow-2'>
            <div >
              <Checkbox checked={ele.checked} indeterminate={ele.indeterminate} onChange={(e) => this.onGroupChecked(e, ele.code)}><h4>{ele.name}</h4></Checkbox>
            </div>
            <div >{options}</div>
          </Row>
        );
      }, this);
    } else if (activeKey == 'discount') {/*现场折扣权限*/
      let gridModel = this.viewModel.getGridModel();
      let actions = { cControlType: 'Toolbar', controls: [{ cCaption: "删除", cControlType: "button", cItemName: "btnDelete", cShowCaption: "删除", iOrder: 3, iStyle: 0, icon: "shanchu1", key: "1902535" }] }
      let width = this.refs.roleAuth.clientWidth;
      width = width * 5 / 6;
      authControl = <Table action={actions} model={gridModel} width={width} height={450} listHeaderHeight={1} />
    } else {/*看板权限*/
      kbList.forEach(function (ele) {
        let options = [], lastAuth = [];
        let second = ele.children ? ele.children : [];
        second.forEach(function (item) {
          let last = item.children ? item.children : [];
          lastAuth = [];
          last.forEach(function (item1) {
            lastAuth.push(
              <Checkbox checked={item1.checked} onChange={(e) => this.onChecked(e, item1.id, 'last', item1.parent, "kanban")}>
                {item1.name}
              </Checkbox>
            );
          }, this);
          options.push(
            <Row >
              <div className='second-auth'>
                <Checkbox checked={item.checked} indeterminate={item.indeterminate} onChange={(e) => this.onChecked(e, item.type, 'second', item.parent, "kanban")}>
                  {item.name || item.typeName}
                </Checkbox>
              </div>
              <div className='last-auth'>{lastAuth}</div>
            </Row>
          );
        }, this);
        authControl.push(
          <Row className='roleRow-2'>
            <div >
              <Checkbox checked={ele.checked} indeterminate={ele.indeterminate} onChange={(e) => this.onGroupChecked(e, ele.code, "kanban")}><h4>{ele.name || ele.typeName}</h4></Checkbox>
            </div>
            <div >{options}</div>
          </Row>
        );
      }, this);
    }
    return authControl;
  }
  onGroupChecked(e, code, type) {
    let { authList, kbList } = this.state;
    let list = authList;
    if (type == 'kanban') list = kbList;
    let checked = e.target.checked;
    list.forEach(function (ele) {
      if (ele.code == code) {
        ele.checked = checked;
        if (checked) ele.indeterminate = false;
        let second = ele.children ? ele.children : [];
        second.forEach(function (ele1) {
          ele1.checked = checked;
          let last = ele1.children ? ele1.children : [];
          last.forEach(function (ele2) {
            ele2.checked = checked;
          })
        });
      }
    });
    list = this.setIndeterminate(list);
    if (type == 'kanban')
      this.setState({ "kbList": list });
    else
      this.setState({ "authList": list });
  }
  onChecked(e, code, level, parent, type) {
    let { authList, kbList } = this.state;
    let list = authList;
    if (type == 'kanban') list = kbList;
    let checked = e.target.checked;
    if (level == 'last') {
      list.forEach(ele => {
        let second = ele.children;
        if (second) {
          second.forEach(ele1 => {
            let last = ele1.children;
            if (last) {
              last.forEach(ele2 => {
                if (type == 'kanban') {
                  if (code == ele2.id) { ele2.checked = checked; }
                } else {
                  if (code == ele2.code) { ele2.checked = checked; }
                }
                if (!checked) ele1.checked = false;
              });
            } else {
              if (type == 'kanban') {
                if (ele1.id == code) ele1.checked = checked;
              } else {
                if (ele1.code == code) ele1.checked = checked;
              }
              if (!checked) ele.checked = false;
            }
          });
        } else {
          if (type == 'kanban') {
            if (ele.id == code) ele.checked = checked;
          } else {
            if (ele.code == code) ele.checked = checked;
          }
        }
      });
    } else {
      list.forEach(ele => {
        let second = ele.children;
        if (second) {
          second.forEach(ele1 => {
            let isEqual = false;
            if (type == 'kanban') {
              if (ele1.type == code) isEqual = true;
            } else {
              if (ele1.code == code) isEqual = true;
            }
            if (isEqual) {
              ele1.checked = checked;
              if (!checked) ele.checked = false;
              let last = ele1.children;
              if (last) {
                last.forEach(ele2 => {
                  ele2.checked = checked;
                });
              }
            }
          });
        } else {
          if (type == 'kanban') {
            if (ele.type == code) ele.checked = checked;
          } else {
            if (ele.code == code) ele.checked = checked;
          }
        }
      });
    }
    list = this.setIndeterminate(list);
    if (type == 'kanban')
      this.setState({ "kbList": list });
    else
      this.setState({ "authList": list });
  }
  setIndeterminate = (authList) => {
    authList.forEach(ele => {
      let second = ele.children;
      if (second) {
        let secondLen = second.length, checkedLen1 = 0, indet1 = 0;
        second.forEach(ele1 => {
          let last = ele1.children;
          if (last) {
            let lastLen = last.length, checkedLen2 = 0;
            last.forEach(ele2 => {
              if (ele2.checked) checkedLen2 += 1;
            });
            if (lastLen > checkedLen2 && checkedLen2 != 0) {
              ele1.indeterminate = true;
              ele1.checked = false;
            } else {
              if (lastLen == checkedLen2 && lastLen != 0) ele1.checked = true;
              ele1.indeterminate = false;
            }
          }
          if (ele1.checked) checkedLen1 += 1;
          if (ele1.indeterminate) indet1 += 1;
        });
        if (secondLen > checkedLen1 && (checkedLen1 != 0 || indet1 != 0)) {
          ele.indeterminate = true;
          ele.checked = false;
        } else {
          if (secondLen == checkedLen1) ele.checked = true;
          ele.indeterminate = false;
        }
      }
    })
    return authList;
  }
  getFooterControl() {
    let footerControl = (
      (this.props.data.params.mode != 'add') ?
        <Row colCount={12} className="bottom-toolbar">
          <Button type="primary" onClick={(e) => this.buttonClick(e, 'save')}>保存</Button>
          <Button type="default" onClick={(e) => this.buttonClick(e, 'cancel')}>取消</Button>
        </Row>
        :
        <Row colCount={12} className="bottom-toolbar">
          <Button type="primary" onClick={(e) => this.buttonClick(e, 'save')}>保存</Button>
          <Button type="primary" className="gray" onClick={(e) => this.buttonClick(e, 'saveAndAdd')}>保存并新增</Button>
          <Button type="default" onClick={(e) => this.buttonClick(e, 'cancel')}>取消</Button>
        </Row>
    );
    return footerControl;
  }
  buttonClick(e, type) {
    if (type == 'cancel') {
      this.rollBackClick();
      return
    }
    let { authList, kbList } = this.state;
    let InputValues = this.state.InputValues;
    if (InputValues.name == "" || InputValues.code == "") {
      let errCode = false, errName = false;
      if (InputValues.name == "") errName = true;
      if (InputValues.code == "") errCode = true;
      // cb.utils.alert("名称及编码必输！", "warning")
      this.setState({ errCode, errName });
      return
    }
    let gridData = this.viewModel.getGridModel().getData();
    for (var i = 0; i < gridData.length; i++) {
      let row = gridData[i];
      let discountdlimit = cb.utils.isEmpty(row.discountdlimit);
      let golddiscountulimit = cb.utils.isEmpty(row.golddiscountulimit);
      let ratediscountdlimit = cb.utils.isEmpty(row.ratediscountdlimit);
      if (discountdlimit && golddiscountulimit && ratediscountdlimit) {
        cb.utils.alert("折扣输入错误，三种折扣必须选择一种输入！", "warning")
        return
      }
    }
    let args = { "name": InputValues.name, "code": InputValues.code, "note": InputValues.desc, "auths": [], "rolekanbans": [] };
    if (this.props.data.params.mode != 'add') {
      args.id = this.props.data.params.id;
    }
    authList.forEach(function (ele) {
      if (ele.children) {/*存在二级权限*/
        if (ele.checked) {/*一级权限为选中态*/
          ele.children.forEach(ele1 => {
            if (ele1.children) {/*存在三级权限*/
              ele1.children.forEach(ele2 => {
                args.auths.push({ auth: ele2.code });
              });
            } else {/*不存在三级权限*/
              if (ele1.checked) args.auths.push({ auth: ele1.code });
            }
          });
        } else if (ele.indeterminate) {/*一级权限为半选中态*/
          ele.children.forEach(ele1 => {
            if (ele1.checked) {/*二级权限为选中态*/
              if (ele1.children) {/*存在三级权限*/
                ele1.children.forEach(ele2 => {
                  args.auths.push({ auth: ele2.code });
                });
              } else {/*不存在三级权限*/
                if (ele1.checked) args.auths.push({ auth: ele1.code });
              }
            } else if (ele1.indeterminate) {/*二级权限为半选中态*/
              if (ele1.children) {/*存在三级权限*/
                ele1.children.forEach(ele2 => {
                  if (ele2.checked) args.auths.push({ auth: ele2.code });
                });
              } else {/*不存在三级权限*/
                if (ele1.checked) args.auths.push({ auth: ele1.code });
              }
            }
          });
        }
      } else {/*不存在二级权限*/
        if (ele.checked) args.auths.push({ auth: ele.code });
      }
    }, this);
    kbList.forEach(function (ele) {
      if (ele.children) {/*存在二级权限*/
        if (ele.checked) {/*一级权限为选中态*/
          ele.children.forEach(ele1 => {
            if (ele1.children) {/*存在三级权限*/
              ele1.children.forEach(ele2 => {
                args.rolekanbans.push({ kanban: ele2.id });
              });
            }
          });
        } else if (ele.indeterminate) {/*一级权限为半选中态*/
          ele.children.forEach(ele1 => {
            if (ele1.checked) {/*二级权限为选中态*/
              if (ele1.children) {/*存在三级权限*/
                ele1.children.forEach(ele2 => {
                  args.rolekanbans.push({ kanban: ele2.id });
                });
              }
            } else if (ele1.indeterminate) {/*二级权限为半选中态*/
              if (ele1.children) {/*存在三级权限*/
                ele1.children.forEach(ele2 => {
                  if (ele2.checked) args.rolekanbans.push({ kanban: ele2.id });
                });
              }
            }
          });
        }
      }
    }, this);
    const setting = this.refs.setting && this.refs.setting.getData();
    if (setting)
      args.layouts = [{ layout: JSON.stringify(setting) }];
    this.viewModel.get('save').fireEvent('click', { type, args });
    this.setState({
      InputValues: { name: "", desc: "", code: "" },
      settingDataSource: [{ "title": "营业概览", "order": 0, "showIcon": false }, { "title": "销售排行", "order": 1, "showIcon": false }, { "title": "门店销售趋势", "order": 2, "showIcon": false }]
    });
  }
  getControl() {
    let header = this.getHeaderControl();
    let body = this.getBodyControl();
    let footer = this.getFooterControl();
    return (
      <div className="roleControl footerFixed">
        <div className="roleHeader">{header}</div>
        <div className="roleBody" ref="roleAuth">{body}</div>
        <div className="">{footer}</div>
      </div>
    )
  }
  render() {
    let control = this.getControl();
    return control;
  }
};

function mapStateToProps(state) {
  return {

  }
}

function mapDispatchToProps(dispatch) {
  return {
    portalactions: bindActionCreators(portalactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Role);
