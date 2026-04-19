import { useState, useRef } from 'react';
import * as XLSX from 'xlsx-js-style'; 
import api from '../services/api';

export default function ImportExcel({ onRefresh, setAlert }) {
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

                if (rawData.length < 3) throw new Error("File Excel kosong atau format salah!");

                // 🔥 VALIDASI HEADER ARSIP
                const header = rawData[0]; 
                const expectedHeaders = ["No", "Kode Klas", "No Surat"];
                const isHeaderValid = expectedHeaders.every((h, i) => 
                    String(header[i] || "").toLowerCase().includes(h.toLowerCase())
                );

                if (!isHeaderValid) {
                    throw new Error("Format Kolom SALAH! Gunakan template dari hasil Export Arsip.");
                }

                const rows = rawData.slice(2); 

                const formattedData = rows.map((row) => {
                    if (!row[2] || String(row[2]) === "-") return null; 

                    const val = (v) => (v === "-" || v === undefined || v === null) ? null : String(v).trim();
                    const num = (v) => v ? String(v).replace(/[^0-9]/g, '') : 0;

                    return {
                        kode_klas: val(row[1]),
                        no_surat: val(row[2]),
                        keperluan: val(row[3]),
                        nominal: num(row[4]),
                        terlampir: val(row[5]),
                        unit_pencipta: val(row[6]),
                        tahun: val(row[7]),
                        jumlah: val(row[8]),
                        no_box_sementara: val(row[9]),
                        tingkat_pengembangan: val(row[10]),
                        no_box_permanen: val(row[11]),
                        kondisi: val(row[12]),
                        jra_aktif: num(row[13]),
                        jra_inaktif: num(row[14]),
                        nasib_akhir: val(row[15]),
                        rekomendasi: val(row[16]),
                        keterangan: val(row[17]),
                    };
                }).filter(item => item !== null);

                const response = await api.post('/arsip/import', { data: formattedData });
                
                if (onRefresh) onRefresh();
                if (setAlert) setAlert({ 
                    show: true, 
                    message: response.data.message || "Impor arsip SP2D berhasil diselesaikan.", 
                    type: "simpan" 
                });

            } catch (err) {
                console.error(err);
                if (setAlert) setAlert({ 
                    show: true, 
                    message: err.response?.data?.message || err.message || "Gagal impor arsip SP2D", 
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