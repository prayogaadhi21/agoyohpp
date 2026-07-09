'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const router = useRouter();

async function handleLogin(e) {
e.preventDefault();
setLoading(true);
setError('');

const { data, error: signInError } = await supabase.auth.signInWithPassword({
email,
password,
});

if (signInError) {
setError(signInError.message);
setLoading(false);
return;
}

const { data: profile, error: profileError } = await supabase
.from('users')
.select('role')
.eq('auth_user_id', data.user.id)
.single();

setLoading(false);

if (profileError || !profile) {
setError('Akun ditemukan tapi profil belum terdaftar di sistem.');
return;
}

if (profile.role === 'admin') router.push('/admin');
else if (profile.role === 'gudang') router.push('/gudang');
else if (profile.role === 'kasir') router.push('/kasir');
else if (profile.role === 'staff') router.push('/staff');
else router.push('/');
}

return (
<main style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
<h1>Login Agoyohpp</h1>
<form onSubmit={handleLogin}>
<div style={{ marginBottom: 12 }}>
<label>Email</label>
<input
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
style={{ width: '100%', padding: 8 }}
/>
</div>
<div style={{ marginBottom: 12 }}>
<label>Password</label>
<input
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
style={{ width: '100%', padding: 8 }}
/>
</div>
{error && <p style={{ color: 'red' }}>{error}</p>}
<button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
{loading ? 'Memproses...' : 'Login'}
</button>
</form>
</main>
);
}
