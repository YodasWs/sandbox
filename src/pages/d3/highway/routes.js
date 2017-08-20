'use strict';

angular.module('pageHighway')
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
	$routeProvider.when('/d3/highway/', {
		templateUrl: 'pages/d3/highway/highway.html',
		controllerAs: '$ctrl',
		controller: 'ctrlHighway',
	})
}])
.controller('ctrlHighway', ['$scope', function($scope) {
	// Use page stylesheet
	angular.element('[ng-view]').attr('ng-view', 'pageHighway')
	// Initialize our variables
	this.sim = null
	this.svg = angular.element('svg')
	this.d3 = d3.select('svg')
	this.cars = []
	this.clearSim = () => {
		// Initialize Simulation
		if (this.sim && this.sim.stop) this.sim.stop()
		this.sim = d3.forceSimulation().stop().alphaMin(0.01)
		this.sim.alphaDecay(0).velocityDecay(0)
	}
	$scope.btnPause = 'Resume'

	this.buildSim = () => {
		let forces = []

		// Add Collision Force
		forces.push(carCollision(CAR))

		for (let i=0, f=forces.length; i<f; i++) {
			this.sim.force(i, forces.pop())
		}

		// Set onTick
		this.sim.on('tick', () => {
			this.d3.selectAll('g.roadway').selectAll('text')
				.text((d) => {
					return d.carsPassed
				})
			this.nodes.selectAll('rect').attr('x', (d) => {
				if (d.x < 0 - CAR.w) {
					d.x = 2000 + CAR.w
					d.movingTo = Math.floor(Math.random() * roadways[d.roadway].lanes.length)
					d.lane = d.movingTo
					roadways[d.roadway].carsPassed++
				}
				return d.x - CAR.w / 2
			}).attr('y', (d) => {
				if (d.lane === d.movingTo) {
					d.y = roadways[d.roadway].lanes[d.lane]
					d.vy = 0
				} else if (Math.abs(roadways[d.roadway].lanes[d.movingTo] - d.y) <= roadways[d.roadway].laneWidth / 30) {
					d.lane = d.movingTo
				} else {
					d.vy = Math.sign(roadways[d.roadway].lanes[d.movingTo] - d.y) * roadways[d.roadway].laneWidth / 30
				}
				return d.y - CAR.h / 2
			})
		})
	}

	$scope.toggleSim = () => {
		if ($scope.btnPause === 'Pause') this.pauseSim()
		else this.resumeSim()
	}

	this.pauseSim = () => {
		this.d3.selectAll('g.roadway').classed('animated', false)
		this.sim.stop()
		$scope.btnPause = 'Resume'
	}

	this.resumeSim = () => {
		this.d3.selectAll('g.roadway').classed('animated', true)
		this.sim.restart()
		$scope.btnPause = 'Pause'
	}

	function changeLanes() {
		this.movingTo = this.lane === roadways[this.roadway].lanes.length - 1 ? this.lane - 1 : this.lane + 1
	}

	this.addCar = (i, car) => {
		if (typeof i !== 'number') return
		if (i < 0 || i >= roadways.length) return
		if (!roadways[i]) return
		// Add missing data
		if (typeof car.lane === 'number' && car.lane >= 0 && car.lane < roadways[i].lanes.length) {
			if (!car.y) {
				car.y = roadways[i].lanes[car.lane]
			}
			if (typeof car.movingTo === 'undefined') car.movingTo = car.lane
		}
		if (!car.id) {
			car.id = `car${this.cars.length}`
		}
		car.x = car.x || 2000 + CAR.w
		car.separation = car.separation || CAR.w / 10
		car.roadway = i
		car.vy = 0
		car.changeLanes = changeLanes.bind(car)
		// Add to Simulation
		this.cars.push(car)
		this.sim.nodes(this.cars)
		let cars = this.d3.selectAll('g.car')
			.data(this.sim.nodes())
			.enter().append('g')
			.classed('car', true)
		cars.append('rect').attr('width', CAR.w).attr('height', CAR.h)
		this.nodes = this.d3.selectAll('g.car')
	}

	const CAR = {
		w: 90,
		h: 40,
	}
	let roadways = [
		{
			carsPassed: 0,
			laneWidth: 70,
			numLanes: 2,
			lanes: [],
		},
		{
			carsPassed: 0,
			laneWidth: 70,
			numLanes: 2,
			lanes: [],
		},
	]
	roadways.forEach((roadway, i) => {
		roadway.y = 2000 / (roadways.length + 1) * (i + 1)
		roadway.i = i
	})

	// Calculate Center of Lanes
	roadways.forEach((roadway, j) => {
		for (let i=0; i<roadway.numLanes; i++) {
			roadway.lanes.push(i * roadway.laneWidth + 2000 / (roadways.length + 1) * (j + 1) - roadway.numLanes * roadway.laneWidth / 2 + roadway.laneWidth / 2)
		}
	})

	// Build roadways
	let d3roadways = this.d3.selectAll('g.roadway').data(roadways)
	d3roadways = d3roadways.enter().append('g').classed('roadway', true).merge(d3roadways)
	d3roadways.append('rect')
		.attr('x', 0).attr('width', 2000)
		.attr('height', (d) => {
			return d.numLanes * d.laneWidth
		})
		.attr('y', (d) => {
			return d.y - d.numLanes * d.laneWidth / 2
		})
	d3roadways.append('text')
		.attr('x', 20).attr('y', (d) => {
			return d.y - d.numLanes * d.laneWidth / 2 - 10
		})

	// Add Lanes
	roadways.forEach((roadway, i) => {
		const ry = 2000 / (roadways.length + 1) * (i + 1)
		for (let i=1; i<roadway.numLanes; i++) {
			let line = this.d3.selectAll('g.roadway').append('line')
			const y = i * roadway.laneWidth + ry - roadway.numLanes * roadway.laneWidth / 2
			line.attr('x1', 2000)
			line.attr('x2', 0)
			line.attr('y1', y)
			line.attr('y2', y)
		}
	})

	// Initialize Sim
	this.clearSim()
	this.buildSim()

	// Add Center Car
	this.addCar(0, {
		id: 'center',
		x: 2000 / 2,
		lane: 1,
		cruiseControl: 0,
	})
	this.addCar(1, {
		id: 'center',
		x: 2000 / 2,
		lane: 0,
		cruiseControl: 0,
	})

	// Add Traffic
	roadways.forEach((roadway, i) => {
		this.addCar(i, {
			lane: 1,
			x: 2000 - CAR.w * 5,
			cruiseControl: -5,
		})
		this.addCar(i, {
			lane: 1,
			x: 2000 + CAR.w * 10,
			cruiseControl: -10,
		})
		this.addCar(i, {
			lane: 1,
			x: 2000 - CAR.w * 15,
			cruiseControl: -15,
		})
		this.addCar(i, {
			lane: 1,
			x: 2000 + CAR.w * 20,
			cruiseControl: -20,
		})
	})

	// Start Sim
	this.resumeSim()
}])
