import { useState, useRef } from 'react';
import * as XLSX from 'xlsx-js-style'; 
import api from '../services/api';

export default function ImportBoxExcel({ onRefresh, setAlert }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();

        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

                if (rawData.length < 2) throw new Error("File Excel kosong!");

                // 🔥 VALIDASI HEADER BOX
                const header = rawData[0]; 
                const expectedHeaders = ["No", "Nomor Box", "Tahun"];
                const isHeaderValid = expectedHeaders.every((h, i) => 
                    String(header[i] || "").toLowerCase().includes(h.toLowerCase())
                );

                if (!isHeaderValid) {
                    throw new Error("Format Kolom SALAH! Gunakan template dari hasil Export Box.");
                }

                const rows = rawData.slice(1); 

                const formattedData = rows.map((row) => {
                    if (!row[1] || String(row[1]).trim() === "" || row[1] === "-") return null; 

                    const val = (v) => (v === "-" || v === undefined || v === null) ? null : String(v).trim();

                    return {
                        nomor_box: val(row[1]),
                        tahun: val(row[2]),
                        kode_klasifikasi: val(row[3]),
                        nama_rak: val(row[4]),
                        nomor_rak: val(row[5]),
                        keterangan: val(row[6])
                    };
                }).filter(item => item !== null);

                const response = await api.post('/boxes/import', { data: formattedData });
                
                if (onRefresh) onRefresh();
                if (setAlert) setAlert({ 
                    show: true, 
                    message: response.data.message || "Impor data box arsip berhasil diselesaikan.", 
                    type: "simpan" 
                });

            } catch (err) {
                console.error(err);
                if (setAlert) setAlert({ 
                    show: true, 
                    message: err.response?.data?.message || err.message || "Gagal impor data box arsip", 
                    type: "hapus" 
                });
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div className="inline-block">
            <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleImport} />
            <button
                disabled={uploading}
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
                {uploading ? (
                    <><i className="bi bi-arrow-repeat animate-spin text-base"></i> <span>Proses...</span></>
                ) : (
                    <><i className="bi bi-file-earmark-arrow-up-fill text-base"></i> <span>Import</span></>
                )}
            </button>
        </div>
    );
}