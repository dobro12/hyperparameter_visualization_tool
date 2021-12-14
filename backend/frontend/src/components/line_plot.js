import React, { useRef, useEffect} from "react";
import * as d3 from "d3";

const LinePlot = (props) => {

	const splot_svg = useRef(null);
	const margin = props.margin;
	const width = props.width;
	const height = props.height;
	const svg_width = props.margin * 2 + width;
	const svg_height = props.margin * 2 + height;
	const data_list = props.data;
	const data_name = props.name;
	const color_list = ['#E87B9F', '#5BC5DB', '#EDB732', '#0000FF', '#FF00FF', '#FFFF00', '#800080'];

	useEffect(() => {
		// type cast of data

		let x_min, x_max, y_min, y_max;
		for(let i = 0; i < data_list.length; i++){
			data_list[i].forEach(element => {
				element['step'] = parseFloat(element['step']);
				element['value'] = parseFloat(element['value']);
			});

			let temp_x_min = d3.min(data_list[i], d=>d['step']);
			let temp_x_max = d3.max(data_list[i], d=>d['step']);
			let temp_y_min = d3.min(data_list[i], d=>d['value']);
			let temp_y_max = d3.max(data_list[i], d=>d['value']);
			if(i === 0){
				x_min = temp_x_min;
				x_max = temp_x_max;
				y_min = temp_y_min;
				y_max = temp_y_max;
			}else{
				x_min = (x_min > temp_x_min) ? temp_x_min : x_min;
				x_max = (x_max < temp_x_max) ? temp_x_max : x_max;
				y_min = (y_min > temp_y_min) ? temp_y_min : y_min;
				y_max = (y_max < temp_y_max) ? temp_y_max : y_max;
			}
			console.log(temp_x_min, temp_x_max, temp_y_min, temp_y_max);
		}
		console.log(x_min, x_max, y_min, y_max);
		
		// get svg instance
		const svg = d3.select(splot_svg.current);

		// reset svg
		svg.selectChildren().remove();

		// create scale
		const x_scale = d3.scaleLinear()
					.domain([x_min, x_max])
					.range([0, width]);
		const y_scale = d3.scaleLinear()
					.domain([y_min, y_max])
					.range([height, 0]);

		// Add scales to axis
		const x_axis = d3.axisBottom(x_scale);
		const y_axis = d3.axisLeft(y_scale);
		if(svg.selectAll('g.x_axis').size() === 0){
			svg.append('g')
				.classed('x_axis', true)
				.attr('transform', `translate(${margin}, ${height + margin})`)
			svg.append('g')
				.classed('y_axis', true)
				.attr('transform', `translate(${margin}, ${margin})`)
		}
		svg.selectAll('g.x_axis').call(x_axis);
		svg.selectAll('g.y_axis').call(y_axis);

		// text label for axes
		svg.append("text")             
			.attr("transform",
				"translate(" + (width/2 + margin) + " ," + 
								(height + margin + 40) + ")")
			.style("text-anchor", "middle")
			.text("step");
		// svg.append("text")
		// 	.attr("transform", `rotate(-90) translate(-${height/2 + margin}, ${margin/3})`)
		// 	.style("text-anchor", "middle")
		// 	.text(data_name);
		svg.append("text")
			.attr('transform', `translate(${margin+ width/2}, ${40})`)
			.style('font-size', "1.5em")
			.style("text-anchor", "middle")
			.text(data_name);

		// add group for scatter plot
		svg.append('g')
			.attr('transform', `translate(${margin}, ${margin})`)
			.classed('graph', true);
		
		// Add the line
		for(let i = 0; i < data_list.length; i++){
			svg.select('.graph')
				.append("path")
				.datum(data_list[i])
				.attr("fill", "none")
				.attr("stroke", color_list[i])
				.attr("stroke-width", 1.5)
				.attr("d", d3.line()
					.x(function(d) {return x_scale(d['step'])})
					.y(function(d) {return y_scale(d['value'])})
				);
		}
	});

	return (
		<div className='line_plot'>
			<svg ref={splot_svg} width={svg_width} height={svg_height}> 
			</svg>
		</div>
	)
};

export default LinePlot;