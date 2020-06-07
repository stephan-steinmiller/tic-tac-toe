


this.on = function() {
    console.log('on wurde ausgeführt');
    
}

var myNamedFunction = function() {
    console.log('damit stephan es versteht')
    return 3
}

const myContext = {
     on: function() {
         console.log('im another function from another context')
     }
}

const ios = {
    on: function(str, callback) {
        return callback()
    },
    greetStephan: () => {
        this.on('asdfasdfasd', () => {})
    }
}

const result = ios.on('asdfdasf', myNamedFunction)
const result1 = ios.greetStephan()
console.log('result ', result)