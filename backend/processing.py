from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import ConstantKernel
from sklearn.gaussian_process.kernels import RBF

import matplotlib.pyplot as plt
import numpy as np
import pickle
import glob
import json
import sys
import os

param_type_dict = {
    'qlr':'float', 
    'q-lr':'float', 
    'p-lr':'float', 
    'alpha':'float', 
    'activ-function':'str', 
    'batch-size':'int', 
    'hidden1':'int', 
    'hidden2':'int',
    'polyak':'float',
    'replay-size':'int',
    'discount-factor':'float',
}

task, algo, version = sys.argv[1].split('_')
scale = sys.argv[2] # 'log', 'linear'
assert scale in ['log', 'linear']

param_name = '-'.join(version.split('-')[1:])
task_algo = '_'.join([task, algo])
dir_list = glob.glob(f'./data/{task_algo}/{version}/*')

data_list = []
for dir_name in dir_list:
    if not os.path.isdir(dir_name):
        continue
    base_dir_name = os.path.basename(dir_name)
    param, run_idx = base_dir_name.split('_')[-2:]

    if param_type_dict[param_name] == 'float':
        param = float(param)
    elif param_type_dict[param_name] == 'int':
        param = int(param)

    file_name = f"{dir_name}/score.json"
    with open(file_name, "r") as f:
        data = json.load(f)
    data.sort(key=lambda x:x['step'])
    score = np.mean([x['value'] for x in data[-10:]])

    file_name = f"{dir_name}/p_loss.json"
    with open(file_name, "r") as f:
        data = json.load(f)
    data.sort(key=lambda x:x['step'])
    p_loss = np.mean([x['value'] for x in data[-10:]])

    file_name = f"{dir_name}/q_loss.json"
    with open(file_name, "r") as f:
        data = json.load(f)
    data.sort(key=lambda x:x['step'])
    q_loss = np.mean([x['value'] for x in data[-10:]])

    file_name = f"{dir_name}/entropy.json"
    with open(file_name, "r") as f:
        data = json.load(f)
    data.sort(key=lambda x:x['step'])
    entropy = np.mean([x['value'] for x in data[-10:]])

    data_list.append([param, score, p_loss, q_loss, entropy])

if param_type_dict[param_name] != 'str':
    if scale == "log":
        x = np.array([np.log(x[0]) for x in data_list])
        x_gp = np.linspace(min(x) + np.log(0.9), max(x) + np.log(1.1), 100)
    else:
        x = np.array([x[0] for x in data_list])
        x_gp = np.linspace(min(x)*0.9, max(x)*1.1, 100)

    # score
    y = np.array([x[1] for x in data_list])
    init_lambda = 10.0
    init_beta = 10.0
    init_sigma = 100.0
    kernel = ConstantKernel(init_beta, (1e-3, 1e3)) * RBF(init_lambda, (1e-3, 1e3)) #initial_value, (minimum_value, maximum_value)
    gp = GaussianProcessRegressor(kernel=kernel, alpha=init_sigma, n_restarts_optimizer=100)
    x_data_gp = x.reshape((-1, 1))
    y_data_gp = y.reshape((-1, 1))
    gp.fit(x_data_gp, y_data_gp)
    y_pred_sk, std_pred_sk = gp.predict(x_gp.reshape((-1, 1)), return_std=True)
    y_pred_sk = y_pred_sk.flatten()
    std_pred_sk = std_pred_sk.flatten()
    if scale == "log":
        gp_data = [[np.exp(x_gp[i]), y_pred_sk[i], std_pred_sk[i]] for i in range(len(x_gp))]
    else:
        gp_data = [[x_gp[i], y_pred_sk[i], std_pred_sk[i]] for i in range(len(x_gp))]

    # p_loss
    y = np.array([x[2] for x in data_list])
    init_lambda = 10.0
    init_beta = 10.0
    init_sigma = 100.0
    kernel = ConstantKernel(init_beta, (1e-3, 1e3)) * RBF(init_lambda, (1e-3, 1e3))
    gp = GaussianProcessRegressor(kernel=kernel, alpha=init_sigma, n_restarts_optimizer=100)
    x_data_gp = x.reshape((-1, 1))
    y_data_gp = y.reshape((-1, 1))
    gp.fit(x_data_gp, y_data_gp)
    y_pred_sk, std_pred_sk = gp.predict(x_gp.reshape((-1, 1)), return_std=True)
    y_pred_sk = y_pred_sk.flatten()
    std_pred_sk = std_pred_sk.flatten()
    if scale == "log":
        gp_data2 = [[np.exp(x_gp[i]), y_pred_sk[i], std_pred_sk[i]] for i in range(len(x_gp))]
    else:
        gp_data2 = [[x_gp[i], y_pred_sk[i], std_pred_sk[i]] for i in range(len(x_gp))]

    # q_loss
    y = np.array([x[3] for x in data_list])
    init_lambda = 10.0
    init_beta = 10.0
    init_sigma = 100.0
    kernel = ConstantKernel(init_beta, (1e-3, 1e3)) * RBF(init_lambda, (1e-3, 1e3))
    gp = GaussianProcessRegressor(kernel=kernel, alpha=init_sigma, n_restarts_optimizer=100)
    x_data_gp = x.reshape((-1, 1))
    y_data_gp = y.reshape((-1, 1))
    gp.fit(x_data_gp, y_data_gp)
    y_pred_sk, std_pred_sk = gp.predict(x_gp.reshape((-1, 1)), return_std=True)
    y_pred_sk = y_pred_sk.flatten()
    std_pred_sk = std_pred_sk.flatten()
    if scale == "log":
        gp_data3 = [[np.exp(x_gp[i]), y_pred_sk[i], std_pred_sk[i]] for i in range(len(x_gp))]
    else:
        gp_data3 = [[x_gp[i], y_pred_sk[i], std_pred_sk[i]] for i in range(len(x_gp))]

    # entropy
    y = np.array([x[4] for x in data_list])
    init_lambda = 10.0
    init_beta = 10.0
    init_sigma = 100.0
    kernel = ConstantKernel(init_beta, (1e-3, 1e3)) * RBF(init_lambda, (1e-3, 1e3))
    gp = GaussianProcessRegressor(kernel=kernel, alpha=init_sigma, n_restarts_optimizer=100)
    x_data_gp = x.reshape((-1, 1))
    y_data_gp = y.reshape((-1, 1))
    gp.fit(x_data_gp, y_data_gp)
    y_pred_sk, std_pred_sk = gp.predict(x_gp.reshape((-1, 1)), return_std=True)
    y_pred_sk = y_pred_sk.flatten()
    std_pred_sk = std_pred_sk.flatten()
    if scale == "log":
        gp_data4 = [[np.exp(x_gp[i]), y_pred_sk[i], std_pred_sk[i]] for i in range(len(x_gp))]
    else:
        gp_data4 = [[x_gp[i], y_pred_sk[i], std_pred_sk[i]] for i in range(len(x_gp))]
else:
    gp_data = []
    gp_data2 = []
    gp_data3 = []
    gp_data4 = []
    
run_data = {}
run_data2 = {}
run_data3 = {}
run_data4 = {}
for item in data_list:
    param, score, p_loss, q_loss, entropy = item
    if not param in run_data.keys():
        run_data[param] = []
        run_data2[param] = []
        run_data3[param] = []
        run_data4[param] = []
    run_data[param].append(score)
    run_data2[param].append(p_loss)
    run_data3[param].append(q_loss)
    run_data4[param].append(entropy)

processed_data = {
    'gp_data': gp_data, 'run_data': run_data,
    'gp_data_p_loss': gp_data2, 'run_data_p_loss': run_data2,
    'gp_data_q_loss': gp_data3, 'run_data_q_loss': run_data3,
    'gp_data_entropy': gp_data4, 'run_data_entropy': run_data4,
}

file_path = f"./data/{task_algo}/{version}/data.json"
with open(file_path, "w", encoding='utf-8') as json_file:
    json.dump(processed_data, json_file, indent=4)
