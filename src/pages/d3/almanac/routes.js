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
				;[
					{
						class: 'surface-path',
						radius: earth.radius,
						path: 'path',
						fn: 'append',
						sweep: 0,
					},
					{
						radius: orb.radius,
						path: 'rise',
						fn: 'prepend',
						sweep: 1,
					},
					{
						radius: orb.radius,
						path: 'set',
						fn: 'append',
						sweep: 0,
					},
				].forEach((d) => {
					// Add Rise Path
					orb[d.path] = document.createElementNS(ns, 'path')
					if (orb.class) orb[d.path].classList.add(orb.class)
					if (d.class) orb[d.path].classList.add(d.class)
					orb[d.path].setAttribute('d',
						`M ${center.x},${center.y} m 0,${d.radius} a ${d.radius},${d.radius} 0,0,${d.sweep} 0-${d.radius*2}`
					)
					$svg[d.fn](orb[d.path])
				})
			})

			setInterval(() => {
				moon.x += 36
				if (moon.x >= 360) moon.x -= 360
				;[
					{
						radius: earth.radius,
						path: 'path',
						sweep: 0,
					},
					{
						radius: moon.radius,
						path: 'rise',
						sweep: 1,
					},
					{
						radius: moon.radius,
						path: 'set',
						sweep: 0,
					},
				].forEach((d) => {
					let x = d.radius * Math.sin(moon.x * Math.PI / 180)
					let y = d.radius * Math.cos(moon.x * Math.PI / 180)
					let dx = d.radius * Math.sin((moon.x + 180) * Math.PI / 180) - x
					let dy = d.radius * Math.cos((moon.x + 180) * Math.PI / 180) - y
					moon[d.path].setAttribute('d',
						`M ${center.x},${center.y} m ${x},${y} a ${d.radius},${d.radius} 0,0,${d.sweep} ${dx},${dy}`
					)
					moon[d.path].style.transform= `rotateZ(5.14deg) rotateX(${moon.x}deg) rotateY(80deg)`
				})
			}, 300)
		},
	})
}])
