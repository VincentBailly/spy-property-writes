const tap = require('tap')
const { spyPropertyWrites } = require('..')

tap.test('setters', t => {
  const o = {}

  const log = []
  const spyCallback = function(source, query, value) {
    log.push({ query, value })
    return 41
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

tap.test('setters: mutate ar', t => {
  const o = function(a, b) { return `${this.foo}:${a}:${b}` }

  const log = []
  const spyCallback = function(source, query, value) {
    log.push({ query, value })
    return { thisArg: { foo: 'baz' }, args: [3] }
  }

  const handler = spyPropertyWrites(spyCallback)
  const spy = new Proxy(o, handler)

  const r = spy.bind({ foo: 'bar' })(42, 43)
  t.equal(log.length, 1)
  t.equal(log[0].query, 'arguments(apply())')
  t.equal(log[0].value.thisArg.foo, 'bar')
  t.equal(log[0].value.args.length, 2)
  t.equal(log[0].value.args[0], 42)
  t.equal(log[0].value.args[1], 43)

  t.equal(r, 'baz:3:undefined')
  t.end()
})
