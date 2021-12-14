var bodyParser = require('body-parser');
var express    = require('express');
var fs         = require('fs');
const { exec } = require("child_process");

var app = express();
const port = 4000;
app.set('port', port);
app.use(bodyParser.json({limit:"10MB"})); 
app.use(bodyParser.urlencoded({limit:"10MB", extended:true}));

const getParentChild = (data, result={}, depth=0) => {
  for (const [parent, children] of Object.entries(data)) {
    for (const child of Object.keys(children)) {
      result[child] = parent;
    }
    var child_result = getParentChild(children, result, depth+1);
    result = Object.assign({}, result, child_result);
  }
  return result;
}

const findParent = (parent_name, data, depth=0) => {
  for (const [key, value] of Object.entries(data)) {
    if(key.includes(parent_name))return value;
    var parent_value = findParent(parent_name, value, depth+1);
    if(parent_value !== null) return parent_value;
  }
  return null;
};  

const findChild = (child_name, data) => {
  for (const [key, value] of Object.entries(data)) {
    if(key.includes(child_name)) return key;
  }
  return '';
};

const getMean = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

const getStd = array => {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

app.get('/api/run/*', function(req, res){
  var item = req.params[0];
  var name = req.query.name;
  var info_list = name.split('_');
  var task = info_list[0];
  var algo = info_list[1];
  var version = info_list[2];
  var hyperparam = info_list[3];

  var data_list = [];
  var data_dir = './data/' + task + '_' + algo + '/' + version;
  fs.readdirSync(data_dir).forEach(file => {
    var file_path = data_dir+'/'+file;
    if(fs.lstatSync(file_path).isDirectory() && file.split('_')[3] === hyperparam){
      var rawdata = fs.readFileSync(file_path + '/' + item +'.json', 'utf8');
      var data = JSON.parse(rawdata);
      data_list.push(data);
    }
  });

  res.json(data_list);
});

app.get('/api/version', function(req, res){
  var name = req.query.name;
  var info_list = name.split('_');
  var task = info_list[0];
  var algo = info_list[1];
  var version = info_list[2];

  var file_path = `./data/${task}_${algo}/${version}`;
  var rawdata = fs.readFileSync(`${file_path}/data.json`, 'utf8');
  var data = JSON.parse(rawdata);
  res.json(data);
});

app.get('/api/version_list', function(req, res){
  console.log('/api/version_list');
  var data_dict = {};
  var data_dir = './data';
  fs.readdirSync(data_dir).forEach(file => {
    var file_path = data_dir+'/'+file;
    var file_list = [];
    if(fs.lstatSync(file_path).isDirectory()){
      fs.readdirSync(file_path).forEach(file2 => {
        var file_path2 = file_path+'/'+file2;
        if(fs.lstatSync(file_path2).isDirectory()){
          file_list.push(file2);
        }
      });
      data_dict[file] = file_list;
    }
  });
  res.json(data_dict);
});

app.post('/api/upload', (req, res, next) => {
  const task_algo = req.body.task_algo;
  const file_dict = JSON.parse(req.body.file);
  const nominal_version_name = req.body.name;
  const parent_name = req.body.parent;
  const param_value = req.body.param;
  const run_index = req.body.index;

  var version_name = '';
  var meta_data_name = `./data/${task_algo}/meta_data.json`;

  if(!fs.existsSync(meta_data_name)){
    var meta_data = {};
    version_name = `v1-${nominal_version_name}`;
    meta_data[parent_name] = {};
    meta_data[parent_name][version_name] = {};
    fs.writeFileSync(meta_data_name, JSON.stringify(meta_data));
    fs.mkdirSync(`./data/${task_algo}/${version_name}`);
  }else{
    var meta_data = JSON.parse(fs.readFileSync(meta_data_name));
    var parent_data = findParent(parent_name, meta_data);
    if(parent_data === null) parent_data = {};
    version_name = findChild(nominal_version_name, parent_data);
    console.log(parent_data);
    console.log(version_name);
    if(version_name === ''){
      var num_versions = fs.readdirSync(`./data/${task_algo}`).length;
      version_name = `v${num_versions}-${nominal_version_name}`;
      parent_data[version_name] = {};
      fs.writeFileSync(meta_data_name, JSON.stringify(meta_data));
      fs.mkdirSync(`./data/${task_algo}/${version_name}`);
    }
  }
  console.log(version_name);
  var dir_name = `${task_algo}_${version_name}_${param_value}_${run_index}`;
  var dir_path = `./data/${task_algo}/${version_name}/${dir_name}`;
  if(!fs.existsSync(dir_path)) fs.mkdirSync(dir_path);

  console.log(Object.keys(file_dict));
  for (const key of Object.keys(file_dict)) {
    const value = file_dict[key];
    const file_name = `${dir_path}/${key}.json`;
    fs.writeFileSync(file_name, JSON.stringify(value));
  }

  var python = "/home/dobro/dobrovenv/bin/python3";
  var scale = "log";
  var execution = `${python} processing.py ${task_algo}_${version_name} ${scale}`;
  exec(execution, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
  });

  res.send("received");
});

app.get('/api/timelines', function(req, res){
  console.log('/api/timelines');
  var task_algo = req.query.name;
  var version_list = [];

  var meta_data_name = `data/${task_algo}/meta_data.json`;
  var meta_data = JSON.parse(fs.readFileSync(meta_data_name));
  var parent_child_dict = getParentChild(meta_data);

  var data_dir = './data/' + task_algo;
  fs.readdirSync(data_dir).forEach(version_name => {
    var file_path = data_dir + '/' + version_name;
    if(fs.lstatSync(file_path).isDirectory()){
      // ======== file is version name. ======== //
      // get performance!
      const perform_file_name = file_path + '/data.json';
      const perform_json_data = JSON.parse(fs.readFileSync(perform_file_name));
      // score
      var score_data = perform_json_data['run_data'];
      var best_param = '';
      var best_value = -1e10;
      for (const [key, value] of Object.entries(score_data)) {
        var mean = getMean(value);
        if(mean > best_value){
          best_param = key;
          best_value = mean;
        }
      }
      // p_loss
      var p_loss_data = perform_json_data['run_data_p_loss'];
      var best_param2 = '';
      var best_value2 = 1e10;
      for (const [key, value] of Object.entries(p_loss_data)) {
        var mean = getMean(value);
        if(mean < best_value2){
          best_param2 = key;
          best_value2 = mean;
        }
      }
      // q_loss
      var q_loss_data = perform_json_data['run_data_q_loss'];
      var best_param3 = '';
      var best_value3 = 1e10;
      for (const [key, value] of Object.entries(q_loss_data)) {
        var mean = getMean(value);
        if(mean < best_value3){
          best_param3 = key;
          best_value3 = mean;
        }
      }
      // entropy
      var entropy_data = perform_json_data['run_data_entropy'];
      var best_param4 = '';
      var best_value4 = 1e10;
      for (const [key, value] of Object.entries(entropy_data)) {
        var mean = getMean(value);
        if(mean < best_value4){
          best_param4 = key;
          best_value4 = mean;
        }
      }

      var perform_data = {
        'score': best_value, 
        'p_loss':best_value2,
        'q_loss':best_value3,
        'entropy':best_value4,
      };

      // get agent args file!
      var agent_file_name = '';
      const dir_list = fs.readdirSync(file_path);
      for(var i=0;i<dir_list.length;i++){
        var file_path2 = file_path+'/'+dir_list[i];
        if(fs.lstatSync(file_path2).isDirectory() && file_path2.includes(best_param)){
          agent_file_name = file_path2 + '/agent_args.json';
          break;
        }
      }
      var agent_args = JSON.parse(fs.readFileSync(agent_file_name));
      delete agent_args['agent_name'];
      delete agent_args['save_name'];

      // parse version info!
      var version_info = Object.assign({}, perform_data, agent_args);
      version_info['parent'] = parent_child_dict[version_name];
      version_info['name'] = version_name;
      version_list.push(version_info);
      // ======================================= //
    }
  });
  res.json(version_list);
});

app.listen(port, () => {
	console.log('Express listening on port', port);
});
