import React, { useState, useRef, useEffect, Component } from "react";
import * as d3 from "d3";
import { CanvasJSChart } from "canvasjs-react-charts";
import SideSelectBar from "./SideSelect";
import "./App.css";


const toolTip = "HyperParameter<br/>-----------------------------------<br/>Learning Rate- Q:{q_lr}<br/>Learning Rate- A:{p_lr}<br/>Batch Size:{batch_size}<br/>Discount Factor:{discount_factor}<br/>Entropy Coefficient:{alpha}<br/>Num of Layer Nodes:{hidden1}<br/>Activation Function:{activ_function}<br/>-----------------------------------<br/>Reward:{score}<br/>Q-Loss:{q_loss}<br/>PI-Loss:{p_loss}<br/>Entropy:{entropy}";


class TimeTable extends Component {

    set_data() {
        const data = this.props.Results;
        
        if (data.length === 0) return false;
        
        var measurement = this.props.Measurement;
        var dataset = [];
        
	    // if (this.props.Measurement !== "") var NLabel = "{hyperparameter} : ("+this.props.Measurement+") {"+this.props.Measurement+"} \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n .";
	    // else var NLabel = "{hyperparameter} \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n .";
	    // if (this.props.Measurement !== "") var NLabel = `{hyperparameter} : (${this.props.Measurement}) ${this.props.Measurement}`;
	    // else var NLabel = "{hyperparameter}";
	    if (this.props.Measurement !== "") var NLabel = "{hyperparameter} : ("+this.props.Measurement+") {"+this.props.Measurement+"}";
	    else var NLabel = "{hyperparameter}";
	    
        const data_scatter = {
            type: "scatter",
		    // indexLabel: NLabel,
		    // indexLabelTextAlign: "center",
		    // indexLabelPlacement: "outside",
		    // indexLabelFontSize: 20,
		    // indexLabelMaxWidth: 250,
		    // indexLabelFontColor: "rgb(220,220,220)",
		    // indexLabelFontWeight: "bolder",
		    markerSize: 30,
	        toolTipContent: toolTip,
		    dataPoints: data
	    }
	    dataset.push(data_scatter);
		
		var current_parents = -1;
		var prev_parents = -1;
		var version_idx = 1;
		var highlight_path = this.find_optimal_path();
		console.log(highlight_path);
		
        for (let i=0; i<data.length; i++){
            var ith_data = data[i]
            current_parents = ith_data['parents'];
            if (current_parents < 0) continue;
            else if (current_parents !== prev_parents) version_idx = 1;
            
            //ith_data['version'] = data[current_parents]['version']+"-"+version_idx;
            
            var in_path = false;
            for (let ith_node of highlight_path) {
                if (i === ith_node) in_path = true;
            }
            
            if (in_path) var rgb_value="rgb(255,0,0)";
            else var rgb_value="rgb(200,200,200)";
            
            const data_line = {
			    type: "line",
			    lineColor: rgb_value,
			    lineThickness: 4,
			    markerSize: 30,
	            toolTipContent: toolTip,
		        dataPoints: [
		            data[current_parents],
		            ith_data,
		        ]
	        }
	        dataset.push(data_line);
		    
		    version_idx += 1;
		    prev_parents = current_parents;
        }
        
		var highlight_index = this.find_optimal_value();
		if (highlight_index >= 0) {
            const data_highlight = {
                type: "scatter",
			    markerSize: 45,
			    markerColor: "red",
			    dataPoints: [data[highlight_index]]
		    }
		    dataset.push(data_highlight);
        }


		const new_data = data.map((d,i)=>{
			let dd = {};
			Object.assign(dd, d);
			dd.y += 20;
			return dd;
		});
        const data_scatter2 = {
            type: "scatter",
		    indexLabel: NLabel,
		    indexLabelTextAlign: "center",
		    indexLabelPlacement: "outside",
		    indexLabelFontSize: 20,
		    indexLabelMaxWidth: 250,
		    indexLabelFontColor: "rgb(220,220,220)",
		    indexLabelFontWeight: "bolder",
		    markerSize: 0.01,
	        toolTipContent: toolTip,
		    dataPoints: new_data
	    }
	    dataset.push(data_scatter2);

		return dataset
    }
    
    set_stripline() {
        const data = this.props.Results;
        if (data.length === 0) return false;
        
        var striplist = [];
        
		var current_x = 0;
		var prev_x = 0;
        for (let ith_data of data) {
            current_x = ith_data['x'];
            if (current_x !== prev_x) {
                var new_strip = {                
				    startValue:current_x-0.002,
				    endValue:current_x+0.002,                
				    //color:"rgb(20,20,20)"              
				    color:"rgb(140,140,140)"                            
			    }
			    striplist.push(new_strip);
            }
            prev_x = current_x;
        }
        return striplist
    }
    
    find_optimal_value() {
        const data = this.props.Results;
        if (data.length === 0) return false;
        
        if (this.props.Measurement === "") {
            return -1
	    }
        if (this.props.Measurement === "score") {
		    var max_reward = -10000.0;
		    var max_index = -1;
		    
            for (let i=0; i<data.length; i++){
                var ith_data = data[i]
                if (max_reward < ith_data['score']) {
                    max_reward = ith_data['score'];
                    max_index = i;
                }
            }
            return max_index
	    }
        if (this.props.Measurement === "q_loss") {
		    var min_loss = 10000.0;
		    var min_index = -1;
		    
            for (let i=0; i<data.length; i++){
                var ith_data = data[i]
                if (min_loss > ith_data['q_loss']) {
                    min_loss = ith_data['q_loss'];
                    min_index = i;
                }
            }
            return min_index
	    }
        if (this.props.Measurement === "p_loss") {
		    var min_loss = 10000.0;
		    var min_index = -1;
		    
            for (let i=0; i<data.length; i++){
                var ith_data = data[i]
                if (min_loss > ith_data['p_loss']) {
                    min_loss = ith_data['p_loss'];
                    min_index = i;
                }
            }
            return min_index
	    }
        if (this.props.Measurement === "entropy") {
		    var min_entropy = 10000.0;
		    var min_index = -1;
		    
            for (let i=0; i<data.length; i++){
                var ith_data = data[i]
                if (min_entropy > ith_data['entropy']) {
                    min_entropy = ith_data['entropy'];
                    min_index = i;
                }
            }
            return min_index
	    }
		
    }
    
    
    find_optimal_path() {
        const data = this.props.Results;
        if (data.length === 0) return false;
        
		var optimal_index = this.find_optimal_value();
		var optimal_path = [];
		
		if (optimal_index >= 0) {
		    var curr_index = optimal_index;
		    while (true) {
		        optimal_path.push(curr_index);
		        if (data[curr_index]['parents'] === -1) break;
		        curr_index = data[curr_index]['parents'];
		    }
		}
		return optimal_path
        
    }
        
    
	render() {
	    //console.log(this.set_data());
		const options = {
			theme: "dark2",
			//width: 1200,
			height: 700,
			animationEnabled: true,
			zoomEnabled: true,
			title:{
				text: "Time-Table",
			    fontColor:"rgb(220,220,220)",
			    fontSize: 30,
			    fontWeight: "bold",
			},
			axisX: {
				title:"Tree Depth",
			    titleFontColor:"rgb(220,220,220)",
			    titleFontSize: 25,
			    titleFontWeight: "bolder",
			    prefix: "Lv.",
			    labelFontWeight: "bolder",
			    labelFontSize: 25,
				interval: 1,
				crosshair: {
					enabled: false,
					snapToDataPoint: true
				},
				stripLines: this.set_stripline()
			},
			axisY:{
			    //interlacedColor: "#F8F1E4",
                tickLength: 0.05,
                tickColor: "black",
                labelFontSize: 0.01,
                gridColor: "black",
                gridThickness: 0.8,
				crosshair: {
					enabled: false,
					snapToDataPoint: true
				}
			},
			data: this.set_data()
		}
		return (
		<div>
			<CanvasJSChart options = {options}
				 onRef={ref => this.chart = ref}
			/>
			{/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
		</div>
		
		);
	}
}

export default TimeTable;
