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

			// Add Equator
			let lat = document.createElementNS(ns, 'path')
			lat.classList.add('lat')
			lat.setAttribute('d',
				`M ${center.x},${center.y} m 0-${earth.radius} a ${earth.radius},${earth.radius} 0,0,1 ${earth.radius},${earth.radius}`
			)
			lat.style.transform = `rotateY(80deg)`
			earth.lat.push(lat)
			$svg.append(lat)

			// Add Orbiting Objects' Paths
			;[sun,moon].forEach((orb) => {
				;[orb.radius, earth.radius].forEach((radius) => {
					// Add Rise Path
					orb.rise = document.createElementNS(ns, 'path')
					if (orb.class) orb.rise.classList.add(orb.class)
					if (radius === earth.radius) orb.rise.classList.add('surface-path')
					orb.rise.setAttribute('d',
						`M ${center.x},${center.y} m -${radius},0 a ${radius},${radius} 0,0,1 ${radius}-${radius}`
					)
					$svg.prepend(orb.rise)

					// Add Set Path
					orb.set = document.createElementNS(ns, 'path')
					if (orb.class) orb.set.classList.add(orb.class)
					if (radius === earth.radius) orb.set.classList.add('surface-path')
					orb.set.setAttribute('d',
						`M ${center.x},${center.y} m 0-${radius} a ${radius},${radius} 0,0,1 ${radius},${radius}`
					)
					$svg.append(orb.set)

				})
			})
		},
	})
}])
