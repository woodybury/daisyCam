const getPixels = require('get-pixels');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
tf.setBackend('tensorflow');

let mobilenet, img;

// const img = tf.fromPixels('file://tensorflow/basset.jpg').toFloat();

getPixels( img , function(err, pixels) {
  if(err) {
    console.log("Bad image path");
    return
  }
  console.log("got pixels", pixels.shape.slice());
  return pixels;
});

tfimg = tf.fromPixels( getPixels("/tensorflow/basset.jpg")).toFloat();

(async () => {

  // Load the model.
  mobilenet = await tf.loadModel('file://tensorflow/model/model.json');
  // Classify the image.
  // const predictions = await mobilenet.predict(img);
  // console.log('Predictions: ');
  // console.log(predictions);
})();