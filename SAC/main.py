# ===== add python path ===== #
import glob
import sys
import os
PATH = os.getcwd()
for dir_idx, dir_name in enumerate(PATH.split('/')):
    dir_path = '/'.join(PATH.split('/')[:(dir_idx+1)])
    file_list = [os.path.basename(sub_dir) for sub_dir in glob.glob(f"{dir_path}/.*")]
    if '.dobro_package' in file_list:
        PATH = dir_path
        break
if not PATH in sys.path:
    sys.path.append(PATH)
# =========================== #

from utils.logger import Logger
from utils.server import Server
from utils.graph import Graph
from nets import Agent

from collections import deque
import numpy as np
import argparse
import pickle
import time
import sys
import gym

def train(env_name, agent_args):
    #### never change code order !!!!!! ####
    server = Server(parent=args.parent_name, param=args.control_param, args=agent_args)
    #### server should be on top !!!!!! ####
    env = gym.make(env_name)
    agent = Agent(env, agent_args)

    save_name = agent_args['save_name']
    score_logger = Logger(save_name, 'score')
    p_loss_logger = Logger(save_name, 'p_loss')
    q_loss_logger = Logger(save_name, 'q_loss')
    entropy_logger = Logger(save_name, 'entropy')

    max_steps = 1000
    max_ep_len = 1000
    start_training_after_steps = 1000
    step_per_training = 50
    epochs = args.training_epochs
    save_freq = 10

    total_step = 0
    update_step = 0
    for epoch in range(epochs):
        ep_step = 0
        while ep_step < max_steps:
            state = env.reset()
            score = 0
            step = 0
            while True:
                step += 1
                ep_step += 1
                total_step += 1
                update_step += 1
                action = agent.get_action(state, True)
                next_state, reward, done, info = env.step(action)
                done = False if step >= max_ep_len else done

                agent.replay_memory.append([state, action, reward, np.float(done), next_state])

                if len(agent.replay_memory) > start_training_after_steps and (total_step + 1)%step_per_training == 0:
                    for _ in range(step_per_training):
                        p_loss, q_loss, entropy = agent.train()
                    print(f"[{total_step}] {p_loss}, {q_loss}, {entropy}")
                    p_loss_logger.write([update_step, p_loss])
                    q_loss_logger.write([update_step, q_loss])
                    entropy_logger.write([update_step, entropy])
                    update_step = 0

                state = next_state
                score += reward

                if done or step >= max_ep_len:
                    break

            score_logger.write([step, score])

        if (epoch+1)%save_freq == 0:
            agent.save()
            score_logger.save()
            p_loss_logger.save()
            q_loss_logger.save()
            entropy_logger.save()

    server.upload()


def test(env_name, agent_args):
    env = gym.make(env_name)
    agent = Agent(env, agent_args)

    episodes = int(1e6)
    for episode in range(episodes):
        state = env.reset()
        done = False
        score = 0
        while not done:
            action, clipped_action, value = agent.get_action(state, False)
            state, reward, done, info = env.step(clipped_action)
            score += reward
            env.render()
            time.sleep(0.01)
        print("score :",score)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='RL algorithm arguments.')
    parser.add_argument('--algo_name', type=str, default="SAC", help='name of algo.')
    parser.add_argument('--test', action='store_true', help='For test.')
    parser.add_argument('--run_idx', type=int, default=0, help='number of runs.')
    parser.add_argument('--env_name', type=str, default="HalfCheetah-v2", help='name of gym environment.')
    parser.add_argument('--discount_factor', type=float, default=0.99)
    parser.add_argument('--hidden1', type=int, default=256)
    parser.add_argument('--hidden2', type=int, default=256)
    parser.add_argument('--activ_function', type=str, default='relu')
    parser.add_argument('--q_lr', type=float, default=0.001)
    parser.add_argument('--p_lr', type=float, default=0.001)
    parser.add_argument('--alpha', type=float, default=0.2)
    parser.add_argument('--polyak', type=float, default=0.995)
    parser.add_argument('--batch_size', type=int, default=256)
    parser.add_argument('--replay_size', type=int, default=100000)
    parser.add_argument('--training_epochs', type=int, default=1000)
    parser.add_argument('--cuda_device', type=str, default="0")
    parser.add_argument('--parent_name', type=str, default="none")
    parser.add_argument('--control_param', type=str, default="discount_factor")
    args = parser.parse_args()

    os.environ["CUDA_VISIBLE_DEVICES"]=args.cuda_device
    assert args.activ_function in ['tanh', 'relu', 'elu', 'leaky_relu', 'silu', 'softplus', 'sigmoid', 'crelu']

    agent_name = args.algo_name
    is_train = not args.test
    algo_idx = args.run_idx
    env_name = args.env_name
    algo = agent_name
    save_name = '-'.join(env_name.split('-')[:-1])
    save_name = "result/{}_{}_{}_{}".format(save_name, algo, args.q_lr, algo_idx)
    agent_args = {
        'agent_name':agent_name,
        'save_name':save_name,
        'discount_factor':args.discount_factor,
        'hidden1':args.hidden1,
        'hidden2':args.hidden2,
        'activ_function':args.activ_function,
        'q_lr':args.q_lr,
        'p_lr':args.p_lr,
        'alpha':args.alpha,
        'polyak':args.polyak,
        'batch_size':args.batch_size,
        'replay_size':args.replay_size,
    }
    if is_train:
        train(env_name, agent_args)
    else:
        test(env_name, agent_args)
