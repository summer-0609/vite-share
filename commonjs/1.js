/**
    1. module.exports 初始值为一个空对象 {}
    2. exports 是指向的 module.exports 的引用
    3. require() 返回的是 module.exports 而不是 exports
*/

// 1
module.exports = {
    a: 2
}
exports.a = 1;

// 2
// module.exports.a = 2;
// exports.a = 1;



// function require(/* ... */) {
//     const module = { exports: {} };
//     ((module, exports) => {
//       // Module code here. In this example, define a function.
//       function someFunc() {}
//       exports = someFunc;
//       // At this point, exports is no longer a shortcut to module.exports, and
//       // this module will still export an empty default object.
//       module.exports = someFunc;
//       // At this point, the module will now export someFunc, instead of the
//       // default object.
//     })(module, module.exports);
//     return module.exports;
// }
  