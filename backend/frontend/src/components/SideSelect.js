import React, { useRef, useEffect} from "react";
import Select from 'react-select';
import * as d3 from "d3";
import "./App.css";


const task_options = [
  { value: 'HalfCheetah', label: 'HalfCheetah' },
  { value: 'Hopper', label: 'Hopper' },
  { value: 'Ant', label: 'Ant' },
  { value: 'Humanoid', label: 'Humanoid' },
];

const algorithm_options = [
  { value: 'SAC', label: 'SAC' },
  { value: 'DDPG', label: 'DDPG' },
  { value: 'TD3', label: 'TD3' },
  { value: 'TRPO', label: 'TRPO' },
  { value: 'CQL', label: 'CQL' },
];

const measurement_options = [
  { value: '', label: '-' },
  { value: 'score', label: 'SCORE' },
  { value: 'q_loss', label: 'CRITIC-LOSS' },
  { value: 'p_loss', label: 'POLICY-LOSS' },
  { value: 'entropy', label: 'ENTROPY' },
];



const customStyles = {
    menu: (provided, state) => ({
        ...provided,
        //width: 200,
        //margin: '50px',
        color: 'blue',
    }),
    
    control: (provided, width) => ({
        ...provided,
        //width: 200,
    }),
    
    singleValue: (provided, state) => {
        const opacity = state.isDisabled ? 0.5 : 1;
        const transition = 'opacity 300ms';

        return { ...provided, opacity, transition };
    }
    
};


class SideSelectBar extends React.Component {
  stateTask = {
    selectedOption: null,
  };
  stateAlgo = {
    selectedOption: null,
  };
  stateMeasurement = {
    selectedOption: null,
  };
  
  
  TaskChange = (selectedOption) => {
    this.setState({ selectedOption });
    this.stateTask.selectedOption = selectedOption.value;
    this.props.ChangeTask(selectedOption.value);
  };
  
  AlgoChange = (selectedOption) => {
    this.setState({ selectedOption });
    this.stateAlgo.selectedOption = selectedOption.value;
    this.props.ChangeAlgo(selectedOption.value);
  };
  
  MeasurementChange = (selectedOption) => {
    this.setState({ selectedOption });
    this.stateMeasurement.selectedOption = selectedOption.value;
    this.props.MeasureFunc(selectedOption.value);
  };
  
  render() {
    const { selectedTask } = this.stateTask;
    const { selectedAlgo } = this.stateAlgo;
    const { selectedMeasurement } = this.stateMeasurement;

    return (
      <div>
          <div className="sidebar">
            TASK
          </div>
          <Select
              styles={customStyles}
              value={selectedTask}
              onChange={this.TaskChange}
              options={task_options}
              defaultValue={task_options[0]}
          />
          <div className="sidebar">
            ALGORITHM
          </div>
          <Select
              styles={customStyles}
              value={selectedAlgo}
              onChange={this.AlgoChange}
              options={algorithm_options}
              defaultValue={algorithm_options[0]}
          />
          <div className="sidebar">
            PERFORMANCE
          </div>
          <Select
              styles={customStyles}
              value={selectedMeasurement}
              onChange={this.MeasurementChange}
              options={measurement_options}
              defaultValue={measurement_options[0]}
          />
      </div>

    );
  }
}

export default SideSelectBar;
