# [WIP] perfect ngToast

Create toast plugin for [Angular.js](https://angularjs.org/).

inspired by [ngDialog](https://github.com/likeastore/ngDialog "ngDialog")

using ECMAScript6 (compiled by [babbel](https://github.com/babel/babel))

### [Demo](http://fusikky.github.io/perfect-ngToast)

## Usage

You need to include `ngToast.css` and `ngToast.js` for essential.

Additionally, you can use `ngToast-theme-default.css` for default style, and `ngToast-theme-custom.css` for custom animation.

---

## Methods
##### ``.open(options)``
This method allows to open toast with `options` object.

### Options:

##### ``template {String}``
This is necessary property to open toast.

(in future, you can set dom url to this property.)

##### ``timeout {Number}``
This is duration time to remain toast. [ms]

default: `2000`

##### ``appendTo {String}``

You can set **selector**  of destination dom 
which toast will append.
such as `.contents`, `#header`.

default: `body`

##### ``className``

This is className you want to append toast dom.

such ad `my-toast`

##### ``animClass {Object}``
Using this property you can set class name when

- ngtoast opening
- ngtoast open
- ngtoast closing

like this

```
animClass: {
  opening: 'opening-class',
  open: 'open-class',
  closing: 'closing-class'
}
```

default: 

```
animClass: {
  opening: 'ngtoast-opening',
  open: 'ngtoast-open',
  closing: 'ngtoast-closing'
}
```

##### ``clickToClose {boolean}``
This property enable you to close when you click the toast.

default: `false`

##### ``hoverNotClose {boolean}``
if this property is `true`, toast will not close
during you hover on toast.

default: `false`

##### ``autoClose {boolean}``
If this property is `false`, toast will not close automatically.

default: `true`

##### ``controller {String} | {Array} | {Object}``

You cat set controller for toast dom.

such as 

```
  {
    controller: ['$scope', 'myService', function($scope, myService) {
        // controller logic
  }
```

##### ``scope``

scope for toast dom. you can inherit your specified scope.

### Returns:

##### ``id {Number}``
This is the ID of the toast. it is incremented every creation.

##### ``closePromise {Promise}``
This is promise for toast closed.

such as

```
ngToast.open({
  template: '<div><p>test</p></div>'
}).closePromise.then(function(){
  // your code after toast close
})


```
