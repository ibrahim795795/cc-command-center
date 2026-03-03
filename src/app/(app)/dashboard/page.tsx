"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isLoaded, userId } = useAuth();

    // Widget State
    const [activeWidgets, setActiveWidgets] = useState<string[]>(['points-distribution', 'upcoming-fees']);
    const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

    useEffect(() => {
        if (!isLoaded) return;
        if (!userId) {
            setData(null);
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            try {
                const [cardsRes, pointsRes, timelineRes] = await Promise.all([
                    fetch("/api/cards"),
                    fetch("/api/points"),
                    fetch("/api/timeline"),
                ]);

                if (!cardsRes.ok || !pointsRes.ok || !timelineRes.ok) throw new Error("Failed to fetch");

                const cards = await cardsRes.json();
                const points = await pointsRes.json();
                const timeline = await timelineRes.json();

                setData({ cards, points, timeline });
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [isLoaded, userId]);

    if (!isLoaded || isLoading) return <div className="p-4">Loading Dashboard...</div>;
    if (!userId) return <div className="p-4">Please log in to view the dashboard.</div>;
    if (!data) return <div className="p-4">Failed to load dashboard.</div>;

    // Process data for charts
    const totalPoints = data.points.reduce((sum: number, p: any) => sum + p.balance, 0);
    const totalLimits = data.cards.reduce((sum: number, c: any) => sum + (c.creditLimit || 0), 0);
    const activeCards = data.cards.length;

    const upcomingFeesData = data.timeline
        .filter((t: any) => t.type === "Annual Fee")
        .slice(0, 5);

    // Total Fee Spend Data (grouped by bank)
    const feesByIssuer = data.cards.reduce((acc: any, card: any) => {
        if (!card.annualFeeAmount && !card.negotiatedNewFeeAmount) return acc;
        if (card.annualFeeWaived) return acc;
        const issuer = card.issuer || 'Unknown';
        const fee = card.annualFeeNegotiated ? card.negotiatedNewFeeAmount : card.annualFeeAmount;
        acc[issuer] = (acc[issuer] || 0) + fee;
        return acc;
    }, {});
    const totalFeeSpendData = Object.keys(feesByIssuer).map(key => ({ issuer: key, amount: feesByIssuer[key] }));

    // Credit Limits By Bank
    const limitsByIssuer = data.cards.reduce((acc: any, card: any) => {
        if (!card.creditLimit) return acc;
        const issuer = card.issuer || 'Unknown';
        acc[issuer] = (acc[issuer] || 0) + card.creditLimit;
        return acc;
    }, {});
    const limitsByIssuerData = Object.keys(limitsByIssuer).map(key => ({ issuer: key, limits: limitsByIssuer[key] }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    async function handleSeedData() {
        setIsLoading(true);
        try {
            await fetch('/api/seed', { method: 'POST' });
            window.location.reload();
        } catch {
            setIsLoading(false);
        }
    }

    if (activeCards === 0) {
        return (
            <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
                <h1 className="text-3xl font-bold mb-4">Welcome to Your Command Center!</h1>
                <p className="text-muted mb-8 max-w-[500px]">You are securely authenticated. Since this is a new account, your dashboard is empty. You can either upload your Master PDF to parse your real cards, or click below to inject sample dummy data right away.</p>
                <button className="btn-primary flex items-center gap-2" onClick={handleSeedData}>
                    🚀 Inject Sample Dummy Data
                </button>
            </div>
        );
    }

    const availableWidgets = [
        { id: 'points-distribution', name: 'Points Distribution' },
        { id: 'upcoming-fees', name: 'Upcoming Fees (Timeline)' },
        { id: 'total-fee-spend', name: 'Total Fee Spend by Bank' },
        { id: 'limits-by-bank', name: 'Credit Limits by Bank' }
    ];

    const toggleWidget = (id: string) => {
        if (activeWidgets.includes(id)) {
            setActiveWidgets(activeWidgets.filter(w => w !== id));
        } else {
            setActiveWidgets([...activeWidgets, id]);
        }
    };

    return (
        <div className="p-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="text-2xl font-bold">Analytics Command Center</h1>
                <button onClick={() => setIsWidgetModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>+</span> Custom Analytics
                </button>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ borderTop: '4px solid var(--accent-color)' }}>
                    <h3 className="text-muted uppercase text-xs font-bold tracking-wider mb-2">Total Points</h3>
                    <p className="text-3xl font-bold">{totalPoints.toLocaleString()}</p>
                </div>
                <div className="card" style={{ borderTop: '4px solid #0088FE' }}>
                    <h3 className="text-muted uppercase text-xs font-bold tracking-wider mb-2">Active Cards</h3>
                    <p className="text-3xl font-bold">{activeCards}</p>
                </div>
                <div className="card" style={{ borderTop: '4px solid #00C49F' }}>
                    <h3 className="text-muted uppercase text-xs font-bold tracking-wider mb-2">Total Credit Limit</h3>
                    <p className="text-3xl font-bold">${totalLimits.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {activeWidgets.includes('points-distribution') && (
                    <div className="card relative">
                        <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                            Points Distribution
                            <button onClick={() => toggleWidget('points-distribution')} className="text-muted hover:text-danger-color text-sm">✕</button>
                        </h2>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={data.points} dataKey="balance" nameKey="program" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                                        {data.points.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => (value || 0).toLocaleString()} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {activeWidgets.includes('upcoming-fees') && (
                    <div className="card relative">
                        <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                            Upcoming Fees (Next 5)
                            <button onClick={() => toggleWidget('upcoming-fees')} className="text-muted hover:text-danger-color text-sm">✕</button>
                        </h2>
                        <div style={{ width: '100%', height: 300 }}>
                            {upcomingFeesData.length > 0 ? (
                                <ResponsiveContainer>
                                    <BarChart data={upcomingFeesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="cardName" tickFormatter={(name: any) => typeof name === 'string' ? name.substring(0, 10) + (name.length > 10 ? '...' : '') : name} />
                                        <YAxis />
                                        <Tooltip formatter={(value: any) => `$${value || 0}`} labelFormatter={(label) => `Card: ${label}`} />
                                        <Bar dataKey="amount" fill="#FF8042" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted items-center justify-center flex h-full">No upcoming fees found.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeWidgets.includes('total-fee-spend') && (
                    <div className="card relative">
                        <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                            Total Fee Spend by Bank
                            <button onClick={() => toggleWidget('total-fee-spend')} className="text-muted hover:text-danger-color text-sm">✕</button>
                        </h2>
                        <div style={{ width: '100%', height: 300 }}>
                            {totalFeeSpendData.length > 0 ? (
                                <ResponsiveContainer>
                                    <BarChart data={totalFeeSpendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="issuer" />
                                        <YAxis />
                                        <Tooltip formatter={(value: any) => `$${value || 0}`} />
                                        <Bar dataKey="amount" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted items-center justify-center flex h-full">No fees found.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeWidgets.includes('limits-by-bank') && (
                    <div className="card relative">
                        <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                            Credit Limits by Bank
                            <button onClick={() => toggleWidget('limits-by-bank')} className="text-muted hover:text-danger-color text-sm">✕</button>
                        </h2>
                        <div style={{ width: '100%', height: 300 }}>
                            {limitsByIssuerData.length > 0 ? (
                                <ResponsiveContainer>
                                    <BarChart data={limitsByIssuerData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis type="number" />
                                        <YAxis dataKey="issuer" type="category" width={80} />
                                        <Tooltip formatter={(value: any) => `$${(value || 0).toLocaleString()}`} />
                                        <Bar dataKey="limits" fill="#8884d8" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted items-center justify-center flex h-full">No credit limits found.</p>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* Configurator Modal */}
            {isWidgetModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem', padding: '2rem' }}>
                        <h2 className="text-xl font-bold mb-4">Add/Remove Analytics</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {availableWidgets.map(widget => (
                                <label key={widget.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                                    <input
                                        type="checkbox"
                                        checked={activeWidgets.includes(widget.id)}
                                        onChange={() => toggleWidget(widget.id)}
                                        style={{ width: '1.2rem', height: '1.2rem' }}
                                    />
                                    <span style={{ fontWeight: 500 }}>{widget.name}</span>
                                </label>
                            ))}
                        </div>
                        <button className="btn-primary w-full" onClick={() => setIsWidgetModalOpen(false)}>Done</button>
                    </div>
                </div>
            )}
        </div>
    );
}
