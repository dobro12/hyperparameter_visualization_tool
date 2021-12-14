import React, {Component} from "react";
import Select from 'react-select';
import axios from "axios";
import * as d3 from "d3";

import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import CachedIcon from '@mui/icons-material/Cached';
import Stack from '@mui/material/Stack';

import "./index.css";

import CanvasJSReact from '../../lib/canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const color_map = ["#FFB5E8", "#A79AFF", "#85E3FF", "#97C1A9"];
const item_list = ['score', 'p_loss', 'q_loss', 'entropy'];
const default_agent_args = {
  'discount_factor': 0.0,
  'hidden1': 0,
  'hidden2': 0,
  'activ_function': '',
  'q_lr': 0.0,
  'p_lr': 0.0,
  'alpha': 0.0,
  'batch_size': 0,
  'polyak':0.0,
  'replay_size':0,
}
const param_dict = {
  'discount-factor': ['Discount factor', 'float'],
  'hidden1': ['The number of hidden node', 'int'],
  'hidden2': ['The number of hidden node', 'int'],
  'activ-function': ['Activation function', 'str'],
  'qlr': ['Q learning rate', 'float'],
  'q-lr': ['Q learning rate', 'float'],
  'p-lr': ['Policy learning rate', 'float'],
  'alpha': ['Entropy coefficient', 'float'],
  'batch-size': ['Batch size', 'int'],
  'polyak': ['Polyak', 'float'],
  'replay-size': ['Replay size', 'int'],
};

const getMean = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
const getStd = array => {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

class OptGraph extends Component {
  constructor(props) {
    // set parameter
    super(props);
    this.name = props.match.params.name;
    this.task = this.name.split('_')[0];
    this.algo = this.name.split('_')[1];
    this.version_param = this.name.split('_')[2];
    this.version = this.version_param.split('-')[0];
    this.version = `Version ${this.version.split('v')[1]}`;
    this.param_name = this.version_param.split('-').slice(1,).join('-');
    [this.param_string, this.param_type] = param_dict[this.param_name];

    // for slider
    this.enable_slider = null;
    if(this.param_type === "str") this.enable_slider = false;
    else this.enable_slider = true;

    // bind function
    this.handleSlider = this.handleSlider.bind(this);
    this.openNav = this.openNav.bind(this);
    this.closeNav = this.closeNav.bind(this);
    this._onCrosshairUpdated = this._onCrosshairUpdated.bind(this);
    this._onCrosshairHidden = this._onCrosshairHidden.bind(this);
    this._onToolTipUpdated = this._onToolTipUpdated.bind(this);
    this._onToolTipHidden = this._onToolTipHidden.bind(this);
    this._rangeChanged = this._rangeChanged.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);

    // set reference
    this.chart_list = [];
    for(let i=0;i<item_list.length;i++){
      this.chart_list.push(React.createRef());
    }
    this.navi_button = React.createRef();

    this.state = {
      gp_data: [],
      run_data: [],
      item:"score",
      option: {theme: "dark2", height: '550', title: {text: 'score'}},
      gp_data2: [],
      run_data2: [],
      item2:"p_loss",
      option2: {theme: "dark2", height: '175', title: {text: 'p_loss'}},
      gp_data3: [],
      run_data3: [],
      item3:"p_loss",
      option3: {theme: "dark2", height: '175', title: {text: 'p_loss'}},
      gp_data4: [],
      run_data4: [],
      item4:"p_loss",
      option4: {theme: "dark2", height: '175', title: {text: 'p_loss'}},
      ucb: 2.0,
      enable_slider:this.enable_slider,
      agent_args:default_agent_args,
      version_data:[],
    };
  }
  
  parseOptions(gp_data, run_data, item_name, ucb){
    var data_list = [];
    var parsed_data = [];
    var parsed_scatter_data = [];
    var parsed_error_data = [];
    var max_point = {x:0, y:-1e10};
    if(item_name !== "score") max_point.y = 1e10;

    if(this.param_type !== "str"){
      gp_data.forEach(element => {
        parsed_data.push({
          'x':element[0], 
          'y':element[1] + ucb*element[2],
        });
        if(item_name === "score"){
          if(element[1] + ucb*element[2] > max_point.y){
            max_point.y = element[1] + ucb*element[2];
            max_point.x = element[0];
          }  
        }else{
          if(element[1] + ucb*element[2] < max_point.y){
            max_point.y = element[1] + ucb*element[2];
            max_point.x = element[0];
          }  
        }
      });
    }else{
      for (const [key, value] of Object.entries(run_data)) {
        let mean = getMean(value);
        if(item_name === "score"){
          if(mean > max_point.y){
            max_point.x = key;
            max_point.y = mean;
          }
        }else{
          if(mean < max_point.y){
            max_point.x = key;
            max_point.y = mean;  
          }
        }
      }
    }

    // parse data
    for (const [key, value] of Object.entries(run_data)) {
      let mean = getMean(value);
      let std = getStd(value);
      const url = `/runs/${this.name}_${key}`;
      const onClick = () => {window.location.href=url;};

      if(this.param_type !== "str"){
        parsed_scatter_data.push({
          x: parseFloat(key),
          y: mean,
          click: onClick,
        });
        parsed_error_data.push({
          x: parseFloat(key),
          y: [mean - std, mean + std, std],
          click: onClick,
        });
      }else{
        var color = "";
        if(key === max_point.x) color = "#ED7D31";
        else color = "#5B9BD5";
        parsed_scatter_data.push({
          label: key,
          y: [0.0, mean],
          color: color,
          click: onClick,
        });
        parsed_error_data.push({
          label: key,
          y: [mean - std, mean + std, std],
          click: onClick,
        });
      }
    }

    // make data list
    if(this.param_type !== "str"){
      data_list.push({
        type: "line",
        name: item_name,
        showInLegend: true,
        lineThickness: 4,
        yValueFormatString: "#.##",
        toolTipContent: "params: {x}<br/>{name}: {y}",
        dataPoints: parsed_data,
      });  
      data_list.push({
        type:"error",
        name:"std",
        showInLegend: true,
        yValueFormatString: "#.##",
        toolTipContent: "{name}: {y[2]}",
        dataPoints:parsed_error_data,
      });
      data_list.push({
        type:"scatter",
        markerSize:15,
        name:"mean",
        showInLegend: true,
        yValueFormatString: "#.##",
        toolTipContent: "params: {x}<br/>{name}: {y}",
        dataPoints:parsed_scatter_data,
      });
      data_list.push({
        type:"scatter",
        markerSize:15,
        name:"recommend",
        showInLegend: true,
        yValueFormatString: "#.##",
        toolTipContent: "{name}: {y}",
        color:"red",
        dataPoints:[max_point],
      });  
    }else{
      data_list.push({
        type:"rangeColumn",
        markerSize:15,
        name:"mean",
        showInLegend: true,
        yValueFormatString: "#.##",
        toolTipContent: "params: {label}<br/>{name}: {y[1]}",
        dataPoints:parsed_scatter_data,
      });
      data_list.push({
        type:"error",
        name:"std",
        showInLegend: true,
        yValueFormatString: "#.##",
        toolTipContent: "{name}: {y[2]}",
        dataPoints:parsed_error_data,
      });
    }

    // make option
    let option = {};
    // let strip_line_data = this.state.checked_versions.map((d,i)=>{
    //   let version_value = null;
    //   for(let j=0;j<this.state.version_data.length;j++){
    //     if(this.state.version_data[j].name === d){
    //       version_value = this.state.version_data[j][item_name];
    //       break;
    //     }
    //   }
    //   return {value: version_value, label: d};
    // });
    // console.log(strip_line_data);
    // console.log(this.state.checked_versions);

    if(this.param_type !== "str"){
      option = {
        theme: "dark2",
        height: '550',
        animationEnabled: true,	
        zoomEnabled: true,
        zoomType: "x",
        axisX:{
          logarithmic: true,
          crosshair:{
            enabled: true,
            snapToDataPoint: true,
            updated: this._onCrosshairUpdated,
            hidden: this._onCrosshairHidden,
          }
        },
        // axisY:{
        //   stripLines:strip_line_data,
        // },
        title: {text: item_name},
        toolTip: {
          shared: true,
          updated: this._onToolTipUpdated,
          hidden: this._onToolTipHidden,
        },
        data: data_list,
        rangeChanged: this._rangeChanged,  
      };
    }else{
      option = {
        theme: "dark2",
        height: '550',
        animationEnabled: true,	
        zoomEnabled: true,
        zoomType: "x",
        axisX:{
          crosshair:{
            enabled: true,
            snapToDataPoint: true,
            updated: this._onCrosshairUpdated,
            hidden: this._onCrosshairHidden,
          }
        },
        title: {text: item_name},
        toolTip: {
          shared: true,
          updated: this._onToolTipUpdated,
          hidden: this._onToolTipHidden,
        },
        data: data_list,
        rangeChanged: this._rangeChanged,  
      };
    }
    return option;
  }

  onSelectChange(option){
    let strip_line_data = [[], [], [], []];
    option.forEach((d,i)=>{
      for(let j=0;j<this.state.version_data.length;j++){
        if(this.state.version_data[j].name === d.value){
          strip_line_data[0].push({value: this.state.version_data[j][this.state.item], label: d.label, thickness:3, labelFontSize:12, color:color_map[j%color_map.length], labelFontColor:color_map[j%color_map.length]});
          strip_line_data[1].push({value: this.state.version_data[j][this.state.item2], label: d.label, thickness:3, labelFontSize:12, color:color_map[j%color_map.length], labelFontColor:color_map[j%color_map.length]});
          strip_line_data[2].push({value: this.state.version_data[j][this.state.item3], label: d.label, thickness:3, labelFontSize:12, color:color_map[j%color_map.length], labelFontColor:color_map[j%color_map.length]});
          strip_line_data[3].push({value: this.state.version_data[j][this.state.item4], label: d.label, thickness:3, labelFontSize:12, color:color_map[j%color_map.length], labelFontColor:color_map[j%color_map.length]});
          break;
        }
      }
    });
    this.setState(current => {
      var option = this.parseOptions(current.gp_data, current.run_data, current.item, current.ucb);
      var option2 = this.parseOptions(current.gp_data2, current.run_data2, current.item2, current.ucb);
      var option3 = this.parseOptions(current.gp_data3, current.run_data3, current.item3, current.ucb);
      var option4 = this.parseOptions(current.gp_data4, current.run_data4, current.item4, current.ucb);
      option.height = 550;
      option.axisX = current.option.axisX;
      option.axisY = current.option.axisY;
      if(!option.axisY) option.axisY = {};
      option.axisY.stripLines = strip_line_data[0];
      option2.height = 175;
      option2.axisX = current.option2.axisX;
      option2.axisY = current.option2.axisY;
      if(!option2.axisY) option2.axisY = {};
      option2.axisY.stripLines = strip_line_data[1];
      option3.height = 175;
      option3.axisX = current.option3.axisX;
      option3.axisY = current.option3.axisY;
      if(!option3.axisY) option3.axisY = {};
      option3.axisY.stripLines = strip_line_data[2];
      option4.height = 175;
      option4.axisX = current.option4.axisX;
      option4.axisY = current.option4.axisY;
      if(!option4.axisY) option4.axisY = {};
      option4.axisY.stripLines = strip_line_data[3];
      return {
        gp_data: current.gp_data, 
        run_data: current.run_data, 
        item: current.item,
        option: option, 
        gp_data2: current.gp_data2, 
        run_data2: current.run_data2, 
        item2: current.item2,
        option2: option2, 
        gp_data3: current.gp_data3, 
        run_data3: current.run_data3, 
        item3: current.item3,
        option3: option3, 
        gp_data4: current.gp_data4, 
        run_data4: current.run_data4, 
        item4: current.item4,
        option4: option4, 
        ucb: current.ucb,
        enable_slider: current.enable_slider,
        agent_args: current.agent_args,
        version_data: current.version_data,
      };
    });
  }

	componentDidMount(){
    this.navi_button.current.click();
    
    let url = '/api/version?name=' + this.name;
    axios.get(url).then(res=>{
      var ucb = this.convertSliderValue(this.state.ucb);

      var gp_data = res.data.gp_data;
      var run_data = res.data.run_data;
      var item = 'score';
      var option = this.parseOptions(gp_data, run_data, item, ucb);
      option.height = 550;

      var gp_data2 = res.data.gp_data_p_loss;
      var run_data2 = res.data.run_data_p_loss;
      var item2 = 'p_loss';
      var option2 = this.parseOptions(gp_data2, run_data2, item2, ucb);
      option2.height = 175;

      var gp_data3 = res.data.gp_data_q_loss;
      var run_data3 = res.data.run_data_q_loss;
      var item3 = 'q_loss';
      var option3 = this.parseOptions(gp_data3, run_data3, item3, ucb);
      option3.height = 175;

      var gp_data4 = res.data.gp_data_entropy;
      var run_data4 = res.data.run_data_entropy;
      var item4 = 'entropy';
      var option4 = this.parseOptions(gp_data4, run_data4, item4, ucb);
      option4.height = 175;

      let run_name = `${this.name}_${Object.keys(run_data)[0]}`;
      url = '/api/run/agent_args?name=' + run_name;
      axios.get(url).then(res=>{
        let agent_args = res.data[0];

        for(const [key, value] of Object.entries(default_agent_args)){
          if(key.replace('_', '-') === this.param_name || key.replace('_', '') === this.param_name){
            d3.select(this.side_navigation)
            .select('ul')
            .append('li')
            .attr('class', 'list-group-item list-group-item-success')
            .html(`${key}`);  
          }else{
            d3.select(this.side_navigation)
            .select('ul')
            .append('li')
            .attr('class', 'list-group-item')
            .html(`${key}: ${agent_args[key]}`);  
          }
        }

        url = `/api/timelines?name=${this.task}_${this.algo}`;
        axios.get(url).then(res=>{
          this.setState(current => ({
            gp_data: gp_data,
            run_data: run_data, 
            item: item,
            option: option, 
            gp_data2: gp_data2,
            run_data2: run_data2, 
            item2: item2,
            option2: option2, 
            gp_data3: gp_data3,
            run_data3: run_data3, 
            item3: item3,
            option3: option3, 
            gp_data4: gp_data4,
            run_data4: run_data4, 
            item4: item4,
            option4: option4, 
            ucb: current.ucb,
            enable_slider: current.enable_slider,
            agent_args: agent_args,
            version_data: res.data, 
          }));            
        }).catch(err=>{
          console.log('axios fail!', err);
        });
      }).catch(err=>{
        console.log('axios fail!', err);
      });  
    }).catch(err=>{
      console.log('axios fail!', err);
    });

    d3.select(this.button_ref)
    .on('click', ()=>{
      this.setState(current => {
        current.option.height = 175;
        current.option2.height = 550;
        current.option3.height = 175;
        current.option4.height = 175;
        return {
          gp_data: current.gp_data2,
          run_data: current.run_data2, 
          item: current.item2,
          option: current.option2, 
          gp_data2: current.gp_data3,
          run_data2: current.run_data3, 
          item2: current.item3,
          option2: current.option3, 
          gp_data3: current.gp_data4,
          run_data3: current.run_data4, 
          item3: current.item4,
          option3: current.option4, 
          gp_data4: current.gp_data,
          run_data4: current.run_data, 
          item4: current.item,
          option4: current.option, 
          ucb: current.ucb,
          enable_slider: current.enable_slider,
          agent_args: current.agent_args,
          version_data: current.version_data,
        };
      });
    });
 	}

  convertSliderValue(value){
    return Math.pow(10.0, value);
  }

  valueLabelFormat(value){
    return value.toPrecision(3);
  }

  handleSlider(event, new_value){
    var ucb = this.convertSliderValue(new_value);
    this.setState(current => {
      var option = this.parseOptions(current.gp_data, current.run_data, current.item, ucb);
      var option2 = this.parseOptions(current.gp_data2, current.run_data2, current.item2, ucb);
      var option3 = this.parseOptions(current.gp_data3, current.run_data3, current.item3, ucb);
      var option4 = this.parseOptions(current.gp_data4, current.run_data4, current.item4, ucb);
      option.height = 550;
      option.axisX = current.option.axisX;
      option.axisY = current.option.axisY;
      option2.height = 175;
      option2.axisX = current.option2.axisX;
      option2.axisY = current.option2.axisY;
      option3.height = 175;
      option3.axisX = current.option3.axisX;
      option3.axisY = current.option3.axisY;
      option4.height = 175;
      option4.axisX = current.option4.axisX;
      option4.axisY = current.option4.axisY;
      return {
        gp_data: current.gp_data, 
        run_data: current.run_data, 
        item: current.item,
        option: option, 
        gp_data2: current.gp_data2, 
        run_data2: current.run_data2, 
        item2: current.item2,
        option2: option2, 
        gp_data3: current.gp_data3, 
        run_data3: current.run_data3, 
        item3: current.item3,
        option3: option3, 
        gp_data4: current.gp_data4, 
        run_data4: current.run_data4, 
        item4: current.item4,
        option4: option4, 
        ucb: new_value,
        enable_slider: current.enable_slider,
        agent_args: current.agent_args,
        version_data: current.version_data,
      };
    });
  }

  openNav() {
    document.getElementById("mySidenav").style.width = "20em";
    document.getElementById("mySidenav").style.padding = "1em";
    document.getElementById("mySidenav").style.paddingTop = "5em";
    document.getElementById("main").style.marginLeft = "20em";
  }
  
  closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("mySidenav").style.padding = "0";
    document.getElementById("mySidenav").style.paddingTop = "0";
    document.getElementById("main").style.marginLeft = "0";
  }

  _rangeChanged(e){
    this.chart_list.forEach((chart, i)=>{
      if (!chart.options.axisX) 
        chart.options.axisX = {};      
      if (!chart.options.axisY) 
        chart.options.axisY = {};
      if (e.trigger === "reset") {
        chart.options.axisX.viewportMinimum = chart.options.axisX.viewportMaximum = null;
        chart.options.axisY.viewportMinimum = chart.options.axisY.viewportMaximum = null;
        chart.render();
      } else if (chart !== e.chart) {
        chart.options.axisX.viewportMinimum = e.axisX[0].viewportMinimum;
        chart.options.axisX.viewportMaximum = e.axisX[0].viewportMaximum;
        chart.options.axisY.viewportMinimum = e.axisY[0].viewportMinimum;
        chart.options.axisY.viewportMaximum = e.axisY[0].viewportMaximum;
        chart.render();
      }
    });
  }

  _onToolTipUpdated(e){
    this.chart_list.forEach((chart, i)=>{
      if(!chart.toolTip)
        chart.toolTip = {};
      if (chart !== e.chart){
        chart.toolTip.showAtX(e.entries[0].xValue);
      }
    });
  }

  _onToolTipHidden(e){
    this.chart_list.forEach((chart, i)=>{
      if(!chart.toolTip)
        chart.toolTip = {};
      if (chart !== e.chart)
        chart.toolTip.hide();
    });
  }

  _onCrosshairUpdated(e){
    this.chart_list.forEach((chart, i)=>{
      if (!chart.axisX)
        chart.axisX = {0: {crosshair:{}}};
      try{
        if (chart !== e.chart)
          chart.axisX[0].crosshair.showAt(e.value);
      }catch(error){
        console.log("cross hair updated error.", error);
      }
    });
  }

  _onCrosshairHidden(e){
    this.chart_list.forEach((chart, i)=>{
      if (!chart.axisX){
        chart.axisX = {0: {crosshair:{}}};
      }
      try{
        if (chart !== e.chart)
        chart.axisX[0].crosshair.hide();
      }catch(error){
        console.log("cross hair updated error.", error);
      }
    });
  }

  render() {
    let best_parameter = null;
    let best_value = this.state.item === "score" ? -1e10 : 1e10;
    let recommend = null;
    for(const [key, value] of Object.entries(this.state.run_data)){
      let mean = getMean(value);
      if(this.state.item === "score"){
        if(best_value < mean){
          best_value = mean;
          best_parameter = key;
        }
      }else{
        if(best_value > mean){
          best_value = mean;
          best_parameter = key;
        }
      }
    }
    if(this.state.option.data && this.param_type !== "str"){
      recommend = this.state.option.data[this.state.option.data.length - 1].dataPoints[0].x;
      recommend = recommend.toPrecision(5);
    }else{
      recommend = "-";
    }

    return (
      <div>
        <div ref={(ref)=>{this.side_navigation=ref}} id="mySidenav" className="sidenav">
          <span className="closebtn" onClick={this.closeNav}>&times;</span>

            <div className="card" style={{width: "100%", marginBottom: "1em"}}>
              <h5 className="card-title" style={{ 'fontSize': "2em" }}>{this.version}</h5>
              <h6 className="card-subtitle mb-2 text-muted" style={{ 'fontSize': "1.5em" }}>{this.param_string}</h6>
            </div>

          <ul className="list-group">
            <li className="list-group-item active" aria-current="true"> Hyper-Parameter </li>
          </ul>
        </div>

        <div id="main">
          <nav className="alert alert-primary" aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="/">Home</a></li>
              {/* <li className="breadcrumb-item active" aria-current="page"><a href="/versions">Versions</a></li> */}
              <li className="breadcrumb-item active" aria-current="page"><a href="#">{this.name}</a></li>
            </ol>
          </nav>

          <span onClick={this.openNav} ref={this.navi_button}>&#9776; params</span>

          <div className="container">
            <div className="row" style={{marginBottom:'1em'}}>
              <Stack direction="row" spacing={1}>
                <Button ref={(ref)=>{this.button_ref=ref}} variant="contained" startIcon={<CachedIcon />} >change order</Button>
              </Stack>
            </div>

            <div className="row">
              <div className="col-8" style={{height:'34em'}}>
                <CanvasJSChart options={this.state.option} onRef={ref=>this.chart_list[0]=ref}/>
              </div>
              <div className="col-4">
                <div className="row" style={{height:'11.8em', width:'25em'}}>
                  <CanvasJSChart options={this.state.option2} onRef={ref=>this.chart_list[1]=ref} />
                </div>
                <div className="row" style={{height:'11.8em', width:'25em'}}>
                  <CanvasJSChart options={this.state.option3} onRef={ref=>this.chart_list[2]=ref} />
                </div>
                <div className="row" style={{height:'11.8em', width:'25em'}}>
                  <CanvasJSChart options={this.state.option4} onRef={ref=>this.chart_list[3]=ref} />
                </div>
              </div>
            </div>
            <br/>

            <div className="row">
              <div className="col-6">
                <h3> UCB: {this.valueLabelFormat(this.convertSliderValue(this.state.ucb))} </h3>
                <Slider
                  disabled={!this.enable_slider}
                  value={this.state.ucb} onChange={this.handleSlider}
                  aria-label="Default" valueLabelDisplay="auto" 
                  scale={this.convertSliderValue}
                  step={0.01} min={0.0} max={3.0}
                  getAriaValueText={this.valueLabelFormat}
                  valueLabelFormat={this.valueLabelFormat}
                />
                <h3> Other versions </h3>
                <Select
                  isMulti
                  onChange={this.onSelectChange}
                  options={this.state.version_data.map((d,i)=>({value:d.name, label:d.name}))}
                />                
              </div>
              <div className="col-6">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col" style={{fontSize:"1.5em"}}>Performance</th>
                      <th scope="col" style={{fontSize:"1.5em"}}>Best parameter</th>
                      <th scope="col" style={{fontSize:"1.5em"}}>Recommend</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{fontSize:"1.5em"}}>{this.state.item}</td>
                      <td style={{fontSize:"1.5em"}}>{best_parameter}</td>
                      <td style={{fontSize:"1.5em"}}>{recommend}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <br/>
            <br/>
            <br/>
            <br/>

          </div>
        </div>
      </div>
    );
  }
}

export default OptGraph;
