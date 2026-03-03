"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";

export default function BonusesPage() {
    const [bonuses, setBonuses] = useState<any[]>([]);
    const [cards, setCards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState("");
    const [formData, setFormData] = useState({
        cardId: "",
        offerName: "",
        minSpendAmount: "",
        spendDeadlineDate: "",
        currentSpendProgress: "",
        bonusExpected: "",
        bonusPosted: false,
        postedDate: "",
        statusPipeline: "In progress"
    });

    const fetchData = async () => {
        setIsLoading(true);
        const [bRes, cRes] = await Promise.all([
            fetch("/api/bonuses"),
            fetch("/api/cards")
        ]);
        if (bRes.ok) setBonuses(await bRes.json());
        if (cRes.ok) setCards(await cRes.json());
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (bonus: any) => {
        setIsEditing(true);
        setEditId(bonus.id);
        setFormData({
            cardId: bonus.cardId,
            offerName: bonus.offerName,
            minSpendAmount: bonus.minSpendAmount ?? "",
            spendDeadlineDate: bonus.spendDeadlineDate ? new Date(bonus.spendDeadlineDate).toISOString().split('T')[0] : "",
            currentSpendProgress: bonus.currentSpendProgress ?? "0",
            bonusExpected: bonus.bonusExpected ?? "",
            bonusPosted: bonus.bonusPosted,
            postedDate: bonus.postedDate ? new Date(bonus.postedDate).toISOString().split('T')[0] : "",
            statusPipeline: bonus.statusPipeline
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditId("");
        setFormData({
            cardId: "", offerName: "", minSpendAmount: "", spendDeadlineDate: "",
            currentSpendProgress: "", bonusExpected: "", bonusPosted: false, postedDate: "", statusPipeline: "In progress"
        });
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.cardId || !formData.offerName) {
            alert("Card and Offer Name are required");
            return;
        }

        const payload = {
            ...formData,
            postedDate: formData.bonusPosted && !formData.postedDate ? new Date().toISOString() : formData.postedDate,
            statusPipeline: formData.bonusPosted ? "Posted" : formData.statusPipeline
        };

        const url = isEditing ? `/api/bonuses/${editId}` : "/api/bonuses";
        const method = isEditing ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            handleCancel();
            fetchData();
        } else {
            alert("Failed to save bonus");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this bonus track?")) return;
        const res = await fetch(`/api/bonuses/${id}`, { method: "DELETE" });
        if (res.ok) fetchData();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Churning & Bonuses</h1>
                {!isEditing && <button className="btn-primary" onClick={() => setIsEditing(true)}>Add Bonus</button>}
            </div>

            {isEditing && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{editId ? "Edit Bonus" : "New Bonus Tracker"}</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem' }}>

                        <div>
                            <label>Link to Card *</label>
                            <select name="cardId" value={formData.cardId} onChange={handleChange} required>
                                <option value="">Select a card...</option>
                                {cards.map(c => <option key={c.id} value={c.id}>{c.nickname}</option>)}
                            </select>
                        </div>

                        <div>
                            <label>Offer Name *</label>
                            <input name="offerName" value={formData.offerName} onChange={handleChange} required placeholder="e.g. 150k MR for $6k spend" />
                        </div>

                        <div>
                            <label>Min Spend Target ($)</label>
                            <input name="minSpendAmount" type="number" step="0.01" value={formData.minSpendAmount} onChange={handleChange} />
                        </div>

                        <div>
                            <label>Current Spend Progress ($)</label>
                            <input name="currentSpendProgress" type="number" step="0.01" value={formData.currentSpendProgress} onChange={handleChange} />
                        </div>

                        <div>
                            <label>Spend Deadline Date</label>
                            <input name="spendDeadlineDate" type="date" value={formData.spendDeadlineDate} onChange={handleChange} />
                        </div>

                        <div>
                            <label>Expected Bonus (Points)</label>
                            <input name="bonusExpected" type="number" value={formData.bonusExpected} onChange={handleChange} />
                        </div>

                        <div>
                            <label>Status Pipeline</label>
                            <select name="statusPipeline" value={formData.statusPipeline} onChange={handleChange}>
                                <option value="In progress">In progress</option>
                                <option value="Waiting to post">Waiting to post</option>
                                <option value="Posted">Posted</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                            <input name="bonusPosted" type="checkbox" checked={formData.bonusPosted} onChange={handleChange} style={{ width: 'auto' }} />
                            <label style={{ margin: 0 }}>Bonus Posted?</label>
                        </div>

                        {formData.bonusPosted && (
                            <div>
                                <label>Posted Date</label>
                                <input name="postedDate" type="date" value={formData.postedDate} onChange={handleChange} />
                            </div>
                        )}

                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary">Save Bonus</button>
                            <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading && !isEditing ? (
                <p className="text-muted">Loading bonuses...</p>
            ) : !isEditing && bonuses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <p className="text-muted">No bonuses tracked yet.</p>
                </div>
            ) : !isEditing && (
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Card</th>
                                <th>Offer Name</th>
                                <th>Progress</th>
                                <th>Deadline</th>
                                <th>Expected</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bonuses.map(bonus => {
                                const progressPct = bonus.minSpendAmount ? Math.min(100, (bonus.currentSpendProgress / bonus.minSpendAmount) * 100) : 0;
                                return (
                                    <tr key={bonus.id}>
                                        <td>
                                            <a href={`/cards/${bonus.cardId}`} style={{ color: 'var(--accent-color)', fontWeight: 500 }}>
                                                {bonus.card?.nickname}
                                            </a>
                                        </td>
                                        <td>{bonus.offerName}</td>
                                        <td>
                                            {bonus.minSpendAmount ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span style={{ fontSize: '0.8rem' }}>${bonus.currentSpendProgress} / ${bonus.minSpendAmount}</span>
                                                    <div style={{ width: '100px', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: progressPct >= 100 ? 'var(--success-color)' : 'var(--accent-color)' }}></div>
                                                    </div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td>{bonus.spendDeadlineDate ? format(new Date(bonus.spendDeadlineDate), 'MMM d, yyyy') : '-'}</td>
                                        <td>{bonus.bonusExpected ? bonus.bonusExpected.toLocaleString() : '-'}</td>
                                        <td>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                backgroundColor: bonus.bonusPosted ? 'rgba(15, 123, 108, 0.1)' : 'rgba(0,0,0,0.05)',
                                                color: bonus.bonusPosted ? 'var(--success-color)' : 'var(--text-secondary)'
                                            }}>
                                                {bonus.statusPipeline}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => handleEdit(bonus)}>Edit</button>
                                            <button className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDelete(bonus.id)}>Delete</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
