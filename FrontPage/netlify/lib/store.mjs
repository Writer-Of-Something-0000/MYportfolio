// Tiny persistence layer for contact-form submissions, backed by Netlify Blobs.
// Zero-config on deployed Netlify functions. Contact volume is low, so we keep
// the whole list under one key and assign sequential ids (#1, #2, #3 …).

import { getStore } from '@netlify/blobs';

const KEY = 'list';

const store = () => getStore('portfolio-contacts');

export async function getContacts() {
  const list = await store().get(KEY, { type: 'json' });
  return Array.isArray(list) ? list : [];
}

// Appends a contact, assigns the next sequential id, and returns the saved entry.
export async function saveContact({ name, email, message, analysis }) {
  const list = await getContacts();
  const id = (list[list.length - 1]?.id || 0) + 1;
  const entry = {
    id,
    name,
    email,
    message,
    analysis: analysis || '',
    date: new Date().toISOString(),
  };
  list.push(entry);
  await store().setJSON(KEY, list);
  return entry;
}

export async function getContactById(id) {
  const list = await getContacts();
  return list.find((c) => c.id === id) || null;
}
