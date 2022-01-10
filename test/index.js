const tap = require('tap')
const { spyPropertyWrites } = require('..')

tap.test('testing setup', t => {
  const o = {}

  const log = []
  const spyCallback = function(source, query, value, setResult) {
    log.push({ query, value })
    return setResult(41)
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
