/**
 * Stop cars from colliding
 *
 * Forked from https://github.com/d3/d3-force/blob/dfc521aa8edd2ea51576acdc336bc6babc375535/src/collide.js
 */
'use strict';

const carCollision = function(dimensions) {

	// https://github.com/d3/d3-force/blob/master/src/constant.js
	function constant(x) {
		return function() {
			return x;
		};
	}

	// https://github.com/d3/d3-force/blob/master/src/jiggle.js
	function jiggle() {
		return (Math.random() - 0.5) * 1e-6;
	}

	function x(d) {
		return d.x + d.vx;
	}

	function y(d) {
		return d.y + d.vy;
	}

	let nodes,
		radii,
		strengths,
		strength,
		iterations = 1;

	// Create dimensions function that returns object
	if (typeof dimensions !== "function") {
		if (dimensions == null) {
			dimensions = { w: 1, h: 1 }
		} else if (typeof dimensions !== 'object') {
			dimensions = { w: +dimensions, h: +dimensions }
		} else {
			if (!dimensions.h) dimensions.h = 1
			if (!dimensions.w) dimensions.w = 1
		}
		dimensions = constant(dimensions);
	}

	function force() {
		let i, n = nodes.length,
			tree,
			node,
			xi,
			yi,
			rx,
			ry,
			ri2;

		for (let k = 0; k < iterations; ++k) {
			tree = d3.quadtree(nodes, x, y).visitAfter(prepare);
			for (i = 0; i < n; ++i) {
				nodes[i].applyBrakes = false
			}
			for (i = 0; i < n; ++i) {
				node = nodes[i];
				rx = radii[node.index].w;
				ry = radii[node.index].h;
				ri2 = rx * rx;
				xi = node.x + node.vx;
				yi = node.y + node.vy;
				tree.visit(apply);
			}
			for (i = 0; i < n; ++i) {
				if (node.applyBrakes) {
					node.vx -= Math.sign(node.vx) * strengths[node.index] / 4
				} else if (Math.abs(node.vx - node.cruiseControl) >= 1e-5) {
					node.vx += Math.sign(node.cruiseControl) * strengths[node.index] / 5
				}
			}
		}

		function apply(quad, x0, y0, x1, y1) {
			let data = quad.data, rj = quad.r, r = rx + rj;
			if (data) {
				if (data.index > node.index) {
					let x = xi - data.x - data.vx,
						y = yi - data.y - data.vy,
						l = x * x + y * y;

					// Are they going to hit?
					if (Math.abs(y) > ry / 2 + radii[data.index].h / 2 + 5) return
					if (l >= r * r) return

					if (data.x > node.x) {
						data.applyBrakes = true
					} else {
						node.applyBrakes = true
					}
				}
				return;
			}
			return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
		}
	}

	function prepare(quad) {
		if (quad.data) return quad.r = radii[quad.data.index].w;
		for (let i = quad.r = 0; i < 4; ++i) {
			if (quad[i] && quad[i].r > quad.r) {
				quad.r = quad[i].r;
			}
		}
	}

	function initialize() {
		if (!nodes) return;
		let n = nodes.length, node;
		radii = new Array(n);
		strengths = new Array(n);
		for (let i = 0; i < n; ++i) {
			node = nodes[i]
			radii[node.index] = dimensions(node, i, nodes)
			strengths[node.index] = strength(node, i, nodes)
		}
	}

	force.initialize = function(_) {
		nodes = _;
		initialize();
	};

	force.iterations = function(_) {
		return arguments.length ? (iterations = +_, force) : iterations;
	};

	force.strength = function(_) {
		return arguments.length ? (strength = (typeof _ !== "function" ? constant(_ == null ? 1 : +_) : _), force) : strength;
	};

	if (!strength) force.strength(1)

	return force
}
