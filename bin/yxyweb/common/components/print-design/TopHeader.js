'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _antd = require('antd');

var _basic = require('../basic');

var _print = require('../../redux/print');

var printactions = _interopRequireWildcard(_print);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Link = _antd.Anchor.Link;

var TopHeader = function (_Component) {
    _inherits(TopHeader, _Component);

    function TopHeader(props) {
        _classCallCheck(this, TopHeader);

        var _this = _possibleConstructorReturn(this, (TopHeader.__proto__ || Object.getPrototypeOf(TopHeader)).call(this, props));

        _this.onTypeClick = function (bo_code) {
            _this.actions.setData({ selectType: bo_code });
            // window.location.href('#' + bo_code);
        };

        _this.getControl = function () {
            var _this$props$print = _this.props.print,
                templateData = _this$props$print.templateData,
                selectType = _this$props$print.selectType;

            if (!templateData) return '';
            var control = [];
            templateData.forEach(function (element) {
                var _this2 = this;

                var className = "topHeader-item";
                if (selectType == element.bo_code) className = "topHeader-item-selected";
                control.push(_react2.default.createElement(
                    _basic.Col,
                    { span: 1, key: element.bo_code, className: className },
                    _react2.default.createElement(
                        'div',
                        { onClick: function onClick() {
                                return _this2.onTypeClick(element.bo_code);
                            } },
                        _react2.default.createElement(Link, { href: "#" + element.bo_code, title: element.bo_name })
                    )
                ));
            }, _this);
            return _react2.default.createElement(
                _basic.Row,
                { colCount: 8 },
                control
            );
        };

        _this.actions = props.printactions;
        return _this;
    }

    _createClass(TopHeader, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            // this.actions.loadBoList();
        }
    }, {
        key: 'render',
        value: function render() {
            var control = this.getControl();
            return _react2.default.createElement(
                _antd.Anchor,
                { affix: false },
                _react2.default.createElement(
                    _basic.Row,
                    { className: 'uretail-print-topHeader' },
                    control
                )
            );
        }
    }]);

    return TopHeader;
}(_react.Component);

function mapStateToProps(state) {
    return {
        print: state.print.toJS()
    };
}

function mapDispatchToProps(dispatch) {
    return {
        printactions: (0, _redux.bindActionCreators)(printactions, dispatch)
    };
}

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TopHeader);