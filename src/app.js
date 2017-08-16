'use strict';

angular.module('sandbox', [
	'pageHighway',
	'ngRoute',
])
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
	$locationProvider.html5Mode(false);
	$routeProvider.when('/', {
		templateUrl: 'pages/home.html',
		controllerAs: '$ctrl',
		controller() {
		},
	})
	.otherwise({redirectTo: '/'})
}])
// https://stackoverflow.com/questions/25141139/toggle-class-with-ng-click-on-several-elements
.directive('toggleUl', () => {
	return {
		restrict: 'A',
		link(scope, element, attrs) {
			element.bind('click', () => {
				element.toggleClass('expand')
			})
		},
	}
})
