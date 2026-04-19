function ArsipForm({form,setForm}){

function handleChange(e){

const {name,value} = e.target

setForm(prev=>({
...prev,
[name]:value
}))

}

return(

<div className="formCard">

<h3>Data Arsip</h3>

<div className="grid">

<input
placeholder="Kode Klas"
name="kode_klas"
value={form.kode_klas}
onChange={handleChange}
/>

<input
placeholder="Nomor Surat"
name="no_surat"
value={form.no_surat}
onChange={handleChange}
/>

<input
placeholder="Tahun"
name="tahun"
value={form.tahun}
onChange={handleChange}
/>

<input
placeholder="Nominal"
name="nominal"
value={form.nominal}
onChange={handleChange}
/>

</div>

<textarea
placeholder="Keperluan"
name="keperluan"
value={form.keperluan}
onChange={handleChange}
/>

</div>

)

}

export default ArsipForm