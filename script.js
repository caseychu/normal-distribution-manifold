window.onload = function () {
	
	var svg = document.querySelector('svg');
	var width = svg.width = parseInt(getComputedStyle(svg).width);
	var height = svg.height = parseInt(getComputedStyle(svg).height);
	
	var padding = Math.min(width, height) * 0.05;
	width -= padding * 2;
	height -= padding * 2;
	
	// height width / w
	var w = 6;
	var h = height * w / width; // Height has to be a scale of root 2 of the horizontal axis
	var muScale = d3.scale.linear().domain([-w / 2, w / 2]).range([0, width]);
	var sigmaScale = d3.scale.linear().domain([0, h]).range([height, 0]);
	
	var x = d3.svg.axis().scale(muScale).orient('bottom').ticks(10).tickSize(8);
	var y = d3.svg.axis().scale(sigmaScale).orient('left').ticks(5).tickSize(8).tickFormat(function (p) {
		return p// / Math.sqrt(2);
	});
	
	var svg = d3.select('svg')
		.append('g')
		.attr('transform', 'translate(' + padding + ',' + padding + ')');
	
	// A click target.
	svg
		.append('rect')
		.attr('class', 'click')
		.attr('width', width)
		.attr('height', height)
		.attr('fill', 'white');
	
	svg
		.append('g')
		.attr('class', 'axis')
		.call(x)
		.attr('transform', 'translate(0, ' + height + ')');
	svg
		.append('g')
		.attr('class', 'axis')
		.call(y)
		.attr('transform', 'translate(' + (width / 2) + ', 0)');
		
	svg.on('click', function () {
		var coords = d3.mouse(this);
		normalDistribution(muScale.invert(coords[0]), sigmaScale.invert(coords[1]));
	})
	
	var old;
	requestAnimationFrame(function tick(time) {
		var tau = -0.25 * time / 1000 + 0.75;
		console.log(tau)
		if (old)
			old.remove();
		
		// http://malkoun.org/RG/hyperbolic.pdf
		old = normalDistribution(-1.5 * tanh(tau), 1.5 * sech(tau));
		
		requestAnimationFrame(tick);
	});
	
	function normalDistribution(mu, sigma, existing) {
		var domain = muScale.domain();
		var line = d3.svg.line()
			.x(muScale)
			.y(function (x) {
				return height * normalPDF(mu, sigma, x);
			})
			.interpolate('basis');
		
		var color = 'hsl(' + (150 + Math.atan2(sigma, mu) * 180 / Math.PI) + ', 100%, 63%)';
		var group = svg.append('g');
		group
			.append('g')
			.attr('transform', 'translate(0, ' + height + ')')
			.append('g')
			.attr('transform', 'scale(1, -1)')
			.append('path')
			.attr({
				'd': line(d3.range(domain[0], domain[1] + 0.1, 0.05)),
				'stroke-width': '2px',
				'stroke': color,
				'fill': 'none'
			})
			.style('opacity', '0.5');
			
		group
			.append('circle')
			.attr({
				'cx': muScale(mu),
				'cy': sigmaScale(sigma),
				'r': 5,
				'fill': '#fff',
				'stroke': color,
				'stroke-width': '2px'
			})
			.style('filter', 'drop-shadow(-5px -5px 5px #000)');
			
		return group;
	}
	
	function normalPDF(mu, sigma, x) {
		var y = Math.exp(-(x - mu) * (x - mu) / (sigma * sigma)) / (Math.sqrt(Math.PI) * sigma);
		return y > 1E-7 ? y : 0;
	}
	
	function tanh(t) {
		if (t >= 0)
			return (1 - Math.exp(-2*t)) / (1 + Math.exp(-2*t));
		return (Math.exp(2*t) - 1) / (Math.exp(2*t) + 1);
	}
	
	function sech(t) {
		return 2 / (Math.exp(t) + Math.exp(-t));
	}
};