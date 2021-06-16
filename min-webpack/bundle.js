
    (function(modules) {
      function require(id) {
          // 根据id获取 function 和 mapping
          const [fn, mapping] = modules[id];
          
          function localRequire(relativePath){
            //根据模块的路径在mapping中找到对应的模块id
            return require(mapping[relativePath]);
          }
          const module = {exports:{}};
          //执行每个模块的代码。
          //对应上方的 function(require, module, exports)
          fn(localRequire,module,module.exports);
          return module.exports;
      }
      // 导入entry.js 代码
      require(0)
    })({0:[
      function (require, module, exports){
        "use strict";

var _message = _interopRequireDefault(require("./message.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

console.log(_message["default"]);
      },
      {"./message.js":1},
    ],1:[
      function (require, module, exports){
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _name = require("./name.js");

var _default = "hello ".concat(_name.name, "!");

exports["default"] = _default;
      },
      {"./name.js":2},
    ],2:[
      function (require, module, exports){
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.name = void 0;
var name = "world";
exports.name = name;
      },
      {},
    ],})
  