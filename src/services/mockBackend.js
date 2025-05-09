const API_BASE = 'http://localhost:3001';

export const login = async credentials => {
	const res = await fetch(`${API_BASE}/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials),
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
};

export const register = async credentials => {
	const res = await fetch(`${API_BASE}/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials),
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
};

export const logout = async () => {
	const res = await fetch(`${API_BASE}/logout`, { method: 'POST' });
	if (!res.ok) throw new Error(await res.text());
	return res.json();
};

export const getUsers = async () => {
	const res = await fetch(`${API_BASE}/users`);
	if (!res.ok) throw new Error(await res.text());
	return res.json();
};

export const updateUser = async (id, updates) => {
	const res = await fetch(`${API_BASE}/users/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(updates),
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
};

export const getWorks = async () => {
	const res = await fetch(`${API_BASE}/works`);
	if (!res.ok) throw new Error(await res.text());
	return res.json();
};

export const addWork = async newWork => {
	const res = await fetch(`${API_BASE}/works`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(newWork),
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
};

export const deleteWork = async id => {
	const res = await fetch(`${API_BASE}/works/${id}`, { method: 'DELETE' });
	if (!res.ok) throw new Error(await res.text());
	return res.json();
};

export const updateWorkStatus = async (id, newStatus) => {
	const res = await fetch(`${API_BASE}/works/${id}/status`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ status: newStatus }),
	});
	console.log(newStatus);
	if (!res.ok) throw new Error(await res.text());
	return res.json();
};

export const updateWork = async (id, updates) => {
	const res = await fetch(`${API_BASE}/works/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(updates),
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
};

export const approveWork = async id => {
	const res = await fetch(`${API_BASE}/works/${id}/approve`, {
		method: 'PUT',
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
};
