angular.module('pageD3Almanac')
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/d3/almanac/', {
		templateUrl: 'pages/d3/almanac/almanac.html',
		controllerAs: '$ctrl',
		controller() {
			angular.element('[ng-view]').attr('ng-view', 'pageD3Almanac')
			const ns = 'http://www.w3.org/2000/svg'
			const ty = 80

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
				x: 0,
				z: 0,
			}

			const moon = {
				radius: 1150,
				inclination: 5.14,
				class: 'moon',
				x: 0,
				z: 0,
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
			lat.style.transform = `rotateY(${ty}deg)`
			earth.lat.push(lat)
			$svg.append(lat)

			// Add Orbiting Objects' Paths
			;[sun,moon].forEach((orb) => {
				;[earth.radius, orb.radius].forEach((radius) => {
					if (radius !== earth.radius) {
						// Add Rise Path
						orb.rise = document.createElementNS(ns, 'path')
						if (orb.class) orb.rise.classList.add(orb.class)
						if (radius === earth.radius) orb.rise.classList.add('surface-path')
						orb.rise.setAttribute('d',
							`M ${center.x},${center.y} m 0,${radius} a ${radius},${radius} 0,0,1 0-${radius*2}`
						)
						$svg.prepend(orb.rise)
					}

					// Add Set Path
					orb.set = document.createElementNS(ns, 'path')
					if (orb.class) orb.set.classList.add(orb.class)
					if (radius === earth.radius) orb.set.classList.add('surface-path')
					orb.set.setAttribute('d',
						`M ${center.x},${center.y} m 0,${radius} a ${radius},${radius} 0,0,0 0-${radius*2}`
					)
					$svg.append(orb.set)

				})
			})

			setInterval(() => {
				moon.x += 36
				if (moon.x >= 360) moon.x -= 360
				let x = moon.radius * Math.sin(moon.x * Math.PI / 180)
				let y = moon.radius * Math.cos(moon.x * Math.PI / 180)
				let dx = moon.radius * Math.sin((moon.x + 180) * Math.PI / 180) - x
				let dy = moon.radius * Math.cos((moon.x + 180) * Math.PI / 180) - y
				moon.rise.setAttribute('d',
					`M ${center.x},${center.y} m ${x},${y} a ${moon.radius},${moon.radius} 0,0,1 ${dx},${dy}`
				)
				moon.set.setAttribute('d',
					`M ${center.x},${center.y} m ${x},${y} a ${moon.radius},${moon.radius} 0,0,0 ${dx},${dy}`
				)
				moon.rise.style.transform= `rotateZ(5.14deg) rotateX(${moon.x}deg) rotateY(80deg)`
				moon.set.style.transform= `rotateZ(5.14deg) rotateX(${moon.x}deg) rotateY(80deg)`
			}, 100)
		},
	})
}])
