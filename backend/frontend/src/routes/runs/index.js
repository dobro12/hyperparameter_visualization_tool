import React from "react";
import {Component} from "react";
import axios from "axios";
import "./index.css";

import CanvasJSReact from '../../lib/canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

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

class Runs extends Component {
  constructor(props) {
    // set parameter
    super(props);
    this.name = props.match.params.name;
    this.task = this.name.split('_')[0];
    this.algo = this.name.split('_')[1];
    this.version_param = this.name.split('_')[2];
    this.param_value = this.name.split('_')[3];
    this.version_name = this.name.split('_').slice(0,3).join('_');

    // bind function
    this.openNav = this.openNav.bind(this);
    this.closeNav = this.closeNav.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this._onCrosshairUpdated = this._onCrosshairUpdated.bind(this);
    this._onCrosshairHidden = this._onCrosshairHidden.bind(this);
    this._onToolTipUpdated = this._onToolTipUpdated.bind(this);
    this._onToolTipHidden = this._onToolTipHidden.bind(this);
    this._rangeChanged = this._rangeChanged.bind(this);

    // set reference
    this.chart_list = [];
    for(let i=0;i<item_list.length;i++){
      this.chart_list.push(React.createRef());
    }
    this.navi_button = React.createRef();

    // set options
    this.default_options = {};
    for(let i=0;i<item_list.length;i++){
      let key = item_list[i];
      this.default_options[key] = {
        theme: "dark2",
        animationEnabled: false,	
        zoomEnabled: true,
        interactivityEnabled: false,
        zoomType: "x",
        axisX:{
          crosshair:{
            enabled: false,
            snapToDataPoint: true,
            updated: this._onCrosshairUpdated,
            hidden: this._onCrosshairHidden,
          }
        },
        title: {text: key},
        toolTip: {
          shared: true,
          updated: this._onToolTipUpdated,
          hidden: this._onToolTipHidden,
        },
        data: [],
        rangeChanged: this._rangeChanged,  
      };
    }

    // set state
    this.state = {
      agent_args: default_agent_args,
      options: this.default_options,
    };
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
            {
              Object.entries(default_agent_args).map((d, i)=>{
                let key =d[0];
                return <li className="list-group-item" key={`li_${i}`}>{key}: {this.state.agent_args[key]}</li>;
              })
            }
          </ul>
        </div>

        <div id="main">
          <nav className="alert alert-primary" aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="/">Home</a></li>
              {/* <li className="breadcrumb-item active" aria-current="page"><a href="/versions">Versions</a></li> */}
              <li className="breadcrumb-item active" aria-current="page"><a href={`/versions/${this.version_name}`}>{this.version_name}</a></li>
              <li className="breadcrumb-item active" aria-current="page"><a href="#">{this.param_value}</a></li>
            </ol>
          </nav>

          <span className="dobro_span" ref={this.navi_button} onClick={this.openNav}>&#9776; params</span>

          <div className="container">
            {item_list.map((d, i)=>{
              if(i%2 === 0){
                const tags = [];
                const repeats = i+2<=item_list.length ? i+2:i+1;
                for(let j=i;j<repeats;j++){
                  let key = item_list[j];
                  tags.push((
                    <div className="col" key={`col_${j}`}>
                      <CanvasJSChart options={this.state.options[key]} onRef={ref=>this.chart_list[j]=ref} />
                    </div>
                  ));
                }
                return (
                  <div className="row" key={`row_${i}`}>
                    {tags}
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
 		);
	}

  fetchData(res){
    const data_list = [];
    res.data.forEach((raw_data, index) => {
      const parsed_data = raw_data.map((element, i) => {
        return {
          'x':element['step'], 
          'y':element['value'], 
          'rounded':element['value'].toPrecision(3),
        };
      });
      data_list.push({
        type: "line",
        name: `run ${index+1}`,
        showInLegend: true,
        dataPoints: parsed_data,
        xValueFormatString: "steps: #",
        yValueFormatString: "#.##",
      });
    });
    return data_list;
  }

	componentDidMount(){
    this.navi_button.current.click();

    let url = '/api/run/agent_args?name=' + this.name;
    axios.get(url).then(res=>{
      this.setState(current => ({
        agent_args:res.data[0], 
        options:current.options, 
      }));
    }).catch(err=>{
      console.log('axios fail!', err);
    });

    for(let i=0;i<item_list.length;i++){
      let item = item_list[i];
      url = `/api/run/${item}?name=` + this.name;  
      axios.get(url).then(res=>{
        this.setState(current => {
          const option = {};
          Object.assign(option, current.options[item]);
          option.data = this.fetchData(res);
          option.interactivityEnabled = true;
          option.axisX.crosshair.enabled = true;
          current.options[item] = option;
          return {
            agent_args:current.agent_args, 
            options:current.options, 
          };
        });
      }).catch(err=>{
        console.log('axios fail!', err);
      });
    }
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

}
 
export default Runs;