import React, { useState } from "react";
import TimeTable from "./TimeTable";
import SideSelectBar from "./SideSelect";
import SideLegend from "./SideLegend";
import DataURL from "./DataFromURL";
import "./App.css";
import axios from 'axios';


function App() {

  // const team = "Team8 :D";
  
  const [curr_task, set_task] = useState("HalfCheetah");
  const [curr_algo, set_algo] = useState("SAC");
  const [task_algo, set_taskalgo] = useState("HalfCheetah_SAC");
  
  const change_task = (text) => { set_task(text); change_taskalgo(text+"_"+curr_algo); }
  const change_algo = (text) => { set_algo(text); change_taskalgo(curr_task+"_"+text); }
  const change_taskalgo = (text) => { set_taskalgo(text); }
  
  
  const [results, set_data] = useState([]);
  const change_data = (data) => { set_data(data); console.log("c-d");}
  
  const [curr_measurement, set_measurement] = useState("");
  const get_measurement = (text) => {
      set_measurement(text);
  }
  
  return (
    <div className="App" style={{margin:"1em"}}>
        <nav className="alert alert-primary" aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="/">Home</a></li>
            </ol>
        </nav>
      <div class="container">
          <div class="row">
              <div class="col-3 align-self-center">
                <SideLegend Algo={curr_algo}
                />
		        <SideSelectBar MeasureFunc={get_measurement} ChangeTask={change_task} ChangeAlgo={change_algo}
		        />
              </div>
              <div class="col-9 align-self-center">
                <TimeTable Measurement={curr_measurement} Results={results} Algo={curr_algo} Task={curr_task}
                />
              </div>
              <div>
                <DataURL DataLoad={change_data} TaskAlgo={task_algo}
                />
              </div>
          </div>
      </div>  
    </div>
  );
}

export default App;
