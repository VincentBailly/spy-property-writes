const tap = require('tap')
const { spyPropertyWrites } = require('..')

tap.test('setters', t => {
  const o = {}

  const log = []
  const spyCallback = function(source, query, value, write) {
    log.push({ query, value })
    write(41)
  }

  const handler = spyPropertyWrites(spyCallback)
  const spy = new Proxy(o, handler)

  spy.a = 42
  t.equal(log.length, 1)
  t.equal(log[0].query, 'set("a")')
  t.equal(log[0].value, 42)
  t.equal(o.a, 41)

  const s = Symbol('s')
  spy[s] = 43
  t.equal(log.length, 2)
  t.equal(log[1].query, 'set("Symbol(s)")')
  t.equal(log[1].value, 43)
  t.equal(o.a, 41)
  t.end()
})

tap.test('function args', t => {
  const o = function(a, b) { return `${this.foo}:${a}:${b}` }

  const log = []
  const spyCallback = function(source, query, value, write) {
    log.push({ query, value })
    if (query === 'thisArgument(apply)') write({ foo: 'baz' })
    else if (query === 'argument1(apply)') write(3)
  }

  const handler = spyPropertyWrites(spyCallback)
  const spy = new Proxy(o, handler)

  const r = spy.bind({ foo: 'bar' })(42, 43)
  t.equal(log.length, 3)
  t.equal(log[0].query, 'thisArgument(apply)')
  t.equal(log[0].value.foo, 'bar')
  t.equal(log[1].query, 'argument1(apply)')
  t.equal(log[1].value, 42)
  t.equal(log[2].query, 'argument2(apply)')
  t.equal(log[2].value, 43)

  t.equal(r, 'baz:3:undefined')
  t.end()
})

tap.test('constructor args', t => {
  const o = function(a, b) { return { foo: `${a}:${b}` } }

  const log = []
  const spyCallback = function(source, query, value, write) {
    log.push({ query, value })
    if (query === 'argument1(constructor)') write(3)
  }

  const handler = spyPropertyWrites(spyCallback)
  const spy = new Proxy(o, handler)

  const r = new spy(42, 43)
  t.equal(log.length, 2)
  t.equal(log[0].query, 'argument1(constructor)')
  t.equal(log[0].value, 42)
  t.equal(log[1].query, 'argument2(constructor)')
  t.equal(log[1].value, 43)

  t.equal(r.foo, '3:undefined')
  t.end()
})

tap.test('define property', t => {
  const o = {}

  const log = []
  const spyCallback = function(source, query, value, write) {
    log.push({ query, value })
    write(42)
  }

  const handler = spyPropertyWrites(spyCallback)
  const spy = new Proxy(o, handler)

  Object.defineProperty(spy, 'a', { configurable: true, value: 21 })
  t.equal(log.length, 1)
  t.equal(log[0].query, 'defineProperty("a").value')
  t.equal(log[0].value, 21)
  t.equal(o.a, 42)

  Object.defineProperty(spy, 'b', { configurable: true, get() { return 21 } })
  t.equal(o.b, 42)
  t.equal(log.length, 2)
  t.equal(log[1].query, 'defineProperty("b").get()')
  t.equal(log[1].value, 21)

  t.end()
})

tap.test('getOwnPropertyDescriptor().set()', t => {

  let val = undefined
  const o = { 
    set a(v) { val = v },
  }

  const log = []
  const spyCallback = function(source, query, value, write) {
    log.push({ query, value })
    write(21)
  }

  const handler = spyPropertyWrites(spyCallback)
  const spy = new Proxy(o, handler)

  Object.getOwnPropertyDescriptor(spy, 'a').set(42)

  t.equal(log.length, 1)
  t.equal(log[0].query, 'getOwnPropertyDescriptor("a").set()')
  t.equal(log[0].value, 42)
  t.equal(val, 21)

  t.end()
})

tap.test('setPrototypeOf', t => {

  let val = undefined
  const o = {}

  const log = []
  const spyCallback = function(source, query, value, write) {
    log.push({ query, value })
    write({ foo: 21 })
  }

  const handler = spyPropertyWrites(spyCallback)
  const spy = new Proxy(o, handler)

  Object.setPrototypeOf(spy, { foo: 42 })

  t.equal(log.length, 1)
  t.equal(log[0].query, 'setPrototypeOf()')
  t.equal(log[0].value.foo, 42)
  t.equal(o.foo, 21)

  t.end()
})

tap.test('composition', t => {
  const o = {}
  // 1 - every property is doubled
  let getterCalled = false
  const handler1 = {
    set: (target, prop, value) => { target[prop] = value * 2 },
    get: (target, prop) => { getterCalled = true; return target[prop] }
  }

  const log = []
  const spyCallback = function(source, query, value, write) {
    log.push({ query, value })
    write(value - 2)
  }

  // 2 - spy on property reads
  const handler2 = spyPropertyWrites(spyCallback, handler1)

  // 3 - add un-spyable property
  const handler3 = {
    ...handler2,
    set: function(target, prop, value, write) {
      if (prop === 'secret') { target[prop] = value }
      else { return handler2.set(...arguments) }
    }
  }

  const spy = new Proxy(o, handler3)

  spy.a = 42
  t.equal(log.length, 1)
  t.equal(log[0].query, 'set("a")')
  t.equal(log[0].value, 42)
  t.equal(spy.a, 80)
  t.ok(getterCalled)

  spy.secret = 43
  t.equal(log.length, 1)
  t.equal(o.secret, 43)
  t.end()
})
