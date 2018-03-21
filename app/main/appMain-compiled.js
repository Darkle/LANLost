/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./app/main/appMain.lsc");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app/bluetooth/blueToothMain.lsc":
/*!*****************************************!*\
  !*** ./app/bluetooth/blueToothMain.lsc ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scanforDevices = exports.createBluetoothScannerWindow = undefined;

var _path = __webpack_require__(/*! path */ "path");

var _path2 = _interopRequireDefault(_path);

var _url = __webpack_require__(/*! url */ "url");

var _url2 = _interopRequireDefault(_url);

var _electron = __webpack_require__(/*! electron */ "electron");

var _handleScanResults = __webpack_require__(/*! ./handleScanResults.lsc */ "./app/bluetooth/handleScanResults.lsc");

var _logging = __webpack_require__(/*! ../common/logging/logging.lsc */ "./app/common/logging/logging.lsc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const bluetoothHiddenWindowHTMLpath = _url2.default.format({
  protocol: 'file',
  slashes: true,
  pathname: _path2.default.resolve(__dirname, '..', 'bluetooth', 'renderer', 'bluetoothHiddenWindow.html')
});

const bluetoothHiddenWindowProperties = {
  show: true,
  webPreferences: {
    experimentalFeatures: true, // for web-bluetooth
    devTools: true
  }
};

let scannerWindow = null; // so it doesn't get garbage collected

function createBluetoothScannerWindow() {
  scannerWindow = new _electron.BrowserWindow(bluetoothHiddenWindowProperties);
  scannerWindow.loadURL(bluetoothHiddenWindowHTMLpath);
  if (true) scannerWindow.webContents.openDevTools({ mode: 'undocked' });

  scannerWindow.webContents.once('did-finish-load', scanforDevices);
  scannerWindow.webContents.on('select-bluetooth-device', _handleScanResults.handleScanResults);
  scannerWindow.webContents.once('crashed', function (event) {
    _logging.logger.error('scannerWindow.webContents crashed', event);
  });
  scannerWindow.once('unresponsive', function (event) {
    _logging.logger.error('scannerWindow unresponsive', event);
  });
}function scanforDevices() {
  return scannerWindow.webContents.executeJavaScript(`navigator.bluetooth.requestDevice({acceptAllDevices: true}).catch(e =>{})`, true).catch(_logging.logger.error);
}exports.createBluetoothScannerWindow = createBluetoothScannerWindow;
exports.scanforDevices = scanforDevices;

/***/ }),

/***/ "./app/bluetooth/handleScanResults.lsc":
/*!*********************************************!*\
  !*** ./app/bluetooth/handleScanResults.lsc ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleScanResults = undefined;

var _lodash = __webpack_require__(/*! lodash */ "lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _logging = __webpack_require__(/*! ../common/logging/logging.lsc */ "./app/common/logging/logging.lsc");

var _settings = __webpack_require__(/*! ../db/settings.lsc */ "./app/db/settings.lsc");

var _settingsWindow = __webpack_require__(/*! ../settingsWindow/settingsWindow.lsc */ "./app/settingsWindow/settingsWindow.lsc");

var _lockSystem = __webpack_require__(/*! ../common/lockSystem.lsc */ "./app/common/lockSystem.lsc");

var _blueToothMain = __webpack_require__(/*! ./blueToothMain.lsc */ "./app/bluetooth/blueToothMain.lsc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let lastTimeSawADeviceWeAreLookingFor = Date.now();

/**
* deviceList example:
*  [
*    { deviceName: 'MotoG3', deviceId: 'E1:77:42:CF:F2:11' }.,
*    { deviceName: 'Foo\'s iPad', deviceId: '12:22:F1:AD:46:17' }
*    ...
*  ]
*/
let i = 0;
function handleScanResults(event, deviceList, callback) {
  event.preventDefault();
  console.log(`handleScanResults scan: ${i++}`);
  // Check for duplicates in deviceList in case run in to this bug:
  // https://github.com/electron/electron/issues/10800
  const dedupedDeviceList = dedupeAndPreferName(deviceList);

  _logging.logger.info('scan results', dedupedDeviceList);

  // settingsWindow?.webContents?.send('mainprocess:update-of-bluetooth-devices-can-see', dedupedDeviceList)

  // sawDeviceWeAreLookingFor = dedupedDeviceList.some(({deviceId}) -> _.find(getSettings().devicesToSearchFor, { deviceId }))
  // shouldLock = checkIfShouldLock(sawDeviceWeAreLookingFor, lastTimeSawADeviceWeAreLookingFor)

  // if shouldLock: lockSystem()
  // if sawDeviceWeAreLookingFor: now lastTimeSawADeviceWeAreLookingFor = Date.now()

  callback(''); // http://bit.ly/2kZhD74
  (0, _blueToothMain.scanforDevices)();
} /*****
  * We remove duplicates, but also for any duplicates, we prefer to take the duplicate
  * that has a device name (sometimes they have an empty string for a device name).
  */
function dedupeAndPreferName(deviceList) {
  return deviceList.reduce(function (newDeviceList, newDevice) {
    var _foundDeviceInNewList;

    const deviceId = newDevice.deviceId;
    const foundDeviceInNewList = _lodash2.default.find(newDeviceList, { deviceId });
    if (!foundDeviceInNewList) {
      return [...(newDeviceList === void 0 ? [] : newDeviceList), newDevice];
    }if (!(foundDeviceInNewList == null ? void 0 : (_foundDeviceInNewList = foundDeviceInNewList.deviceName) == null ? void 0 : _foundDeviceInNewList.length) && newDevice.deviceName.length) {
      var _ref;

      return [...(_ref = _lodash2.default.filter(newDeviceList, item => item.deviceId !== deviceId), _ref === void 0 ? [] : _ref), newDevice];
    }return newDeviceList;
  }, []);
}exports.handleScanResults = handleScanResults;

/***/ }),

/***/ "./app/common/lockSystem.lsc":
/*!***********************************!*\
  !*** ./app/common/lockSystem.lsc ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkIfShouldLock = exports.lockSystem = undefined;

var _ms = __webpack_require__(/*! ms */ "ms");

var _ms2 = _interopRequireDefault(_ms);

var _settings = __webpack_require__(/*! ../db/settings.lsc */ "./app/db/settings.lsc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function lockSystem() {
  if (!(0, _settings.getSettings)().lanLostEnabled) return;
}function checkIfShouldLock(sawDeviceWeAreLookingFor, lastTimeSawADeviceWeAreLookingFor) {
  return !sawDeviceWeAreLookingFor && Date.now() > lastTimeSawADeviceWeAreLookingFor + (0, _ms2.default)(`${(0, _settings.getSettings)().timeToLock} mins`);
}exports.lockSystem = lockSystem;
exports.checkIfShouldLock = checkIfShouldLock;

/***/ }),

/***/ "./app/common/logging/customRollbarTransport.lsc":
/*!*******************************************************!*\
  !*** ./app/common/logging/customRollbarTransport.lsc ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rollbarLogger = exports.CustomRollbarTransport = undefined;

var _util = __webpack_require__(/*! util */ "util");

var _util2 = _interopRequireDefault(_util);

var _electron = __webpack_require__(/*! electron */ "electron");

var _winston = __webpack_require__(/*! winston */ "winston");

var _winston2 = _interopRequireDefault(_winston);

var _rollbar = __webpack_require__(/*! rollbar */ "rollbar");

var _rollbar2 = _interopRequireDefault(_rollbar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rollbarConfig = {
  accessToken: process.env.rollbarAccessToken,
  enabled: false,
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: "development",
  reportLevel: 'error',
  payload: {
    mainOrRenderer: 'main',
    platform: process.platform,
    processVersions: process.versions,
    arch: process.arch,
    lanLostVersion: _electron.app.getVersion()
  },
  // Ignore the server stuff cause that includes info about the host pc name.
  transform(payload) {
    return payload.server = {};
  }
};

const rollbarLogger = new _rollbar2.default(rollbarConfig);

const CustomRollbarTransport = _winston2.default.transports.CustomLogger = function (options) {
  Object.assign(this, options);
};_util2.default.inherits(CustomRollbarTransport, _winston2.default.Transport);

CustomRollbarTransport.prototype.log = function (level, msg = '', error, callback) {
  // Only log errors.
  if (level !== 'error') return;
  rollbarLogger.error(msg, error);
  callback(null, true);
};exports.CustomRollbarTransport = CustomRollbarTransport;
exports.rollbarLogger = rollbarLogger;

/***/ }),

/***/ "./app/common/logging/logging.lsc":
/*!****************************************!*\
  !*** ./app/common/logging/logging.lsc ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeRollbarLogging = exports.addRollbarLogging = exports.removeUserDebugLogger = exports.addUserDebugLogger = exports.logger = undefined;

var _electron = __webpack_require__(/*! electron */ "electron");

var _winston = __webpack_require__(/*! winston */ "winston");

var _winston2 = _interopRequireDefault(_winston);

var _customRollbarTransport = __webpack_require__(/*! ./customRollbarTransport.lsc */ "./app/common/logging/customRollbarTransport.lsc");

var _userDebugLogger = __webpack_require__(/*! ./userDebugLogger.lsc */ "./app/common/logging/userDebugLogger.lsc");

var _settings = __webpack_require__(/*! ../../db/settings.lsc */ "./app/db/settings.lsc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rollbarTransportOptions = {
  level: 'error',
  handleExceptions: true,
  humanReadableUnhandledException: true
};
const userDebugTransportOptions = {
  level: 'debug',
  handleExceptions: true,
  humanReadableUnhandledException: true
  /*****
  * https://github.com/winstonjs/winston
  * Winston log levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
  * So can use logger.error(), logger.warn(), logger.info(), logger.verbose(), logger.debug()
  */
};const logger = new _winston2.default.Logger({
  level: 'debug',
  exitOnError: false
});

if (true) {
  logger.add(_winston2.default.transports.Console, {
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: true
  });
} // dont send errors to rollbar in dev && only if enabled.
if (false) {} /**
  * We also need to disable rollbar itself as it is set to report uncaught exceptions.
  */
function addRollbarLogging() {
  _customRollbarTransport.rollbarLogger.configure({ enabled: true });
  logger.add(_customRollbarTransport.CustomRollbarTransport, rollbarTransportOptions);
}function removeRollbarLogging() {
  _customRollbarTransport.rollbarLogger.configure({ enabled: false });
  logger.remove(_customRollbarTransport.CustomRollbarTransport);
}function addUserDebugLogger() {
  logger.add(_userDebugLogger.UserDebugLoggerTransport, userDebugTransportOptions);
}function removeUserDebugLogger() {
  logger.remove(_userDebugLogger.UserDebugLoggerTransport);
}_electron.ipcMain.on('settings-renderer:error-sent', (event, arg) => {
  return logger.error('settings-renderer:error-sent', arg);
});

_electron.ipcMain.on('bluetooth-renderer:error-sent', (event, arg) => {
  return logger.error('bluetooth-renderer:error-sent', arg);
});

exports.logger = logger;
exports.addUserDebugLogger = addUserDebugLogger;
exports.removeUserDebugLogger = removeUserDebugLogger;
exports.addRollbarLogging = addRollbarLogging;
exports.removeRollbarLogging = removeRollbarLogging;

/***/ }),

/***/ "./app/common/logging/userDebugLogger.lsc":
/*!************************************************!*\
  !*** ./app/common/logging/userDebugLogger.lsc ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserDebugLoggerTransport = undefined;

var _util = __webpack_require__(/*! util */ "util");

var _util2 = _interopRequireDefault(_util);

var _winston = __webpack_require__(/*! winston */ "winston");

var _winston2 = _interopRequireDefault(_winston);

var _debugWindow = __webpack_require__(/*! ../../debugWindow/debugWindow.lsc */ "./app/debugWindow/debugWindow.lsc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/****
* This is the loggger for when the user checks the "debug" checkbox in the options
* window. The log data is sent to the debug window renderer and displayed there.
*
* The transports need a param (options) or they throw an error, even if you don't use it.
*/
const UserDebugLoggerTransport = _winston2.default.transports.CustomLogger = function (options) {
  Object.assign(this, options);
};_util2.default.inherits(UserDebugLoggerTransport, _winston2.default.Transport);

UserDebugLoggerTransport.prototype.log = function (level, msg = '', meta = {}, callback) {
  var _debugWindow$webConte;

  _debugWindow.debugWindow == null ? void 0 : (_debugWindow$webConte = _debugWindow.debugWindow.webContents) == null ? void 0 : typeof _debugWindow$webConte.send !== 'function' ? void 0 : _debugWindow$webConte.send('mainprocess:debug-info-sent', { level, msg, meta });
  callback(null, true);
};exports.UserDebugLoggerTransport = UserDebugLoggerTransport;

/***/ }),

/***/ "./app/common/setUpDev.lsc":
/*!*********************************!*\
  !*** ./app/common/setUpDev.lsc ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setUpDev = undefined;

var _path = __webpack_require__(/*! path */ "path");

var _path2 = _interopRequireDefault(_path);

var _electron = __webpack_require__(/*! electron */ "electron");

var _settingsWindow = __webpack_require__(/*! ../settingsWindow/settingsWindow.lsc */ "./app/settingsWindow/settingsWindow.lsc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const settingsWindowDirPath = _path2.default.resolve(__dirname, '..', 'settingsWindow', 'renderer');
const settingsWindowHTMLfilePath = _path2.default.join(settingsWindowDirPath, 'settingsWindow.html');
const settingsWindowCSSfilePath = _path2.default.join(settingsWindowDirPath, 'assets', 'styles', 'css', 'settingsWindowCss-compiled.css');
const settingsWindowJSfilePath = _path2.default.join(settingsWindowDirPath, 'settingsWindowRendererMain-compiled.js');
const settingsWindowIconFiles = _path2.default.join(settingsWindowDirPath, 'assets', 'icons', '*.*');
const bluetoothRendereJSfilePath = _path2.default.resolve(__dirname, '..', 'bluetooth', 'renderer', 'bluetoothRendererMain-compiled.js');
const devtronPath = _path2.default.resolve(__dirname, '..', '..', 'node_modules', 'devtron');

function setUpDev() {
  if (false) {}
  __webpack_require__(/*! electron-reload */ "electron-reload")([settingsWindowHTMLfilePath, settingsWindowCSSfilePath, settingsWindowJSfilePath, settingsWindowIconFiles, bluetoothRendereJSfilePath]);
  _electron.BrowserWindow.addDevToolsExtension(devtronPath);
  // auto open the settings window in dev so dont have to manually open it each time electron restarts
  (0, _settingsWindow.showSettingsWindow)();
}exports.setUpDev = setUpDev;

/***/ }),

/***/ "./app/common/utils.lsc":
/*!******************************!*\
  !*** ./app/common/utils.lsc ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.omitGawkObserverFromSettings = exports.omitInheritedProperties = exports.logSettingsUpdateInDev = exports.noop = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _qI = __webpack_require__(/*! q-i */ "q-i");

var _lodash = __webpack_require__(/*! lodash */ "lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function noop() {
  return;
}function omitGawkObserverFromSettings(settings) {
  return omitInheritedProperties(settings, '__gawk__');
}function logSettingsUpdateInDev(newSettingKey, newSettingValue) {
  if (true) {
    console.log('======================updateSetting======================');
    console.log(newSettingKey);
    (0, _qI.print)(newSettingValue);
  }
} /**
   * In the off-chance that an object key name is literally the word 'undefined',
   * set Symbol() as the default param.
   */
function omitInheritedProperties(obj, propFilter = Symbol()) {
  return Object.getOwnPropertyNames(obj).reduce(function (prev, propName) {
    if (propFilter === propName) return prev;
    if (isObject(obj[propName])) {
      return _extends({}, prev, { [propName]: omitInheritedProperties(obj[propName], propFilter) });
    }return _extends({}, prev, { [propName]: obj[propName] });
  }, {});
}function isObject(obj) {
  return _lodash2.default.isObject(obj) && !_lodash2.default.isArray(obj) && !_lodash2.default.isFunction(obj) && !_lodash2.default.isRegExp(obj);
}exports.noop = noop;
exports.logSettingsUpdateInDev = logSettingsUpdateInDev;
exports.omitInheritedProperties = omitInheritedProperties;
exports.omitGawkObserverFromSettings = omitGawkObserverFromSettings;

/***/ }),

/***/ "./app/db/settings.lsc":
/*!*****************************!*\
  !*** ./app/db/settings.lsc ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeNewDeviceToSearchFor = exports.addNewDeviceToSearchFor = exports.getSettings = exports.updateSetting = undefined;

var _electron = __webpack_require__(/*! electron */ "electron");

var _electronStore = __webpack_require__(/*! electron-store */ "electron-store");

var _electronStore2 = _interopRequireDefault(_electronStore);

var _lodash = __webpack_require__(/*! lodash */ "lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _qI = __webpack_require__(/*! q-i */ "q-i");

var _gawk = __webpack_require__(/*! gawk */ "gawk");

var _gawk2 = _interopRequireDefault(_gawk);

var _justCompose = __webpack_require__(/*! just-compose */ "just-compose");

var _justCompose2 = _interopRequireDefault(_justCompose);

var _logging = __webpack_require__(/*! ../common/logging/logging.lsc */ "./app/common/logging/logging.lsc");

var _tray = __webpack_require__(/*! ../tray/tray.lsc */ "./app/tray/tray.lsc");

var _utils = __webpack_require__(/*! ../common/utils.lsc */ "./app/common/utils.lsc");

var _debugWindow = __webpack_require__(/*! ../debugWindow/debugWindow.lsc */ "./app/debugWindow/debugWindow.lsc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultSettings = {
  lanLostEnabled: true, //Boolean
  firstRun: true, //Boolean
  trayIconColor: 'white', //String
  settingsWindowPosition: null, //Null or an Object with integer key values.
  devicesToSearchFor: [], //Array of Objects {deviceName:'foo', deviceid:'C2:45:22:BG:H4:66'}
  timeToLock: 4, //Integer (number of minutes)
  reportErrors: true, //Boolean
  userDebug: false, //Boolean
  runOnStartup: true //Boolean
};

const store = new _electronStore2.default({ defaults: defaultSettings });

const settings = (0, _justCompose2.default)(_gawk2.default, _utils.omitInheritedProperties)(store.store);

if (true) (0, _qI.print)(settings);

function getSettings() {
  return settings;
} // TODO: do some validation on the settings being passed in
function updateSetting(newSettingKey, newSettingValue) {
  if (true) (0, _utils.logSettingsUpdateInDev)(newSettingKey, newSettingValue);
  settings[newSettingKey] = newSettingValue;
  store.set(newSettingKey, newSettingValue);
} /*****
  * Settings observers.
  */
_gawk2.default.watch(settings, ['reportErrors'], function (newValue) {
  if (newValue) (0, _logging.addRollbarLogging)();else (0, _logging.removeRollbarLogging)();
});
_gawk2.default.watch(settings, ['userDebug'], function (newValue) {
  if (newValue) {
    (0, _logging.addUserDebugLogger)();
    (0, _debugWindow.showDebugWindow)();
  } else {
    (0, _logging.removeUserDebugLogger)();
    (0, _debugWindow.closeDebugWindow)();
  }
});
_gawk2.default.watch(settings, ['trayIconColor'], _tray.changeTrayIcon);

/*****
* Regular Array.includes compares by reference, not value, so using _.find.
*/
function findDeviceInDevicesToSearchFor(deviceId) {
  return _lodash2.default.find(settings.devicesToSearchFor, { deviceId });
}function addNewDeviceToSearchFor(deviceToAdd) {
  var _ref;

  if (findDeviceInDevicesToSearchFor(deviceToAdd.deviceId)) return;
  updateSetting('devicesToSearchFor', [...(_ref = settings.devicesToSearchFor, _ref === void 0 ? [] : _ref), ...[deviceToAdd]]);
}function removeNewDeviceToSearchFor({ deviceId: deviceIdToRemove }) {
  if (!findDeviceInDevicesToSearchFor(deviceIdToRemove)) return;
  updateSetting('devicesToSearchFor', settings.devicesToSearchFor.filter(function ({ deviceId }) {
    return deviceId !== deviceIdToRemove;
  }));
}_electron.ipcMain.on('renderer:setting-updated-in-ui', function (event, settingName, settingValue) {
  updateSetting(settingName, settingValue);
});

_electron.ipcMain.on('renderer:device-added-in-ui', function (event, deviceToAdd) {
  addNewDeviceToSearchFor(deviceToAdd);
});

_electron.ipcMain.on('renderer:device-removed-in-ui', function (event, deviceToRemove) {
  removeNewDeviceToSearchFor(deviceToRemove);
});

exports.updateSetting = updateSetting;
exports.getSettings = getSettings;
exports.addNewDeviceToSearchFor = addNewDeviceToSearchFor;
exports.removeNewDeviceToSearchFor = removeNewDeviceToSearchFor;

/***/ }),

/***/ "./app/debugWindow/debugWindow.lsc":
/*!*****************************************!*\
  !*** ./app/debugWindow/debugWindow.lsc ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.closeDebugWindow = exports.showDebugWindow = exports.debugWindow = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _path = __webpack_require__(/*! path */ "path");

var _path2 = _interopRequireDefault(_path);

var _url = __webpack_require__(/*! url */ "url");

var _url2 = _interopRequireDefault(_url);

var _electron = __webpack_require__(/*! electron */ "electron");

var _logging = __webpack_require__(/*! ../common/logging/logging.lsc */ "./app/common/logging/logging.lsc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debugWindowHTMLpath = _url2.default.format({
  protocol: 'file',
  slashes: true,
  pathname: _path2.default.resolve(__dirname, '..', 'debugWindow', 'renderer', 'debugWindow.html')
});
const debugWindowProperties = _extends({
  width: 786,
  height: 616,
  title: 'LANLost',
  autoHideMenuBar: true,
  resizable: false,
  fullscreenable: false,
  fullscreen: false,
  frame: false,
  show: false,
  webPreferences: {
    textAreasAreResizable: true,
    devTools: true
  }
});
/****
* Remove the menu in alt menu bar in prod, so they dont accidentally exit the app.
* Reload is for dev so we can easily reload the browserwindow with Ctrl+R
*/
const debugWindowMenu =  true ? _electron.Menu.buildFromTemplate([{ role: 'reload' }]) : undefined;
let debugWindow = null;

function showDebugWindow() {
  if (debugWindow) return debugWindow.show();

  exports.debugWindow = debugWindow = new _electron.BrowserWindow(debugWindowProperties);
  debugWindow.loadURL(debugWindowHTMLpath);
  debugWindow.setMenu(debugWindowMenu);

  if (true) debugWindow.webContents.openDevTools({ mode: 'undocked' });

  debugWindow.once('close', function () {
    (0, _logging.removeUserDebugLogger)();
  });

  debugWindow.once('ready-to-show', function () {
    debugWindow.show();
    (0, _logging.addUserDebugLogger)();
  });

  debugWindow.once('closed', function () {
    exports.debugWindow = debugWindow = null;
  });
}function closeDebugWindow() {
  debugWindow.close();
}exports.debugWindow = debugWindow;
exports.showDebugWindow = showDebugWindow;
exports.closeDebugWindow = closeDebugWindow;

/***/ }),

/***/ "./app/main/appMain.lsc":
/*!******************************!*\
  !*** ./app/main/appMain.lsc ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(/*! ../../config/env.lsc */ "./config/env.lsc");

var _electron = __webpack_require__(/*! electron */ "electron");

var _setUpDev = __webpack_require__(/*! ../common/setUpDev.lsc */ "./app/common/setUpDev.lsc");

var _settings = __webpack_require__(/*! ../db/settings.lsc */ "./app/db/settings.lsc");

var _utils = __webpack_require__(/*! ../common/utils.lsc */ "./app/common/utils.lsc");

var _tray = __webpack_require__(/*! ../tray/tray.lsc */ "./app/tray/tray.lsc");

var _settingsWindow = __webpack_require__(/*! ../settingsWindow/settingsWindow.lsc */ "./app/settingsWindow/settingsWindow.lsc");

var _blueToothMain = __webpack_require__(/*! ../bluetooth/blueToothMain.lsc */ "./app/bluetooth/blueToothMain.lsc");

var _logging = __webpack_require__(/*! ../common/logging/logging.lsc */ "./app/common/logging/logging.lsc");

_electron.app.commandLine.appendSwitch('enable-web-bluetooth');

_electron.app.once('ready', function () {
  var _electronApp$dock;

  if (_electron.app.makeSingleInstance(_utils.noop)) _electron.app.quit();
  if (true) (0, _setUpDev.setUpDev)();
  if (!(0, _settings.getSettings)().firstRun) (_electronApp$dock = _electron.app.dock) == null ? void 0 : _electronApp$dock.hide();

  (0, _blueToothMain.createBluetoothScannerWindow)();
  (0, _tray.initTrayMenu)();

  if ((0, _settings.getSettings)().firstRun) {
    (0, _settings.updateSetting)('firstRun', false);
    (0, _settingsWindow.showSettingsWindow)();
  }
});

_electron.app.on('window-all-closed', _utils.noop);

process.on('unhandledRejection', _logging.logger.error);

/***/ }),

/***/ "./app/settingsWindow/settingsWindow.lsc":
/*!***********************************************!*\
  !*** ./app/settingsWindow/settingsWindow.lsc ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.settingsWindow = exports.toggleSettingsWindow = exports.showSettingsWindow = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _path = __webpack_require__(/*! path */ "path");

var _path2 = _interopRequireDefault(_path);

var _url = __webpack_require__(/*! url */ "url");

var _url2 = _interopRequireDefault(_url);

var _electron = __webpack_require__(/*! electron */ "electron");

var _settings = __webpack_require__(/*! ../db/settings.lsc */ "./app/db/settings.lsc");

var _logging = __webpack_require__(/*! ../common/logging/logging.lsc */ "./app/common/logging/logging.lsc");

var _utils = __webpack_require__(/*! ../common/utils.lsc */ "./app/common/utils.lsc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const settingsHTMLpath = _url2.default.format({
  protocol: 'file',
  slashes: true,
  pathname: _path2.default.resolve(__dirname, '..', 'settingsWindow', 'renderer', 'settingsWindow.html')
});
const settingsWindowProperties = _extends({
  width: 786,
  height: 616,
  title: 'LANLost',
  autoHideMenuBar: true,
  resizable: false,
  fullscreenable: false,
  fullscreen: false,
  frame: false,
  show: false,
  webPreferences: {
    textAreasAreResizable: false,
    devTools: true
  }
}, getStoredWindowPosition());
/****
* Remove the menu in alt menu bar in prod, so they dont accidentally exit the app.
* Reload is for dev so we can easily reload the browserwindow with Ctrl+R
*/
const settingsWindowMenu =  true ? _electron.Menu.buildFromTemplate([{ role: 'reload' }]) : undefined;
let settingsWindow = null;

function showSettingsWindow() {
  var _electronApp$dock;

  if (settingsWindow) return settingsWindow.show();

  /*****
  * We add the settings to a global each time we create a new settings window so we can easily
  * load the inital app settings on renderer startup. This way we dont have to send a message from the renderer
  * to the main processs to ask for the settings - or send them from main process on detection of the
  * BrowserWindow 'ready-to-show' event, both of which might make the UI show nothing briefly before the settings.
  *
  * We can't use remote.require(../settings.lsc).getSettings() in the renderer because it doesn't seem to work
  * with code that needs to be transpiled, as everything in settlings.lsc is compiled into appMain-compiled.js and the
  * remote.require() looks for the .lsc file - it doesn't know that the settings module has been compiled and now lives
  * inside of the appMain-compiled.js file.
  */
  global.settingsWindowRendererInitialSettings = (0, _utils.omitGawkObserverFromSettings)((0, _settings.getSettings)());

  exports.settingsWindow = settingsWindow = new _electron.BrowserWindow(_extends({}, settingsWindowProperties, getStoredWindowPosition()));
  settingsWindow.loadURL(settingsHTMLpath);
  settingsWindow.setMenu(settingsWindowMenu);

  (_electronApp$dock = _electron.app.dock) == null ? void 0 : _electronApp$dock.show();

  if (true) settingsWindow.webContents.openDevTools({ mode: 'undocked' });

  settingsWindow.once('close', function () {
    (0, _settings.updateSetting)('settingsWindowPosition', settingsWindow.getBounds());
  });

  settingsWindow.once('ready-to-show', function () {
    settingsWindow.show();
  });

  settingsWindow.once('closed', function () {
    var _electronApp$dock2;

    exports.settingsWindow = settingsWindow = null;
    (_electronApp$dock2 = _electron.app.dock) == null ? void 0 : _electronApp$dock2.hide();
  });

  settingsWindow.webContents.once('crashed', function (event) {
    _logging.logger.error('settingsWindow.webContents crashed', event);
  });

  settingsWindow.once('unresponsive', function (event) {
    _logging.logger.error('settingsWindow unresponsive', event);
  });
}function getStoredWindowPosition() {
  if (!(typeof _settings.getSettings !== 'function' ? void 0 : (0, _settings.getSettings)().settingsWindowPosition)) return {};
  return {
    x: (0, _settings.getSettings)().settingsWindowPosition.x,
    y: (0, _settings.getSettings)().settingsWindowPosition.y
  };
}function toggleSettingsWindow() {
  if (!settingsWindow) {
    showSettingsWindow();
  } else if (settingsWindow.isVisible()) {
    settingsWindow.close();
  }
}exports.showSettingsWindow = showSettingsWindow;
exports.toggleSettingsWindow = toggleSettingsWindow;
exports.settingsWindow = settingsWindow;

/***/ }),

/***/ "./app/tray/toggleEnabledFromTray.lsc":
/*!********************************************!*\
  !*** ./app/tray/toggleEnabledFromTray.lsc ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggleEnabledFromTray = undefined;

var _settings = __webpack_require__(/*! ../db/settings.lsc */ "./app/db/settings.lsc");

var _settingsWindow = __webpack_require__(/*! ../settingsWindow/settingsWindow.lsc */ "./app/settingsWindow/settingsWindow.lsc");

function toggleEnabledFromTray() {
  var _settingsWindow$webCo;

  const toggledLanLostEnabled = !(0, _settings.getSettings)().lanLostEnabled;
  (0, _settings.updateSetting)('lanLostEnabled', toggledLanLostEnabled);
  _settingsWindow.settingsWindow == null ? void 0 : (_settingsWindow$webCo = _settingsWindow.settingsWindow.webContents) == null ? void 0 : _settingsWindow$webCo.send('mainprocess:lanLost-tray-enabled-disabled-toggled', toggledLanLostEnabled);
}exports.toggleEnabledFromTray = toggleEnabledFromTray;

/***/ }),

/***/ "./app/tray/tray.lsc":
/*!***************************!*\
  !*** ./app/tray/tray.lsc ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changeTrayIcon = exports.initTrayMenu = undefined;

var _path = __webpack_require__(/*! path */ "path");

var _path2 = _interopRequireDefault(_path);

var _electron = __webpack_require__(/*! electron */ "electron");

var _settingsWindow = __webpack_require__(/*! ../settingsWindow/settingsWindow.lsc */ "./app/settingsWindow/settingsWindow.lsc");

var _toggleEnabledFromTray = __webpack_require__(/*! ./toggleEnabledFromTray.lsc */ "./app/tray/toggleEnabledFromTray.lsc");

var _settings = __webpack_require__(/*! ../db/settings.lsc */ "./app/db/settings.lsc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let tray = null; // might need to be outside to avoid being garbage collected. https://electron.atom.io/docs/api/tray/
const trayIconsFolderPath = _path2.default.resolve(__dirname, '..', '..', 'resources', 'icons');

function getNewTrayIconPath(trayIconColor) {
  return _path2.default.join(trayIconsFolderPath, trayIconColor, `LANLost-${trayIconColor}-128x128.png`);
}function initTrayMenu() {
  tray = new _electron.Tray(getNewTrayIconPath((0, _settings.getSettings)().trayIconColor));
  tray.setContextMenu(createContextMenu());
  tray.setToolTip('LANLost');
  tray.on('double-click', _settingsWindow.toggleSettingsWindow);
}function createContextMenu() {
  return _electron.Menu.buildFromTemplate([{
    label: 'Open LANLost Settings',
    click() {
      return (0, _settingsWindow.showSettingsWindow)();
    }
  }, {
    label: `${(0, _settings.getSettings)().lanLostEnabled ? 'Disable' : 'Enable'} LANLost`,
    click() {
      (0, _toggleEnabledFromTray.toggleEnabledFromTray)();
      return tray.setContextMenu(createContextMenu());
    }
  }, {
    label: 'Quit LANLost',
    click() {
      return _electron.app.quit();
    }
  }]);
}function changeTrayIcon(newTrayIconColor) {
  tray.setImage(getNewTrayIconPath(newTrayIconColor));
}exports.initTrayMenu = initTrayMenu;
exports.changeTrayIcon = changeTrayIcon;

/***/ }),

/***/ "./config/env.lsc":
/*!************************!*\
  !*** ./config/env.lsc ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _path = __webpack_require__(/*! path */ "path");

var _path2 = _interopRequireDefault(_path);

var _dotenv = __webpack_require__(/*! dotenv */ "dotenv");

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// http://bit.ly/2xEDMxk
_dotenv2.default.config({ path: _path2.default.resolve(__dirname, '..', '..', 'config', '.env') });

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),

/***/ "electron-reload":
/*!**********************************!*\
  !*** external "electron-reload" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("electron-reload");

/***/ }),

/***/ "electron-store":
/*!*********************************!*\
  !*** external "electron-store" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("electron-store");

/***/ }),

/***/ "gawk":
/*!***********************!*\
  !*** external "gawk" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("gawk");

/***/ }),

/***/ "just-compose":
/*!*******************************!*\
  !*** external "just-compose" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("just-compose");

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),

/***/ "ms":
/*!*********************!*\
  !*** external "ms" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("ms");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "q-i":
/*!**********************!*\
  !*** external "q-i" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("q-i");

/***/ }),

/***/ "rollbar":
/*!**************************!*\
  !*** external "rollbar" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("rollbar");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),

/***/ "winston":
/*!**************************!*\
  !*** external "winston" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("winston");

/***/ })

/******/ });