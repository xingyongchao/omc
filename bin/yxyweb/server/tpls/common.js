"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var header = exports.header = function header() {
  return "\n    console.info('%c <%=vmName%> js init', 'color:green');\n    cb.viewmodels.register('<%=vmName%>', function (modelType) {\n\n      var model = function (data) {\n        cb.models.ContainerModel.call(this,data);\n        this.init();\n      };\n      model.prototype = cb.utils.getPrototype(cb.models.ContainerModel.prototype);\n      model.prototype.modelType = modelType;\n\n      model.prototype.init = function () {\n          var _this = this;\n          var fields = {\n            <%for(var i=0;i<fields.length;i++){%>\n              <%var field = fields[i];%>\n              '<%=field.name%>':<%=field.value%>,\n            <%}%>\n          };\n          this.setData(fields);\n          this.setDirty(false);\n\n  ";
};

var footer = exports.footer = function footer() {
  return "\n\n      this.biz = biz;\n      // this.initData();\n    };\n      model.prototype.initData = function () {\n        // if(cb.biz['<%=subId%>'] && cb.biz['<%=subId%>']['<%=extendVmName%>']){\n        //   console.info('%c <%=extendVmName%> extendjs doAction', 'color:green');\n        //   cb.biz['<%=subId%>']['<%=extendVmName%>'].doAction(\"init\", this);\n        // }else{\n        //   console.log('%c no extend js' , 'font-size:22pt;color:red');\n        // }\n        var self = this;\n        var extendFile = '<%=subId%>/<%=extendFileName%>';\n        cb.require([extendFile], function (extend){\n          console.info('%c <%=extendVmName%> extendjs doAction', 'color:green');\n          extend.doAction(\"init\", self);\n          self.execute('extendReady',self);\n        }, function(error){\n          console.info('%c \u672A\u627E\u5230  ' + extendFile , 'font-size:12pt;color:#860786');\n          console.info('%c extendVmName--><%=extendVmName%>','font-size:12pt;color:#860786')\n          self.execute('extendReady',self);\n        });\n\t    };\n\n    return model;\n  });\n\n  ";
};
var eventsListener = exports.eventsListener = function eventsListener() {
  return "\n    //common events start\n    //actions\n    <% if(allActions) { %>\n      _this.allActions = <%= allActions%>;\n    <% }%>\n    <% if(actions) { %>\n      <%for(var i=0;i<actions.length;i++){%>\n          <%var action = actions[i];%>\n          _this.get('<%=action.name%>').on('<%=action.event%>',function(params){\n            var args = cb.utils.extend(true, {}, <%=action.params%>, { key: '<%=action.name%>'},{ params: params });\n            <%if(action.needReduce){%>\n            var self = this;\n            args.disabledCallback = function () {\n              self.setDisabled(true);\n            }\n            args.enabledCallback = function () {\n              self.setDisabled(false);\n            }\n            <%}%>\n            biz.do('<%=action.cAction%>',_this, args)\n          });\n      <%}%>\n    <%}%>\n    <% if(checkFields) { %>\n      //check\n      <%for(var i=0;i<checkFields.length;i++){%>\n          <%var checkField = checkFields[i];%>\n            _this.get('<%=checkField.name%>').on('afterValueChange',function(params){\n              if(params) params.key = '<%=checkField.name%>';\n              biz.do('check',_this, params);\n            });\n      <%}%>\n    <%}%>\n\n    _this.on('columnSetting',function(params){\n      biz.do('columnSetting',_this,params);\n    });\n    //common events end\n  ";
};