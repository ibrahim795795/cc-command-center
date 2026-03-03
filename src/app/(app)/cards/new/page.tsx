"use client";
import React from 'react';
import CardForm from '@/components/CardForm';

export default function NewCardPage() {
    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Add New Card</h1>
            </div>
            <CardForm />
        </div>
    );
}
