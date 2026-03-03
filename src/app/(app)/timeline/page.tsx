"use client";
import React, { useEffect, useState } from "react";
import { format, differenceInDays } from "date-fns";

import { useAuth } from "@clerk/nextjs";

export default function TimelinePage() {
    const { isLoaded, userId } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [daysFilter, setDaysFilter] = useState<number>(30); // 7, 30, 60, 90
    const [typeFilter, setTypeFilter] = useState("All");

    useEffect(() => {
        fetch("/api/timeline").then(res => res.json()).then(data => {
            setEvents(data);
            setIsLoading(false);
        });
    }, []);

    const now = new Date();

    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const diffDays = differenceInDays(eventDate, now);

        if (diffDays < 0 || diffDays > daysFilter) return false;
        if (typeFilter !== "All" && event.type !== typeFilter) return false;

        return true;
    });

    const handleCopyCalendarUrl = () => {
        if (!userId) return;
        const url = `${window.location.origin}/api/calendar/${userId}`;
        navigator.clipboard.writeText(url);
        alert("Calendar Feed URL copied to clipboard! Paste this into Apple Calendar or Google Calendar subscriptions.");
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Deadlines & Timeline</h1>
                {isLoaded && userId && (
                    <button onClick={handleCopyCalendarUrl} className="btn-secondary flex items-center gap-2">
                        📅 Copy Calendar Sync URL
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div>
                    <label>Timeframe</label>
                    <select value={daysFilter} onChange={(e) => setDaysFilter(Number(e.target.value))}>
                        <option value={7}>Next 7 days</option>
                        <option value={30}>Next 30 days</option>
                        <option value={60}>Next 60 days</option>
                        <option value={90}>Next 90 days</option>
                        <option value={365}>Next 1 year</option>
                    </select>
                </div>
                <div>
                    <label>Event Type</label>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="All">All Types</option>
                        <option value="Annual Fee">Annual Fee</option>
                        <option value="Statement Close">Statement Close</option>
                        <option value="Payment Due">Payment Due</option>
                        <option value="Min Spend Deadline">Min Spend</option>
                        <option value="Apply">Apply (Future Card)</option>
                        <option value="Task Reminder">Task Reminder</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <p className="text-muted">Loading timeline...</p>
            ) : filteredEvents.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <p className="text-muted">No upcoming events found for this filter.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0 }}>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Days Away</th>
                                    <th>Event Type</th>
                                    <th>Card</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEvents.map(event => {
                                    const eventDate = new Date(event.date);
                                    const diff = differenceInDays(eventDate, now);
                                    const isUrgent = diff <= 7;

                                    let typeColor = 'var(--text-secondary)';
                                    if (event.type === 'Payment Due' || event.type === 'Min Spend Deadline') typeColor = 'var(--danger-color)';
                                    if (event.type === 'Annual Fee') typeColor = 'var(--accent-color)';
                                    if (event.type === 'Apply') typeColor = 'var(--success-color)';

                                    return (
                                        <tr key={event.id}>
                                            <td style={{ fontWeight: 500 }}>{format(eventDate, 'MMM d, yyyy')}</td>
                                            <td>
                                                <span style={{
                                                    color: isUrgent ? 'var(--danger-color)' : 'inherit',
                                                    fontWeight: isUrgent ? 600 : 400
                                                }}>
                                                    {diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : `In ${diff} days`}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                                    color: typeColor,
                                                    fontWeight: 500
                                                }}>
                                                    {event.type}
                                                </span>
                                            </td>
                                            <td>
                                                <a href={`/cards/${event.cardId}`} style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>
                                                    {event.cardName}
                                                </a>
                                            </td>
                                            <td>
                                                {event.amount ? `$${event.amount}` : event.details ? event.details : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
