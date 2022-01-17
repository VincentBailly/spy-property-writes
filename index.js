exports.spyPropertyWrites = function (callback) {
  return {
    set: (target, prop, value) => {
      callback(target, `set("${prop.toString()}")`, value, v => Reflect.set(target, prop, v))
    },
    apply: (target, thisArg, args) => {
      let newThisArg = undefined
      callback(target, 'thisArgument(apply)', thisArg, n => { newThisArg = n })

      const newArgs = args.map(_ => undefined)
      args.forEach((a, i) => callback(target, `argument${i+1}(apply)`, a, v => { newArgs[i] = v }))
      return Reflect.apply(target, newThisArg, newArgs)
    },
    construct: (target, args) => {
      const newArgs = args.map(_ => undefined)
      args.forEach((a, i) => callback(target, `argument${i+1}(constructor)`, a, v => { newArgs[i] = v }))
      return Reflect.construct(target, newArgs)
    },
    getOwnPropertyDescriptor: (target, prop) => {
      const desc = Reflect.getOwnPropertyDescriptor(target, prop)
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
    defineProperty: (target, property, descriptor) => {
      const newDescriptor = {...descriptor}
      if (Object.keys(descriptor).includes('value')) {
        newDescriptor.value = undefined
        callback(target, `defineProperty("${property.toString()}").value`, descriptor.value, v => { 
          newDescriptor.value = v
          Reflect.defineProperty(target, property, newDescriptor)
        })
      } else if (Object.keys(descriptor).includes('get')) {
        newDescriptor.get = () => {
          let result = undefined
          callback(target, `defineProperty("${property.toString()}").get()`, descriptor.get(), v => { result = v })
          return result
        }
        Reflect.defineProperty(target, property, newDescriptor)
      } else {
        Reflect.defineProperty(target, property, newDescriptor)
      }
      return true
    }
  }
}
