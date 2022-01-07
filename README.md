# spy-property-writes

JavaScript offers various ways for an object to store another object.
This library give a uniform way to trap the various ways in which properties are passed to an object. This library is not concerned by how the values are stored in the object but only how they are passed to it.

## Usage

### Spy property setters

```javascript

const { spyPropertyWrites } = require('spy-property-writes')

const o = {}

const spyCallback = function(source, query, value, setResult) {
  console.log({ query, value })
  return setResult(value)
}

const handler = spyPropertyReads(spyCallback)
const spy = new Proxy(o, handler)

spy.a = 42
//  console.log() => { query: 'set("a")', value: 42 } 

```
### Spy function arguments

```javascript

const { spyPropertyWrites } = require('spy-property-writes')

const o = function() {}

const spyCallback = function(source, query, value, setResult) {
  console.log({ query, value })
  return setResult(value)
}

const handler = spyPropertyReads(spyCallback)
const spy = new Proxy(o, handler)

spy.bind({ foo: 'bar' })(42, 43)
//  console.log() => { query: 'thisArgument(apply())', value: { foo: 'bar' } } 
//  console.log() => { query: 'argument1(apply())', value: 42 } 
//  console.log() => { query: 'argument2(apply())', value: 41 } 

spy(42)
//  console.log() => { query: 'argument1(apply())', value: 42 } 
```

### Spy constructor arguments

```javascript

const { spyPropertyWrites } = require('spy-property-writes')

const o = function() {}

const spyCallback = function(source, query, value, setResult) {
  console.log({ query, value })
  return setResult(value)
}

const handler = spyPropertyReads(spyCallback)
const spy = new Proxy(o, handler)

new spy(42, 43)
//  console.log() => { query: 'argument1(constructor)', value: 42 } 
//  console.log() => { query: 'argument2(constructor)', value: 41 } 
```
