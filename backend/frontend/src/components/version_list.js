import React, {Component} from "react";
import axios from "axios";


class VersionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: [],
    };
  }

  componentDidMount(){
    const url = "/api/version_list";
    var total_items = [];
    axios.get(url).then(res=>{
      console.log(res.data);
      for (const [task_algo, version_list] of Object.entries(res.data)) {
        var items = [];
        console.log(task_algo, version_list);
        version_list.forEach((element, index) => {
          console.log(`${task_algo}_${index}`);
          items.push(
            <div className="row" key={`${task_algo}_${index}`}>
              <div className="col-6 offset-1">
                <a href={`/versions/${task_algo}_${element}`}>{`• ${element}`}</a>
              </div>
            </div>
          );            
        });
        console.log(items);
        total_items.push(
          <div key={task_algo}>
            <div className="row">
              <div className="col-6">
                {`• ${task_algo}`}
              </div>
            </div>
            {items}
          </div>
        );
      }
      this.setState({item:total_items});
    }).catch(err=>{
      console.log('axios fail!');
    });    
  }

  render() {
    return (
      <div className="container-fluid">  
      <div id="main">
          {this.state.item}
        </div>
      </div>
    );
  }
      
}

export default VersionList;
