'use strict';

angular.module('ngToast', []).factory('ngToast', ['$rootScope', '$compile', '$timeout', function ($rootScope, $compile, $timeout) {

  var $el = angular.element,
      DEFAULT_TIMEOUT_MSEC = 1000,
      $toast = null,
      $toastParent = null,
      scope = {},
      options = {},
      animationEndEvent = 'animationend webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend';

  var defaultOps = {
    timeout: DEFAULT_TIMEOUT_MSEC, // ms default
    clickToClose: false, // boolean
    appendTo: null, // selector
    className: '',
    animClass: {
      opening: 'ngtoast-opening',
      open: 'ngtoast-open',
      closing: 'ngtoast-closing'
    },
    hoverNotClose: false
  };

  var $body = $el(document.querySelector('body'));
  var publicMethods = {
    open: function open(opts) {
      $el(document.querySelector('.toast')).remove();
      options = angular.extend({}, defaultOps, opts);

      if (options.template && angular.isString(options.template)) {
        $toast = $el(options.template);
      }

      if (options.clickToClose) {
        $toast.on('click', function () {
          publicMethods.close();
        });
      }

      // timeout
      var closeTimeout = DEFAULT_TIMEOUT_MSEC;
      if (options.timeout && angular.isNumber(options.timeout)) {
        closeTimeout = options.timeout;
      }
      // scope
      if (options.scope && angular.isObject(options.scope)) {
        scope = options.scope;
      } else {
        scope = $rootScope.$new();
      }

      $compile($toast)(scope);

      if (options.appendTo && angular.isString(options.appendTo)) {
        $toastParent = $el(document.querySelector(options.appendTo));
      } else {
        $toastParent = $body;
      }

      // hoverNotClose
      var timeoutPromise = $timeout(function () {
        publicMethods.close();
      }, closeTimeout);

      if (options.hoverNotClose) {
        $toast
        .on('mouseenter', function () {
          $timeout.cancel(timeoutPromise);
         })
        .on('mouseleave', function () {
           timeoutPromise = $timeout(function () {
            publicMethods.close();
          }, closeTimeout);
         });
      }
      $toastParent.append($toast);
      $timeout(function () {
        $toast.addClass(options.animClass.opening);
        $toast.unbind(animationEndEvent).bind(animationEndEvent, function () {
          $toast.removeClass(options.animClass.opening).addClass(options.animClass.open);
        });
      });
    },
    close: function close() {
      $toast.removeClass(options.animClass.open).addClass(options.animClass.closing);
      $toast.unbind(animationEndEvent).bind(animationEndEvent, function () {
        scope.$destroy();
        $toast.remove();
      });
    }
  };

  return publicMethods;
}]);


