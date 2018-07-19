from datetime import datetime
from time import sleep
import sys

# put tf detection to sleep when it's dark outside
hour_now = datetime.now().hour
min_now = datetime.now().minute
print ('python spawned at {:d}:{:02d}'.format(hour_now, min_now))
sys.stdout.flush()
min_sleep_time = 60 - min_now
if hour_now > 20:
    hour_sleep_time = 30 - hour_now
    print ('it is late, sleeping for ',  hour_sleep_time - 1, ' hours and ', min_sleep_time, 'mins')
    sys.stdout.flush()
    sleep((hour_sleep_time - 1)*3600 - min_sleep_time*60)
elif hour_now < 6:
    sleep_time = 6 - hour_now
    print ('it is early, sleeping for ', sleep_time - 1, ' hours and ', min_sleep_time, 'mins')
    sys.stdout.flush()
    sleep((sleep_time - 1)*3600 - min_sleep_time*60)

import cv2
import numpy as np
import tensorflow as tf
from image_diff import diff
import glob
import os

camera = cv2.VideoCapture(0)

model_file = "tensorflow/daisy_retrain/tf_files/retrained_graph.pb"
label_file = "tensorflow/daisy_retrain/tf_files/retrained_labels.txt"
input_layer = "input"
output_layer = "final_result"
input_height = 224
input_width = 224
input_mean = 128
input_std = 128

def load_labels(label_file):
    label = []
    proto_as_ascii_lines = tf.gfile.GFile(label_file).readlines()
    for l in proto_as_ascii_lines:
        label.append(l.rstrip())
    return label

def grabVideoFeed():
    grabbed, frame = camera.read()
    return frame if grabbed else None

def load_graph(model_file):
    graph = tf.Graph()
    graph_def = tf.GraphDef()

    with open(model_file, "rb") as f:
        graph_def.ParseFromString(f.read())
    with graph.as_default():
        tf.import_graph_def(graph_def)

    return graph

with tf.Session() as sess:
    graph = load_graph(model_file)

    while True:
        frame = grabVideoFeed()

        if frame is None:
            raise SystemError('Issue grabbing the frame')

        sm_frame = cv2.resize(frame, (input_height, input_width), interpolation=cv2.INTER_CUBIC)

        numpy_frame = np.asarray(sm_frame)

        float_caster = tf.cast(numpy_frame, tf.float32)
        dims_expander = tf.expand_dims(float_caster, axis=0)
        normalized = tf.divide(tf.subtract(dims_expander, [input_mean]), [input_std])
        sess = tf.Session()
        result = sess.run(normalized)

        input_name = "import/" + input_layer
        output_name = "import/" + output_layer
        input_operation = graph.get_operation_by_name(input_name)
        output_operation = graph.get_operation_by_name(output_name)

        with tf.Session(graph=graph) as sess:
            results = sess.run(output_operation.outputs[0],
                               {input_operation.outputs[0]: result})
        results = np.squeeze(results)

        top_k = results.argsort()[-5:][::-1]
        labels = load_labels(label_file)

        template = "{} (score={:0.5f})"
        for i in top_k:
            print(template.format(labels[i], results[i]))
            sys.stdout.flush()

        score = results[0]
        if score > 0.9:
            print ('daisy found, score: ', score)
            sys.stdout.flush()

            # compute image diff
            list_of_images = glob.glob('tensorflow/daisy_detection/capture/daisy/*.jpg')
            latest_image = max(list_of_images, key=os.path.getctime)

            save_image = diff(latest_image, frame)
            if save_image:
                filename = "tensorflow/daisy_detection/capture/daisy/" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".jpg"
                print ('new image:',filename)
                sys.stdout.flush()
                cv2.imwrite(filename, frame)
            else:
                print ('she has not moved!')
                sys.stdout.flush()
        else:
            sleep(1)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            sess.close()
            break

camera.release()
cv2.destroyAllWindows()