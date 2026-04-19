function OCRPreview({image,ocrText}){

return(

<div className="previewCard">

{image && (
<img
src={image}
style={{
width:"100%",
borderRadius:8
}}
/>
)}

{ocrText && (

<pre className="ocrBox">
{ocrText}
</pre>

)}

</div>

)

}

export default OCRPreview