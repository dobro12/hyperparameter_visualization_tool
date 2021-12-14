# Visualization Tool for Intuitive Hyperparameter Optimization

InfoVis Final Project.

## How to use

1. execute backend server.

   - ```bash
     $ cd backend
     $ yarn start
     ```

2. execute frontend server.

   - ```bash
     $ cd backend/frontend
     $ yarn start
     ```

3. explore!

## How to train RL and add data

### requirements

1. tensorflow==1.13.1
2. sklearn
3. gym
4. mujoco-py
5. matplotlib

### train

- ```bash
  $ cd SAC
  $ ./train.sh
  ```

- After few minutes, the policy learning rate version is trained, and the visualization web is updated.

- To get more information about train arguments, you can execute "python main.py -h".
