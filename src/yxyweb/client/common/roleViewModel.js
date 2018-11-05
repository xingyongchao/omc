cb.viewmodels.register('RoleViewModel', function (modelType) {
  var model = function (data) {
    cb.models.ContainerModel.call(this, data);
    this.init();
  };
  model.prototype = cb.utils.getPrototype(cb.models.ContainerModel.prototype);
  model.prototype.modelType = modelType;

  model.prototype.init = function () {
    var fields = {
      // params: { "billNo": "sys_rolelist" },
      schemeName: new cb.models.SimpleModel({ bMustSelect: true }),
      isDefault: new cb.models.SimpleModel({ value: false }),
      save: new cb.models.SimpleModel({ needClear: false }),
      search: new cb.models.SimpleModel({ needClear: false }),
      addScheme: new cb.models.SimpleModel({ needClear: false }),
      schemeMenu: new cb.models.SimpleModel({ needClear: false }),
      addRow: new cb.models.SimpleModel({ needClear: false }),
      btnDelete: new cb.models.SimpleModel({ needClear: false }),
      discountAuth: new cb.models.GridModel({
        "columns": {
          "id": {
            "cFieldName": "id",
            "cItemName": "id",
            "cCaption": "id",
            "cShowCaption": "id",
            "iBillEntityId": 53238,
            "iBillTplGroupId": 463933,
            "iTplId": 44602,
            "iFieldType": 1,
            "bEnum": false,
            "bMustSelect": true,
            "bHidden": true,
            "bCanModify": false,
            "iColWidth": 150,
            "bShowIt": false,
            "bFilter": false,
            "bIsNull": true,
            "cTplGroupName": "现场折扣数据",
            "bMain": false,
            "cDataSourceName": "base.user.UserDiscount",
            "cParentDataSource": "base.user.User",
            "cControlType": "Input",
            "bVmExclude": 0
          },
          "productclass": {
            "cFieldName": "productclass",
            "cItemName": "productclass",
            "cCaption": "商品类别id",
            "cShowCaption": "商品类别id",
            "iBillEntityId": 53238,
            "iBillTplGroupId": 463933,
            "iTplId": 44602,
            "iFieldType": 1,
            "bEnum": false,
            "bMustSelect": true,
            "bHidden": true,
            "bCanModify": false,
            "iColWidth": 150,
            "bShowIt": false,
            "bFilter": false,
            "bIsNull": true,
            "cTplGroupName": "现场折扣数据",
            "bMain": false,
            "cDataSourceName": "base.user.UserDiscount",
            "cParentDataSource": "base.user.User",
            "cControlType": "Input",
            "bVmExclude": 0
          },
          "productclass_name": {
            "cFieldName": "productclass.name",
            "cItemName": "productclass_name",
            "cCaption": "商品类别",
            "cShowCaption": "商品类别",
            "iBillEntityId": 53238,
            "iBillTplGroupId": 463933,
            "iTplId": 44602,
            "iFieldType": 1,
            "bEnum": false,
            "bMustSelect": true,
            "bHidden": false,
            "cRefType": "aa_productclass",
            "cRefRetId": "{\"productclass\":\"id\"}",
            "bCanModify": true,
            "iColWidth": 150,
            "bShowIt": true,
            "bFilter": false,
            "bIsNull": true,
            "cTplGroupName": "现场折扣数据",
            "bMain": false,
            "cDataSourceName": "base.user.UserDiscount",
            "cParentDataSource": "base.user.User",
            "cControlType": "treerefer",
            "refReturn": "name",
            "bVmExclude": 0
          },
          "execdiscount": {
            "cFieldName": "execdiscount",
            "cItemName": "execdiscount",
            "cCaption": "会员",
            "cShowCaption": "会员",
            "iBillEntityId": 53238,
            "iBillTplGroupId": 463933,
            "iTplId": 44602,
            "iFieldType": 1,
            "bEnum": true,
            "cEnumString": "{\"true\":\"是\",\"false\":\"否\"}",
            "enumArray": "[{\"value\":\"是\",\"key\":\"true\"},{\"value\":\"否\",\"key\":\"false\"}]",
            "cEnumType": "aa_boolean",
            "bMustSelect": true,
            "bHidden": false,
            "bCanModify": true,
            "iColWidth": 150,
            "bShowIt": true,
            "bFilter": false,
            "bIsNull": true,
            "cTplGroupName": "现场折扣数据",
            "bMain": false,
            "cDataSourceName": "base.user.UserDiscount",
            "cParentDataSource": "base.user.User",
            "cControlType": "select",
            "bVmExclude": 0
          },
          "discountdlimit": {
            "cFieldName": "discountdlimit",
            "cItemName": "discountdlimit",
            "cCaption": "折扣率下限（%）",
            "cShowCaption": "折扣率下限（%）",
            "iBillEntityId": 53238,
            "iBillTplGroupId": 463933,
            "iTplId": 44602,
            "iFieldType": 1,
            "bEnum": false,
            "bMustSelect": true,
            "bHidden": false,
            "bCanModify": true,
            "iColWidth": 150,
            "bShowIt": true,
            "bFilter": false,
            "bIsNull": true,
            "cTplGroupName": "现场折扣数据",
            "bMain": false,
            "cDataSourceName": "base.user.UserDiscount",
            "cParentDataSource": "base.user.User",
            "cControlType": "InputNumber",
            "bVmExclude": 0
          },
          "golddiscountulimit": {
            "cFieldName": "golddiscountulimit",
            "cItemName": "golddiscountulimit",
            "cCaption": "金价折扣额上限（元/克）",
            "cShowCaption": "金价折扣额上限（元/克）",
            "iBillEntityId": 53238,
            "iBillTplGroupId": 463933,
            "iTplId": 44602,
            "iFieldType": 1,
            "bEnum": false,
            "bMustSelect": true,
            "bHidden": false,
            "bCanModify": true,
            "iColWidth": 150,
            "bShowIt": false,
            "bFilter": false,
            "bIsNull": true,
            "cTplGroupName": "现场折扣数据",
            "bMain": false,
            "cDataSourceName": "base.user.UserDiscount",
            "cParentDataSource": "base.user.User",
            "cControlType": "InputNumber",
            "bVmExclude": 0
          },
          "ratediscountdlimit": {
            "cFieldName": "ratediscountdlimit",
            "cItemName": "ratediscountdlimit",
            "cCaption": "工费折扣率下限（%）",
            "cShowCaption": "工费折扣率下限（%）",
            "iBillEntityId": 53238,
            "iBillTplGroupId": 463933,
            "iTplId": 44602,
            "iFieldType": 1,
            "bEnum": false,
            "bMustSelect": true,
            "bHidden": false,
            "bCanModify": true,
            "iColWidth": 150,
            "bShowIt": false,
            "bFilter": false,
            "bIsNull": true,
            "cTplGroupName": "现场折扣数据",
            "bMain": false,
            "cDataSourceName": "base.user.UserDiscount",
            "cParentDataSource": "base.user.User",
            "cControlType": "InputNumber",
            "bVmExclude": 0
          },
          "user": {
            "cFieldName": "user",
            "cItemName": "user",
            "cCaption": "操作员",
            "cShowCaption": "操作员",
            "iBillEntityId": 53238,
            "iBillTplGroupId": 463933,
            "iTplId": 44602,
            "iFieldType": 1,
            "bEnum": false,
            "bMustSelect": true,
            "bHidden": true,
            "bCanModify": false,
            "iColWidth": 150,
            "bShowIt": false,
            "bFilter": false,
            "bIsNull": true,
            "cTplGroupName": "现场折扣数据",
            "bMain": false,
            "cDataSourceName": "base.user.UserDiscount",
            "cParentDataSource": "base.user.User",
            "cControlType": "Input",
            "bVmExclude": 0
          }
        },
        "independent": true,
        "readOnly": false,
        "isDirty": true,
        "showCheckBox": false,
        "bIsNull": true,
        "showRowNo": true,
        "showAggregates": false,
        "pagination": false,
        "showColumnSetting": false
      })
    };
    let params = this.getParams();
    params.billNo = "sys_rolelist";
    this.setData(fields);
    this.setDirty(false);

    this.get('save').on('click', function (args) {
      FilterViewModel_Extend.saveAction(this.getParent(), args);
    });
    this.get('addRow').on('click', function (args) {
      FilterViewModel_Extend.addRowAction(this.getParent(), args);
    });
    this.get('btnDelete').on('click', function (args) {
      let gridModel = this.getParent().getGridModel();
      gridModel.deleteRows([args.index]);
    });
    if (cb.rest.AppContext.tenant.industry == 17 || cb.rest.AppContext.tenant.industry == '17') {
      this.get('discountAuth').setColumnState("golddiscountulimit", "bShowIt", true);
      this.get('discountAuth').setColumnState("ratediscountdlimit", "bShowIt", true);
    }
    else {
      this.get('discountAuth').setColumnState("golddiscountulimit", "bShowIt", false);
      this.get('discountAuth').setColumnState("ratediscountdlimit", "bShowIt", false);
    }
    this.initData();
  };

  model.prototype.initData = function () {
    if (typeof FilterViewModel_Extend == 'object')
      FilterViewModel_Extend.doAction("init_Extend", this);
  };

  return model;
});

var FilterViewModel_Extend = {
  doAction: function (name, viewModel) {
    this[name](viewModel);
  },
  init_Extend: function (viewModel) {
    var self = this;

    var proxy = cb.rest.DynamicProxy.create({
      getAuthList: { url: '/auth/list', method: 'GET' },
      getFindAuth: { url: '/role/find', method: 'GET' }
    });
    proxy.getAuthList({}, function (err, data) {
      if (err) {
        console.error(err.message);
        return;
      }
      viewModel.doPropertyChange('initRole', data);
      var params = viewModel.getParams();
      if (params.mode == 'edit') {
        var roleId = params.id;
        proxy.config.getFindAuth.url = proxy.config.getFindAuth.url + "/" + roleId;
        proxy.getFindAuth({}, function (err, roleData) {
          if (err) {
            console.error(err.message);
            return;
          }
          let rolediscounts = roleData.rolediscounts ? roleData.rolediscounts : [];
          let gridModel = viewModel.getGridModel();
          gridModel.setDataSource(rolediscounts);
          viewModel.doPropertyChange('initRoleData', roleData);
        });
      }
    });
  },
  saveAction: function (viewModel, args) {
    var self = this;
    var proxy = cb.rest.DynamicProxy.create({
      saveUserAuth: {
        url: '/role/save',
        method: 'POST',
        options: {
          token: true
        }
      }
    });
    var callback = function () {
      cb.utils.alert('保存成功！', 'success');
      if (args.type == 'saveAndAdd')
        self.init_Extend(viewModel);
      if (args.type == 'save')
        viewModel.doPropertyChange('rollBackClick');
    };
    const rolediscounts = viewModel.getGridModel().getData();
    args.args.rolediscounts = rolediscounts;
    proxy.saveUserAuth(args.args, function (err, result) {
      if (err) {
        cb.utils.alert(err.message, 'error');
        return;
      }
      callback();
    });
  },
  addRowAction: function (viewModel, args) {
    const gridModel = viewModel.getGridModel();
    gridModel.appendRow();
  }
};
