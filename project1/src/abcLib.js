(function(){
    console.log("loaded");

    let abcLIB = {
        getRandomColor(){
            //function getByte(){
            //    return 55 + Math.round(Math.random() * 200);
            //}
            const getByte = _ => 55 + Math.round(Math.random() * 200);
            return `rgba(${getByte()},${getByte()},${getByte()},.8)`;
            },
        
        getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        drawRectangle(ctx, x,y,width,height,fillStyle="black",lineWidth=0,strokeStyle="black"){
            ctx.fillStyle = fillStyle;
            ctx.save();
            ctx.beginPath();
            ctx.rect(x,y,width,height);
            ctx.closePath();
            ctx.fill();
            if(lineWidth >0){
                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            }
            ctx.restore();
        }
        ,dtr(degrees){
            return degrees * (Math.PI/180);
        }

        ,drawCircle(ctx,x,y,radius,color){
            ctx.save();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x,y,radius,0,Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        ,getMouseCoordinates(e){
            let canvasBounds =  e.target.getBoundingClientRect();
            return {x: e.clientX - canvasBounds.x, y: e.clientY - canvasBounds.y};
        }
        ,roundToMultipleOf(number,multipleOf=10){
            if(number < multipleOf){
                throw `Number ${number} is smaller than ${multipleOf}.`
            }
            //Divides submitted number by the 
            let divResult = number / multipleOf;
            return multipleOf * Math.round(divResult);
        },
        drawLine(ctx, x, y, length, color){
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y+length);
            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.lineWidth = abcLib.getRandomInt(2,5);
            ctx.stroke();
            ctx.restore();
        },
        getRandomColorWithinRange(hueMin=0, hueMax=360, satMin=50,satMax=100, lumMin=35,lumMax=70){
            return  `hsl(${abcLib.getRandomInt(hueMin, hueMax)}, ${abcLib.getRandomInt(satMin, satMax)}%, ${abcLib.getRandomInt(lumMin, lumMax)}%)`;
        }
    };

    if(window){
        window["abcLib"] = abcLIB;
    }
    else{
        throw "'window' is not defined!";
    }
})();

