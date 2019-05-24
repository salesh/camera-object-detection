import React, { useRef, useEffect } from 'react';
import './App.css';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

function App() {
  /*
    Basically this is library that contains models that aims 
    to localize and indentify multiple objects in single image.
    Model mobilenet_v2 has the highest classification accuracy.
    COCO dataset is a large-scale object decetion, segmentation,
    and captioning dataset (machine learning creation).
  */
  const promiseModel = cocoSsd.load('mobilenet_v2');

  /*
    New thing in React
    useRef => by using this hook it returns a mutable ref object whose .current property is 
    initialized to the passed argument (initialValue).
    The returned plain JavaScript object will persist for the full lifetime of the
    component.
    Essentially, useRef is like a "box" that can hold a mutable value
    in its .current property.
    useRef doesn't notify you when its content changes.
  */
 
  const refVideo = useRef(null);
  const refCanvas = useRef(null);

  // Property window
  const widthWindow = window.innerWidth;
  const heightWindow = window.innerHeight


  /*
    Detection function get our video and model that we loaded.
    With model we detect on our video and we get predictions.
    Then we call our next function drawBBox.

    requestAnimationFrame tells the browser that you wish 
    to perform an animation and requests that the browser call 
    a specified function to update and animation before the next repaint.
    Basically recursion.
  */

  const detectionFunction = (video, model) => {
    model.detect(video).then(predictions => {
      drawBBox(predictions);
    });
    requestAnimationFrame(() => detectionFunction(video, model));
  }

  /*
    drawBBox function draw our predictions
  */
  const drawBBox = predictions => {

    /*
      Drawing context on the canvas, '2d' leading to the
      creation of object that represent two-dimensional renedering context

      With clearReact we clear all previous rectangle
    */
    const ctx = refCanvas.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    /*
      Now this is party where we get configure rectangle with red
      border
    */
   
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.textBaseline = 'bottom';
    ctx.font = '12px sans-serif';

    predictions.forEach(prediction => {
      // We get from library information about class of object + % score of precision
      const predictionText = prediction.class + ' ' + (prediction.score * 100).toFixed(2);

      // We measure text width and height with font so we can add to the rectangular
      const widthText = ctx.measureText(predictionText).width;
      const heightText = parseInt(ctx.font, 10);

      /* 
        x, y, width, height that we got from our prediction
        we draw empty rectangle (strokeRect) arround target ctx.strokeStyle give us red border
      */
      ctx.strokeRect(
        prediction.bbox[0], 
        prediction.bbox[1], 
        prediction.bbox[2], 
        prediction.bbox[3]
      );


      /*
        Now we want to create second green rectangle that sit on our primary rectangle
        and have some prediction text
      */
      ctx.fillStyle = '#0F0';
      ctx.fillRect(
        prediction.bbox[0] - ctx.lineWidth / 2,
        prediction.bbox[1],
        widthText + ctx.lineWidth,
        - heightText
      );

      // Blue text prediction inside second rectangle
      ctx.fillStyle = '#00F';
      ctx.fillText(predictionText, prediction.bbox[0], prediction.bbox[1]);
    });
  }

  /*
    New thing in React
    useEffect => by using this hook it runs both after the first render and after every update
    "mounting" and "updating" => 'AFTER RENDER'
  */

  useEffect(() => {

    /* 
      "environment"
      The video source is facing away from the user, 
      thereby viewing their environment. 
      This is the back camera on a smartphone.
    */

    const contraintsMediaDevice = {
      audio: false,
      video: { facingMode: 'environment'}
    };

    // Now we check does our browser have media capabilities and rights
    
    if (navigator.mediaDevices.getUserMedia) {
      
      const promiseCamera = navigator.mediaDevices.getUserMedia(contraintsMediaDevice)
      .then(streamCamera => {
        // Add to our video srcObject streamCamera that we got from browser
        refVideo.current.srcObject = streamCamera;
        // onloadedmetadata event occurs when meta data for the specified audio/video has been loaded
        return new Promise(resolve => refVideo.current.onloadedmetadata = resolve);
      }).catch(error => {
        console.log(error);
        alert('Activate your camera and refresh the page!')
      })

      // Now when model ready + camera is ready call our detectionFunction
      Promise.all([promiseModel, promiseCamera])
      .then(values => detectionFunction(refVideo.current, values[0]))
      .catch(error => console.error(error));
    }
  });

  /* Part where we render our application
    <> </> => Fragments  React.Fragments
    common patern in React for a component to return multiple elements
    We create video and canvas with params
  */
  return (
    <>
      <video 
        ref= {refVideo}
        className='app-position'
        autoPlay
        playsInline
        muted
        width={widthWindow}
        height={heightWindow}
      />
      <canvas
        ref={refCanvas}
        className='app-position'
        width={widthWindow}
        height={heightWindow}
      />
    </>
  );
}

export default App;
