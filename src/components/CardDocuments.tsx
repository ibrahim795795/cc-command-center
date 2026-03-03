"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";

export default function CardDocuments({ cardId }: { cardId: string }) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Upload State
    const [file, setFile] = useState<File | null>(null);
    const [tag, setTag] = useState("Statement");
    const [statementMonthYear, setStatementMonthYear] = useState("");
    const [notes, setNotes] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const fetchDocuments = async () => {
        setIsLoading(true);
        const res = await fetch(`/api/cards/${cardId}/documents`);
        if (res.ok) {
            setDocuments(await res.json());
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchDocuments();
    }, [cardId]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        setUploadError("");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("tag", tag);
        formData.append("notes", notes);
        if (tag === "Statement") {
            formData.append("statementMonthYear", statementMonthYear);
        }

        const res = await fetch(`/api/cards/${cardId}/documents`, {
            method: "POST",
            body: formData,
        });

        setIsUploading(false);
        if (res.ok) {
            // Reset form
            setFile(null);
            setNotes("");
            setStatementMonthYear("");
            // Refresh list
            fetchDocuments();
        } else {
            const err = await res.json();
            setUploadError(err.error || "Upload failed");
        }
    };

    const handleDelete = async (docId: string) => {
        if (!confirm("Delete this document?")) return;
        const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
        if (res.ok) {
            fetchDocuments();
        }
    };

    const filteredDocs = documents.filter(doc => {
        const search = searchTerm.toLowerCase();
        return doc.fileName.toLowerCase().includes(search) ||
            (doc.tag && doc.tag.toLowerCase().includes(search));
    });

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Documents</h2>

            {/* Upload Form */}
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 500 }}>Upload New Document</h3>
                <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label>File *</label>
                        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required style={{ background: 'transparent', border: 'none', padding: 0 }} />
                    </div>

                    <div>
                        <label>Tag</label>
                        <select value={tag} onChange={(e) => setTag(e.target.value)}>
                            <option value="Statement">Statement</option>
                            <option value="Retention">Retention Offer</option>
                            <option value="Promo">Promo</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {tag === "Statement" && (
                        <div>
                            <label>Month/Year (e.g. 2023-11)</label>
                            <input type="month" value={statementMonthYear} onChange={(e) => setStatementMonthYear(e.target.value)} />
                        </div>
                    )}

                    <div style={{ gridColumn: 'span 2' }}>
                        <label>Notes</label>
                        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Brief description..." />
                    </div>

                    {uploadError && <div className="text-danger" style={{ gridColumn: 'span 2' }}>{uploadError}</div>}

                    <div style={{ gridColumn: 'span 2' }}>
                        <button type="submit" className="btn-primary" disabled={isUploading || !file}>
                            {isUploading ? "Uploading..." : "Upload Document"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Document List */}
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Attached Documents
                <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '250px', fontWeight: 'normal' }}
                />
            </h3>

            {isLoading ? (
                <p className="text-muted">Loading documents...</p>
            ) : filteredDocs.length === 0 ? (
                <p className="text-muted">No documents found.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Tag</th>
                                <th>Period</th>
                                <th>Date Uploaded</th>
                                <th>Notes</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocs.map(doc => (
                                <tr key={doc.id}>
                                    <td>
                                        <a href={doc.filePath} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', fontWeight: 500 }}>
                                            {doc.fileName}
                                        </a>
                                    </td>
                                    <td>
                                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                                            {doc.tag}
                                        </span>
                                    </td>
                                    <td>{doc.statementMonthYear || '-'}</td>
                                    <td>{format(new Date(doc.uploadDate), "MMM d, yyyy")}</td>
                                    <td>{doc.notes || '-'}</td>
                                    <td>
                                        <button type="button" onClick={() => handleDelete(doc.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'transparent', color: 'var(--danger-color)', border: 'none' }}>
                                            Delete
                                        </button>
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
