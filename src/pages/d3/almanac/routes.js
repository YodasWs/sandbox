angular.module('pageD3Almanac')
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/d3/almanac/', {
		templateUrl: 'pages/d3/almanac/almanac.html',
		controllerAs: '$ctrl',
		controller() {
			angular.element('[ng-view]').attr('ng-view', 'pageD3Almanac')
			const ns = 'http://www.w3.org/2000/svg'

			const center = {
				x: 450,
				y: 1350,
			}

			const earth = {
				radius: 1000,
				lat: [],
			}

			const sun = {
				radius: 1300,
			}

			const moon = {
				radius: 1150,
				inclination: 5.14,
				class: 'moon',
			}

			const $svg = $('[ng-view="pageD3Almanac"] svg')

			// Add Earth
			earth.green = document.createElementNS(ns, 'circle')
			earth.green.setAttribute('r', earth.radius)
			earth.green.setAttribute('cx', center.x)
			earth.green.setAttribute('cy', center.y)
			earth.green.setAttribute('id', 'terra')
			$svg.append(earth.green)

			// Add Orbiting Objects
			;[sun,moon].forEach((orb) => {
				// Add Rise Path
				orb.rise = document.createElementNS(ns, 'path')
				if (orb.class) orb.rise.classList.add(orb.class)
				orb.rise.setAttribute('d',
					`M ${center.x},${center.y} m -${orb.radius},0 a ${orb.radius},${orb.radius} 0,0,1 ${orb.radius}-${orb.radius}`
				)
				$svg.prepend(orb.rise)

				// Add Set Path
				orb.set = document.createElementNS(ns, 'path')
				if (orb.class) orb.set.classList.add(orb.class)
				orb.set.setAttribute('d',
					`M ${center.x},${center.y} m 0-${orb.radius} a ${orb.radius},${orb.radius} 0,0,1 ${orb.radius},${orb.radius}`
				)
				$svg.append(orb.set)

			})
		},
	})
}])
