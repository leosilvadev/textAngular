describe('taBind', function () {
	'use strict';
	beforeEach(module('textAngular'));
	afterEach(inject(function($document){
		$document.find('body').html('');
	}));
	var $rootScope;
	
	it('should require ngModel', inject(function ($compile, $rootScope) {
		expect(function () {
			$compile('<div ta-bind></div>')($rootScope);
			$rootScope.$digest();
		}).toThrow();
	}));
	
	it('should add ta-bind class', inject(function ($compile, $rootScope) {
		var element = $compile('<div ta-bind ng-model="test"></div>')($rootScope);
		$rootScope.$digest();
		expect(element.hasClass('ta-bind')).toBe(true);
	}));
	
	it('should prevent mousedown from propagating up from contenteditable', inject(function($compile, $rootScope){
		var element = $compile('<div ta-bind contenteditable="true" ng-model="test"></div>')($rootScope);
		var event;
		if(angular.element === jQuery){
			event = jQuery.Event('mousedown');
			element.triggerHandler(event);
			$rootScope.$digest();
			expect(event.isPropagationStopped()).toBe(true);
		}else{
			var _stopPropagation = false;
			event = {stopPropagation: function(){ _stopPropagation = true; }};
			element.triggerHandler('mousedown', event);
			$rootScope.$digest();
			expect(_stopPropagation).toBe(true);
		}
	}));
	
	describe('should respect HTML5 placeholder', function () {
		describe('and require an id', function(){
			it('should error', inject(function ($compile, $rootScope) {
				expect(function(){
					$rootScope.html = '';
					$compile('<div ta-bind contenteditable="true" ng-model="html" placeholder="Add Comment"></div>')($rootScope);
				}).toThrow('textAngular Error: An unique ID is required for placeholders to work');
			}));
		});
		
		describe('and cleanup after itself on $destroy', function(){
			it('removing specific styles', inject(function ($compile, $rootScope, $document) {
				$rootScope.html = '';
				var element = $compile('<div ta-bind id="test" contenteditable="true" ng-model="html" placeholder="Add Comment"></div>')($rootScope);
				$rootScope.$digest();
				expect(document.styleSheets[1].rules.length).toBe(1);
				element.scope().$destroy();
				$rootScope.$digest();
				expect(document.styleSheets[1].rules.length).toBe(0);
			}));
		});
		
		describe('as contenteditable div initially blank', function(){
			var $rootScope, element, $window;
			beforeEach(inject(function (_$compile_, _$rootScope_, _$window_, $document) {
				$window = _$window_;
				$rootScope = _$rootScope_;
				$rootScope.html = '';
				element = _$compile_('<div ta-bind id="test" contenteditable="true" ng-model="html" placeholder="Add Comment"></div>')($rootScope);
				$document.find('body').append(element);
				$rootScope.$digest();
			}));
			
			afterEach(function(){
				element.remove();
			});
			// Cases: '' value; _defaultVal (<p><br></p>); Other Value
			it('should add the placeholder-text class', function () {
				expect(element.hasClass('placeholder-text')).toBe(true);
			});
			it('should add the placeholder text', function () {
				expect(element.html()).toEqual('<p><br></p>');
				expect($window.getComputedStyle(element[0], ':before').getPropertyValue('content')).toBe("'Add Comment'");
			});
			it('should remove the placeholder-text class on focusin', function () {
				element.triggerHandler('focus');
				$rootScope.$digest();
				expect(element.hasClass('placeholder-text')).toBe(false);
			});
			it('should add the placeholder text back on blur if the input is blank', function () {
				element.triggerHandler('focus');
				$rootScope.$digest();
				expect(element.html()).toEqual('<p><br></p>');
				expect($window.getComputedStyle(element[0], ':before').length).toBe(0);
				element.triggerHandler('blur');
				$rootScope.$digest();
				expect(element.html()).toEqual('<p><br></p>');
				expect($window.getComputedStyle(element[0], ':before').getPropertyValue('content')).toBe("'Add Comment'");
			});
			it('should add the placeholder-text class back on blur if the input is blank', function () {
				element.triggerHandler('focus');
				$rootScope.$digest();
				expect(element.hasClass('placeholder-text')).toBe(false);
				element.triggerHandler('blur');
				$rootScope.$digest();
				expect(element.hasClass('placeholder-text')).toBe(true);
			});
			it('should not add the placeholder text back on blur if the input is not blank', function () {
				element.triggerHandler('focus');
				$rootScope.$digest();
				$rootScope.html = '<p>Lorem Ipsum</p>';
				element.triggerHandler('blur');
				$rootScope.$digest();
				expect($window.getComputedStyle(element[0], ':before').getPropertyValue('display')).toBe("");
				expect(element.html()).toEqual('<p>Lorem Ipsum</p>');
			});
			it('should not add the placeholder-text class back on blur if the input is not blank', function () {
				element.triggerHandler('focus');
				$rootScope.$digest();
				expect(element.hasClass('placeholder-text')).toBe(false);
				$rootScope.html = '<p>Lorem Ipsum</p>';
				$rootScope.$digest();
				element.triggerHandler('blur');
				$rootScope.$digest();
				expect(element.hasClass('placeholder-text')).toBe(false);
			});
		});
		describe('as contenteditable div initially with content', function(){
			var $rootScope, element, $window;
			beforeEach(inject(function (_$compile_, _$rootScope_, _$window_, $document) {
				$window = _$window_;
				$rootScope = _$rootScope_;
				$rootScope.html = '<p>Lorem Ipsum</p>';
				element = _$compile_('<div ta-bind id="test" contenteditable="true" ng-model="html" placeholder="Add Comment"></div>')($rootScope);
				$document.find('body').append(element);
				$rootScope.$digest();
			}));
			afterEach(function(){
				element.remove();
			});
			// Cases: '' value; _defaultVal (<p><br></p>); Other Value
			it('should not add the placeholder-text class', function () {
				expect(element.hasClass('placeholder-text')).toBe(false);
			});
			it('should add the placeholder text', function () {
				expect(element.html()).toEqual('<p>Lorem Ipsum</p>');
				expect($window.getComputedStyle(element[0], ':before').length).toBe(0);
			});
			it('should remove the placeholder text on focusin', function () {
				element.triggerHandler('focus');
				$rootScope.$digest();
				expect(element.html()).toEqual('<p>Lorem Ipsum</p>');
			});
			it('should remove the placeholder-text class on focusin', function () {
				element.triggerHandler('focus');
				$rootScope.$digest();
				expect(element.hasClass('placeholder-text')).toBe(false);
			});
			it('should add the placeholder text back on blur if the input is blank', function () {
				element.triggerHandler('focus');
				$rootScope.$digest();
				expect(element.html()).toEqual('<p>Lorem Ipsum</p>');
				expect($window.getComputedStyle(element[0], ':before').length).toBe(0);
				element.triggerHandler('blur');
				$rootScope.$digest();
				expect(element.html()).toEqual('<p>Lorem Ipsum</p>');
				expect($window.getComputedStyle(element[0], ':before').length).toBe(0);
			});
			it('should add the placeholder-text class back on blur if the input is blank', function () {
				element.triggerHandler('focus');
				$rootScope.$digest();
				expect(element.hasClass('placeholder-text')).toBe(false);
				element.triggerHandler('blur');
				$rootScope.$digest();
				expect(element.hasClass('placeholder-text')).toBe(false);
			});
		});
	});

	describe('should function as a display div', function () {
		var $rootScope, element;
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<div ta-bind ng-model="html"></div>')($rootScope);
			$rootScope.$digest();
		}));

		it('should display model contents', function () {
			expect(element.html()).toBe('<p>Test Contents</p>');
		});
		it('should NOT update model from keyup', function () {
			element.html('<div>Test 2 Content</div>');
			element.triggerHandler('keyup');
			$rootScope.$digest();
			expect($rootScope.html).toBe('<p>Test Contents</p>');
		});
		it('should error on update model from update function', function () {
			element.html('<div>Test 2 Content</div>');
			expect(function () {
				$rootScope.updateTaBind();
			}).toThrow('textAngular Error: attempting to update non-editable taBind');
		});
		it('should update display from model change', function () {
			$rootScope.html = '<div>Test 2 Content</div>';
			$rootScope.$digest();
			expect(element.html()).toBe('<div>Test 2 Content</div>');
		});
	});

	describe('should sanitize word based content on paste', function () {
		var element, pasted = '';
		beforeEach(function(){
			pasted = '';
			module(function($provide){
				$provide.value('taSelection', {
					insertHtml: function(html){ pasted = html; }
				});
			});
		});
		beforeEach(inject(function (_$compile_, _$rootScope_, $document) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
			$document.find('body').append(element);
			$rootScope.$digest();
		}));
		// in fragment
		it('in fragment', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<div><!--StartFragment--><p class=MsoNormal>Test Content Stripping<o:p></o:p></p><!--EndFragment--></div>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<p>Test Content Stripping</p>');
		}));
		// out fragment
		it('outside fragment', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoNormal"><span lang="EN-US">Body</span><o:p></o:p></p>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<p><span lang="EN-US">Body</span></p>');
		}));
		
		it('remove blank list tag', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListBulletCxSpLast"><span lang="EN-US">&nbsp;</span></p>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('');
		}));
		
		// header
		it('Header Element', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<h1>Header 1<o:p></o:p></h1>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<h1>Header 1</h1>');
		}));
		// bold/italics
		it('handle bold/italics/underline', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p><b>Header</b> <u>1</u> <i>Test</i><o:p></o:p></p>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<p><b>Header</b> <u>1</u> <i>Test</i></p>');
		}));
		// lists, ul/ol
		it('ol list, format 1', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class=MsoListParagraphCxSpFirst style="text-indent:-18.0pt;mso-list:l0 level1 lfo1"><![if !supportLists]><span style="mso-fareast-font-family:Cambria;mso-fareast-theme-font:minor-latin;mso-bidi-font-family:Cambria;mso-bidi-theme-font:minor-latin"><span style="mso-list:Ignore">1.<span style="font:7.0pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ol><li>Test1</li></ol>');
		}));
		it('ol list, format 2', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListNumberCxSpFirst"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ol><li>Test1</li></ol>');
		}));
		it('ul list, format 1', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class=MsoListParagraphCxSpFirst style="text-indent:-18.0pt;mso-list:l0 level1 lfo1"><![if !supportLists]><span style="mso-fareast-font-family:Cambria;mso-fareast-theme-font:minor-latin;mso-bidi-font-family:Cambria;mso-bidi-theme-font:minor-latin"><span style="mso-list:Ignore">.<span style="font:7.0pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>Test1<o:p></o:p></p><p class=MsoListParagraphCxSpLast style="text-indent:-18.0pt;mso-list:l0 level1 lfo1"><![if !supportLists]><span style="mso-fareast-font-family:Cambria;mso-fareast-theme-font:minor-latin;mso-bidi-font-family:Cambria;mso-bidi-theme-font:minor-latin"><span style="mso-list:Ignore">.<span style="font:7.0pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ul><li>Test1</li><li>Test1</li></ul>');
		}));
		it('ul list, format 2', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListBulletCxSpFirst"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p><p class="MsoListBulletCxSpLast"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ul><li>Test1</li><li>Test1</li></ul>');
		}));
		// indents - ul > ul, ul > ol, ol > ol, ol > ul
		
		it('ul > ul nested list', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListBulletCxSpFirst"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListBulletCxSpLast" style="margin-left:39.6pt"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ul><li>Test1<ul><li>Test1</li></ul></li></ul>');
		}));
		it('ul > ol nested list', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListBulletCxSpFirst"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListNumberCxSpLast" style="margin-left:39.6pt"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ul><li>Test1<ol><li>Test1</li></ol></li></ul>');
		}));
		it('ol > ol nested list', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListNumberCxSpFirst"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListNumberCxSpLast" style="margin-left:39.6pt"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">2.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ol><li>Test1<ol><li>Test1</li></ol></li></ol>');
		}));
		it('ol > ul nested list', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListNumberCxSpFirst"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListBulletCxSpLast" style="margin-left:39.6pt"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ol><li>Test1<ul><li>Test1</li></ul></li></ol>');
		}));
		
		// outdents - ul < ul, ul < ol, ol < ol, ol < ul
		/* These Break on Phantom JS for some reason. */
		it('ul > ul < ul nested list', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListBulletCxSpFirst"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListBulletCxSpMiddle" style="margin-left:39.6pt"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListBulletCxSpLast"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			/*
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ul><li>Test1<ul><li>Test1</li></ul></li><li>Test1</li></ul>');*/
		}));
		it('ul > ul < ol nested list', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListBulletCxSpFirst"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListBulletCxSpMiddle" style="margin-left:39.6pt"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListNumberCxSpLast"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			/*
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ul><li>Test1<ul><li>Test1</li></ul></li></ul><ol><li>Test1</li></ol>');*/
		}));
		it('ol > ul < ol nested list', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListNumberCxSpFirst"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListBulletCxSpMiddle" style="margin-left:39.6pt"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListNumberCxSpLast"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			/*
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ol><li>Test1<ul><li>Test1</li></ul></li><li>Test1</li></ol>');*/
		}));
		it('ol > ol < ol nested list', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListNumberCxSpFirst"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListNumberCxSpMiddle" style="margin-left:39.6pt"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListNumberCxSpLast"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			/*
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ol><li>Test1<ol><li>Test1</li></ol></li><li>Test1</li></ol>');*/
		}));
		it('ol > ol < ul nested list', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListNumberCxSpFirst"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListNumberCxSpMiddle" style="margin-left:39.6pt"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListBulletCxSpLast"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			/*
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ol><li>Test1<ol><li>Test1</li></ol></li></ol><ul><li>Test1</li></ul>');*/
		}));
		it('ul > ol < ul nested list', inject(function($timeout, taSelection){
			element.triggerHandler('paste', {clipboardData: {types: 'text/html', getData: function(){
				return '<p class="MsoListBulletCxSpFirst"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListNumberCxSpMiddle" style="margin-left:39.6pt"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">1.<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>' + // jshint ignore:line
					'<p class="MsoListBulletCxSpLast"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;mso-ansi-language:EN-US">�<span style="font-stretch: normal; font-size: 7pt; font-family: \'Times New Roman\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><!--[endif]-->Test1<o:p></o:p></p>';// jshint ignore:line
			}}});
			/*
			$timeout.flush();
			$rootScope.$digest();
			expect(pasted).toBe('<ul><li>Test1<ol><li>Test1</li></ol></li><li>Test1</li></ul>');*/
		}));
	});
	
	describe('should function as an WYSIWYG div', function () {
		var $rootScope, element;
		
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
			$rootScope.$digest();
		}));

		it('should display model contents', function () {
			expect(element.html()).toBe('<p>Test Contents</p>');
		});
		it('should update model from keyup', function () {
			element.html('<div>Test 2 Content</div>');
			element.triggerHandler('keyup');
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});
		it('should update model from update function', function () {
			element.html('<div>Test 2 Content</div>');
			$rootScope.updateTaBind();
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});
		it('should update display from model change', function () {
			$rootScope.html = '<div>Test 2 Content</div>';
			$rootScope.$digest();
			expect(element.html()).toBe('<div>Test 2 Content</div>');
		});
		
		it('should prevent links default event', function () {
			$rootScope.html = '<div><a href="test">Test</a> 2 Content</div>';
			$rootScope.$digest();
			element.find('a').on('click', function(e){
				expect(e.isDefaultPrevented());
			});
			jQuery(element.find('a')[0]).trigger('click');
		});
		
		describe('should trim empty content', function(){
			it('returns undefined when <p></p>', function(){
				element.html('<p></p>');
				$rootScope.updateTaBind();
				$rootScope.$digest();
				expect($rootScope.html).toBe('');
			});
			it('returns undefined when <p><br/></p>', function(){
				element.html('<p><br/></p>');
				$rootScope.updateTaBind();
				$rootScope.$digest();
				expect($rootScope.html).toBe('');
			});
			it('returns undefined when single whitespace', function(){
				element.html('<p> </p>');
				$rootScope.updateTaBind();
				$rootScope.$digest();
				expect($rootScope.html).toBe('');
			});
			it('returns undefined when single &nbsp;', function(){
				element.html('<p>&nbsp;</p>');
				$rootScope.updateTaBind();
				$rootScope.$digest();
				expect($rootScope.html).toBe('');
			});
			it('returns undefined when multiple &nbsp;', function(){
				element.html('<p>&nbsp;&nbsp;&nbsp;</p>');
				$rootScope.updateTaBind();
				$rootScope.$digest();
				expect($rootScope.html).toBe('');
			});
			it('returns undefined whith mixed &nbsp; and whitespace', function(){
				element.html('<p>&nbsp; &nbsp; &nbsp;</p>');
				$rootScope.updateTaBind();
				$rootScope.$digest();
				expect($rootScope.html).toBe('');
			});
		});
		
		describe('should respect the ta-default-wrap value', function(){
			describe('on focus', function(){
				it('default to p element', inject(function($rootScope, $compile){
					$rootScope.html = '';
					element = $compile('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$rootScope.$digest();
					element.triggerHandler('focus');
					$rootScope.$digest();
					expect(element.html()).toBe('<p><br></p>');
				}));
				it('set to other value', inject(function($rootScope, $compile){
					$rootScope.html = '';
					element = $compile('<div ta-bind ta-default-wrap="div" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$rootScope.$digest();
					element.triggerHandler('focus');
					$rootScope.$digest();
					expect(element.html()).toBe('<div><br></div>');
				}));
				it('set to blank should not wrap', inject(function($rootScope, $compile){
					$rootScope.html = '';
					element = $compile('<div ta-bind ta-default-wrap="" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$rootScope.$digest();
					element.triggerHandler('focus');
					$rootScope.$digest();
					expect(element.html()).toBe('');
				}));
			});
			describe('on keyup', function(){
				it('default to p element', inject(function($rootScope, $compile){
					$rootScope.html = '';
					element = $compile('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$rootScope.$digest();
					element.triggerHandler('keyup');
					$rootScope.$digest();
					expect(element.html()).toBe('<p><br></p>');
				}));
				it('set to other value', inject(function($rootScope, $compile){
					$rootScope.html = '';
					element = $compile('<div ta-bind ta-default-wrap="div" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$rootScope.$digest();
					element.triggerHandler('keyup');
					$rootScope.$digest();
					expect(element.html()).toBe('<div><br></div>');
				}));
				it('set to blank should not wrap', inject(function($rootScope, $compile){
					$rootScope.html = '';
					element = $compile('<div ta-bind ta-default-wrap="" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$rootScope.$digest();
					element.triggerHandler('keyup');
					$rootScope.$digest();
					expect(element.html()).toBe('');
				}));
			});
			describe('on ignoring keys press', function() {
				it('should ignore blocked keys events', inject(function($rootScope, $compile, $window, $document, taSelection) {
					var BLOCKED_KEYS = [19,20,27,33,34,35,36,37,38,39,40,45,46,112,113,114,115,116,117,118,119,120,121,122,123,144,145],
						eventSpy = spyOn(taSelection, 'setSelectionToElementStart').andCallThrough(),
						event;
					$rootScope.html = '<p><br></p>';
					element = $compile('<div ta-bind ta-default-wrap="b" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					var range = $window.rangy.createRangyRange();
					range.selectNodeContents(element.children()[0]);
					$window.rangy.getSelection().setSingleRange(range);

					BLOCKED_KEYS.forEach(function(key) {
						if(angular.element === jQuery) {
							event = jQuery.Event('keyup');
							event.keyCode = key;
							element.triggerHandler(event);
						}else{
							event = {keyCode: key};
							element.triggerHandler('keyup', event);
						}
						$rootScope.$digest();
						expect(eventSpy).not.toHaveBeenCalled();
					});
					element.remove();
				}));
			});
			describe('on enter press', function(){
				it('replace inserted with default wrap', inject(function($rootScope, $compile, $window, $document){
					$rootScope.html = '<p><br></p>';
					element = $compile('<div ta-bind ta-default-wrap="b" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					var range = $window.rangy.createRangyRange();
					range.selectNodeContents(element.children()[0]);
					$window.rangy.getSelection().setSingleRange(range);
					var event;
					if(angular.element === jQuery){
						event = jQuery.Event('keyup');
						event.keyCode = 13;
						element.triggerHandler(event);
					}else{
						event = {keyCode: 13};
						element.triggerHandler('keyup', event);
					}
					$rootScope.$digest();
					expect(element.html()).toBe('<b><br></b>');
					element.remove();
				}));
				it('NOT replace inserted with default wrap when shift', inject(function($rootScope, $compile, $window, $document){
					$rootScope.html = '<p><br></p>';
					element = $compile('<div ta-bind ta-default-wrap="b" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					var range = $window.rangy.createRangyRange();
					range.selectNodeContents(element.children()[0]);
					$window.rangy.getSelection().setSingleRange(range);
					var event;
					if(angular.element === jQuery){
						event = jQuery.Event('keyup');
						event.keyCode = 13;
						event.shiftKey = true;
						element.triggerHandler(event);
					}else{
						event = {keyCode: 13, shiftKey: true};
						element.triggerHandler('keyup', event);
					}
					$rootScope.$digest();
					expect(element.html()).toBe('<p><br></p>');
					element.remove();
				}));
				it('NOT replace inserted with default wrap when a li', inject(function($rootScope, $compile, $window, $document){
					$rootScope.html = '<li><br></li>';
					element = $compile('<div ta-bind ta-default-wrap="b" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					var range = $window.rangy.createRangyRange();
					range.selectNodeContents(element.children()[0]);
					$window.rangy.getSelection().setSingleRange(range);
					var event;
					if(angular.element === jQuery){
						event = jQuery.Event('keyup');
						event.keyCode = 13;
						element.triggerHandler(event);
					}else{
						event = {keyCode: 13};
						element.triggerHandler('keyup', event);
					}
					$rootScope.$digest();
					expect(element.html()).toBe('<li><br></li>');
					element.remove();
				}));
				it('NOT replace inserted with default wrap when nested in a li', inject(function($rootScope, $compile, $window, $document){
					$rootScope.html = '<li><i><br></i></li>';
					element = $compile('<div ta-bind ta-default-wrap="b" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					var range = $window.rangy.createRangyRange();
					range.selectNodeContents(element.children()[0].childNodes[0]);
					$window.rangy.getSelection().setSingleRange(range);
					var event;
					if(angular.element === jQuery){
						event = jQuery.Event('keyup');
						event.keyCode = 13;
						element.triggerHandler(event);
					}else{
						event = {keyCode: 13};
						element.triggerHandler('keyup', event);
					}
					$rootScope.$digest();
					expect(element.html()).toBe('<li><i><br></i></li>');
					element.remove();
				}));
				it('should replace inserted with default wrap when empty', inject(function($rootScope, $compile, $window, $document){
					$rootScope.html = '<p><br></p>';
					element = $compile('<div ta-bind ta-default-wrap="b" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					element[0].innerHTML = '';
					element.triggerHandler('keyup');
					$rootScope.$digest();
					expect(element.html()).toBe('<b><br></b>');
					element.remove();
				}));
			});
		});
	});

	describe('should function as an textarea', function () {
		var $rootScope, element;
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<textarea ta-bind ng-model="html"></textarea>')($rootScope);
			$rootScope.$digest();
		}));

		it('should display model contents', function () {
			expect(element.val()).toBe('<p>Test Contents</p>');
		});
		it('should update model from change', function () {
			element.val('<div>Test 2 Content</div>');
			element.triggerHandler('blur');
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});
		it('should update model from update function', function () {
			element.val('<div>Test 2 Content</div>');
			$rootScope.updateTaBind();
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});
		it('should update display from model change', function () {
			$rootScope.html = '<div>Test 2 Content</div>';
			$rootScope.$digest();
			expect(element.val()).toBe('<div>Test 2 Content</div>');
		});
	});

	describe('should function as an input', function () {
		var $rootScope, element;
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<input ta-bind ng-model="html"/>')($rootScope);
			$rootScope.$digest();
		}));

		it('should display model contents', function () {
			expect(element.val()).toBe('<p>Test Contents</p>');
		});
		it('should update model from change', function () {
			element.val('<div>Test 2 Content</div>');
			element.triggerHandler('blur');
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});
		it('should update model from update function', function () {
			element.val('<div>Test 2 Content</div>');
			$rootScope.updateTaBind();
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});
		it('should update display from model change', function () {
			$rootScope.html = '<div>Test 2 Content</div>';
			$rootScope.$digest();
			expect(element.val()).toBe('<div>Test 2 Content</div>');
		});
	});

	describe('should update from cut and paste events', function () {
		// non-contenteditable is handled by the change event now
		
		describe('on content-editable', function () {
			var $rootScope, element, $timeout;
			beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, $document, $window) {
				$rootScope = _$rootScope_;
				$timeout = _$timeout_;
				$rootScope.html = '<p>Test Contents</p>';
				element = _$compile_('<div contenteditable="true" ta-bind ng-model="html"></div>')($rootScope);
				$document.find('body').append(element);
				$rootScope.$digest();
				var sel = $window.rangy.getSelection();
				var range = $window.rangy.createRangyRange();
				range.selectNodeContents(element.find('p')[0]);
				sel.setSingleRange(range);
			}));
			afterEach(function(){
				element.remove();
			});
			
			// var text = (e.originalEvent || e).clipboardData.getData('text/plain') || $window.clipboardData.getData('Text');
			describe('should update model from paste', function () {
				it('non-ie based w/o jquery', inject(function($window){
					element.triggerHandler('paste', {clipboardData: {types: 'text/plain', getData: function(){ return 'Test 3 Content'; }}});
					$timeout.flush();
					$rootScope.$digest();
					expect($rootScope.html).toBe('<p>Test 3 Content</p>');
				}));
				
				it('non-ie based w/ jquery', inject(function($window){
					element.triggerHandler('paste', {originalEvent: {clipboardData: {types: 'text/plain', getData: function(){ return 'Test 3 Content'; } }}});
					$timeout.flush();
					$rootScope.$digest();
					expect($rootScope.html).toBe('<p>Test 3 Content</p>');
				}));
				
				it('non-ie based w/o paste content', inject(function($window){
					element.triggerHandler('paste');
					expect(function(){
						$timeout.flush();
					}).toThrow();
					$rootScope.$digest();
					expect($rootScope.html).toBe('<p>Test Contents</p>');
				}));
			});
	
			it('should update model from cut', function () {
				element.html('<div>Test 2 Content</div>');
				element.triggerHandler('cut');
				$timeout.flush();
				$rootScope.$digest();
				expect($rootScope.html).toBe('<div>Test 2 Content</div>');
			});
		});
		
		describe('on content-editable with readonly', function () {
			var $rootScope, element, $timeout;
			beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, $document, $window) {
				$rootScope = _$rootScope_;
				$timeout = _$timeout_;
				$rootScope.html = '<p>Test Contents</p>';
				element = _$compile_('<div contenteditable="true" ta-readonly="true" ta-bind ng-model="html"></div>')($rootScope);
				$document.find('body').append(element);
				$rootScope.$digest();
				var sel = $window.rangy.getSelection();
				var range = $window.rangy.createRangyRange();
				range.selectNodeContents(element.find('p')[0]);
				sel.setSingleRange(range);
			}));
			afterEach(function(){
				element.remove();
			});
			
			// var text = (e.originalEvent || e).clipboardData.getData('text/plain') || $window.clipboardData.getData('Text');
			describe('should not update model from paste', function () {
				it('ie based', inject(function($window){
					$window.clipboardData = {
						getData: function(){ return 'Test 2 Content'; }
					};
					element.triggerHandler('paste');
					expect(function(){
						$timeout.flush();
					}).toThrow();
					$rootScope.$digest();
					expect($rootScope.html).toBe('<p>Test Contents</p>');
					$window.clipboardData = undefined;
				}));
				
				it('non-ie based', inject(function($window){
					element.triggerHandler('paste', {clipboardData: {types: 'text/plain', getData: function(){ return 'Test 3 Content'; }}});
					expect(function(){
						$timeout.flush();
					}).toThrow();
					$rootScope.$digest();
					expect($rootScope.html).toBe('<p>Test Contents</p>');
				}));
			});
		});
	});
	
	describe('emits the ta-drop-event event correctly', function(){
		afterEach(inject(function($timeout){
			try{
				$timeout.flush();
			}catch(e){}
		}));
		describe('without read-only attr', function(){
			var $rootScope, element;
			beforeEach(inject(function (_$compile_, _$rootScope_) {
				$rootScope = _$rootScope_;
				$rootScope.html = '<p>Test Contents</p>';
				element = _$compile_('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
			}));
			it('should fire on drop event', function(){
				var success = false;
				$rootScope.$on('ta-drop-event', function(){
					success = true;
				});
				element.triggerHandler('drop');
				$rootScope.$digest();
				expect(success).toBe(true);
			});
			it('should fire on drop event only once', function(){
				var count = 0;
				$rootScope.$on('ta-drop-event', function(){
					count++;
				});
				element.triggerHandler('drop');
				$rootScope.$digest();
				element.triggerHandler('drop');
				$rootScope.$digest();
				// as we don't flush the $timeout it should never reset to being able to send another event
				expect(count).toBe(1);
			});
			it('should fire on drop event again after timeout', inject(function($timeout){
				var count = 0;
				$rootScope.$on('ta-drop-event', function(){
					count++;
				});
				element.triggerHandler('drop');
				$rootScope.$digest();
				$timeout.flush();
				element.triggerHandler('drop');
				$rootScope.$digest();
				// as we don't flush the $timeout it should never reset to being able to send another event
				expect(count).toBe(2);
			}));
		});
		describe('with read-only attr initially false', function(){
			var $rootScope, element;
			beforeEach(inject(function (_$compile_, _$rootScope_) {
				$rootScope = _$rootScope_;
				$rootScope.html = '<p>Test Contents</p>';
				$rootScope.readonly = false;
				element = _$compile_('<div ta-bind contenteditable="contenteditable" ta-readonly="readonly" ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
			}));
			it('should fire on drop event', function(){
				var success = false;
				$rootScope.$on('ta-drop-event', function(){
					success = true;
				});
				element.triggerHandler('drop');
				$rootScope.$digest();
				expect(success).toBe(true);
			});
			it('should not fire on drop event when changed to readonly mode', function(){
				$rootScope.readonly = true;
				$rootScope.$digest();
				var success = false;
				$rootScope.$on('ta-drop-event', function(){
					success = true;
				});
				element.triggerHandler('drop');
				$rootScope.$digest();
				expect(success).toBe(false);
			});
		});
		describe('with read-only attr initially true', function(){
			var $rootScope, element;
			beforeEach(inject(function (_$compile_, _$rootScope_) {
				$rootScope = _$rootScope_;
				$rootScope.html = '<p>Test Contents</p>';
				$rootScope.readonly = true;
				element = _$compile_('<div ta-bind contenteditable="contenteditable" ta-readonly="readonly" ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
			}));
			it('should not fire on drop event', function(){
				var success = false;
				$rootScope.$on('ta-drop-event', function(){
					success = true;
				});
				element.triggerHandler('drop');
				$rootScope.$digest();
				expect(success).toBe(false);
			});
			it('should fire on drop event when changed to not readonly mode', function(){
				$rootScope.readonly = false;
				$rootScope.$digest();
				var success = false;
				$rootScope.$on('ta-drop-event', function(){
					success = true;
				});
				element.triggerHandler('drop');
				$rootScope.$digest();
				expect(success).toBe(true);
			});
		});
	});
	
	describe('emits the ta-element-select event correctly', function(){
		var $rootScope, element;
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p><a>Test Contents</a><img/></p>';
			element = _$compile_('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
			$rootScope.$digest();
		}));
		it('on click of <a> element', function(){
			var targetElement = element.find('a');
			var test;
			$rootScope.$on('ta-element-select', function(event, element){
				test = element;
			});
			targetElement.triggerHandler('click');
			$rootScope.$digest();
			expect(test).toBe(targetElement[0]);
		});
		it('on click of <img> element', function(){
			var targetElement = element.find('img');
			var test;
			$rootScope.$on('ta-element-select', function(event, element){
				test = element;
			});
			targetElement.triggerHandler('click');
			$rootScope.$digest();
			expect(test).toBe(targetElement[0]);
		});
	});
	
	describe('should create the updateTaBind function on parent scope', function () {
		describe('without id', function () {
			it('should exist', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$compile_('<textarea ta-bind ng-model="html"></textarea>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(_$rootScope_.updateTaBind).toBeDefined();
			}));
		});

		describe('with id', function () {
			it('should exist', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$compile_('<textarea id="Test" ta-bind ng-model="html"></textarea>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(_$rootScope_.updateTaBindTest).toBeDefined();
			}));
		});
	});
	
	describe('should use taSanitize to', function () {
		var $rootScope, element;
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
			$rootScope.$digest();
		}));

		it('parse from change events', function () {
			element.append('<bad-tag>Test 2 Content</bad-tag>');
			$rootScope.updateTaBind();
			$rootScope.$digest();
			expect($rootScope.html).toBe('<p>Test Contents</p>Test 2 Content');
		});

		it('format from model change', function () {
			$rootScope.html += '<bad-tag>Test 2 Content</bad-tag>';
			$rootScope.$digest();
			expect(element.html()).toBe('<p>Test Contents</p>Test 2 Content');
		});
	});
	
	describe('should respect taUnsafeSanitizer attribute', function () {
		var $rootScope, element;
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<div ta-bind contenteditable="contenteditable" ta-unsafe-sanitizer="true" ng-model="html"></div>')($rootScope);
			$rootScope.$digest();
		}));

		it('allow bad tags', function () {
			element.append('<bad-tag>Test 2 Content</bad-tag>');
			$rootScope.updateTaBind();
			$rootScope.$digest();
			expect($rootScope.html).toBe('<p>Test Contents</p><bad-tag>Test 2 Content</bad-tag>');
		});
		
		it('not allow malformed html', function () {
			element.append('<bad-tag Test 2 Content</bad-tag>');
			$rootScope.updateTaBind();
			$rootScope.$digest();
			expect($rootScope.html).toBe('<p>Test Contents</p>');
		});
	});

	describe('should respect taReadonly value', function () {
		describe('initially true', function () {
			it('as a textarea', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('disabled')).toBe('disabled');
			}));
			it('as an input', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('disabled')).toBe('disabled');
			}));
			it('as an editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).not.toBeDefined();
			}));
			it('as an un-editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<div ta-bind ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).not.toBeDefined();
			}));
			it('has the .ta-readonly class', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.hasClass('ta-readonly')).toBe(true);
			}));
		});

		describe('initially false', function () {
			it('as a textarea', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('disabled')).not.toBeDefined();
			}));
			it('as an input', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('disabled')).not.toBeDefined();
			}));
			it('as an editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).toBe('true');
			}));
			it('as an un-editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<div ta-bind ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).not.toBeDefined();
			}));
			it('does not have .ta-readonly class', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.hasClass('ta-readonly')).toBe(false);
			}));
		});


		describe('changed to true', function () {
			it('as a textarea', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = true;
				_$rootScope_.$digest();
				expect(element.attr('disabled')).toBe('disabled');
			}));
			it('as an input', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = true;
				_$rootScope_.$digest();
				expect(element.attr('disabled')).toBe('disabled');
			}));
			it('as an editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = true;
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).not.toBeDefined();
			}));
			it('as an un-editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<div ta-bind ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = true;
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).not.toBeDefined();
			}));
			it('adds the .ta-readonly class', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = true;
				_$rootScope_.$digest();
				expect(element.hasClass('ta-readonly')).toBe(true);
			}));
		});

		describe('changed to false', function () {
			it('as a textarea', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = false;
				_$rootScope_.$digest();
				expect(element.attr('disabled')).not.toBeDefined();
			}));
			it('as an input', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = false;
				_$rootScope_.$digest();
				expect(element.attr('disabled')).not.toBeDefined();
			}));
			it('as an editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = false;
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).toBe('true');
			}));
			it('as an un-editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<div ta-bind ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = false;
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).not.toBeDefined();
			}));
			it('removes the .ta-readonly class', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = false;
				_$rootScope_.$digest();
				expect(element.hasClass('ta-readonly')).toBe(false);
			}));
		});

		describe('when true don\'t update model', function () {
			describe('from cut and paste events', function () {
				describe('on textarea', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')($rootScope);
						$rootScope.$digest();
					}));

					it('should not update model from paste', inject(function($timeout) {
						element.val('<div>Test 2 Content</div>');
						element.triggerHandler('paste');
						expect(function(){
							$timeout.flush();
						}).toThrow();
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					}));

					it('should not update model from cut', function () {
						element.val('<div>Test 2 Content</div>');
						element.triggerHandler('cut');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});

				describe('on input', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')($rootScope);
						$rootScope.$digest();
					}));

					it('should not update model from paste', inject(function ($timeout) {
						element.val('<div>Test 2 Content</div>');
						element.triggerHandler('paste');
						expect(function(){
							$timeout.flush();
						}).toThrow();
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					}));

					it('should not update model from cut', function () {
						element.val('<div>Test 2 Content</div>');
						element.triggerHandler('cut');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});

				describe('on editable div', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')($rootScope);
						$rootScope.$digest();
					}));

					it('should not update model from paste', inject(function ($timeout) {
						element.html('<div>Test 2 Content</div>');
						element.triggerHandler('paste');
						expect(function(){
							$timeout.flush();
						}).toThrow();
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					}));

					it('should not update model from cut', function () {
						element.html('<div>Test 2 Content</div>');
						element.triggerHandler('cut');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});
			});

			describe('from updateTaBind function', function () {
				describe('on textarea', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')($rootScope);
						$rootScope.$digest();
					}));

					it('should not update model', function () {
						element.val('<div>Test 2 Content</div>');
						$rootScope.updateTaBind();
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});

				describe('on input', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')($rootScope);
						$rootScope.$digest();
					}));

					it('should not update model', function () {
						element.val('<div>Test 2 Content</div>');
						$rootScope.updateTaBind();
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});

				describe('on editable div', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')($rootScope);
						$rootScope.$digest();
					}));

					it('should not update model', function () {
						element.html('<div>Test 2 Content</div>');
						$rootScope.updateTaBind();
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});
			});

			describe('from blur function', function () {
				describe('on textarea', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')($rootScope);
						$rootScope.$digest();
					}));

					it('should not update model', function () {
						element.val('<div>Test 2 Content</div>');
						element.triggerHandler('blur');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});

				describe('on input', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')($rootScope);
						$rootScope.$digest();
					}));

					it('should not update model', function () {
						element.val('<div>Test 2 Content</div>');
						element.triggerHandler('blur');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});
			});

			describe('from keyup function', function () {
				describe('on editable div', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')($rootScope);
						$rootScope.$digest();
					}));

					it('should not update model', function () {
						element.html('<div>Test 2 Content</div>');
						element.triggerHandler('keyup');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});
			});
		});
	});
	
	
	
	describe('custom renderers', function () {
		describe('function in display mode', function () {
			beforeEach(inject(function(taCustomRenderers){
				taCustomRenderers.push({
					// Parse back out: '<div class="ta-insert-video" ta-insert-video src="' + urlLink + '" allowfullscreen="true" width="300" frameborder="0" height="250"></div>'
					// To correct video element. For now only support youtube
					selector: 'a',
					renderLogic: function(_element){
						_element.replaceWith(angular.element('<b></b>'));
					}
				});
				taCustomRenderers.push({
					// Parse back out: '<div class="ta-insert-video" ta-insert-video src="' + urlLink + '" allowfullscreen="true" width="300" frameborder="0" height="250"></div>'
					// To correct video element. For now only support youtube
					customAttribute: 'href',
					renderLogic: function(_element){
						_element.replaceWith(angular.element('<i></i>'));
					}
				});
			}));
			
			afterEach(inject(function(taCustomRenderers){
				taCustomRenderers.pop();
				taCustomRenderers.pop();
			}));
			
			it('should replace with custom code for video renderer', inject(function ($compile, $rootScope) {
				$rootScope.html = '<p><img class="ta-insert-video" ta-insert-video="http://www.youtube.com/embed/2maA1-mvicY" src="" allowfullscreen="true" width="300" frameborder="0" height="250"/></p>';
				var element = $compile('<div ta-bind ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
				expect(element.find('img').length).toBe(0);
				expect(element.find('iframe').length).toBe(1);
			}));
			
			it('should not replace with custom code for normal img', inject(function ($compile, $rootScope) {
				$rootScope.html = '<p><img src=""/></p>';
				var element = $compile('<div ta-bind ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
				expect(element.find('img').length).toBe(1);
				expect(element.find('iframe').length).toBe(0);
			}));
			
			it('should replace for selector only', inject(function ($compile, $rootScope) {
				$rootScope.html = '<p><a></a></p>';
				var element = $compile('<div ta-bind ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
				expect(element.find('a').length).toBe(0);
				expect(element.find('b').length).toBe(1);
			}));
			
			it('should replace for attribute only', inject(function ($compile, $rootScope) {
				$rootScope.html = '<p><span href></span><b href></b></p>';
				var element = $compile('<div ta-bind ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
				expect(element.find('span').length).toBe(0);
				expect(element.find('b').length).toBe(0);
				expect(element.find('i').length).toBe(2);
			}));
		});
		
		describe('not function in edit mode', function () {
			it('should exist', inject(function ($compile, $rootScope) {
				$rootScope.html = '<p><img class="ta-insert-video" ta-insert-video="http://www.youtube.com/embed/2maA1-mvicY" src="" allowfullscreen="true" width="300" frameborder="0" height="250"/></p>';
				var element = $compile('<div ta-bind contenteditable="true" ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
				expect(element.find('img').length).toBe(1);
				expect(element.find('iframe').length).toBe(0);
			}));
		});
	});
	
	describe('form validation', function(){
		var element;
		beforeEach(module('textAngular'));
		
		describe('basic', function(){
			beforeEach(inject(function (_$compile_, _$rootScope_, $document) {
				$rootScope = _$rootScope_;
				$rootScope.html = '';
				var _form = angular.element('<form name="form"></form>');
				element = angular.element('<div ta-bind name="test" contenteditable="true" ng-model="html"></div>');
				_form.append(element);
				$document.find('body').append(_$compile_(_form)($rootScope));
				$rootScope.$digest();
			}));
			
			describe('should start with', function () {
				it('pristine', function(){
					expect($rootScope.form.$pristine).toBe(true);
				});
				it('field pristine', function(){
					expect($rootScope.form.test.$pristine).toBe(true);
				});
				it('valid', function(){
					expect($rootScope.form.$valid).toBe(true);
				});
				it('field valid', function(){
					expect($rootScope.form.test.$valid).toBe(true);
				});
			});
			
			describe('should NOT change on direct model change', function () {
				beforeEach(function(){
					$rootScope.html = '<div>Test Change Content</div>';
					$rootScope.$digest();
				});
				it('pristine', function(){
					expect($rootScope.form.$pristine).toBe(true);
				});
				it('field pristine', function(){
					expect($rootScope.form.test.$pristine).toBe(true);
				});
				it('valid', function(){
					expect($rootScope.form.$valid).toBe(true);
				});
				it('field valid', function(){
					expect($rootScope.form.test.$valid).toBe(true);
				});
			});
			
			describe('should change on input update', function () {
				beforeEach(inject(function(textAngularManager){
					element.html('<div>Test Change Content</div>');
					element.triggerHandler('keyup');
					$rootScope.$digest();
				}));
				it('not pristine', function(){
					expect($rootScope.form.$pristine).toBe(false);
				});
				it('field not pristine', function(){
					expect($rootScope.form.test.$pristine).toBe(false);
				});
				it('valid', function(){
					expect($rootScope.form.$valid).toBe(true);
				});
				it('field valid', function(){
					expect($rootScope.form.test.$valid).toBe(true);
				});
			});
			
			describe('should change on blur', function () {
				beforeEach(inject(function(textAngularManager){
					element.html('<div>Test Change Content</div>');
					element.triggerHandler('blur');
					$rootScope.$digest();
				}));
				it('not pristine', function(){
					expect($rootScope.form.$pristine).toBe(false);
				});
				it('field not pristine', function(){
					expect($rootScope.form.test.$pristine).toBe(false);
				});
				it('valid', function(){
					expect($rootScope.form.$valid).toBe(true);
				});
				it('field valid', function(){
					expect($rootScope.form.test.$valid).toBe(true);
				});
			});
			
			describe('should NOT change on blur with no content difference', function () {
				beforeEach(function(){
					$rootScope.html = '<div>Test Change Content</div>';
					$rootScope.$digest();
					element.triggerHandler('blur');
					$rootScope.$digest();
				});
				it('pristine', function(){
					expect($rootScope.form.$pristine).toBe(true);
				});
				it('field pristine', function(){
					expect($rootScope.form.test.$pristine).toBe(true);
				});
				it('valid', function(){
					expect($rootScope.form.$valid).toBe(true);
				});
				it('field valid', function(){
					expect($rootScope.form.test.$valid).toBe(true);
				});
			});
		});
		describe('with errors', function(){
			beforeEach(inject(function (_$compile_, _$rootScope_, $document) {
				$rootScope = _$rootScope_;
				$rootScope.html = '';
				var _form = angular.element('<form name="form"></form>');
				element = angular.element('<div ta-bind name="test" contenteditable="true" ng-model="html" required></div>');
				_form.append(element);
				$document.find('body').append(_$compile_(_form)($rootScope));
				$rootScope.$digest();
			}));
			
			describe('should start with', function () {
				it('ng-required', function(){
					expect($rootScope.form.test.$error.required).toBe(true);
				});
				it('invalid', function(){
					expect($rootScope.form.$invalid).toBe(true);
				});
				it('infield valid', function(){
					expect($rootScope.form.test.$invalid).toBe(true);
				});
			});
			
			describe('should change on direct model change', function () {
				beforeEach(function(){
					$rootScope.html = '<div>Test Change Content</div>';
					$rootScope.$digest();
				});
				it('ng-required', function(){
					expect($rootScope.form.test.$error.required).toBe(false);
				});
				it('valid', function(){
					expect($rootScope.form.$valid).toBe(true);
				});
				it('field valid', function(){
					expect($rootScope.form.test.$valid).toBe(true);
				});
			});
			
			describe('should change on input update', function () {
				beforeEach(inject(function(textAngularManager){
					element.html('<div>Test Change Content</div>');
					element.triggerHandler('keyup');
					$rootScope.$digest();
				}));
				it('ng-required', function(){
					expect($rootScope.form.test.$error.required).toBe(false);
				});
				it('valid', function(){
					expect($rootScope.form.$valid).toBe(true);
				});
				it('field valid', function(){
					expect($rootScope.form.test.$valid).toBe(true);
				});
			});
			
			describe('should change on blur', function () {
				beforeEach(inject(function(textAngularManager){
					element.html('<div>Test Change Content</div>');
					element.triggerHandler('blur');
					$rootScope.$digest();
				}));
				it('ng-required', function(){
					expect($rootScope.form.test.$error.required).toBe(false);
				});
				it('valid', function(){
					expect($rootScope.form.$valid).toBe(true);
				});
				it('field valid', function(){
					expect($rootScope.form.test.$valid).toBe(true);
				});
			});
		});
	});
});