const fs = require('fs')
const path = require('path')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')

let ID = 0

// 根据入口文件获取文件信息， 获取当前js文件的依赖信息
function createAsset(filename) {
  //获取文件，返回值是字符串
  const content = fs.readFileSync(filename, 'utf-8')
  // babylon 转换成 AST
  const ast = babel.parseSync(content, {
    sourceType: 'module'
  })

  // 用来存储当前文件所依赖的文件路径
  const dependencies = []
  
  // 遍历 ast
  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      // 把当前依赖的模块加入到数组中，其实这存的是字符串，
      dependencies.push(node.source.value)
    }
  })
  // 创建id, 方便之后找到依赖关系，下面会讲
  const id = ID++

  // 这边主要把ES6 的代码转成 ES5
  const { code } = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env']
  });

  return {
    id,
    filename,
    dependencies,
    code
  }
}

// {
//   id: 0,
//   filename: './example/entry.js',
//   dependencies: ['./message.js'],
//    code: '"use strict";\n' +
//    '\n' +
//    'var _message = _interopRequireDefault(require("./message.js"));\n' +
//    '\n' +
//    'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
//    '\n' +
//    'console.log(_message["default"]);'
// }


// 从入口开始分析所有依赖项，形成依赖图，采用广度遍历
function createGraph(entry) {
  // 如上所示，表示入口文件的依赖
  const mainAsset = createAsset(entry)
  
  // 既然要广度遍历肯定要有一个队列，第一个元素肯定是 从 "./example/entry.js" 返回的信息
  const queue = [mainAsset]

  for (const asset of queue) {
    // 获取相对路径
    const dirname = path.dirname(asset.filename)

    // 新增一个属性来保存子依赖项的数据
    // 保存类似 这样的数据结构 --->  {"./message.js" : 1}
    // 对应上面的 id,  方便找到依赖关系
    asset.mapping = {}

    // 根据依赖添加数组元素
    asset.dependencies.forEach(relativePath => {
      const absolutePath = path.join(dirname, relativePath)
      // 获得子依赖（子模块）的依赖项、代码、模块id，文件名
      const child = createAsset(absolutePath) 
      
      asset.mapping[relativePath] = child.id
      queue.push(child)
    })
  }
  return queue
}

// 复制代码得到如下数据:
// [
//     {
//         id: 0,
//         filename: './example/entry.js',
//         dependencies: ['./message.js'],
//         code: '"use strict";\n\nvar _message = require("./message.js");\n\nvar _message2 = _interopRequireDefault(_message);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nconsole.log(_message2.default);',
//         mapping: {
//             './message.js': 1
//         }
//     },
//     {
//         id: 1,
//         filename: 'example/message.js',
//         dependencies: ['./name.js'],
//         code: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\n\nvar _name = require("./name.js");\n\nexports.default = "hello " + _name.name + "!";',
//         mapping: {
//             './name.js': 2
//         }
//     },
//     {
//         id: 2,
//         filename: 'example/name.js',
//         dependencies: [],
//         code: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nvar name = exports.name = \'world\';',
//         mapping: {}
//     }
// ]

function bundle(graph) {
  let modules = "";

  // 循环依赖关系，并把每个模块中的代码存在function作用域里
  graph.forEach(mod => {
    modules += `${mod.id}:[
      function (require, module, exports){
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)},
    ],`;
  });

  const result = `
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
    })({${modules}})
  `;

  return result;
}

// (function(modules) {
    
// })({
//     0: [
//         function(require, module, exports) {
//             "use strict";
//             var _message = require("./message.js");
//             var _message2 = _interopRequireDefault(_message);
//             function _interopRequireDefault(obj) {
//                 return obj && obj.__esModule ? obj : {
//                     default: obj
//                 };
//             }
//             console.log(_message2.default);
//         },
//         // 导入模块对应的 id
//         {
//             "./message.js": 1
//         },
//     ],
//     1: [
//         function(require, module, exports) {
//             "use strict";
//             Object.defineProperty(exports, "__esModule", {
//                 value: true
//             });
//             var _name = require("./name.js");
//             exports.default = "hello " + _name.name + "!";
//         },
//         {
//             "./name.js": 2
//         },
//     ],
//     2: [
//         function(require, module, exports) {
//             "use strict";
//             Object.defineProperty(exports, "__esModule", {
//                 value: true
//             });
//             var name = exports.name = 'world';
//         },
//         {},
//     ],
// })


const graph = createGraph("./example/entry.js");
const result = bundle(graph);

// 打包生成文件
fs.writeFileSync("./bundle.js", result);