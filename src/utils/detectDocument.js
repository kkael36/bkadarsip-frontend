export async function detectDocumentCorners(image){

if(!window.cv){
console.log("opencv belum ready")
return null
}

const cv = window.cv

return new Promise(resolve=>{

const img = new Image()

img.onload = ()=>{

const canvas = document.createElement("canvas")
canvas.width = img.width
canvas.height = img.height

const ctx = canvas.getContext("2d")
ctx.drawImage(img,0,0)

const src = cv.imread(canvas)

const gray = new cv.Mat()
cv.cvtColor(src,gray,cv.COLOR_RGBA2GRAY)

const blur = new cv.Mat()
cv.GaussianBlur(gray,blur,new cv.Size(5,5),0)

const edges = new cv.Mat()
cv.Canny(blur,edges,75,200)

const contours = new cv.MatVector()
const hierarchy = new cv.Mat()

cv.findContours(
edges,
contours,
hierarchy,
cv.RETR_LIST,
cv.CHAIN_APPROX_SIMPLE
)

let biggest = null
let maxArea = 0

for(let i=0;i<contours.size();i++){

const cnt = contours.get(i)
const area = cv.contourArea(cnt)

if(area>maxArea){

const peri = cv.arcLength(cnt,true)
const approx = new cv.Mat()

cv.approxPolyDP(cnt,approx,0.02*peri,true)

if(approx.rows===4){

biggest = approx
maxArea = area

}

}

}

if(!biggest){
resolve(null)
return
}

const points=[]

for(let i=0;i<4;i++){

points.push({
x:biggest.intPtr(i,0)[0],
y:biggest.intPtr(i,0)[1]
})

}

resolve(points)

}

img.src=image

})

}