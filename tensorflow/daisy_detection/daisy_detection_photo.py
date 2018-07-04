# import numpy as np
# import tensorflow as tf
#
# from utils import label_map_util
# from utils import visualization_utils as vis_util
#
# # What model
# MODEL_NAME = 'daisy_model'
#
# # Path to frozen detection graph. This is the actual model that is used for the object detection.
# PATH_TO_CKPT = MODEL_NAME + '/frozen_inference_graph.pb'
#
# # List of the strings that is used to add correct label for each box.
# PATH_TO_LABELS = MODEL_NAME + '/label_map.py'
#
# NUM_CLASSES = 1
#
# # Load a (frozen) Tensorflow model into memory.
#
# detection_graph = tf.Graph()
# with detection_graph.as_default():
#     od_graph_def = tf.GraphDef()
#     with tf.gfile.GFile(PATH_TO_CKPT, 'rb') as fid:
#         serialized_graph = fid.read()
#         od_graph_def.ParseFromString(serialized_graph)
#         tf.import_graph_def(od_graph_def, name='')
#
#
# # ## Loading label map
# # Label maps map indices to category names, so that when our convolution network predicts `5`, we know that this corresponds to `airplane`.  Here we use internal utility functions, but anything that returns a dictionary mapping integers to appropriate string labels would be fine
#
# label_map = label_map_util.load_labelmap(PATH_TO_LABELS)
# categories = label_map_util.convert_label_map_to_categories(label_map, max_num_classes=NUM_CLASSES, use_display_name=True)
# category_index = label_map_util.create_category_index(categories)
#
# #intializing the web camera device
#
# import cv2
#
# # Running the tensorflow session
# def detect(image):
#     with detection_graph.as_default():
#         with tf.Session(graph=detection_graph) as sess:
#             image_np = cv2.imread(image)
#
#             height, width = image_np.shape[:2]
#             max_height = 600
#             max_width = 600
#
#             # only shrink if img is bigger than required
#             if max_height < height or max_width < width:
#                 # get scaling factor
#                 scaling_factor = max_height / float(height)
#                 if max_width/float(width) < scaling_factor:
#                     scaling_factor = max_width / float(width)
#                 # resize image
#                 image_np = cv2.resize(image_np, None, fx=scaling_factor, fy=scaling_factor, interpolation=cv2.INTER_AREA)
#
#
#             # Expand dimensions since the model expects images to have shape: [1, None, None, 3]
#             image_np_expanded = np.expand_dims(image_np, axis=0)
#             image_tensor = detection_graph.get_tensor_by_name('image_tensor:0')
#             # Each box represents a part of the image where a particular object was detected.
#             boxes = detection_graph.get_tensor_by_name('detection_boxes:0')
#             # Each score represent how level of confidence for each of the objects.
#             # Score is shown on the result image, together with the class label.
#             scores = detection_graph.get_tensor_by_name('detection_scores:0')
#             classes = detection_graph.get_tensor_by_name('detection_classes:0')
#             num_detections = detection_graph.get_tensor_by_name('num_detections:0')
#             # Actual detection.
#             (boxes, scores, classes, num_detections) = sess.run(
#                 [boxes, scores, classes, num_detections],
#                 feed_dict={image_tensor: image_np_expanded})
#
#             print (scores[0][0])
#
#             # Visualization of the results of a detection.
#             vis_util.visualize_boxes_and_labels_on_image_array(
#                 image_np,
#                 np.squeeze(boxes),
#                 np.squeeze(classes).astype(np.int32),
#                 np.squeeze(scores),
#                 category_index,
#                 use_normalized_coordinates=True,
#                 line_thickness=8)
#             return image_np
#
# image = detect('daisy_photos/daisy_test.jpg')
# while (1):
#     cv2.imshow('image',image)
#     if cv2.waitKey(25) & 0xFF == ord('q'):
#         cv2.destroyAllWindows()
#         break


import numpy as np
from PIL import Image
from PIL import ImageDraw
import tensorflow as tf

from utils import label_map_util

try:
    from StringIO import StringIO
except ImportError:
    from io import StringIO

# What model
MODEL_NAME = 'daisy_model'

# Path to frozen detection graph. This is the actual model that is used for the object detection.
PATH_TO_CKPT = MODEL_NAME + '/frozen_inference_graph.pb'

# List of the strings that is used to add correct label for each box.
PATH_TO_LABELS = MODEL_NAME + '/label_map.py'


class ObjectDetector(object):

    def __init__(self):
        self.detection_graph = self._build_graph()
        self.sess = tf.Session(graph=self.detection_graph)

        label_map = label_map_util.load_labelmap(PATH_TO_LABELS)
        categories = label_map_util.convert_label_map_to_categories(
            label_map, max_num_classes=1, use_display_name=True)
        self.category_index = label_map_util.create_category_index(categories)

    def _build_graph(self):
        detection_graph = tf.Graph()
        with detection_graph.as_default():
            od_graph_def = tf.GraphDef()
            with tf.gfile.GFile(PATH_TO_CKPT, 'rb') as fid:
                serialized_graph = fid.read()
                od_graph_def.ParseFromString(serialized_graph)
                tf.import_graph_def(od_graph_def, name='')
                # for node in od_graph_def.node: print (node.name)

        return detection_graph

    def _load_image_into_numpy_array(self, image):
        (im_width, im_height) = image.size
        return np.array(image.getdata()).reshape(
            (im_height, im_width, 3)).astype(np.uint8)

    def draw_bounding_box_on_image(self,image, box, color='red', thickness=4):
        draw = ImageDraw.Draw(image)
        im_width, im_height = image.size
        ymin, xmin, ymax, xmax = box
        (left, right, top, bottom) = (xmin * im_width, xmax * im_width,
                                      ymin * im_height, ymax * im_height)
        draw.line([(left, top), (left, bottom), (right, bottom),
                   (right, top), (left, top)], width=thickness, fill=color)

    def detect(self, image):
        image_np = self._load_image_into_numpy_array(image)
        image_np_expanded = np.expand_dims(image_np, axis=0)

        graph = self.detection_graph
        image_tensor = graph.get_tensor_by_name('image_tensor:0')
        boxes = graph.get_tensor_by_name('detection_boxes:0')
        scores = graph.get_tensor_by_name('detection_scores:0')
        classes = graph.get_tensor_by_name('detection_classes:0')
        num_detections = graph.get_tensor_by_name('num_detections:0')

        (boxes, scores, classes, num_detections) = self.sess.run(
            [boxes, scores, classes, num_detections],
            feed_dict={image_tensor: image_np_expanded})

        boxes, scores, classes, num_detections = map(
            np.squeeze, [boxes, scores, classes, num_detections])

        return boxes, scores, classes.astype(int), num_detections

def detect_objects(image_path):
    print (image_path)
    image = Image.open(image_path).convert('RGB')
    boxes, scores, classes, num_detections = detector.detect(image)
    image.thumbnail((480, 480), Image.ANTIALIAS)
    # # show a bounding box
    detector.draw_bounding_box_on_image(image,boxes[0],thickness=int(scores[0]*10)-4)
    image.show()


    print("boxes:", boxes[0])
    print("scores:", classes[0])
    print("classes:", classes[0])
    print("num_detections:", num_detections)

    print("\n ", image_path,"\t",scores[0])


detector = ObjectDetector()

detect_objects("daisy_photos/daisy_test.jpg")