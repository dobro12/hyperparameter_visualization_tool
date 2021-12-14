import React from "react";
import {Component} from "react";
import axios from "axios";
import "./index.css";

import CanvasJSReact from '../../lib/canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var CanvasJS = CanvasJSReact.CanvasJS;

const item_list = {'score':[], 'p_loss':[], 'q_loss':[], 'entropy':[]};

class Runs extends Component {
  constructor(props) {
    super(props);
    this.name = props.match.params.name;
    this.state = {
      agent_args: {
        'discount_factor': 0.0,
        'hidden1': 0,
        'hidden2': 0,
        'activ_function': 'relu',
        'q_lr': 0.0,
        'p_lr': 0.0,
        'alpha': 0.0,
      }, 
      is_loaded: false
    };

    this.openNav = this.openNav.bind(this);
    this.closeNav = this.closeNav.bind(this);
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

 	render() {	
    const option1 = {
      theme: "dark2",
      animationEnabled: true,	
      zoomEnabled: true,
      title: {
        text: 'score'
      },
      axisY: {
        // suffix: "%"
      },
      axisX: {
        // prefix: "W",
        // interval: 2
      },
      toolTip: {
        shared: true
      },
      data: item_list['score']
    };

    const option2 = {
      theme: "dark2",
      animationEnabled: true,	
      zoomEnabled: true,
      title: {text: 'p_loss'},
      toolTip: {shared: true},
      data: item_list['p_loss']
    };

    const option3 = {
      theme: "dark2",
      animationEnabled: true,	
      zoomEnabled: true,
      title: {text: 'q_loss'},
      toolTip: {shared: true},
      data: item_list['q_loss']
    };

    const option4 = {
      theme: "dark2",
      animationEnabled: true,	
      zoomEnabled: true,
      title: {text: 'entropy'},
      toolTip: {shared: true},
      data: item_list['entropy']
    };

    
    return (
      <div>
        <div id="mySidenav" className="sidenav">
          <span className="closebtn" onClick={this.closeNav}>&times;</span>
          <ul className="list-group">
            <li className="list-group-item active" aria-current="true"> Hyper-Parameter </li>
            <li className="list-group-item">discount factor: {this.state.agent_args['discount_factor']}</li>
            <li className="list-group-item">hidden1: {this.state.agent_args['hidden1']}</li>
            <li className="list-group-item">hidden2: {this.state.agent_args['hidden2']}</li>
            <li className="list-group-item">activ_function: {this.state.agent_args['activ_function']}</li>
            <li className="list-group-item">Q learing rate: {this.state.agent_args['q_lr']}</li>
            <li className="list-group-item">policy learing rate: {this.state.agent_args['p_lr']}</li>
            <li className="list-group-item">alpha: {this.state.agent_args['alpha']}</li>
          </ul>
        </div>

        <div id="main">
          <nav className="alert alert-primary" aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="/">Home</a></li>
              <li className="breadcrumb-item active" aria-current="page"><a href="/runs">Runs</a></li>
              <li className="breadcrumb-item active" aria-current="page"><a href="#">{this.name}</a></li>
            </ol>
          </nav>

          <span onClick={this.openNav}>&#9776; settings</span>

          {/* <div className="container-fluid"> */}
          <div className="container">
            <div className="row">
              <div className="col">
                <CanvasJSChart options={option1} 
                  onRef={ref => this.chart1 = ref}
                />
              </div>
              <div className="col">
                <CanvasJSChart options = {option2} 
                  onRef={ref => this.chart2 = ref}
                />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <CanvasJSChart options = {option3} 
                  onRef={ref => this.chart3 = ref}
                />
              </div>
              <div className="col">
                <CanvasJSChart options = {option4} 
                  onRef={ref => this.chart4 = ref}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
 		);
	}
	
	componentDidMount(){
    var url = '/api/score?name=' + this.name;
    var parsed_data_list = [];
    axios.get(url).then(res=>{
      res.data.forEach(raw_data => {
        var parsed_data = [];
        raw_data.forEach(element => {
          parsed_data.push({
            'x':element['step'], 
            'y':element['value'], 
            'rounded':element['value'].toPrecision(3),
          });
        });
        parsed_data_list.push(parsed_data);
      });
      parsed_data_list.forEach((parsed_data, index) => {
        item_list['score'].push({
          type: "line",
          name: (index+1).toString(),
          showInLegend: true,
          // color: "red",
          // toolTipContent: "<div>run: {name}</div><div>step: {x}</div><div>score: {rounded}</div>",
          dataPoints: parsed_data,
        });
      });
      this.chart1.render();
    }).catch(err=>{
      console.log('axios fail!');
    });

    url = '/api/p_loss?name=' + this.name;
    parsed_data_list = [];
    axios.get(url).then(res=>{
      res.data.forEach(raw_data => {
        var parsed_data = [];
        raw_data.forEach(element => {
          parsed_data.push({
            'x':element['step'], 
            'y':element['value'], 
            'rounded':element['value'].toPrecision(3),
          });
        });
        parsed_data_list.push(parsed_data);
      });
      parsed_data_list.forEach((parsed_data, index) => {
        item_list['p_loss'].push({
          type: "line",
          name: (index+1).toString(),
          showInLegend: true,
          dataPoints: parsed_data,
        });
      });
      this.chart2.render();
    }).catch(err=>{
      console.log('axios fail!');
    });

    url = '/api/q_loss?name=' + this.name;
    parsed_data_list = [];
    axios.get(url).then(res=>{
      res.data.forEach(raw_data => {
        var parsed_data = [];
        raw_data.forEach(element => {
          parsed_data.push({
            'x':element['step'], 
            'y':element['value'], 
            'rounded':element['value'].toPrecision(3),
          });
        });
        parsed_data_list.push(parsed_data);
      });
      parsed_data_list.forEach((parsed_data, index) => {
        item_list['q_loss'].push({
          type: "line",
          name: (index+1).toString(),
          showInLegend: true,
          dataPoints: parsed_data,
        });
      });
      this.chart3.render();
    }).catch(err=>{
      console.log('axios fail!');
    });

    url = '/api/entropy?name=' + this.name;
    parsed_data_list = [];
    axios.get(url).then(res=>{
      res.data.forEach(raw_data => {
        var parsed_data = [];
        raw_data.forEach(element => {
          parsed_data.push({
            'x':element['step'], 
            'y':element['value'], 
            'rounded':element['value'].toPrecision(3),
          });
        });
        parsed_data_list.push(parsed_data);
      });
      parsed_data_list.forEach((parsed_data, index) => {
        item_list['entropy'].push({
          type: "line",
          name: (index+1).toString(),
          showInLegend: true,
          dataPoints: parsed_data,
        });
      });
      this.chart4.render();
    }).catch(err=>{
      console.log('axios fail!');
    });

    url = '/api/agent_args?name=' + this.name;
    axios.get(url).then(res=>{
      this.setState(current => ({agent_args:res.data[0], is_loaded:true}));
    }).catch(err=>{
      console.log('axios fail!');
    });    
	}
}
 
export default Runs;