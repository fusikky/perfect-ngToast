angular.module('ngToast', []).factory('ngToast', [
  '$rootScope',
  '$compile',
  '$controller',
  '$timeout',
  '$q',
  function ($rootScope, $compile, $controller, $timeout, $q) {

    /** TODO:
     * options : html template get / plain
     */

    var $el = angular.element,
      options = {},
      $body = $el(document.querySelector('body'));

    const DEFAULT_TIMEOUT_MSEC = 2000,
      animationEndEvent = 'animationend webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend transitionend webkitTransitionEnd mozTransitionEnd MSTransitionEnd  oTransitionEnd',
      defaultOps = {
       timeout: DEFAULT_TIMEOUT_MSEC, // ms
       appendTo: null, // selector
       className: 'ngtoast-default', // classname to add for container
       animClass: {
         opening: 'ngtoast-opening',
         open: 'ngtoast-open',
         closing: 'ngtoast-closing'
       },
       clickToClose: false, // boolean
       hoverNotClose: false, // boolean
       autoClose: true // boolean
    };

    class ngToast {

      constructor() {
        this.scopes = {};
        this.globalId = 0;
        this.closeDefers = [];
        this.openToastIds = [];
      }

      open(opts) {
        var $toastParent = null,
          $toast = null,
          toastId = this.globalId++,
          scope = {},
          closeDefer,
          closeTimeout = DEFAULT_TIMEOUT_MSEC,
          timeoutPromise = null;

        this.closeDefers[toastId] = closeDefer = $q.defer();
        this.openToastIds.push(toastId);

        // extend options
        options = angular.extend({}, defaultOps, opts);

        // scope
        if (options.scope && angular.isObject(options.scope)) {
          this.scopes[toastId] = scope = options.scope.$new();
        } else {
          this.scopes[toastId] = scope = $rootScope.$new();
        }

        scope.closeThisToast = (value) => {
          this.close($toast, value);
        };

         // controller
        if (options.controller && (angular.isString(options.controller) || angular.isArray(options.controller) || angular.isFunction(options.controller))) {
          let ctrl = options.controller;
          let controllerInstance = $controller(ctrl, {$scope: scope});
        }

        // create template
        // TODO: use template url
        if (options.template && angular.isString(options.template)) {
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
          $toast.on('click', (evt) => {
            this.close($toast);
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
        if (options.autoClose) {
          timeoutPromise = $timeout((evt) => {
            this.close($toast);
          }, closeTimeout);
        }

        // hoverNotClose
        if (options.hoverNotClose) {
          $toast
          .on('mouseenter', (evt) => {
            $timeout.cancel(timeoutPromise);
           })
          .on('mouseleave', (evt) =>{
             timeoutPromise = $timeout((evt) => {
               this.close($toast);
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
              return
            }
            $toast.removeClass(options.animClass.opening).addClass(options.animClass.open);
            $rootScope.$broadcast('ngToast.opened', toastId);
          });
        }, 100);

        return {
          id: toastId,
          closePromise: closeDefer.promise
        }
      }

      close($toast, value) {
        var toastId = parseInt($toast.attr('toast-id'));
        $toast.removeClass(options.animClass.open).addClass(options.animClass.closing);
        $rootScope.$broadcast('ngToast.closing', toastId);
        // perform close with animation
        $toast.unbind(animationEndEvent).bind(animationEndEvent, (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          if (!$el(evt.target).hasClass('ngtoast-container')) {
            return
          }
          $toast.remove();
          this.scopes[toastId].$destroy();
          this.closeDefers[toastId].resolve(value);
          $rootScope.$broadcast('ngToast.closed', toastId);
        });
      }
    }

    return new ngToast();
}]);
