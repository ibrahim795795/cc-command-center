"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CardForm from '@/components/CardForm';
import CardDocuments from '@/components/CardDocuments';
import CardTasks from '@/components/CardTasks';

export default function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const [card, setCard] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/cards/${id}`)
            .then(res => res.json())
            .then(data => {
                setCard(data);
                setIsLoading(false);
            });
    }, [id]);

    if (isLoading) return <p className="text-muted">Loading...</p>;
    if (!card || card.error) return <p className="text-danger">Card not found</p>;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Edit {card.nickname}</h1>
            </div>

            {/* For MVP, we pass the card into the edit form. Later we might want a View vs Edit mode. */}
            {/* For now, Edit Mode IS the view mode for simplicity. */}
            <CardForm initialData={card} isEdit={true} />

            <CardTasks cardId={card.id} />
            <CardDocuments cardId={card.id} />
        </div>
    );
}
