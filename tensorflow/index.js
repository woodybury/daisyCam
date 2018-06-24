const mobile = require('@tensorflow-models/mobilenet');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
tf.setBackend('tensorflow');

let mobilenet, model;

const img = tf.fromPixels('./basset.jpg').toFloat();

(async () => {

  // Load the model.
  mobilenet = await tf.loadModel('file://tensorflow/model.json');
  // Classify the image.
  const predictions = await mobilenet.predict(img);
  // console.log('Predictions: ');
  // console.log(predictions);
})();