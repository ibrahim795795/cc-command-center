"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cards").then(r => r.json()).then(data => {
      setCards(data);
      setIsLoading(false);
    });
  }, []);

  const downloadCSV = () => {
    if (cards.length === 0) return;
    const headers = ["Nickname", "Issuer", "Network", "Program", "Status", "Credit Limit", "Annual Fee", "Waived", "Next AF", "Opened", "5/24", "Credits", "Bonus", "Notes"];

    const rows = cards.map((c: any) => [
      `"${(c.nickname || '').replace(/"/g, '""')}"`,
      `"${(c.issuer || '').replace(/"/g, '""')}"`,
      `"${(c.network || '').replace(/"/g, '""')}"`,
      `"${(c.pointsProgram || '').replace(/"/g, '""')}"`,
      `"${(c.status || '').replace(/"/g, '""')}"`,
      c.creditLimit || '',
      c.annualFeeAmount || '',
      c.annualFeeWaived ? 'Yes' : 'No',
      c.nextAnnualFeeDate ? format(new Date(c.nextAnnualFeeDate), 'yyyy-MM-dd') : '',
      c.openedDate ? format(new Date(c.openedDate), 'yyyy-MM-dd') : '',
      c.chase524Status ? 'Yes' : 'No',
      `"${(c.credits || '').replace(/"/g, '""')}"`,
      `"${(c.welcomeBonus || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WalletOS_Cards_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const syncAppleNotes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/adopt-cards", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully synced ${data.cardsUpdated} Apple Notes to your account!`);
        window.location.reload();
      } else {
        alert("Failed to sync notes.");
      }
    } catch (e) {
      alert("Error syncing.");
    }
    setIsLoading(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Credit Cards</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={syncAppleNotes} className="btn-secondary">⬇️ Sync Apple Notes</button>
          <button onClick={downloadCSV} className="btn-secondary" disabled={cards.length === 0}>Export CSV</button>
          <a href="/cards/new" className="btn-primary">Add Card</a>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted">Loading cards...</p>
      ) : cards.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>No cards added yet.</p>
          <a href="/cards/new" className="btn-primary">Add your first card</a>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Nickname</th>
                <th>Issuer</th>
                <th>Network</th>
                <th>Points Program</th>
                <th>Next AF Date</th>
                <th>AF Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card: any) => (
                <tr key={card.id}>
                  <td>
                    <a href={`/cards/${card.id}`} style={{ fontWeight: 500, color: 'var(--accent-color)' }}>
                      {card.nickname}
                    </a>
                  </td>
                  <td>{card.issuer || '-'}</td>
                  <td>{card.network || '-'}</td>
                  <td>{card.pointsProgram || '-'}</td>
                  <td>{card.nextAnnualFeeDate ? format(new Date(card.nextAnnualFeeDate), 'MMM d, yyyy') : '-'}</td>
                  <td>
                    {card.annualFeeWaived ? (
                      <span className="text-success">
                        Waived
                      </span>
                    ) : card.annualFeeNegotiated ? (
                      <span className="text-success">
                        ${card.negotiatedNewFeeAmount}
                      </span>
                    ) : (
                      card.annualFeeAmount !== null ? `$${card.annualFeeAmount}` : '-'
                    )}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      backgroundColor: card.status === 'Active' ? 'rgba(15, 123, 108, 0.1)' : 'rgba(0,0,0,0.05)',
                      color: card.status === 'Active' ? 'var(--success-color)' : 'var(--text-secondary)'
                    }}>
                      {card.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
