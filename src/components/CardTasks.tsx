"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";

export default function CardTasks({ cardId }: { cardId: string }) {
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchTasks = async () => {
        setIsLoading(true);
        const res = await fetch(`/api/cards/${cardId}/tasks`);
        if (res.ok) {
            setTasks(await res.json());
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, [cardId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        setIsSubmitting(true);
        setError("");

        const payload = {
            title,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        };

        const res = await fetch(`/api/cards/${cardId}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setIsSubmitting(false);
        if (res.ok) {
            setTitle("");
            setDueDate("");
            fetchTasks();
        } else {
            const err = await res.json();
            setError(err.error || "Failed to create task");
        }
    };

    const toggleComplete = async (taskId: string, currentCompleted: boolean) => {
        const res = await fetch(`/api/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !currentCompleted })
        });
        if (res.ok) fetchTasks();
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm("Delete this task?")) return;
        const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
        if (res.ok) fetchTasks();
    };

    const pendingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>To-Do List & Reminders</h2>

            {/* Add Task Form */}
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '2rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr) auto', gap: '1rem', alignItems: 'end' }}>

                    <div>
                        <label>Task / Reminder *</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Cancel card before Aug 10" />
                    </div>

                    <div>
                        <label>Due Date</label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </div>

                    <div>
                        <button type="submit" className="btn-primary" disabled={isSubmitting || !title}>
                            {isSubmitting ? "Adding..." : "Add"}
                        </button>
                    </div>
                </form>
                {error && <div className="text-danger mt-2">{error}</div>}
            </div>

            {/* Task List */}
            {isLoading ? (
                <p className="text-muted">Loading tasks...</p>
            ) : tasks.length === 0 ? (
                <p className="text-muted">No tasks created yet.</p>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {pendingTasks.map(task => (
                            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleComplete(task.id, task.completed)}
                                        style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: '1rem' }}>{task.title}</div>
                                        {task.dueDate && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--danger-color)', marginTop: '0.2rem' }}>
                                                Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button type="button" onClick={() => handleDelete(task.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'transparent', color: 'var(--danger-color)', border: 'none' }}>
                                    Delete
                                </button>
                            </div>
                        ))}

                        {completedTasks.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</h3>
                                {completedTasks.map(task => (
                                    <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', opacity: 0.6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={task.completed}
                                                onChange={() => toggleComplete(task.id, task.completed)}
                                                style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                                            />
                                            <div style={{ textDecoration: 'line-through' }}>
                                                {task.title}
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => handleDelete(task.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'transparent', color: 'var(--danger-color)', border: 'none' }}>
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
