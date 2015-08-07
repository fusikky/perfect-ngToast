angular.module('ngToast', []).factory('ngToast', [
  '$rootScope',
  '$compile',
  '$controller',
  '$timeout',
  '$q',
  '$http',
  function ($rootScope, $compile, $controller, $timeout, $q, $http) {

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
       autoClose: true, // boolean
       plain: true // boolean
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

        // set timeout for close
        if (options.timeout && angular.isNumber(options.timeout)) {
          closeTimeout = options.timeout;
        }

        // set toast parent dom
        if (options.appendTo && angular.isString(options.appendTo)) {
          $toastParent = $el(document.querySelector(options.appendTo));
        } else {
          $toastParent = $body;
        }

        // set action to toast (after template loaded).
        function setActionToToast ($toast) {
          $toast
          .addClass('ngtoast-container')
          .attr('toast-id', toastId)

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

          $compile($toast)(scope);

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
        }

        // create template and set action
        $q.all({
          template: loadTemplate(options.template)
        }).then((res) => {
          $toast = $el(res.template);
          setActionToToast.call(this, $toast);
        });

        function loadTemplateUrl (templUrl) {
          return $http.get(templUrl).then(function(response) {
            return response.data;
          });
        }

        function loadTemplate (templ) {
          if(!templ) return '<span>Empty</span>'
          if (angular.isString(templ) && options.plain) {
            return templ;
          }
          return loadTemplateUrl(templ);
        }

        return {
          id: toastId,
          closePromise: closeDefer.promise,
          close: (value) => {
            this.close($toast, value);
          }
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

      closeAll(value) {
        var $allToasts = document.querySelectorAll('.ngtoast-container');
        for (var i =  0; i < $allToasts.length; i++) {
            var toast = $allToasts[i];
            this.close($el(toast), value);
        }
      }
    }

    return new ngToast();
}]);
