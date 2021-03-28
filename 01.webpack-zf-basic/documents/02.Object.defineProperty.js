let p = {name: 'lihua'}
Object.defineProperty(p, 'age', {
  value: 10,
  configurable: true, // 是否可删除
  enumerable: false, // for循环是否可以打印
})

p.age = 13
console.log(Object.keys(p)) // ['name']
console.log(Reflect.has(p, 'age')) // true