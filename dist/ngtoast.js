'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

angular.module('ngToast', []).factory('ngToast', ['$rootScope', '$compile', '$timeout', '$q', function ($rootScope, $compile, $timeout, $q) {

  /** TODO:
   * options : html template get / plain
   */

  var $el = angular.element,
      options = {},
      $body = $el(document.querySelector('body'));

  var DEFAULT_TIMEOUT_MSEC = 1000,
      animationEndEvent = 'animationend webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend transitionend webkitTransitionEnd mozTransitionEnd MSTransitionEnd  oTransitionEnd',
      defaultOps = {
    timeout: DEFAULT_TIMEOUT_MSEC, // ms default
    appendTo: null, // selector
    className: null, // classname to add for container
    animClass: {
      opening: 'ngtoast-opening',
      open: 'ngtoast-open',
      closing: 'ngtoast-closing'
    },
    clickToClose: false, // boolean
    hoverNotClose: false // boolean
  };

  var ngToast = (function () {
    function ngToast() {
      _classCallCheck(this, ngToast);

      this.scopes = {};
      this.globalId = 0;
      this.closeDefers = [];
      this.openToastIds = [];
    }

    _createClass(ngToast, [{
      key: 'open',
      value: function open(opts) {
        var self = this,
            $toastParent = null,
            $toast = null,
            toastId = this.globalId++,
            scope = {},
            closeDefer,
            closeTimeout = DEFAULT_TIMEOUT_MSEC;

        this.closeDefers[toastId] = closeDefer = $q.defer();
        this.openToastIds.push(toastId);

        // Future Use for ES6
        // var promise = new Promise();

        // extend options
        options = angular.extend({}, defaultOps, opts);

        // scope
        if (options.scope && angular.isObject(options.scope)) {
          this.scopes[toastId] = scope = options.scope;
        } else {
          this.scopes[toastId] = scope = $rootScope.$new();
        }

        // create template
        // TODO: use template url
        if (options.template && angular.isString(options.template)) {
          $toast = $el(options.template);
          $toast.addClass('ngtoast-container').attr('toast-id', toastId);
        }

        // add className
        if (options.className) {
          $toast.addClass(options.className);
        }

        // click to close
        if (options.clickToClose) {
          $toast.on('click', function () {
            self.close($toast);
          });
        }

        // set timeout for close
        if (options.timeout && angular.isNumber(options.timeout)) {
          closeTimeout = options.timeout;
        }

        $compile($toast)(scope);

        // set toast parent dom
        if (options.appendTo && angular.isString(options.appendTo)) {
          $toastParent = $el(document.querySelector(options.appendTo));
        } else {
          $toastParent = $body;
        }

        // auto close
        var timeoutPromise = $timeout(function () {
          self.close($toast);
        }, closeTimeout);

        // hoverNotClose
        if (options.hoverNotClose) {
          $toast.on('mouseenter', function () {
            $timeout.cancel(timeoutPromise);
          }).on('mouseleave', function () {
            timeoutPromise = $timeout(function () {
              self.close($toast);
            }, closeTimeout);
          });
        }

        // append toast
        $toastParent.append($toast);

        // open animation
        $timeout(function () {
          $toast.addClass(options.animClass.opening);
          $rootScope.$broadcast('ngToast.opening', toastId);
          $toast.unbind(animationEndEvent).bind(animationEndEvent, function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!$el(e.target).hasClass('ngtoast-container')) {
              return;
            }
            $toast.removeClass(options.animClass.opening).addClass(options.animClass.open);
            $rootScope.$broadcast('ngToast.opened', toastId);
          });
        }, 100);

        return {
          id: toastId,
          closePromise: closeDefer.promise
        };
      }
    }, {
      key: 'close',
      value: function close($toast) {
        var self = this;
        var toastId = parseInt($toast.attr('toast-id'));
        $toast.removeClass(options.animClass.open).addClass(options.animClass.closing);
        $rootScope.$broadcast('ngToast.closing', toastId);
        // perform close with animation
        $toast.unbind(animationEndEvent).bind(animationEndEvent, function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (!$el(e.target).hasClass('ngtoast-container')) {
            return;
          }
          self.scopes[toastId].$destroy();
          $toast.remove();
          var def = self.closeDefers[toastId];
          self.closeDefers[toastId].resolve();
          $rootScope.$broadcast('ngToast.closed', toastId);
        });
      }
    }]);

    return ngToast;
  })();

  return new ngToast();
}]);