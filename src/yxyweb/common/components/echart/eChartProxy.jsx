import React, { Component } from 'react';
import { genAction, proxy } from '../../helpers/util';

export const url = {
  saveTotalSchema: "report/saveTotalSchema",
  getTotalSetting: 'report/getTotalSetting',
  menuExists: '/menu/exists',
  publishMenu: '/report/publishMenu',
  saveGroupSchema: 'report/saveGroupSchema',
  deleteGroupSchema: 'report/deleteGroupSchema',
  getGroupSchema: 'report/getGroupSchema',
  checkGroupAuth: '/user/operation/batchcheck/groupschemaAdd,groupschemaSave,groupschemaDelete',
  getGroupItems: 'report/getGroupItems',
  columnDefine: 'report/columnDefine',
  getGroupSetting: '/report/getGroupSetting',
  reportList: '/report/list',
  getReportList: '/report/getReportList',
  getReportView: '/report/getReportView',
  getReportViews: '/report/getReportViews',
  getReportViewList: '/report/getReportViewList',
  saveReportView: "/report/saveReportView",
  getLayoutByUserId: "/layout/getLayoutByUserId",
  getAllregion: "/region/getAllregion"
};

export function doProxy(url, method, params, callback, noUniform) {
  const config = { url: url, method: method, params: params };
  if (noUniform) {
    config.options = { uniform: false };
  }
  proxy(config)
    .then(json => {
      callback(json);
    });
}

let mergeProxy;

export function doProxy1(url, method, params, callback, noUniform) {
  if (!mergeProxy)
    mergeProxy = cb.rest.MergeProxy.create();
  mergeProxy.add({ url, method, options: { baseurl: false, uniform: false } }, params, callback);
  if (mergeProxy.count() === 8)
    submitProxy();
}

export function submitProxy() {
  mergeProxy.submit();
  mergeProxy = cb.rest.MergeProxy.create();
}
