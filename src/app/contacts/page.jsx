'use client';

import { useState, useEffect } from 'react';
import ContactTable from '../components/ContactTable';

const contacts = []

function SyncExtension() {
    
}

function UploadContacts() {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('contacts');
        if (saved) {
            setContacts(JSON.parse(saved));
        }
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();

        // For CSV: parse it into objects
        const rows = text.split('\n').slice(1); // skip headers
        const newContacts = rows
            .map(row => {
            const [name, email, company] = row.split(',');
            return { name: name?.trim(), email: email?.trim(), company: company?.trim() };
            })
            .filter(c => c.name); // remove empty lines

        const existingContacts = JSON.parse(localStorage.getItem('contacts')) || [];

        const mergedContacts = [...existingContacts];

        for (const newContact of newContacts) {
            const matchIndex = existingContacts.findIndex(
            c => c.email && c.email === newContact.email
            );

            if (matchIndex > -1) {
            // update contact if it differs
            const existing = existingContacts[matchIndex];
            if (
                existing.name !== newContact.name ||
                existing.company !== newContact.company
            ) {
                mergedContacts[matchIndex] = { ...existing, ...newContact };
            }
            } else {
            // new contact, add to list
            mergedContacts.push(newContact);
            }
        }

        setContacts(mergedContacts);
        localStorage.setItem('contacts', JSON.stringify(mergedContacts));
    };

    return (
        <div className="p-6 w-full mx-auto">
        <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="mb-4"
        />

        {contacts.length > 0 && (
            <div className="mt-4">
                <h2 className="text-xl font-bold mb-2">Preview:</h2>
                <ul className="space-y-2">
                    {contacts.map((c, i) => (
                    <li key={i} className="bg-white p-4 rounded shadow">
                        <strong>{c.name}</strong> — {c.company}
                    </li>
                    ))}
                </ul>
            </div>
        )}
        </div>
    );
}

export default function ContactsPage() {
  return (
    <main className="w-full mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">Your Contacts 💼</h1>
      <ContactTable contacts={contacts} />
      <UploadContacts />
    </main>
  );
}