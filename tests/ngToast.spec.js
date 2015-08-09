describe('perfect-ngToast', function() {

  // testing contents
  // - ngToast to be defined
  // - no options
  // - plain template
  // - template url ($httpBackend)
  // - controller instance

  beforeEach(module('ngToast'));
  afterEach(inject(function (ngToast, $document) {
    ngToast.closeAll();

   //  toasts = angular.element('body')
   //  .find('.ngtoast-container')
   //  console.log(toasts);
   //  $document[0].queryselector('.ngtoast-container')
   //  toasts.triggerHandler('animationend');

    [].slice.call(
      $document.find('body').children()
    )
    .map(angular.element)
    .forEach(function (elm) {
      if (elm.hasClass('ngtoast-container')) {
        // yuck
        elm.triggerHandler('animationend');
      }
    });
  }));

  // - ngToast to be defined
  it('the ngToast service should be injected', inject(function(ngToast) {
    expect(ngToast).toBeDefined();
  }));

  // - returned object has id
  describe('with Empty option', function () {
    var elm, toast;
    beforeEach(inject(function (ngToast, $timeout, $document) {
      toast = ngToast.open();
      $timeout.flush();
      var id = toast.id
      elm = $document[0].querySelector('#toast' + id);
   }));

    it('open method should returns valid toast object', inject(function () {
      expect(toast).toBeDefined();
    }));

    it('toast should include a toast id', function() {
      expect(toast.id).toEqual(0);
    });

    it('toast dom should be created', function() {
      expect(elm).toBeDefined();
    });

    it('toast should have Empty template', inject(function () {
      expect(elm.textContent).toEqual('Empty');
    }));

    it('toast should have Empty template', inject(function () {
      expect(elm.textContent).toEqual('Empty');
    }));

  });

  // - plain template
  describe('with a plain template', function () {
    var elm;
    beforeEach(inject(function (ngToast, $timeout, $document) {
      var id = ngToast.open({
        template: '<div><p>some text {{1 + 1}}</p></div>',
        plain: true
      }).id;
      $timeout.flush();
      elm = $document[0].querySelector('#toast' + id);
    }));

    it('should have compiled the html', inject(function () {
      expect(elm.textContent).toEqual('some text 2');
    }));
  });


  // - template url
  describe('use template URL', function () {
    var elm;
    beforeEach(inject(function (ngToast, $timeout, $document, $httpBackend) {
      $httpBackend.when('GET', 'test_template.html')
      // $httpBackend.whenGET('test.html')
      .respond('<div><p>some text</p></div>');
      var id = ngToast.open({
        template: 'test_template.html',
        plain: false
      }).id;
      $httpBackend.flush();
      $timeout.flush();
      elm = $document[0].querySelector('#toast' + id);
    }));

    it('should have compiled the html', inject(function () {
      expect(elm.textContent).toEqual('some text');
    }));
  });


  // - controller instance
  describe('controller scope should be activated', function () {
    var elm;
    beforeEach(inject(function (ngToast, $timeout, $document) {
      var id = ngToast.open({
        template: '<div><p>{{text}}</p></div>',
        plain: true,
        controller: ['$scope', function($scope) {
          $scope.text = 'hello'
        }]
      }).id;
      $timeout.flush();
      elm = $document[0].querySelector('#toast' + id);
    }));

    it('scope should be activated', inject(function () {
      expect(elm.textContent).toEqual('hello');
    }));
  });

});

