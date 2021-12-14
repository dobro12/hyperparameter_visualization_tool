import LinePlot from "../../components/line_plot";
import React from "react";
import "./index.css";

import scores1 from "../../data/HalfCheetah_SAC_0_0.0001/score.json";
import scores2 from "../../data/HalfCheetah_SAC_1_0.0001/score.json";
import scores3 from "../../data/HalfCheetah_SAC_2_0.0001/score.json";

import q_loss1 from "../../data/HalfCheetah_SAC_0_0.0001/q_loss.json";
import q_loss2 from "../../data/HalfCheetah_SAC_1_0.0001/q_loss.json";
import q_loss3 from "../../data/HalfCheetah_SAC_2_0.0001/q_loss.json";

import p_loss1 from "../../data/HalfCheetah_SAC_0_0.0001/p_loss.json";
import p_loss2 from "../../data/HalfCheetah_SAC_1_0.0001/p_loss.json";
import p_loss3 from "../../data/HalfCheetah_SAC_2_0.0001/p_loss.json";

import entropy1 from "../../data/HalfCheetah_SAC_0_0.0001/entropy.json";
import entropy2 from "../../data/HalfCheetah_SAC_1_0.0001/entropy.json";
import entropy3 from "../../data/HalfCheetah_SAC_2_0.0001/entropy.json";

import agent_args from "../../data/HalfCheetah_SAC_2_0.0001/agent_args.json";

function Runs() {

  const width = 400;
  const height = 250;
  const margin = 50;

  return (
    <div className="Runs">
      <nav aria-label="breadcrumb" style={{'backgroundColor':'white', 'fontSize': 'xx-large'}}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">Project</li>
        </ol>
      </nav>

      <div class="card" style={{"width": "18rem", "margin":"1em"}}>
        <div class="card-header">
          Hyper-Parameter
        </div>
        <ul class="list-group list-group-flush">
        <li class="list-group-item">discount factor: {agent_args['discount_factor']}</li>
        <li class="list-group-item">hidden1: {agent_args['hidden1']}</li>
        <li class="list-group-item">hidden2: {agent_args['hidden2']}</li>
        <li class="list-group-item">activ_function: {agent_args['activ_function']}</li>
        <li class="list-group-item">Q learing rate: {agent_args['q_lr']}</li>
        <li class="list-group-item">policy learing rate: {agent_args['p_lr']}</li>
        <li class="list-group-item">alpha: {agent_args['alpha']}</li>
        </ul>
      </div>

      <div>
        <div className="row align-items-start" style={{float: 'left', margin:'0.5em'}} >
          <div className="col">
            <LinePlot
              width={width}
              height={height}
              margin={margin}
              data={[scores1, scores2, scores3]}
              name={"score"}
            />
          </div>

          <div className="col">
            <LinePlot
              width={width}
              height={height}
              margin={margin}
              data={[q_loss1, q_loss2, q_loss3]}
              name={"q_loss"}
            />
          </div>

          <div className="col">
            <LinePlot
              width={width}
              height={height}
              margin={margin}
              data={[p_loss1, p_loss2, p_loss3]}
              name={"p_loss"}
            />
          </div>

          <div className="col">
            <LinePlot
              width={width}
              height={height}
              margin={margin}
              data={[entropy1, entropy2, entropy3]}
              name={"entropy"}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Runs;
