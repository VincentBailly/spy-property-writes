exports.spyPropertyWrites = function (callback, handler = {}) {
  const reflect = (name, ...args) => {
    if (handler[name]) {
      return handler[name](...args)
    }
    return Reflect[name](...args)
  }
  return {
    ...handler,
    set: (target, prop, value) => {
      callback(target, `set("${prop.toString()}")`, value, v => reflect('set', target, prop, v))
    },
    apply: (target, thisArg, args) => {
      let newThisArg = undefined
      callback(target, 'thisArgument(apply)', thisArg, n => { newThisArg = n })

      const newArgs = args.map(_ => undefined)
      args.forEach((a, i) => callback(target, `argument${i+1}(apply)`, a, v => { newArgs[i] = v }))
      return reflect('apply', target, newThisArg, newArgs)
    },
    construct: (target, args) => {
      const newArgs = args.map(_ => undefined)
      args.forEach((a, i) => callback(target, `argument${i+1}(constructor)`, a, v => { newArgs[i] = v }))
      return reflect('construct', target, newArgs)
    },
    getOwnPropertyDescriptor: (target, prop) => {
      const desc = reflect('getOwnPropertyDescriptor', target, prop)
      if (!Object.keys(desc).includes('set')) {
        return desc
      }
      return {
        ...desc,
        set: (value) => {
          callback(target, `getOwnPropertyDescriptor("${prop.toString()}").set()`, value, v => { desc.set(v) })
        }
      }
    },
    setPrototypeOf: (target, prototype) => {
      callback(target, 'setPrototypeOf()', prototype, v => reflect('setPrototypeOf', target, v))
      return true
    },
    defineProperty: (target, property, descriptor) => {
      const newDescriptor = {...descriptor}
      if (Object.keys(descriptor).includes('value')) {
        newDescriptor.value = undefined
        callback(target, `defineProperty("${property.toString()}").value`, descriptor.value, v => { 
          newDescriptor.value = v
          reflect('defineProperty', target, property, newDescriptor)
        })
      } else if (Object.keys(descriptor).includes('get')) {
        newDescriptor.get = () => {
          let result = undefined
          callback(target, `defineProperty("${property.toString()}").get()`, descriptor.get(), v => { result = v })
          return result
        }
        reflect('defineProperty', target, property, newDescriptor)
      } else {
        reflect('defineProperty', target, property, newDescriptor)
      }
      return true
    }
  }
}
