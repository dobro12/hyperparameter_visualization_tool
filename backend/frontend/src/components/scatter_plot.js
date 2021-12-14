import React, { useRef, useEffect} from "react";
import * as d3 from "d3";

const ScatterPlot = (props) => {

	const splot_svg = useRef(null);
	const margin = props.margin;
	const width = props.width;
	const height = props.height;
	const svg_width = props.margin * 2 + width;
	const svg_height = props.margin * 2 + height;
	const data = props.data;

	useEffect(() => {
		// type cast of data
		data.forEach(element => {
			element[0] = parseFloat(element[0]);
			element[1] = parseFloat(element[1]);
		});
		
		// get svg instance
		const svg = d3.select(splot_svg.current);

		// Create scale
		const x_scale = d3.scaleLinear()
					.domain([d3.min(data, d=>d[0]), d3.max(data, d=>d[0])])
					.range([0, width]);
		const y_scale = d3.scaleLinear()
					.domain([d3.min(data, d=>d[1]), d3.max(data, d=>d[1])])
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

		// add group for scatter plot
		svg.append('g')
			.attr('transform', `translate(${margin}, ${margin})`)
			.classed('graph', true);

		// define function for enter/update/exit of data join
		function update(data){
			svg.select('.graph')
				.selectAll('circle')
				.data(data)
				.join(
					function(enter){
						return enter.append('circle')
							.attr('class', (d,i)=>`class_${i}`)
							.attr('cx', d=>x_scale(d[0]))
							.attr('cy', d=>y_scale(d[1]))
							.attr('fill', d=>d[2])
							.style("opacity", d=>d[3])
							.attr('r', d=>d[4]);
					},
					function(update){
						return update
							.attr('cx', d => x_scale(d[0]))
							.attr('cy', d => y_scale(d[1]))
							.attr('fill', d=>d[2])
							.style("opacity", d=>d[3])
							.attr('r', d=>d[4]);

					},
					function(exit){
						return exit.remove();
					}
				);
		}
		update(data);

		// add brush
		const brush = d3.brush()
		.extent([[0.0, 0.0], [width, height]])
		.on("start brush end", brushed);					
		svg.append('g')
			.attr('transform', `translate(${margin}, ${margin})`)
			.call(brush);

		function brushed({selection}){
			let data_list = [];

			if(selection === null){
				console.log("unselected");
				svg.selectAll("circle").classed("selected", false);
			}else{
				console.log("selected");
				let [[x0, y0], [x1, y1]] = selection;

				for(let i=0;i<data.length;i++){
					let x_coord = x_scale(data[i][0]);
					let y_coord = y_scale(data[i][1]);
					let condition = x0 <= x_coord && x_coord <= x1
						&& y0 <= y_coord && y_coord <= y1;
					if(condition){
						data_list.push(data[i]);
						d3.selectAll(`.class_${i}`).classed('selected', true);
					}else{
						d3.selectAll(`.class_${i}`).classed('selected', false);
					}
				}
			}
		}
		
	});

	return (
		<div style={{margin:'2em'}}>
			<svg ref={splot_svg} width={svg_width} height={svg_height}> 
			</svg>
		</div>
	)
};

export default ScatterPlot;