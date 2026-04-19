export function perspectiveCrop(imageSrc,points){

return new Promise(resolve=>{

const cv = window.cv
const img = new Image()

img.onload = ()=>{

const canvas = document.createElement("canvas")
canvas.width = img.width
canvas.height = img.height

const ctx = canvas.getContext("2d")
ctx.drawImage(img,0,0)

const src = cv.imread(canvas)
const dst = new cv.Mat()

// ukuran gambar yang tampil di modal
const displayWidth = img.clientWidth || img.width
const displayHeight = img.clientHeight || img.height

// hitung scale
const scaleX = img.width / displayWidth
const scaleY = img.height / displayHeight

// convert titik ke koordinat asli
const scaledPoints = points.map(p=>({
x: p.x * scaleX,
y: p.y * scaleY
}))

const srcTri = cv.matFromArray(4,1,cv.CV_32FC2,[

scaledPoints[0].x,scaledPoints[0].y,
scaledPoints[1].x,scaledPoints[1].y,
scaledPoints[2].x,scaledPoints[2].y,
scaledPoints[3].x,scaledPoints[3].y

])

const width = 800
const height = 1000

const dstTri = cv.matFromArray(4,1,cv.CV_32FC2,[

0,0,
width,0,
width,height,
0,height

])

const M = cv.getPerspectiveTransform(srcTri,dstTri)

cv.warpPerspective(
src,
dst,
M,
new cv.Size(width,height),
cv.INTER_LINEAR,
cv.BORDER_CONSTANT,
new cv.Scalar()
)

const outCanvas = document.createElement("canvas")
cv.imshow(outCanvas,dst)

resolve(outCanvas.toDataURL())

}

img.src = imageSrc

})

}