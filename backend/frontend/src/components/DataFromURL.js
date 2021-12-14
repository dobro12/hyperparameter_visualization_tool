import React, { useState, useRef, useEffect, Component } from "react";
import * as d3 from "d3";
import "./App.css";
import axios from 'axios';

const DataURL = (props) => {
    console.log("d-f-u");
    var data_url = [];
    
    const url = "/api/timelines?name=";
    const task_algo = props.TaskAlgo;
    console.log(task_algo);
    
    useEffect(() => {
        axios.get(url+task_algo).then(res=>{
            console.log(res.data);
            for(let i=0; i<res.data.length; i++){
                var curr_data = res.data[i];
                data_url.push(curr_data);
            }
            
            console.log("start");
            const data = data_processing(data_url, task_algo);
            console.log("end");
            console.log(data);
            props.DataLoad(data);
            
        }).catch(err=>{
            console.log('axios fail!');
            props.DataLoad([]);
        });
        
    }, [props.TaskAlgo]);
    
        console.log("end");
    
    
    
    function data_processing(data, task_algo){
      const num_data = data.length;
      
      const url_version = "http://147.46.123.77:3000/versions/"+task_algo //"/versions/"+task_algo;
      for(let i=0; i<num_data; i++){
        let a = data[i]["name"];
        data[i]["click"] = () => {window.location.href=url_version+"_"+a;};
        console.log(url_version+"_"+data[i]["name"]);
      }
      
      for(let i=0; i<num_data; i++){
        // fix error
        if (data[i]["name"] === "v1-qlr") data[i]["name"] = "v1-q-lr";
        if (data[i]["parent"] === "v1-qlr") data[i]["parent"] = "v1-q-lr";
        
        data[i]["score"] = Math.round(data[i]["score"]*10.0)/10.0;
        data[i]["p_loss"] = Math.round(data[i]["p_loss"]*100.0)/100.0;
        data[i]["q_loss"] = Math.round(data[i]["q_loss"]*100.0)/100.0;
        data[i]["entropy"] = Math.round(data[i]["entropy"]*1000.0)/1000.0;
        
        let modified_hyper = '';
        let modified_name = data[i]["name"].split("-");
        for (let j=1; j<modified_name.length; j++){
            if (j>1) modified_hyper += "-";
            modified_hyper += modified_name[j];
        }
        //console.log(modified_hyper);
        if (modified_hyper === "q-lr") modified_hyper = "LR-Q";
        if (modified_hyper === "p-lr") modified_hyper = "LR-A";
        if (modified_hyper === "batch-size") modified_hyper = "BS";
        if (modified_hyper === "discount-factor") modified_hyper = "DF";
        if (modified_hyper === "alpha") modified_hyper = "EC";
        if (modified_hyper === "hidden1") modified_hyper = "NN";
        if (modified_hyper === "activ-function") modified_hyper = "AF";
        data[i]["hyperparameter"] = modified_hyper;
      }
      
      //let processed_data = [];
      for(let i=0; i<num_data; i++){
        data[i]["x"] = -1;
        data[i]["y"] = 0;
        data[i]["parents"] = -1;
        data[i]["children"] = [];
      }
      
      let curr_depth_list = [], curr_depth = 1;
      for(let i=0; i<num_data; i++){
        if (data[i]["parent"] === "none") {
            curr_depth_list.push(i);
            data[i]["x"] = curr_depth;
        }
      }
      
      var leaf_y = 0;
      
      while (curr_depth_list.length !== 0) {
        let next_depth_list = [];
        curr_depth += 1;
        
        for(let i=0; i<curr_depth_list.length; i++){
            var curr_name = data[curr_depth_list[i]]["name"];
            var n_child = 0;
            
            for(let j=0; j<num_data; j++){
                if (data[j]["parent"] === curr_name) {
                    next_depth_list.push(j);
                    n_child += 1
                    data[j]["x"] = curr_depth;
                    data[j]["parents"] = curr_depth_list[i];
                    data[curr_depth_list[i]]["children"].push(j);
                }
            }
            if (n_child === 0) {
                leaf_y += 100;
                data[curr_depth_list[i]]["y"] = leaf_y;
            }
        }
        curr_depth_list = next_depth_list;
      }
      
      
      while (true) {
        var end_loop = true;
        for(let i=0; i<num_data; i++){
            if (data[i]["y"] === 0) {
                
                let curr_child = data[i]["children"];
                if (curr_child.length === 0) {
                    leaf_y += 100;
                    data[i]["y"] = leaf_y
                }
                else {
                    var all_child = true;
                    var y_sum = 0;
                    for (let j=0; j<curr_child.length; j++){
                        y_sum += data[curr_child[j]]["y"]
                        if (data[curr_child[j]]["y"] === 0) all_child = false;
                    }
                    
                    if (all_child) {
                        data[i]["y"] = y_sum/curr_child.length;
                    }
                }
                end_loop = false;
            }
            
        }
        
        if (end_loop) break;
      }
      
      return data;
    }
       
  
    return (
      <div>
      </div>
    );
}


export default React.memo(DataURL);
