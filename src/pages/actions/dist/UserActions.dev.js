"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCountry = exports.getUser = exports.login = void 0;

var _dispatcher = _interopRequireDefault(require("../dispatcher"));

var _constants = require("../constants/constants");

var _Spotify = _interopRequireDefault(require("../core/Spotify"));

var _reactGa = _interopRequireDefault(require("react-ga"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var login = function login() {
  _reactGa["default"].ga('send', 'event', 'event', 'login', 'init');

  return new Promise(function (resolve, reject) {
    _Spotify["default"].login().then(function (data) {
      _dispatcher["default"].dispatch({
        type: _constants.USER_TOKEN,
        data: data
      });

      _reactGa["default"].ga('send', 'event', 'event', 'login', 'fin');
    });
  });
};

exports.login = login;

var getUser = function getUser() {
  var token = localStorage.magic_token;

  if (token) {
    _Spotify["default"].getUser().then(function (data) {
      _dispatcher["default"].dispatch({
        type: _constants.USER_LOGED,
        data: data
      });
    });
  }
};

exports.getUser = getUser;

var getCountry = function getCountry() {
  if (localStorage.magic_country) {
    _dispatcher["default"].dispatch({
      type: _constants.USER_COUNTRY,
      data: localStorage.magic_country
    });
  } else {
    var checkStatus = function checkStatus(response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    };

    var parseJSON = function parseJSON(response) {
      return response.json();
    }; // fetch('https://ip-api.com/json', {
    //   method: 'GET'
    // }).then(checkStatus)
    //   .then(parseJSON)
    //   .then((response) => {
    //     let markets = ['AD', 'AR', 'AT', 'AU', 'BE', 'BG', 'BO', 'BR', 'CA', 'CH', 'CL', 'CO', 'CR', 'CY', 'CZ',
    //       'DE', 'DK', 'DO', 'EC', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'GT', 'HK', 'HN', 'HU', 'IE', 'IS', 'IT', 'LI',
    //       'LT', 'LU', 'LV', 'MC', 'MT', 'MX', 'MY', 'NI', 'NL', 'NO', 'NZ', 'PA', 'PE', 'PH', 'PL', 'PT', 'PY', 'RO',
    //       'SE', 'SG', 'SI', 'SK', 'SV', 'TR', 'TW', 'US', 'UY'];
    //     if (markets.indexOf(response.countryCode) > -1) {
    //       localStorage.magic_country = response.countryCode;
    //       Dispatcher.dispatch({
    //         type: USER_COUNTRY,
    //         data: response.countryCode
    //       });
    //     } else {
    //       localStorage.magic_country = 'US';
    //       Dispatcher.dispatch({
    //         type: USER_COUNTRY,
    //         data: 'US'
    //       });
    //     }
    //   }).catch((error) => {
    //     ReactGA.ga('send', 'event', 'event', 'error-country', 'catch');
    //   });

  }
};

exports.getCountry = getCountry;