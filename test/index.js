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
