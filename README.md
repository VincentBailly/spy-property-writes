# spy-property-writes

JavaScript offers various ways for an object to store another object.
This library gives a uniform way to spy the various ways in which properties are passed to an object.
This library also gives the power to change the values of these read operations.
This library is not concerned by how the values are stored in the object but only how they are passed to it.

## Usage

### Spy property setters

```javascript

const { spyPropertyWrites } = require('spy-property-writes')

const o = {}

const spyCallback = function(source, query, value) {
  console.log({ query, value })
  return value
}

const handler = spyPropertyWrites(spyCallback)
const spy = new Proxy(o, handler)

spy.a = 42
//  console.log() => { query: 'set("a")', value: 42 } 

```
### Spy function arguments

```javascript

const { spyPropertyWrites } = require('spy-property-writes')

const o = function() {}

const spyCallback = function(source, query, value) {
  console.log({ query, value })
  return value
}

const handler = spyPropertyWrites(spyCallback)
const spy = new Proxy(o, handler)

spy.bind({ foo: 'bar' })(42, 43)
//  console.log() => { query: 'arguments(apply())', value: { thisArg: { foo: 'bar' }, args: [42, 43] } } 

```

### Spy constructor arguments

```javascript

const { spyPropertyWrites } = require('spy-property-writes')

const o = function() {}

const spyCallback = function(source, query, value) {
  console.log({ query, value })
  return value
}

const handler = spyPropertyWrites(spyCallback)
const spy = new Proxy(o, handler)

new spy(42, 43)
//  console.log() => { query: 'arguments(constructor)', value: [42, 43] } 

```

### DefineProperty

```javascript

const { spyPropertyWrites } = require('spy-property-writes')

const o = function() {}

const spyCallback = function(source, query, value) {
  console.log({ query, value })
  return value
}

const handler = spyPropertyWrites(spyCallback)
const spy = new Proxy(o, handler)

Object.defineProperty(spy, 'a', { value: 42 })
//  console.log() => { query: 'defineProperty("a").value', value: 42 } 

Object.defineProperty(spy, 'b', { get() { return 42 } })
o.b
//  console.log() => { query: 'defineProperty("a").get()', value: 42 } 

```

### getOwnPropertyDescriptor.set

```javascript

const { spyPropertyWrites } = require('spy-property-writes')

const o = { set a() {} }

const spyCallback = function(source, query, value) {
  console.log({ query, value })
  return value
}

const handler = spyPropertyWrites(spyCallback)
const spy = new Proxy(o, handler)

Object.getOwnPropertyDescriptor(spy, 'a').set(42)
//  console.log() => { query: 'getOwnPropertyDescriptor("a").set()', value: 42 } 


```

### SetPrototypeOf

```javascript

const { spyPropertyWrites } = require('spy-property-writes')

const o = function() {}

const spyCallback = function(source, query, value) {
  console.log({ query, value })
  return value
}

const handler = spyPropertyWrites(spyCallback)
const spy = new Proxy(o, handler)

Object.setPrototypeOf(spy, { foo: 42 })
//  console.log() => { query: 'setPrototypeOf()', value: { foo: 42 } } 

```

### Composing proxy handlers

The proxy handlers created by 'spy-property-writes' can wrap other proxy handlers.
This allows composition of 'proxy enhancers' to create sophisticated
proxy behavior.

```javascript

const { spyPropertyWrites } = require('spy-property-reads')

const o = {}
// 1 - every property is doubled
const handler1 = { set: (target, prop, value) => target[prop] = value * 2 }

const spyCallback = function(source, query, value) {
  console.log({ query, value })
  return value
}

// 2 - spy on property reads
const handler2 = spyPropertyWrites(spyCallback, handler1)

// 3 - add un-spyable property
const handler3 = {
  ...handler2,
  set: function(target, prop, value) {
    if (prop === 'secret') { target[prop] = value }
    else { return handler2.set(...arguments) }
  }
}

const spy = new Proxy(o, handler3)

spy.a = 42
//  console.log() => { query: 'set("a")', result: 42 } 

spy.a // 84

spy.secret = 43
// No call to "console.log"

```
