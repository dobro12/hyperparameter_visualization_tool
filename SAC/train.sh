env_name="HalfCheetah-v2"
parent_name="none"
control_param="p_lr"
p_lr=0.001
# training_epochs=1000
training_epochs=10
cuda_device=0
run_idx=0
python main.py --run_idx "$run_idx" --p_lr "$p_lr" --cuda_device "$cuda_device" --env_name "$env_name" --parent_name "$parent_name" --control_param "$control_param" --training_epochs "$training_epochs"