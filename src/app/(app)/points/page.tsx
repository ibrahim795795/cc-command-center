"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";

export default function PointsPage() {
    const [points, setPoints] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState("");
    const [formData, setFormData] = useState({
        program: "",
        balance: "",
        notes: ""
    });

    const fetchPoints = async () => {
        setIsLoading(true);
        const res = await fetch("/api/points");
        if (res.ok) setPoints(await res.json());
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPoints();
    }, []);

    const handleEdit = (p: any) => {
        setIsEditing(true);
        setEditId(p.id);
        setFormData({
            program: p.program,
            balance: p.balance.toString(),
            notes: p.notes || ""
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditId("");
        setFormData({ program: "", balance: "", notes: "" });
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.program || !formData.balance) return;

        const url = isEditing ? `/api/points/${editId}` : "/api/points";
        const method = isEditing ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            handleCancel();
            fetchPoints();
        } else {
            const err = await res.json();
            alert(err.error || "Failed to save points");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this program?")) return;
        const res = await fetch(`/api/points/${id}`, { method: "DELETE" });
        if (res.ok) fetchPoints();
    };

    const totalPoints = points.reduce((acc, curr) => acc + curr.balance, 0);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Points Balances</h1>
                {!isEditing && <button className="btn-primary" onClick={() => setIsEditing(true)}>Add Program</button>}
            </div>

            {!isEditing && points.length > 0 && (
                <div className="card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-color)', border: '2px solid var(--accent-color)' }}>
                    <div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Combined Points</span>
                        <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--accent-color)', fontWeight: 800 }}>{totalPoints.toLocaleString()}</h2>
                    </div>
                </div>
            )}

            {isEditing && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{editId ? "Edit Program" : "Add Program"}</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label>Program Name *</label>
                            <input name="program" value={formData.program} onChange={handleChange} required placeholder="e.g. Amex MR, Chase UR, Aeroplan" />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label>Current Balance *</label>
                            <input name="balance" type="number" value={formData.balance} onChange={handleChange} required />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label>Notes</label>
                            <input name="notes" value={formData.notes} onChange={handleChange} placeholder="Any details..." />
                        </div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary">Save Balance</button>
                            <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading && !isEditing ? (
                <p className="text-muted">Loading points...</p>
            ) : !isEditing && points.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <p className="text-muted">No points tracked yet.</p>
                </div>
            ) : !isEditing && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {points.map(p => (
                        <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{p.program}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', border: 'none' }} onClick={() => handleEdit(p)}>Edit</button>
                                </div>
                            </div>

                            <div style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--accent-color)', marginBottom: '0.5rem' }}>
                                {p.balance.toLocaleString()}
                            </div>

                            {p.notes && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{p.notes}</p>}

                            <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Updated {format(new Date(p.lastUpdated), 'MMM d, yyyy')}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
