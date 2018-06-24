const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
tf.setBackend('tensorflow');

const MOBILENET_MODEL_PATH = 'model.json';

let mobilenet;

const img = 'basset.jpg';

(async () => {

  // Load the model.
  console.log (img);
  //mobilenet = await tf.loadModel(MOBILENET_MODEL_PATH);
  // Classify the image.
  //const predictions = await model.classify(img);
  //console.log('Predictions: ');
  //console.log(predictions);
})();