# From tensorflow/models/research/

## train
```gcloud ml-engine jobs submit training object_detection_`date +%s` \
    --runtime-version 1.5 \
    --job-dir=gs://daisy-209018/data/train \
    --packages dist/object_detection-0.1.tar.gz,slim/dist/slim-0.1.tar.gz \
    --module-name object_detection.train \
    --region us-central1 \
    --config ../../GitHub/daisyCam/tensorflow/training/cloud.yml \
    -- \
    --train_dir=gs://daisy-209018/data/train \
    --pipeline_config_path=gs://daisy-209018/data/ssd_mobilenet_v1_pets.config```

## eval
```gcloud ml-engine jobs submit training object_detection_eval_`date +%s` \
    --runtime-version 1.5 \
    --job-dir=gs://daisy-209018/data/train \
    --packages dist/object_detection-0.1.tar.gz,slim/dist/slim-0.1.tar.gz \
    --module-name object_detection.eval \
    --region us-central1 \
    --scale-tier BASIC_GPU \
    -- \
    --checkpoint_dir=gs://daisy-209018/data/train \
    --eval_dir=gs://daisy-209018/data/eval \
    --pipeline_config_path=gs://daisy-209018/data/ssd_mobilenet_v1_pets.config```
    
## create
```python object_detection/export_inference_graph.py \
    --input_type image_tensor \
    --pipeline_config_path ../../GitHub/daisyCam/tensorflow/training/ssd_mobilenet_v1_pets.config \
    --trained_checkpoint_prefix ../../GitHub/daisyCam/tensorflow/training/trained/model.ckpt-62231 \
    --output_directory ../../GitHub/daisyCam/tensorflow/training/trained/model.pb```
