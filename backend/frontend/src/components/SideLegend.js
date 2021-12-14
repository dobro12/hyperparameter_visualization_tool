import React, { useState, useRef, useEffect, useCallback } from "react";
import MaterialTable from 'material-table';
import * as d3 from "d3";


const SAC_legend = [
    {
      hyperparemeter: "learning rate: critic network",
      notation: "LR-Q",
    },
    {
      hyperparemeter: "learning rate: actor network",
      notation: "LR-A",
    },
    {
      hyperparemeter: "batch size",
      notation: "BS",
    },
    {
      hyperparemeter: "discount factor",
      notation: "DF",
    },
    {
      hyperparemeter: "entropy coefficient",
      notation: "EC",
    },
    {
      hyperparemeter: "number of hidden layer nodes",
      notation: "NN",
    },
    {
      hyperparemeter: "activation function",
      notation: "AF",
    },
  ];
  
const DDPG_legend = [
    {
      hyperparemeter: "learning rate: critic network",
      notation: "LR-Q",
    },
    {
      hyperparemeter: "learning rate: actor network",
      notation: "LR-A",
    },
    {
      hyperparemeter: "batch size",
      notation: "BS",
    },
    {
      hyperparemeter: "discount factor",
      notation: "DF",
    },
    {
      hyperparemeter: "number of hidden layer nodes",
      notation: "NN",
    },
    {
      hyperparemeter: "activation function",
      notation: "AF",
    },
  ];
  
const columns = [
    {
      title: "hyperparemeter",
      field: "hyperparemeter",
      align: "center",
    },
    {
      title: "notation",
      field: "notation",
      align: "center",
    },
  ];

const SideLegend = (props) => {
    
    const algo = props.Algo;
    var data;
    if (algo === "SAC") data = SAC_legend;
    else if (algo === "DDPG") data = DDPG_legend;
    else data = DDPG_legend;
  
    return (
      <div>
            <MaterialTable
              data={data}
              columns={columns}
              options={{
                toolbar:false,
                paging:false,
                //maxBodyHeight:350,
                rowStyle: {
                    fontSize: 12.5,
                },
              }}
            />
      </div>
    );
}


export default React.memo(SideLegend);
