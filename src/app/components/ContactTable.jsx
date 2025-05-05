import React from "react";

function TableHeader() {
  return (
    <thead className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wider">
      <tr>
        <th className="px-6 py-3 border-b border-gray-200">ID</th>
        <th className="px-6 py-3 border-b border-gray-200">Name</th>
        <th className="px-6 py-3 border-b border-gray-200">LI URL</th>
        <th className="px-6 py-3 border-b border-gray-200">Company</th>
        <th className="px-6 py-3 border-b border-gray-200">Job Title</th>
        <th className="px-6 py-3 border-b border-gray-200">Portfolio</th>
        <th className="px-6 py-3 border-b border-gray-200">Message Sent</th>
        <th className="px-6 py-3 border-b border-gray-200">Responded</th>
        <th className="px-6 py-3 border-b border-gray-200">Referral</th>
        <th className="px-6 py-3 border-b border-gray-200">Last Interaction Date</th>
        <th className="px-6 py-3 border-b border-gray-200">Interaction Type</th>
        <th className="px-6 py-3 border-b border-gray-200">Notes</th>
      </tr>
    </thead>
  );
}

function ContactRow({ contact }) {
  return (
    <tr className="bg-white even:bg-blue-50 hover:bg-gray-100 transition">
      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">{contact.id}</td>
      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">{contact.name}</td>
      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">{contact.li_url}</td>
      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">{contact.company}</td>
      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">{contact.job_title}</td>
      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">{contact.portfolio_url}</td>
      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${contact.initial_message_sent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {contact.initial_message_sent ? "Yes" : "No"}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${contact.responded ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {contact.responded ? "Responded" : "No Response"}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${contact.referral_offered ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {contact.referral_offered ? "Yes" : "No"}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">{contact.last_interaction_date}</td>
      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">{contact.interaction_type}</td>
      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">{contact.notes}</td>
    </tr>
  );
}

export default function ContactTable({ contacts }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg shadow">
      <table className="min-w-full table-auto border-collapse text-left bg-white shadow-md rounded-lg overflow-hidden">
        <TableHeader />
        <tbody className="divide-y divide-gray-200 bg-white even:bg-blue-50">
          {contacts.length === 0 ? (
            <tr>
              <td colSpan={12} className="text-center py-8 text-gray-500">
                No contacts yet. Maybe they're just shy 😢
              </td>
            </tr>
          ) : (
            contacts.map((contact) => (
              <ContactRow key={contact.id || contact.name} contact={contact} />
            )))
          }
        </tbody>
      </table>
    </div>
  );
}