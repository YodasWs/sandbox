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
		// Add Center Car
		this.addCar(0, {
			id: 'center',
			x: 2000 / 2,
			lane: 1,
			cruiseControl: 0,
		})

		let forces = []

		// Add Collision Force
		forces.push(carCollision(CAR))

		for (let i=0, f=forces.length; i<f; i++) {
			this.sim.force(i, forces.pop())
		}

		// Set onTick
		this.sim.on('tick', () => {
			this.nodes.selectAll('rect').attr('x', (d) => {
				if (d.x < 0 - CAR.w) {
					d.x = 2000 + CAR.w
					d.movingTo = 1 // Math.floor(Math.random() * roadways[0].lanes.length)
					d.lane = d.movingTo
				}
				return d.x - CAR.w / 2
			}).attr('y', (d) => {
				if (d.lane === d.movingTo) {
					d.y = roadways[0].lanes[d.lane]
					d.vy = 0
				} else if (Math.abs(roadways[0].lanes[d.movingTo] - d.y) <= roadways[0].laneWidth / 30) {
					d.lane = d.movingTo
				} else {
					d.vy = Math.sign(roadways[0].lanes[d.movingTo] - d.y) * roadways[0].laneWidth / 30
				}
				return d.y - CAR.h / 2
			})
		})
		this.sim.on('tick')()
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
		this.movingTo = this.lane === roadways[0].lanes.length - 1 ? this.lane - 1 : this.lane + 1
	}

	this.addCar = (i, car) => {
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
			laneWidth: 70,
			numLanes: 2,
			lanes: [],
		},
	]

	// Calculate Center of Lanes
	for (let i=0; i<roadways[0].numLanes; i++) {
		roadways[0].lanes.push(i * roadways[0].laneWidth + 1000 - roadways[0].numLanes * roadways[0].laneWidth / 2 + roadways[0].laneWidth / 2)
	}

	// Build roadways
	roadways.forEach((roadway, i) => {
		const ry = 2000 / (roadways.length + 1) * (i + 1)
		this.d3.append('g').classed('roadway', true)
		this.d3.selectAll('g.roadway').append('rect')
			.attr('height', roadway.numLanes * roadway.laneWidth)
			.attr('y', ry - roadway.numLanes * roadway.laneWidth / 2)
			.attr('x', 0).attr('width', 2000)
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
	this.resumeSim()

	// Add Traffic
	this.addCar(0, {
		lane: 1,
		x: 2000 - CAR.w * 5,
		cruiseControl: -5,
	})
	this.addCar(0, {
		lane: 1,
		x: 2000 + CAR.w * 10,
		cruiseControl: -10,
	})
}])
