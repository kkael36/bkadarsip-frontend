import React from "react"

function DocumentScanner({ onCrop }) {
  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      // Langsung kirim hasil filenya (base64) ke fungsi onCrop
      onCrop(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={styles.container}>
      <input 
        type="file" 
        onChange={handleFile} 
        accept="image/*"
      />
    </div>
  )
}

const styles = {
  container: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
}

export default DocumentScanner