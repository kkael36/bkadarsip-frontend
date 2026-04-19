import { useState, useEffect } from 'react';
import api from '../services/api';
import DenahArsip from '../components/DenahArsip';

export default function Denah() {
    const [boxes, setBoxes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchBoxes();
    }, []);

    const fetchBoxes = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/boxes');
            setBoxes(response.data);
        } catch (err) {
            console.error("Gagal memuat data box:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <div className="space-y-6 animate-in fade-in duration-500">
            {/* 🔥 Passing data boxes dari DB ke DenahArsip */}
            <DenahArsip boxes={boxes} />
        </div>
    );
}