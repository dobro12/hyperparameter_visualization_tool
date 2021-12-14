import React, { useRef, useEffect} from "react";
import * as d3 from "d3";



const Mainplot = (props) => {

	const splot_svg = useRef(null);
	const margin = props.margin;
	const width = props.width;
	const height = props.height;
	const svg_width = props.margin * 2 + width;
	const svg_height = props.margin * 2 + height;
	const data = props.data;
	const gp_data = props.gp_data;

	useEffect(() => {
		// TODO

		// type casting
		data.forEach(element => {
			element[0] = parseFloat(element[0]);
			element[1] = parseFloat(element[1]);
		});

		// ============================================== //
		// ============== for scatter plot ============== //
		const svg = d3.select(splot_svg.current);

		// Create scale
		const x_scale = d3.scaleLog()
					.domain([d3.min(data, d=>d[0]), d3.max(data, d=>d[0])])
					.range([0, width]);
		// const y_scale = d3.scaleLinear()
		// 			.domain([d3.min(data, d=>d[1]), d3.max(data, d=>d[1])])
		// 			.range([height, 0]);
		const y_scale = d3.scaleLinear()
					.domain([0.0, d3.max(data, d=>d[1])])
					.range([height, 0]);

		// Add scales to axis
		const x_axis = d3.axisBottom(x_scale);
		const y_axis = d3.axisLeft(y_scale);
		svg.append('g')
			.attr('transform', `translate(${margin}, ${height + margin})`)
			.call(x_axis);
		svg.append('g')
			.attr('transform', `translate(${margin}, ${margin})`)
			.call(y_axis);


		// svg.append('g')
		// 	.attr('transform', `translate(${margin}, ${margin})`)
		// 	.selectAll('line')
		// 	.data(data)
		// 	.join(
		// 		function(enter){
		// 			return enter.append('line')
		// 				.attr('y1', d => y_scale(d[1] + d[2]))
		// 				.attr('y2', d => y_scale(d[1] - d[2]))
		// 				.attr('x1', d => x_scale(d[0]))
		// 				.attr('x2', d => x_scale(d[0]))
		// 				.attr('stroke', 'black')
		// 				.attr('stroke-width', 2);
		// 		},
		// 		function(update){
		// 			return update;
		// 	},
		// 		function(exit){
		// 			return exit.remove();
		// 		},
		// 	);
			
		// join data and make DOM via enter function
		svg.append('g')
			.attr('transform', `translate(${margin}, ${margin})`)
			.selectAll('circle')
			.data(data).join(
				function(enter){
					return enter.append('circle')
					.attr('cx', d=>x_scale(d[0]))
					.attr('cy', d=>y_scale(d[1]))
					.attr('class', (d,i)=>`class_${i}`)
					.attr('fill', "#5BC5DB")
					.on('click', function(){window.location.href = "/runs";})
					.attr('r', 5);
				},
				function(update){
					return update;
				},
				function(exit){
					return exit.remove();
				}
			);

		svg.append('g')
			.attr('transform', `translate(${margin}, ${margin})`)
			.append("path")
			.datum(gp_data['data'])
			.attr("fill", "none")
			.attr("stroke", "#E87B9F")
			.attr("stroke-width", 1.5)
			.attr("d", d3.line()
				.x(function(d) {return x_scale(d[0])})
				.y(function(d) {return y_scale(d[1])})
			);

		svg.append('circle')
		.attr('transform', `translate(${margin}, ${margin})`)
		.attr('cx', x_scale(gp_data['recommend'][0]))
		.attr('cy', y_scale(gp_data['recommend'][1]))
		.attr('r', 10);
			

		// ============================================== //

	});

	return (
		<div className='scatter_plot' onclick="location.href = '/runs'">
			<svg ref={splot_svg} width={svg_width} height={svg_height}> 
			</svg>
		</div>
	)
};

export default Mainplot;