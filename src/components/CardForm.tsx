"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CardForm({ initialData = null, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nickname: "",
        issuer: "",
        network: "",
        pointsProgram: "",
        last4: "",
        annualFeeAmount: "",
        annualFeeWaived: false,
        annualFeeNegotiated: false,
        negotiatedSavingsAmount: "",
        negotiatedNewFeeAmount: "",
        nextAnnualFeeDate: "",
        statementCloseDate: "",
        paymentDueDate: "",
        creditLimit: "",
        status: "Active",
        retentionMethod: "",
        notes: "",
        openedDate: "",
        tradelineHistory: "",
        credits: "",
        welcomeBonus: "",
        chase524Status: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                annualFeeAmount: initialData.annualFeeAmount ?? "",
                negotiatedSavingsAmount: initialData.negotiatedSavingsAmount ?? "",
                negotiatedNewFeeAmount: initialData.negotiatedNewFeeAmount ?? "",
                nextAnnualFeeDate: initialData.nextAnnualFeeDate ? new Date(initialData.nextAnnualFeeDate).toISOString().split('T')[0] : "",
                openedDate: initialData.openedDate ? new Date(initialData.openedDate).toISOString().split('T')[0] : "",
                statementCloseDate: initialData.statementCloseDate ?? "",
                paymentDueDate: initialData.paymentDueDate ?? "",
                creditLimit: initialData.creditLimit ?? "",
                last4: initialData.last4 ?? "",
                issuer: initialData.issuer ?? "",
                network: initialData.network ?? "",
                pointsProgram: initialData.pointsProgram ?? "",
                retentionMethod: initialData.retentionMethod ?? "",
                notes: initialData.notes ?? "",
                tradelineHistory: initialData.tradelineHistory ?? "",
                credits: initialData.credits ?? "",
                welcomeBonus: initialData.welcomeBonus ?? "",
                chase524Status: initialData.chase524Status ?? false
            });
        }
    }, [initialData]);

    // Handle derived calculations for fees
    useEffect(() => {
        if (formData.annualFeeWaived) {
            if (formData.annualFeeNegotiated) {
                setFormData(prev => ({ ...prev, annualFeeNegotiated: false })); // Exclusivity
            }
            setFormData(prev => ({ ...prev, negotiatedNewFeeAmount: "0" }));
        } else if (formData.annualFeeNegotiated) {
            const og = parseFloat(formData.annualFeeAmount as string);
            const savings = parseFloat(formData.negotiatedSavingsAmount as string);
            if (!isNaN(og) && !isNaN(savings)) {
                setFormData(prev => ({ ...prev, negotiatedNewFeeAmount: (og - savings).toString() }));
            }
        }
    }, [formData.annualFeeWaived, formData.annualFeeNegotiated, formData.annualFeeAmount, formData.negotiatedSavingsAmount]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        if (!formData.nickname) {
            setError("Nickname is required");
            setIsSubmitting(false);
            return;
        }

        // Prepare payload (convert numbers)
        const payload = {
            ...formData,
            annualFeeAmount: formData.annualFeeAmount ? Number(formData.annualFeeAmount) : null,
            negotiatedSavingsAmount: formData.negotiatedSavingsAmount ? Number(formData.negotiatedSavingsAmount) : null,
            negotiatedNewFeeAmount: formData.negotiatedNewFeeAmount ? Number(formData.negotiatedNewFeeAmount) : null,
            statementCloseDate: formData.statementCloseDate ? Number(formData.statementCloseDate) : null,
            paymentDueDate: formData.paymentDueDate ? Number(formData.paymentDueDate) : null,
            creditLimit: formData.creditLimit ? Number(formData.creditLimit) : null,
            nextAnnualFeeDate: formData.nextAnnualFeeDate || null,
            openedDate: formData.openedDate || null,
            tradelineHistory: formData.tradelineHistory || null,
            credits: formData.credits || null,
            welcomeBonus: formData.welcomeBonus || null,
        };

        const url = isEdit ? `/api/cards/${initialData.id}` : "/api/cards";
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        setIsSubmitting(false);
        if (!res.ok) {
            const err = await res.json();
            setError(err.error || "Something went wrong");
        } else {
            router.push("/");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this card?")) return;
        const res = await fetch(`/api/cards/${initialData.id}`, { method: "DELETE" });
        if (res.ok) router.push("/");
    };

    return (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label>Nickname *</label>
                        <input name="nickname" value={formData.nickname} onChange={handleChange} required placeholder="e.g. Amex Gold Personal" />
                    </div>

                    <div>
                        <label>Issuer / Bank</label>
                        <input name="issuer" value={formData.issuer} onChange={handleChange} placeholder="e.g. Amex" />
                    </div>

                    <div>
                        <label>Network</label>
                        <select name="network" value={formData.network} onChange={handleChange}>
                            <option value="">Select Network...</option>
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                            <option value="Amex">Amex</option>
                            <option value="Discover">Discover</option>
                        </select>
                    </div>

                    <div>
                        <label>Points Program</label>
                        <input name="pointsProgram" value={formData.pointsProgram} onChange={handleChange} placeholder="e.g. MR, UR, Aeroplan" />
                    </div>

                    <div>
                        <label>Last 4 Digits</label>
                        <input name="last4" value={formData.last4} onChange={handleChange} maxLength={4} placeholder="1234" />
                    </div>

                    <div>
                        <label>Credit Limit ($)</label>
                        <input name="creditLimit" type="number" step="0.01" value={formData.creditLimit} onChange={handleChange} placeholder="e.g. 10000" />
                    </div>

                    <div>
                        <label>Date Opened</label>
                        <input name="openedDate" type="date" value={formData.openedDate} onChange={handleChange} />
                    </div>

                    <div>
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="Active">Active</option>
                            <option value="Product Changed">Product Changed</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2', marginTop: '0.5rem' }}>
                        <input name="chase524Status" type="checkbox" checked={formData.chase524Status} onChange={handleChange} style={{ width: 'auto' }} />
                        <label style={{ margin: 0 }}>Counts towards Chase 5/24 Status</label>
                    </div>

                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Welcome & Benefits</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label>Welcome Bonus</label>
                        <input name="welcomeBonus" value={formData.welcomeBonus} onChange={handleChange} placeholder="e.g. 150k MR for $6k spend" />
                    </div>

                    <div>
                        <label>Annual Credits</label>
                        <input name="credits" value={formData.credits} onChange={handleChange} placeholder="e.g. $200 airline, $200 hotel" />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label>Tradeline / Upgrade History</label>
                        <input name="tradelineHistory" value={formData.tradelineHistory} onChange={handleChange} placeholder="e.g. Gold -> Plat -> Closed" />
                    </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Fees & Dates</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label>Original Annual Fee ($)</label>
                        <input name="annualFeeAmount" type="number" step="0.01" value={formData.annualFeeAmount} onChange={handleChange} placeholder="e.g. 699" />
                    </div>

                    <div>
                        <label>Next Annual Fee Date</label>
                        <input name="nextAnnualFeeDate" type="date" value={formData.nextAnnualFeeDate} onChange={handleChange} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input name="annualFeeWaived" type="checkbox" checked={formData.annualFeeWaived} onChange={handleChange} style={{ width: 'auto' }} />
                        <label style={{ margin: 0 }}>Fee Waived Entirely</label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input name="annualFeeNegotiated" type="checkbox" checked={formData.annualFeeNegotiated} onChange={handleChange} disabled={formData.annualFeeWaived} style={{ width: 'auto' }} />
                        <label style={{ margin: 0, color: formData.annualFeeWaived ? 'var(--text-secondary)' : 'var(--text-primary)' }}>Fee Negotiated (Partial savings)</label>
                    </div>

                    {formData.annualFeeNegotiated && (
                        <>
                            <div>
                                <label>Negotiated Savings ($)</label>
                                <input name="negotiatedSavingsAmount" type="number" step="0.01" value={formData.negotiatedSavingsAmount} onChange={handleChange} />
                            </div>
                            <div>
                                <label>New Fee Amount ($)</label>
                                <input name="negotiatedNewFeeAmount" type="number" step="0.01" value={formData.negotiatedNewFeeAmount} onChange={handleChange} readOnly style={{ backgroundColor: 'var(--bg-secondary)' }} />
                            </div>
                            <div>
                                <label>Retention Method</label>
                                <select name="retentionMethod" value={formData.retentionMethod} onChange={handleChange}>
                                    <option value="">Select...</option>
                                    <option value="Retention Offer">Retention Offer</option>
                                    <option value="Product Change">Product Change</option>
                                    <option value="Promo">Promo</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </>
                    )}

                    {formData.annualFeeWaived && (
                        <div>
                            <label>New Fee Amount ($)</label>
                            <input value="0" readOnly style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--success-color)', fontWeight: 600 }} />
                        </div>
                    )}
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Billing cycle</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label>Statement Close Date (Day of Month)</label>
                        <input name="statementCloseDate" type="number" min="1" max="31" value={formData.statementCloseDate} onChange={handleChange} placeholder="e.g. 15" />
                    </div>
                    <div>
                        <label>Payment Due Date (Day of Month)</label>
                        <input name="paymentDueDate" type="number" min="1" max="31" value={formData.paymentDueDate} onChange={handleChange} placeholder="e.g. 5" />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label>Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Add any details about this card..."></textarea>
                </div>

                {error && <p className="text-danger" style={{ marginBottom: '1rem' }}>{error}</p>}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <button type="button" className="btn-secondary" onClick={() => router.push("/")} style={{ marginRight: '0.5rem' }}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Card"}
                        </button>
                    </div>

                    {isEdit && (
                        <button type="button" className="btn-danger" onClick={handleDelete}>Delete</button>
                    )}
                </div>
            </form>
        </div>
    );
}
