/**
 *
 * @param {*} target 装饰的目标
 * @param {*} key 属性名 PI
 * @param {*} descriptor 属性描述器
 */
function readonly(target, key, descriptor) {
    descriptor.writable = false;
}

class Person {
  @readonly PI = 3.14
}

const p = new Person();
p.PI = 34;
// console.log(p)
