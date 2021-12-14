import Mainplot from "./components/main_plot";
import React from "react";
import "./opt_graph.css";

import opt_data from './data/data.json';
import gp_data from "./data/gp.json";

// import q_lr1 from "./data/q-lr_0.001.json";
// import q_lr2 from "./data/q-lr_0.0003.json";
// import q_lr3 from "./data/q-lr_0.0001.json";
// import q_lr4 from "./data/q-lr_3e-05.json";
// import q_lr5 from "./data/q-lr_1e-05.json";

function OptGraph() {

  const width = 600;
  const height = 400;
  const margin = 50;

  // const data = [
  //   [0.001, q_lr1['mean'], q_lr1['std']],
  //   [0.0003, q_lr2['mean'], q_lr2['std']],
  //   [0.0001, q_lr3['mean'], q_lr3['std']],
  //   [0.00003, q_lr4['mean'], q_lr4['std']],
  //   [0.00001, q_lr5['mean'], q_lr5['std']],
  // ]

  return (
    <div className="OptGraph">
      <nav aria-label="breadcrumb" style={{ 'backgroundColor': 'white', 'fontSize': 'xx-large' }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">Project</li>
        </ol>
      </nav>

      <div class="card" style={{ "width": "18rem", "margin": "1em" }}>
        <h5 class="card-title" style={{ 'fontSize': "2em" }}>Version 1</h5>
        <h6 class="card-subtitle mb-2 text-muted" style={{ 'fontSize': "1.5em" }}>Q learning rate</h6>
      </div>

      <div style={{ width: "800px", margin: "0 auto" }}>
        <Mainplot
          width={width}
          height={height}
          margin={margin}
          data={opt_data}
          gp_data={gp_data}
        />
      </div>

      <div class="slidecontainer">
        <h2> UCB </h2>
        <input type="range" min="1" max="100" value="50" class="slider" id="myRange"/>
      </div>
    </div>
  );
}

export default OptGraph;
