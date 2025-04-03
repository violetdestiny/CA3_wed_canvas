let canvas = null
let ctx = null

let scribbleCanvas
let scribbleCanvasCtx
let maskCanvas
let maskCanvasCtx
let offscreenCanvas
let offscreenCanvasCtx

let embossConvolutionMatrix = [0, 0, 0,
    0, 2, -1,
    0, -1, 0]

let blurConvolutionMatrix = [1, 2, 1,
    2, 4, 2,
    1, 2, 1]

let sharpenConvolutionMatrix = [0, -2, 0,
    -2, 11, -2,
    0, -2, 0]

let edgeDetectionConvolutionMatrix = [1, 1, 1,
    1, -7, 1,
    1, 1, 1]

let noConvolutionMatrix = [0, 0, 0,
    0, 1, 0,
    0, 0, 0]

let convolutionMatrix = embossConvolutionMatrix /* select which convolution to use */



let ImageCanvas;
let ImageCanvasCtx;

//giving x and y positions to mouse - global variables
let mouseX = 0;
let mouseY = 0;
let radius = 10;

images = [{
        filename: "images/Hello_kitty_character_portrait.png",
        x: 0,
        y: 0,
        w: 500,
        h: 500},
    {
        filename: "images/girl.png",
        x: 100,
        y: 100,
        w: 300,
        h: 200},
    {

        filename: "images/girl.png",
        x: 50,
        y: 400,
        w: 150,
        h: 200}]

images.forEach(image =>
{
    currentImageIndex = 1
    image.img = new Image()
    image.img.src = image.filename
    image.rotation = 0
    image.isInverted = false
    image.isBlackAndWhite = false
    image.brightnessLevel = 0
    image.transparencyLevel = 1.0
    image.isSepia = false
    image.isThreshold = false
    image.isPosterise = false
    image.isEmbossed = false
    image.hasedgeDetection = false
    image.isBlur = false
    image.isSharpen = false
})
let textColor = `#ffffff`
let textFont = `Arial`
let  textFontSize = 20


let scribbleEnabled = false;


window.onload = onAllAssetsLoaded
document.write("<div id='loadingMessage'>Loading...</div>")
function onAllAssetsLoaded()
{
    // hide the webpage loading message
    document.getElementById('loadingMessage').style.visibility = "hidden"

    canvas = document.getElementById("ia_canvas")
    ctx = canvas.getContext("2d")
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    scribbleCanvas = document.createElement("canvas");
    scribbleCanvasCtx = scribbleCanvas.getContext("2d");
    scribbleCanvas.width = canvas.clientWidth;
    scribbleCanvas.height = canvas.clientHeight;

    maskCanvas = document.createElement("canvas");
    maskCanvasCtx = maskCanvas.getContext("2d");
    maskCanvas.width = canvas.clientWidth;
    maskCanvas.height = canvas.clientHeight;

    ImageCanvas = document.createElement("canvas");
    ImageCanvasCtx = ImageCanvas.getContext("2d");
    ImageCanvas.width = canvas.clientWidth;
    ImageCanvas.height = canvas.clientHeight;


    offscreenCanvas = document.createElement('canvas')
    offscreenCanvasCtx = offscreenCanvas.getContext('2d')
    offscreenCanvas.width = canvas.clientWidth;
    offscreenCanvas.height = canvas.clientWidth;





    renderCanvas()
    canvas.addEventListener('mousedown', mousedownHandler)
    canvas.addEventListener('mouseup', mouseupHandler)
    canvas.addEventListener('mousemove', moveHandler)
    window.onmousewheel = document.onmousewheel = mousewheelHandler
}


function renderCanvas()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    images.forEach((image, index) =>
    {
        offscreenCanvasCtx.clearRect(0, 0, canvas.width, canvas.height)

        if (index === currentImageIndex)
        {
            offscreenCanvasCtx.fillStyle = "red"
            offscreenCanvasCtx.fillRect(image.x - 2, image.y - 2, image.w + 4, image.h + 4)
        }
        // draw the second image onto the offscreenCanvas
        offscreenCanvasCtx.drawImage(image.img, image.x, image.y, image.w, image.h)


        // invert
        if (image.isInverted)
        {
            imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.w, image.h)
            data = imageData.data

            for (let i = 0; i < data.length; i += 4)
            {
                data[i + 0] = 255 - data[i + 0]
                data[i + 1] = 255 - data[i + 1]
                data[i + 2] = 255 - data[i + 2]
                data[i + 3] = 255
            }

            offscreenCanvasCtx.putImageData(imageData, image.x, image.y)


        }
        //emboss
        if (image.isEmbossed)
        {
            convolutionMatrix = embossConvolutionMatrix
            doConvolution(image)


        }
        //Edge Detection
        if (image.hasedgeDetection)
        {
            convolutionMatrix = edgeDetectionConvolutionMatrix
            doConvolution(image)

        }
        //Sharpness
        if (image.isSharpen)
        {
            convolutionMatrix = sharpenConvolutionMatrix
            doConvolution(image)

        }
        //Blur
        if (image.isBlur)
        {
            convolutionMatrix = blurConvolutionMatrix
            doConvolution(image)

        }

        // blackandwhite
        if (image.isBlackAndWhite)
        {
            imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.w, image.h)
            data = imageData.data

            for (let i = 0; i < data.length; i += 4)
            {
                data[i + 0] = data[i + 0]
                data[i + 1] = data[i + 0]
                data[i + 2] = data[i + 0]
                data[i + 3] = 255
            }

            offscreenCanvasCtx.putImageData(imageData, image.x, image.y)


        }
        //sepia
        if (image.isSepia)
        {
            imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.w, image.h)
            data = imageData.data

            for (let i = 0; i < data.length; i += 4)
            {
                red = data[i]
                green = data[i + 1]
                blue = data[i + 2]

                data[i] = (red * 0.393) + (green * 0.769) + (blue * 0.189)
                data[i + 1] = (red * 0.349) + (green * 0.686) + (blue * 0.168)
                data[i + 2] = (red * 0.272) + (green * 0.534) + (blue * 0.131)
            }


            offscreenCanvasCtx.putImageData(imageData, image.x, image.y)


        }
        //Posterise
        if (image.isPosterise)
        {
            imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.w, image.h)
            data = imageData.data

            for (let i = 0; i < data.length; i += 4)
            {
                data[i + 0] = data[i + 0] - data[i + 0] % 64
                data[i + 1] = data[i + 1] - data[i + 1] % 64
                data[i + 2] = data[i + 2] - data[i + 2] % 64
                data[i + 3] = 255
            }

            offscreenCanvasCtx.putImageData(imageData, image.x, image.y)


        }
        //Threshold
        if (image.isThreshold)
        {
            imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.w, image.h)
            data = imageData.data

            for (let i = 0; i < data.length; i += 4)
            {
                for (let rgb = 0; rgb < 3; rgb++)
                {
                    if (data[i + rgb] < 128)
                    {
                        data[i + rgb] = 0
                    } else
                    {
                        data[i + rgb] = 255
                    }
                }
                data[i + 3] = 255
            }

            offscreenCanvasCtx.putImageData(imageData, image.x, image.y)


        }

        // brightness


        imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.w, image.h)
        data = imageData.data

        for (let i = 0; i < data.length; i += 4)
        {
            data[i + 0] = data[i + 0] + image.brightnessLevel
            data[i + 1] = data[i + 1] + image.brightnessLevel
            data[i + 2] = data[i + 2] + image.brightnessLevel
            data[i + 3] = 255
        }

        offscreenCanvasCtx.putImageData(imageData, image.x, image.y)


        ctx.save()

        // rotate the offscreenCanvas around its centre
        ctx.translate(image.x + (image.w / 2), image.y + (image.h / 2))
        ctx.rotate(Math.radians(image.rotation))//rotate image
        ctx.translate(-(image.x + (image.w / 2)), -(image.y + (image.h / 2)))

        // draw the offscreen canvas onto the screen's canvas
        ctx.globalAlpha = image.transparencyLevel;
//is masked
if(image.isMasked){

        if (maskImage !== null)
        {

            maskCanvasCtx.save()
       
              maskCanvasCtx.drawImage(maskImage, image.x, image.y, canvas.width, canvas.height)
               maskCanvasCtx.globalCompositeOperation = 'source-in'

            maskCanvasCtx.drawImage(offscreenCanvas, image.x, image.y, image.w, image.h)

            ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height)
            maskCanvasCtx.restore()
        } 
        }else
        {

            ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height)
        }
        
        ctx.drawImage(scribbleCanvas, 0, 0, canvas.width, canvas.height)

        ctx.globalAlpha = 1.0;
        ctx.restore()
    })
    ctx.beginPath();
    ctx.fillStyle = textColor;
    ctx.font = `${20 * scale}px ${textFont}`;
    ctx.lineWidth = 50;
    var x = 50;
    var y = 100;
    ctx.fillText(text, x, y + (20 * scale));
    ctx.closePath();


}

function setProperty(property, value)
{
    if (value.includes("."))
    {
        images[currentImageIndex][property] = parseFloat(value)
    } else {
        images[currentImageIndex][property] = parseInt(value)
    }
    renderCanvas()
}
function toggleProperty(property)
{
    images[currentImageIndex][property] = !images[currentImageIndex][property]
    renderCanvas()
}




function mouseIsInsideImage(imageTopLeftX, imageTopLeftY, imageWidth, imageHeight, x, y)
{
    if ((x > imageTopLeftX) && (y > imageTopLeftY))
    {
        if (x > imageTopLeftX)
        {
            if ((x - imageTopLeftX) > imageWidth)
            {
                return false // to the right of the image
            }
        }

        if (y > imageTopLeftY)
        {
            if ((y - imageTopLeftY) > imageHeight)
            {
                return false // below the image
            }
        }
    } else // above or to the left of the image
    {
        return false
    }
    return true // inside image
}



let offsetX = 0
let offsetY = 0
let mouseIsPressed = false

function mousedownHandler(e)
{
    if (e.which === 1)  // left mouse button
    {
        let canvasBoundingRectangle = canvas.getBoundingClientRect()
        mouseX = e.clientX - canvasBoundingRectangle.left
        mouseY = e.clientY - canvasBoundingRectangle.top

        if (scribbleEnabled)
        {
            mouseIsPressed = true

        } else
        {
            images.forEach((image, index) =>
            {
                if (mouseIsInsideImage(image.x, image.y, image.w, image.h, mouseX, mouseY))
                {
                    offsetX = mouseX - image.x
                    offsetY = mouseY - image.y

                    currentImageIndex = index


                    document.getElementById("ia_transparency").value = image.transparencyLevel
                    document.getElementById("ia_invert").checked = image.isInverted

                    renderCanvas()
                }
            })
        }
    }
}

function mouseupHandler(e)
{
    mouseIsPressed = false
}

function mousewheelHandler(e)
{
    let canvasBoundingRectangle = canvas.getBoundingClientRect()
    mouseX = e.clientX - canvasBoundingRectangle.left
    mouseY = e.clientY - canvasBoundingRectangle.top
    unitChange = e.wheelDelta / 120  // unitChange will be equal to either +1 or -1
    if (mouseIsInsideImage(images[currentImageIndex].x, images[currentImageIndex].y, images[currentImageIndex].w, images[currentImageIndex].h, mouseX, mouseY))
    {

        images[currentImageIndex].x = images[currentImageIndex].x - unitChange
        images[currentImageIndex].y = images[currentImageIndex].y - unitChange
        images[currentImageIndex].w = images[currentImageIndex].w + 2 * unitChange
        images[currentImageIndex].x = images[currentImageIndex].x + 2 * unitChange
        renderCanvas()
    }

}
function moveHandler(e)
{
    if (scribbleEnabled && mouseIsPressed)
    {
        let canvasBoundingRectangle = canvas.getBoundingClientRect()
        mouseX = e.clientX - canvasBoundingRectangle.left
        mouseY = e.clientY - canvasBoundingRectangle.top
//        scribbleCanvasCtx.fillStyle = "red";
        scribbleCanvasCtx.beginPath();
        scribbleCanvasCtx.arc(mouseX, mouseY, radius, 0, Math.PI * 2);
        scribbleCanvasCtx.fill();
        scribbleCanvasCtx.closePath();
        renderCanvas()
    } else
    {
        if (e.which === 1)  // left mouse button
        {
            let canvasBoundingRectangle = canvas.getBoundingClientRect()
            mouseX = e.clientX - canvasBoundingRectangle.left
            mouseY = e.clientY - canvasBoundingRectangle.top

            images[currentImageIndex].x = mouseX - offsetX
            images[currentImageIndex].y = mouseY - offsetY



            renderCanvas()
        }
    }
}

function doConvolution(image)
{
    // do the convolution
    let totalConvolutionSum = 0
    for (let j = 0; j < 9; j++)
    {
        totalConvolutionSum += convolutionMatrix[j]
    }

    // get the image data (i.e. the pixels) from the double buffer
    imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.w, image.h)
    data = imageData.data

    // keep a copy of the original data, as we need to look at the pixels around the current pixel when doing the convolution
    originalImageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.w, image.h)
    originalData = originalImageData.data

    for (let i = 0; i < data.length; i += 4)
    {
        data[ i + 3] = 255 // alpha

        // apply the convolution for each of red, green and blue
        for (let rgbOffset = 0; rgbOffset < 3; rgbOffset++)
        {
            // get the pixel and its eight sourrounding pixel values from the original image 
            let convolutionPixels = [originalData[i + rgbOffset - image.w * 4 - 4],
                originalData[i + rgbOffset - image.w * 4],
                originalData[i + rgbOffset - image.w * 4 + 4],
                originalData[i + rgbOffset - 4],
                originalData[i + rgbOffset],
                originalData[i + rgbOffset + 4],
                originalData[i + rgbOffset + image.w * 4 - 4],
                originalData[i + rgbOffset + image.w * 4],
                originalData[i + rgbOffset + image.w * 4 + 4]]

            // do the convolution
            let convolvedPixel = 0
            for (let j = 0; j < 9; j++)
            {
                convolvedPixel += convolutionPixels[j] * convolutionMatrix[j]
            }

            // place the convolved pixel in the double buffer		 
            if (convolutionMatrix === embossConvolutionMatrix) // embossed is treated differently
            {
                data[i + rgbOffset] = convolvedPixel + 127
            } else
            {
                convolvedPixel /= totalConvolutionSum
                data[i + rgbOffset] = convolvedPixel
            }
        }
    }
    offscreenCanvasCtx.putImageData(imageData, image.x, image.y)



}

let maskImage = null;
function handleMaskImageUpload()
{
    let maskImageInput = document.getElementById("maskImageUpload");
    maskImage = new Image();
    maskImage.onload = function () {
        applyMask(maskImage);
        renderCanvas();
    };
    maskImage.src = URL.createObjectURL(maskImageInput.files[0]);
}
function imageHue() {
            let redAdjustment = parseInt(document.getElementById("ia_redSlider").value);
            let greenAdjustment = parseInt(document.getElementById("ia_greenSlider").value);
            let blueAdjustment = parseInt(document.getElementById("ia_blueSlider").value);

            // Apply adjustments to each pixel in the image
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                data[i] += redAdjustment;   // Red channel
                data[i + 1] += greenAdjustment; // Green channel
                data[i + 2] += blueAdjustment;  // Blue channel
            }

            ctx.putImageData(imageData, 0, 0);
            
        }
    

function addImage(filename)
{
    console.log(filename)
    let image = {
        filename: `images/${filename}`,
        x: 50,
        y: 50,
        w: 150,
        h: 100}

    image.img = new Image()
    image.img.src = image.filename
    image.rotation = 0
    image.isInverted = false
    image.isBlackAndWhite = false
    image.brightnessLevel = 0
    image.transparencyLevel = 1.0
    image.isSepia = false
    image.isThreshold = false
    image.isPosterise = false
    image.isEmbossed = false
    image.hasedgeDetection = false
    image.isBlur = false
    image.isSharpen = false

    images.push(image)
    renderCanvas()
}
function deleteImage() {
    //console.log("Deleted");
    let selectedIndex = currentImageIndex;
    images.splice(selectedIndex, 1);// Remove the image object at the selectedIndex from the images array

    renderCanvas();
}
function moveImageToFront() {
    console.log("move image to the front");
    let selectedIndex = currentImageIndex;
    let image = images.splice(selectedIndex, 1)[0];
    images.push(image);
    renderCanvas();
}
function moveImageToBack() {
    console.log("Move image to back");
    let selectedIndex = currentImageIndex;
    let image = images.splice(selectedIndex, 1)[0];
    images.unshift(image);
    renderCanvas();
}
//Text functions--------
var text = ""
function addText() {
    console.log("add");
    var textInput = document.getElementById('ia_textInput');
    text = textInput.value;


    renderCanvas();
}
function moveTextToTheBack() {
    console.log("move all images to the front");
    let imageArray = Object.values(images);

    // Reverse the array to move all images to the front
    imageArray.reverse();

    // Convert array back to object
    images = imageArray.reduce((acc, img, index) => {
        acc[index] = img;
        return acc;
    }, {});

    renderCanvas();
}
function deleteText() {
    console.log("delete");
    document.getElementById('ia_textInput').value = '';
    renderCanvas();
}
function changeTextColor() {
    textColor = document.getElementById("ia_textColorPicker").value
    renderCanvas();
}
function changeTextFont()
{
    textFont = document.getElementById("ia_fontSelector").value
    renderCanvas();
}
var scale = 1;
function changeTextScale() {
    var scaleInput = document.getElementById("scaleInput");
    scale = scaleInput.value;
    renderCanvas();
}


function eraseScribble() {
   
    scribbleCanvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderCanvas();
}

function setImage(image) {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ImageCanvasCtx.drawImage(image, 0, 0, canvas.width, canvas.height);

    renderCanvas();
}

function color(newColor) {
    
    console.log(scribbleCanvasCtx.fillStyle = newColor);
}

function radiusSize(newRadiusSize) {
    radius = newRadiusSize;
}

function enableScribble(checkbox) {
    scribbleEnabled = checkbox.checked;
}



Math.radians = function (degrees)
{
    return degrees * Math.PI / 180
}



