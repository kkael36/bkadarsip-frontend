import { useState, useEffect } from "react"
import PerspectiveCropper from "react-perspective-cropper"

function PerspectiveCropModal({ image, onClose, onCrop }) {

const [points,setPoints] = useState(null)
const [cropped,setCropped] = useState(null)
const [imgSize,setImgSize] = useState({width:0,height:0})

useEffect(()=>{

const img = new Image()
img.src = image

img.onload = ()=>{

setImgSize({
width: img.width,
height: img.height
})

}

},[image])

function handleChange(p){
setPoints(p)
}

function handleCrop(img){
setCropped(img)
}

function useCrop(){

if(!cropped) return

onCrop(cropped)
onClose()

}

return(

<div className="modal"> <div className="modalContent"> <h3>Crop Dokumen</h3> <div style={{ width:"100%", maxWidth:"800px", margin:"auto" }}>

<PerspectiveCropper image={image} onChange={handleChange} onCrop={handleCrop} width={imgSize.width} height={imgSize.height} lineColor="#00ff99" pointColor="#00ff99" />

</div> <div className="actions"> <button onClick={onClose}> Batal </button> <button onClick={useCrop}> Crop </button> </div> </div> </div>

)

}

export default PerspectiveCropModal