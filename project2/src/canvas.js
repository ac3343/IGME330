/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';
import * as classes from './classes.js';


let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData,bubbles,auroraRangeSlider,auroraColorPos,auroraColorSpd,auroraColorAcc,auroraColorSpdLabel,maxSpeed;


function setupCanvas(canvasElement,analyserNodeRef){
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"darkblue"},{percent:1,color:"magenta"}]);
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize/2);

    bubbles = new Array(audioData.length);

    auroraRangeSlider = document.querySelector("#auroraSlider");
    auroraColorPos = 0;
    auroraColorSpd = .01;
    maxSpeed = 2;
    auroraColorAcc = .1;
    auroraColorSpdLabel = document.querySelector("#auroraSpeedLabel");
}

function draw(params={}){
  // 1 - populate the audioData array with the frequency data from the analyserNode
    // notice these arrays are passed "by reference"
    if(params.useFreqData){
        analyserNode.getByteFrequencyData(audioData);
    }
    else if(params.useWaveData){
        // waveform data
        analyserNode.getByteTimeDomainData(audioData); 
    }
	
	// 2 - draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = .1;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.restore();
		
	// 3 - draw gradient
	if(params.showGradient){
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = .3;
        ctx.fillRect(0,0,canvasWidth,canvasHeight);
        ctx.restore();
        
    }
	// 4 - draw bars
	if(params.showBars){
        let barSpacing = 4;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
        let barWidth = screenWidthForBars / audioData.length;
        let barHeight = 200;
        let topSpacing = 100;

        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.50)';
        ctx.strokeStyle = 'rgba(0,0,0,0.50)';
        //loop through data and draw
        for(let i=0; i<audioData.length; i++){
            ctx.fillRect(margin + i* (barWidth + barSpacing), topSpacing + 256-audioData[i],barWidth,barHeight);
            ctx.strokeRect(margin + i* (barWidth + barSpacing), topSpacing + 256-audioData[i],barWidth,barHeight)
        }
        ctx.restore();
    }
    //Draw bubbles
    if(params.showBubbles){
        let barSpacing = 4;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
        let barWidth = screenWidthForBars / audioData.length;
        let barHeight = 200;
        let topSpacing = 100;

        //loop through data and adds new bubbles
        for(let i=0; i<audioData.length; i++){
            let velocityScaler = .5;
            let velocity = (audioData[i]) * velocityScaler;
            if(bubbles[i] == null){
                bubbles[i] = new classes.Bubble(margin + i* (barWidth + barSpacing), canvasHeight/2);
            }
            else if(bubbles[i].y >= canvasHeight/2 + velocity){
                bubbles[i].y = canvasHeight/2;
            }
        }
        for(let i=bubbles.length - 1; i >=0; i--){
            bubbles[i].Draw(ctx);
        }
    }
    //draw aurora
	if(params.showAurora){
        let barSpacing = 4;
        let margin = canvasWidth/2;
        let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
        let barWidth = screenWidthForBars / audioData.length;
        let topSpacing = 100;

        
        //loop through data and draw
        for(let i=0; i<audioData.length; i++){
            ctx.save();
            let barHeight = audioData[i] / 1.5;
            let gradient = ctx.createLinearGradient(0, canvasHeight/2 - audioData[i], 0, canvasHeight/2 + audioData[i]);
            let rangeControl = auroraRangeSlider.value;
            let startColor = `hsla(${(i+auroraColorPos) *rangeControl}, ${(Math.abs(1) * 25) + 50}%, 50%,`;
            gradient.addColorStop(0, startColor + "0)");
            gradient.addColorStop(0.3, startColor + "0)");
            gradient.addColorStop(0.5, startColor + ".6)");
            gradient.addColorStop(0.6, startColor + "0)");
            gradient.addColorStop(1, startColor + "0)");
            ctx.fillStyle = gradient;
            //ctx.strokeStyle = 'rgba(0,0,0,0.50)';
            //bottom left
            ctx.fillRect(margin + (i + .5)* (barWidth), canvasHeight/2 ,barWidth, barHeight/3);
            //top left
            ctx.fillRect(margin + (i + .5)* (barWidth), canvasHeight/2,barWidth, -barHeight);
            //bottom right
            ctx.fillRect(margin - (i + .5)* (barWidth), canvasHeight/2 ,barWidth, barHeight/3);
            //top right
            ctx.fillRect(margin - (i + .5)* (barWidth), canvasHeight/2 ,barWidth, -barHeight);
            //ctx.strokeRect(margin + i* (barWidth + barSpacing), canvasHeight/2,barWidth,barHeight);
            ctx.restore();
        }
        auroraColorAcc = utils.getRandomInt(-1, 1) / 10.0;
        if(auroraColorSpd < maxSpeed && auroraColorSpd > -maxSpeed){
            auroraColorSpd += auroraColorAcc;
        }
        else if(auroraColorSpd > -maxSpeed){
            auroraColorSpd -= auroraColorAcc;
        }
        else if(auroraColorSpd < maxSpeed){
            auroraColorSpd += auroraColorAcc;
        }
        auroraColorPos+=auroraColorSpd;
        document.querySelector("#auroraSpeedLabel").innerHTML = auroraColorSpd;
    }
	// 5 - draw circles
	if(params.showCircles){
        let maximumRadius = canvasHeight/4;

        ctx.save();
        ctx.globalAlpha = 0.5;
        //loop through data and draw
        for(let i=0; i<audioData.length; i++){
            //red
            let percent = audioData[i] /255;

            let circleRadius = percent * maximumRadius;
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(255,111,111,.3 - percent/3.0);
            ctx.arc(canvasWidth/2,canvasHeight/2,circleRadius,0,2*Math.PI, false);
            ctx.fill();
            ctx.closePath();

            //blue
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(0,0,255,.10 - percent/10.0);
            ctx.arc(canvasWidth/2,canvasHeight/2,circleRadius * 1.5,0,2*Math.PI, false);
            ctx.fill();
            ctx.closePath();

            //yellow
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(200,200,0,.5 - percent/5.0);
            ctx.arc(canvasWidth/2,canvasHeight/2,circleRadius * .5,0,2*Math.PI, false);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
        ctx.restore();
    }

    // 6 - bitmap manipulation
	// TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
	// regardless of whether or not we are applying a pixel effect
	// At some point, refactor this code so that we are looping though the image data only if
	// it is necessary

	// A) grab all of the pixels on the canvas and put them in the `data` array
	// `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
	// the variable `data` below is a reference to that array 
    let imageData = ctx.getImageData(0,0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width;
	
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for(let i = 0;i < length; i+=4){
		// C) randomly change every 20th pixel to red
        if(params.showNoise && Math.random() < .05){
			// data[i] is the red channel
			// data[i+1] is the green channel
			// data[i+2] is the blue channel
			// data[i+3] is the alpha channel
			data[i] = data[i+1] = data[i+2] = 0;// zero out the red and green and blue channels
            data[i] = 45;// make the red channel 100% red
            data[i+1] = 220;
        } // end if
        if(params.showInvert){
            let red = data[i], green = data[i+1], blue = data[i+2];
            data[i] = 255 - red;
            data[i+1] = 255- green;
            data[i+2] = 255 - blue;
        }
    } // end for
    if(params.showEmboss){
        for(let i = 0; i <length; i++){
            if(i%4==3) continue;
            data[i] = 127+2*data[i] - data[i+4] - data[i + width*4];
        }
    }
    
	
    // D) copy image data back to canvas
    ctx.putImageData(imageData,0,0);
}

export {setupCanvas,draw};