import React from "react";
import {Component} from "react";
import axios from "axios";
import "./index.css";

import CanvasJSReact from '../../lib/canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
// var CanvasJS = CanvasJSReact.CanvasJS;

const item_list = ['score', 'p_loss', 'q_loss', 'entropy'];

class Runs extends Component {
  constructor(props) {
    super(props);
    this.name = props.match.params.name;
    this.task = this.name.split('_')[0];
    this.algo = this.name.split('_')[1];
    this.version_param = this.name.split('_')[2];
    this.param_value = this.name.split('_')[3];
    this.version_name = this.name.split('_').slice(0,3).join('_');

    this.state = {
      agent_args: {
        'discount_factor': 0.0,
        'hidden1': 0,
        'hidden2': 0,
        'activ_function': '',
        'q_lr': 0.0,
        'p_lr': 0.0,
        'alpha': 0.0,
      },
      options: {
        'score': {theme: "dark2", title: {text: 'score'}},
        'p_loss': {theme: "dark2", title: {text: 'p_loss'}},
        'q_loss': {theme: "dark2", title: {text: 'q_loss'}},
        'entropy': {theme: "dark2", title: {text: 'entropy'}},
      },
      charts: {
      },
      is_loaded: false
    };

    this.openNav = this.openNav.bind(this);
    this.closeNav = this.closeNav.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.draw = this.draw.bind(this);

    this._rangeChanged = this._rangeChanged.bind(this);
    this._onToolTipUpdated = this._onToolTipUpdated(this);
    this._onToolTipHidden = this._onToolTipHidden(this);
    this._onCrosshairUpdated = this._onCrosshairUpdated(this);
    this._onCrosshairHidden = this._onCrosshairHidden(this);

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
              <li className="breadcrumb-item active" aria-current="page"><a href="/versions">Versions</a></li>
              <li className="breadcrumb-item active" aria-current="page"><a href={`/versions/${this.version_name}`}>{this.version_name}</a></li>
              <li className="breadcrumb-item active" aria-current="page"><a href="#">{this.param_value}</a></li>
            </ol>
          </nav>

          <span onClick={this.openNav}>&#9776; params</span>

          {/* <div className="container-fluid"> */}
          <div className="container">
            <div className="row">
              <div className="col">
                <CanvasJSChart options={this.state.options['score']} 
                  onRef={ref => this.setState(current => {
                    var charts = current.charts;
                    charts['score'] = ref;
                    return {
                      agent_args:current.agent_args, 
                      options:current.options, 
                      charts:charts, 
                      is_loaded:current.is_loaded
                    }}
                  )} 
                />
              </div>
              <div className="col">
                <CanvasJSChart options={this.state.options['p_loss']} 
                  onRef={ref => this.setState(current => {
                    var charts = current.charts;
                    charts['p_loss'] = ref;
                    return {
                      agent_args:current.agent_args, 
                      options:current.options, 
                      charts:charts, 
                      is_loaded:current.is_loaded
                    }}
                  )} 
                />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <CanvasJSChart options={this.state.options['q_loss']} 
                  onRef={ref => this.setState(current => {
                    var charts = current.charts;
                    charts['q_loss'] = ref;
                    return {
                      agent_args:current.agent_args, 
                      options:current.options, 
                      charts:charts, 
                      is_loaded:current.is_loaded
                    }}
                  )} 
                />

              </div>
              <div className="col">
                <CanvasJSChart options={this.state.options['entropy']} 
                  onRef={ref => this.setState(current => {
                    var charts = current.charts;
                    charts['entropy'] = ref;
                    return {
                      agent_args:current.agent_args, 
                      options:current.options, 
                      charts:charts, 
                      is_loaded:current.is_loaded
                    }}
                  )} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
 		);
	}
	
  _rangeChanged(e){
    for (var key of Object.keys(this.state.charts)) {
      var chart = this.state.charts[key];
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
    }
  }

  _onToolTipUpdated(e){
    for (var key of Object.keys(this.state.charts)) {
      var chart = this.state.charts[key];
      if (chart !== e.chart){
        chart.toolTip.showAtX(e.entries[0].xValue);
        chart.render();
      }
    }
  }
  _onToolTipHidden(e){
    for (var key of Object.keys(this.state.charts)) {
      var chart = this.state.charts[key];
      if (chart !== e.chart){
        chart.toolTip.toolTip.hide();
        chart.render();
      }
    }
  }
  _onCrosshairUpdated(e){
    console.log('!!!!!');
    for (var key of Object.keys(this.state.charts)) {
      var chart = this.state.charts[key];
      if (!chart.options.axisX) 
        chart.options.axisX = {};      
      if (chart !== e.chart){
        chart.axisX[0].crosshair.showAt(e.value);
        chart.render();
      }
    }
  }
  _onCrosshairHidden(e){
    for (var key of Object.keys(this.state.charts)) {
      var chart = this.state.charts[key];
      if (!chart.options.axisX) 
        chart.options.axisX = {};      
      if (chart !== e.chart){
        chart.toolTip.axisX[0].crosshair.hide();
        chart.render();
      }
    }
  }

  fetchData(res, item){
    var data_list = [];
    res.data.forEach((raw_data, index) => {
      var parsed_data = [];
      raw_data.forEach(element => {
        parsed_data.push({
          'x':element['step'], 
          'y':element['value'], 
          'rounded':element['value'].toPrecision(3),
        });
      });
      data_list.push({
        type: "line",
        name: (index+1).toString(),
        showInLegend: true,
        dataPoints: parsed_data,
      });
    });

    var option = {
      theme: "dark2",
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
      title: {text: item},
      toolTip: {
        shared: true,
        updated: this._onToolTipUpdated,
        hidden: this._onToolTipHidden,
      },
      data: data_list,
      rangeChanged: this._rangeChanged,
    };
    return option;
  }

  draw(i=0){
    if(i===item_list.length) return;
    var item = item_list[i];
    var url = `/api/run/${item}?name=` + this.name;

    axios.get(url).then(res=>{
      this.setState(current => {
        var options = current.options;
        options[item] = this.fetchData(res, item);
        return {agent_args:current.agent_args, options:options, charts:current.charts, is_loaded:current.is_loaded};
      });
      this.draw(i+1);
      return;
    }).catch(err=>{
      console.log('axios fail!');
      return;
    });
  }

	componentDidMount(){
    var url = '/api/run/agent_args?name=' + this.name;
    axios.get(url).then(res=>{
      this.setState(current => ({agent_args:res.data[0], options:current.options, charts:current.charts, is_loaded:true}));
      this.draw();
    }).catch(err=>{
      console.log('axios fail!');
    });      
  }

}
 
export default Runs;