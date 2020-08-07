

document.addEventListener('DOMContentLoaded', (ev) => {
    setTimeout(() => document.querySelector('#btn-open').click(), 0)
})


window.open = (function(original) {
    return function(...args) {
        console.log('window.open', ...args);
        return original.apply(window, args)
    }
})(window.open)