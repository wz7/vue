/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

// 基于数组原型对象创建一个新的对象 ------------------------------------------------------------
// 覆写（增强）数组原型方法，使其具有依赖通知更新能力 ---------------------------------------------
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 * 遍历这七个方法 --------------------------------------------------------------------------
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  // 以 push 方法为例，获取 arrayProto.push 的原生方法
  const original = arrayProto[method]
  // 
  def(arrayMethods, method, function mutator (...args) {
    // 先执行原生的 push 方法，往数组中放置新的数据 --------------------------------------------
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 如果执行的是 push unshift splice 操作的话，进行响应式处理 -------------------------------
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 执行 dep.notify 方法进行以来通知更新 --------------------------------------------------
    ob.dep.notify()
    return result
  })
})
