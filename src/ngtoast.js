 angular.module('ngToast', []).factory('ngToast', [
  '$rootScope',
  '$compile',
  '$timeout',
  '$q',
  function ($rootScope, $compile, $timeout, $q) {

    /** TODO:
     * options : html template get / plain
     */

    var $el = angular.element,
      $toast = null,
      $toastParent = null,
      options = {};

    var $body = $el(document.querySelector('body'));

    const DEFAULT_TIMEOUT_MSEC = 1000;
    const animationEndEvent = 'animationend webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend';
    const defaultOps = {
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

    class ngToast {

      constructor() {
        this.scopes = {};
        this.globalId = 0;
        this.closeDefers = [];
        this.openToastIds = [];
      }

      open(opts) {
        var self = this;
        var toastId = this.globalId++;
        this.openToastIds.push(toastId);
        var scope = {};
        var closeDefer;
        this.closeDefers[toastId] = closeDefer = $q.defer();

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
          // TODO: add container
          $toast = $el(options.template);
          $toast
          .addClass('ngtoast-container')
          .attr('toast-id', toastId)
        }

        // add className
        if (options.className) {
          $toast.addClass(options.className)
        }

        // click to close
        if (options.clickToClose) {
          $toast.on('click', function () {
            self.close(toastId);
          });
        }

        // set timeout for close
        var closeTimeout = DEFAULT_TIMEOUT_MSEC;
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
          self.close(toastId);
        }, closeTimeout);

        // hoverNotClose
        if (options.hoverNotClose) {
          $toast
          .on('mouseenter', function () {
            $timeout.cancel(timeoutPromise);
           })
          .on('mouseleave', function () {
             timeoutPromise = $timeout(function () {
               self.close(toastId);
             }, closeTimeout);
           });
        }

        // append toast
        $toastParent.append($toast);

        // open animation
        $timeout(function () {
          $toast.addClass(options.animClass.opening);
          $rootScope.$broadcast('ngToast.opening');
          $toast.unbind(animationEndEvent).bind(animationEndEvent, function () {
            $toast.removeClass(options.animClass.opening).addClass(options.animClass.open);
            $rootScope.$broadcast('ngToast.opened');
          });
        });

        return {
          closePromise: closeDefer.promise
        }
      }

      close(toastId) {
        var self = this;
        $toast.removeClass(options.animClass.open).addClass(options.animClass.closing);
        $rootScope.$broadcast('ngToast.closing');
        // perform close with animation
        $toast.unbind(animationEndEvent).bind(animationEndEvent, function () {
          self.scopes[toastId].$destroy();
          $toast.remove();
          var def = self.closeDefers[toastId];
          self.closeDefers[toastId].resolve();
          $rootScope.$broadcast('ngToast.closed');
        });
      }
    }

    return new ngToast();
}]);


