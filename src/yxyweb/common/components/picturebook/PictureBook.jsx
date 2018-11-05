import React from 'react';
import { Upload, Progress, Icon, Badge, Modal, Pagination, Button } from 'antd';
import SvgIcon from 'SvgIcon';

if (process.env.__CLIENT__ === true) {
  require('./PictureBook.less')
}
export default class PictureBook extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      fileType: props.fileType || 'img',
      bill2ReferKeyFieldMap: props.bill2ReferKeyFieldMap || {},
      readOnly: false,
      percent: 0,
      showModal: false,
      current: 1,
      picIndex: 0,
    };
    this.DocumentServerAddress = 'https://oivs4lxfc.bkt.clouddn.com';
    var proxy = cb.rest.DynamicProxy.create({
      getFileServerUrl: {
        url: '/pub/fileupload/getFileServerUrl',
        method: 'GET',
        options: {
          token: true
        }
      }
    });
    proxy.getFileServerUrl({}, function (err, result) {
      if (!err)
        this.DocumentServerAddress = result;
    }, this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.model) {
      if (!this.props.model) {
        nextProps.model.addListener(this);
        this.setValue(nextProps.model.getValue());
      } else {
        return;
      }
    } else {
      let bill2ReferKeyFieldMap = nextProps.bill2ReferKeyFieldMap || this.state.bill2ReferKeyFieldMap;
      let fileList = [];
      if (this.props.model) {
        this.props.model.removeListener(this);
        if (nextProps.dataSource)
          fileList = this.transferBill2Refer(nextProps.dataSource, bill2ReferKeyFieldMap);
        this.setState({
          fileList,
          bill2ReferKeyFieldMap
        });
      } else {
        if (nextProps.dataSource)
          fileList = this.transferBill2Refer(nextProps.dataSource, bill2ReferKeyFieldMap);
        this.setState({
          fileList,
          bill2ReferKeyFieldMap,
          readOnly: nextProps.readOnly
        });
      }
    }
  }
  componentDidMount() {
    if (this.props.model)
      this.props.model.addListener(this);
  }
  componentWillUnmount() {
    if (this.props.model)
      this.props.model.removeListener(this);
  }
  setListenerState(params, propertyName) {
    let showValue = params.showValue;
    if (showValue && showValue.length > 0) {
      params.fileList = this.transferBill2Refer(showValue, params.bill2ReferKeyFieldMap);
    }
    this.setState(params);
  }
  setValue(value) {
    const fileList = this.transferBill2Refer(value, this.state.bill2ReferKeyFieldMap);
    this.setState({ fileList });
  }
  transferBill2Refer = (value, bill2ReferKeyFieldMap) => {
    if (!value) return [];
    var newValue = [];
    value.forEach(function (item, index) {
      var referItem = {};
      for (var billKey in bill2ReferKeyFieldMap)
        referItem[bill2ReferKeyFieldMap[billKey]] = item[billKey];
      newValue.push(referItem);
    });
    return newValue;
  };
  /*上传改变事件*/
  _fielUploadOnChange = (info) => {
    let { fileList, replaceIndex, onReplace, bill2ReferKeyFieldMap, current } = this.state;
    let file = {};
    let isExists = this._isExists(info.file.uid);
    let num = this._getNumByUid(info.file.uid);
    /*上传中状态*/
    if (info.file.status === 'uploading') {
      /*更新上传文件进度*/
      if (fileList.length <= 0 || !isExists) {
        file.percent = info.file.percent;
        file.name = info.file.name;
        file.id = info.file.uid;
        file.type = info.file.type;
        if (onReplace)
          fileList[replaceIndex] = file;
        else
          fileList.push(file);
      } else {
        if (num != -1) {
          if (!info.file.percent) {
            cb.utils.loadingControl.end();
            fileList[num].percent = 100;
          } else {
            fileList[num].percent = info.file.percent;
          }
          fileList[num].size = info.file.size;
        }
      }
      let pageIndex = Math.ceil(fileList.length / 10);
      this.setState({
        fileList,
        percent: info.file.percent,
        current: pageIndex
      });
    }
    /*上传完成状态*/
    if (info.file.status === 'done') {
      if (info.file.response.code == 200) {
        /*上传完成，更新上传文件信息*/
        if (num != -1) {
          fileList[num].size = info.file.size;
          fileList[num].id = info.file.uid;
          fileList[num].address = this.DocumentServerAddress + info.file.response.data;
        }
        this.setState({
          fileList,
          percent: 0
        });

        cb.utils.alert(`${info.file.name} 上传成功！`, 'success');
        cb.utils.loadingControl.end();
        if (onReplace) {
          if (this.props.model) {
            let cellValues = [];
            for (var key in bill2ReferKeyFieldMap) {
              let newKey = bill2ReferKeyFieldMap[key];
              cellValues.push({
                index: replaceIndex,
                cellName: key,
                cellValue: fileList[replaceIndex][newKey]
              })
            }
            if (this.props.model)
              this.props.model.setCellValues(cellValues);
          }
          this.setState({
            onReplace: false
          })
        } else {
          if (this.props.model)
            this.props.model.setValue(fileList, true);
        }

      } else {
        /*上传失败删除上传文件*/
        cb.utils.loadingControl.end();
        fileList.pop();
        this.setState({
          fileList,
          percent: 0
        });
        cb.utils.alert(`${info.file.name} 上传失败！${info.file.response.code} : ${info.file.response.message}`, 'error');
      }
    }
    /*上传出错状态*/
    if (info.file.status === 'error') {
      cb.utils.alert(`${info.file.name} 上传失败！${info.file.response.code} : ${info.file.response.message}`, 'error');
    }
  }
  /*根据uid获取上传列表对应序号*/
  _getNumByUid = (id) => {
    let fileList = this.state.fileList;
    for (var i = 0; i < fileList.length; i++) {
      if (fileList[i].id == id) {
        return i;
      }
    }
    return -1;
  }
  /*判断函数，是否已存在在上传完成列表中*/
  _isExists = (id) => {
    var isExists = false;
    let fileList = this.state.fileList;
    for (var i = 0; i < fileList.length; i++) {
      if (fileList[i].id == id) {
        isExists = true;
        break;
      }
    }
    return isExists;
  }
  /*显示已上传文件/图片的列表*/
  _fileListControl = (fileType) => {
    if (this.state.fileList.length == 0 && this.state.readOnly) {
      return <div className="upload-nodata"><Icon type={fileType == "file" ? "noFile" : "noPic"} /><span>{fileType == "file" ? "暂无附件~" : "暂无图片~"}</span></div>
    }
    return <FileList arrowImg={this._arrowImg} DelFile={this._DelFile} colCount={this.state.colCount} fileType={fileType} fileList={this.state.fileList} readOnly={this.state.readOnly} mode={this.state.mode} />
  }
  /*删除已上传文件*/
  _DelFile = (index) => {
    if (this.props.model)
      this.props.model.deleteItem(index);
  }
  /*上传前事件*/
  _beforeUpload = (file, uploadFileList) => {
    cb.utils.loadingControl.start();
    cb.utils.alert('上传中~请稍后！', 'success');
  }
  onOk = () => {
    this.setState({ showModal: false });
  }
  onCancel = () => {
    this.setState({ showModal: false });
  }
  onBigCancel = () => {
    this.setState({ showDetailModal: false, picIndex: 0 });
  }
  showPicModel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.onClick();
    this.setState({
      showModal: true
    })
  }
  onOpenDetail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ showDetailModal: true });
  }
  onDelete = (e) => {
    this.onClick();
    e.preventDefault();
    e.stopPropagation();
    const fileList = this.state.fileList;
    let indexes = [];
    fileList.map((file, index) => {
      indexes.push(index);
    });
    if (this.props.model) {
      this.props.model.deleteItems(indexes)
    } else {
      if (this.props.onDelete)
        this.props.onDelete(indexes);
    }
  }
  onPicDelete = (e, index) => {
    if (this.props.model)
      this.props.model.deleteItem(index)
  }
  onReplace = (e, index) => {
    this.setState({
      onReplace: true,
      replaceIndex: index
    });
  }
  onChangePagination = (page, pageSize) => {
    this.setState({
      current: page
    })
  }
  onClick = () => {
    if (this.props.onClick)
      this.props.onClick();
  }
  onLeftClick = () => {
    if (this.state.picIndex == 0) return;
    this.setState({
      picIndex: this.state.picIndex - 1
    });
  }
  onRightClick = () => {
    if (this.state.picIndex == this.state.fileList.length - 1) return;
    this.setState({
      picIndex: this.state.picIndex + 1
    });
  }
  _getControl = () => {
    const { fileList } = this.state;
    let readOnly = false, count = fileList.length;
    if (this.state.mode == 'browse' || this.state.readOnly) readOnly = true;
    let control = null, style = {};
    if (count == 0) {/*无数据*/
      if (readOnly) {
        control = (
          <Badge count={count}>
            <div className="pictureBook readOnly">
              <div className='pictureRow'></div>

            </div>
          </Badge>
        )
      } else {
        let tempControl = (
          <div className="pictureBook " onClick={this.onClick}>
            <div className='pictureRow'></div>
            <SvgIcon type="shangchuantupian" />
            <p>上传图片</p>
          </div>
        )
        control = this.getUploadControl(tempControl);
      }
    } else {/*存在上传数据*/
      if (readOnly) {
        control = (
          <Badge count={count}>
            <div className="pictureBook " onClick={this.onClick}>
              <div className='pictureImg'><img onClick={this.showPicModel} src={this.state.fileList[0].address} /></div>
            </div>
          </Badge >
        )
      } else {
        let tempControl = (
          <Badge count={count}>
            <div className="pictureBook " onClick={this.onClick}>
              <div className='pictureRow'></div>
              <div className='pictureImg'><img onClick={this.showPicModel} src={this.state.fileList[0].address} /></div>
              <div className="fileBtn">
                <a className={'upload'}>
                  <Icon type="uploadImg" />
                </a>
                <a onClick={this.onOpenDetail} className={'search'}>
                  <Icon type="search" />
                </a>
                <a onClick={this.onDelete} className={'delete'}>
                  <Icon type="delete" />
                </a>
              </div>
              <div className='Progress'>
                {(this.state.percent && this.state.percent != 100) ?
                  <Progress percent={this.state.percent} strokeWidth={5} />
                  :
                  null}
              </div>
            </div>
          </Badge >
        )
        control = this.getUploadControl(tempControl);
      }
    }
    return control
  }
  getModalControl = () => {
    const { fileList, current, bPaginationChange } = this.state;
    let control = [];
    let startIndex = 0, len = fileList.length, endIndex = len;
    // let pageIndex = Math.ceil(len / 10);
    // if (pageIndex != current && !bPaginationChange)
    //   this.setState({ current: pageIndex });

    if (len > 10) {
      if (current == 1) {
        endIndex = 10;
      }
      if (current > 1) {
        startIndex = (current - 1) * 10;
        endIndex = current * 10;
        if (endIndex > len)
          endIndex = len;
      }
    }
    for (var i = startIndex; i < endIndex; i++) {
      let j = i;
      let buttonControl = (
        <a onClick={e => this.onReplace(e, j)} className={'replace'}>替换</a>
      )
      let tempControl = this.getUploadControl(buttonControl);
      control.push(
        <div className="list-col">
          <div className="pictureBook">
            <div className='pictureImg'><img src={fileList[i].address} /></div>
            <div className="fileBtn">
              {tempControl}
              <a onClick={e => this.onPicDelete(e, j)} className={'delete'}>
                <Icon type="delete" />
              </a>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="pictureBook-list">
        <div className="list-row">
          {control}
        </div>
        {
          len > 10 ?
            <div className="pagination-new"><Pagination pageSize={10} current={current} total={fileList.length} onChange={this.onChangePagination} /></div>
            : ""
        }
      </div>
    )
  }
  getBigModalControl = () => {
    const { fileList, picIndex } = this.state;
    const len = fileList.length - 1;
    return (
      <div className='picture-big'>
        <a className={picIndex == 0 ? "pic-left pic-left-disabled" : "pic-left"}
          onClick={this.onLeftClick}><Icon type="left" /></a>
        {fileList[picIndex] ? <img src={fileList[picIndex].address} /> : null}
        <a className={picIndex == len ? "pic-right pic-right-disabled" : "pic-right"}
          onClick={this.onRightClick}><Icon type="right" /></a>
      </div>
    )
  }
  getUploadControl = (control) => {
    let action = '/upload?token=' + cb.rest.AppContext.token;
    let accept = '';
    if (this.state.fileType == 'img') accept = 'image/gif,image/jpeg,image/png,image/x-ms-bmp';
    return (
      <Upload
        showUploadList={false}
        action={action}
        onChange={this._fielUploadOnChange}
        multiple={false}
        accept={accept}
        beforeUpload={this._beforeUpload}
      >
        {control}
      </Upload >
    )
  }
  render() {
    let control = this._getControl();
    let modalControl = this.getModalControl();
    let bigModalControl = this.getBigModalControl();
    let buttonControl = (
      <Button key="upload" onClick={this.handleModify}>
        <SvgIcon className="plus-copy" type="shangchuanbeijingtu" />
        上传图片
        </Button>
    )
    let uploadControl = this.getUploadControl(buttonControl);
    const title = (
      <div className="model-header">
        <div className="modelTitle">图册</div>
        {this.state.readOnly ? "" : uploadControl}
      </div>
    );
    return (
      <div className='upload-picture-book clearfix'>
        {control}
        <Modal title={title} width={750} visible={this.state.showModal} className="picture-book-modal"
          onOk={this.onOk} onCancel={this.onCancel} okText="确认" cancelText="取消" maskClosable={false}
        >
          {modalControl}
        </Modal>
        <Modal width={600} visible={this.state.showDetailModal} className="picture-big-modal"
          footer={null} maskClosable={false} onCancel={this.onBigCancel}
        >
          {bigModalControl}
        </Modal>
      </div>
    )
  }
}
