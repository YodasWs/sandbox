angular.module('pageD3Almanac')
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/d3/almanac/', {
		templateUrl: 'pages/d3/almanac/almanac.html',
		controllerAs: '$ctrl',
		controller() {
			angular.element('[ng-view]').attr('ng-view', 'pageD3Almanac')
		},
	})
}])
