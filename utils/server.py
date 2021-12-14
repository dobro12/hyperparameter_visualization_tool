import requests
import pickle
import glob
import json
import sys
import os

SERVER_URL = "http://localhost:3000/api/upload"

class Server:
    def __init__(self, parent, param, args):
        assert param in args.keys()
        self.parent_version_name = parent
        self.param_value = args[param]
        self.nominal_version_name = param.replace('_', '-')
        self.url = SERVER_URL
        self.agent_args = args
        a = args['save_name'].split('_')
        b = '_'.join([*a[:2], self.nominal_version_name, f"{self.param_value}", a[-1]])
        args['save_name'] = b

    def upload(self):
        save_dir = self.agent_args['save_name']
        dir_list = glob.glob(f'{save_dir}/*_log')
        task_algo = '_'.join(save_dir.replace('result/', '').split('_')[:2])
        algo_idx = save_dir.replace('result/', '').split('_')[-1]

        file_dict = {}
        for dir_name in dir_list:
            parent_dir_name = os.path.dirname(dir_name)
            save_file_name = os.path.basename(dir_name).replace('_log', '')

            file_name_list = glob.glob(f"{dir_name}/*")
            data = []
            for file_name in file_name_list:
                with open(file_name, "rb") as f:
                    data += pickle.load(f)

            new_data = []
            steps = 0 if 'score' in save_file_name else 1
            for item in data:
                steps += item[0]
                new_data.append({'step':steps, 'value':float(item[1])})
            file_dict[save_file_name] = new_data

        file_name = f'{save_dir}/agent_args.json'
        with open(file_name, "r") as f:
            file_dict['agent_args'] = json.load(f)

        res = requests.post(self.url, data={
            'task_algo':task_algo, 
            'file':json.dumps(file_dict), 
            'parent':self.parent_version_name, 
            'name':self.nominal_version_name, 
            'param':self.param_value,
            'index':algo_idx,
        })
        print(res.text)
