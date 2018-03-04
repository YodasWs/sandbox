/* app.json */

angular.module('sandbox', modules)
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
	$locationProvider.html5Mode(false);
	$routeProvider.when('/', {
		templateUrl: 'pages/home.html',
		controllerAs: '$ctrl',
		controller() {
			angular.element('[ng-view]').attr('ng-view', 'pageHome')
		},
	})
	.otherwise({redirectTo: '/'})
}])
// https://stackoverflow.com/questions/25141139/toggle-class-with-ng-click-on-several-elements
.directive('toggleUl', () => {
	return {
		restrict: 'A',
		link(scope, element, attrs) {
			element.on('click', () => {
				element.toggleClass('expand')
			}).on('keypress', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					element.toggleClass('expand')
				}
			})
		},
	}
})
