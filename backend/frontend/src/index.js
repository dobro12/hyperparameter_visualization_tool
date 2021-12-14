import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import NotFound from './components/not_found';
import OptGraph from './routes/opt_graph';
import VersionList from './components/version_list';
import Runs from './routes/runs';
import App from './components/App';

function Index(){
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/versions/:name" component={OptGraph} />
        <Route path="/versions" component={VersionList} />
        <Route path="/runs/:name" component={Runs} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Router>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
