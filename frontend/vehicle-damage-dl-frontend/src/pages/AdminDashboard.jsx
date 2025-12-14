import React, { useEffect, useState } from "react";
import axios from "axios";
import { onAuthStateChanged, signOut, getIdTokenResult } from "firebase/auth";
import { auth } from "../../firebase";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [results, setResults] = useState([]);
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem("ADMIN_KEY") || "");
  const [loading, setLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [lastFetchStatus, setLastFetchStatus] = useState(null);
  const API_BASE = ""; // if backend is on same origin, leave blank; otherwise "http://localhost:5000"

  useEffect(() => {
    if (adminKey) {
      fetchAll();
    }
  }, [adminKey]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        try {
          const tokenRes = await getIdTokenResult(user);
          setIdToken(tokenRes.token);
        } catch (err) {
          console.warn("Failed to get ID token result", err);
          setIdToken(null);
        }
      } else {
        setFirebaseUser(null);
        setIdToken(null);
      }
    });
    return () => unsub();
  }, []);

  const headers = adminKey ? { "X-ADMIN-KEY": adminKey } : {};

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, u, r] = await Promise.all([
        axios.get(`${API_BASE}/admin/stats`, { headers }),
        axios.get(`${API_BASE}/admin/uploads`, { headers }),
        axios.get(`${API_BASE}/admin/results`, { headers })
      ]);
      setStats(s.data);
      setUploads(u.data.uploads || []);
      setResults(r.data.results || []);
      setLastFetchStatus({ ok: true, status: 200 });
    } catch (err) {
      console.error(err);
      setLastFetchStatus({ ok: false, status: err?.response?.status || 0, message: err?.message });
      alert("Failed to fetch admin data — check admin key and backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (folder, filename) => {
    if (!window.confirm(`Delete ${filename} from ${folder}?`)) return;
    try {
      await axios.post(`${API_BASE}/admin/delete`, { folder, filename }, { headers });
      alert("Deleted");
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const saveKey = () => {
    localStorage.setItem("ADMIN_KEY", adminKey);
    fetchAll();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="mb-4">
        <label className="block mb-1">Admin Key</label>
        <input value={adminKey} onChange={e=>setAdminKey(e.target.value)} className="border p-2 mr-2" />
        <button onClick={saveKey} className="px-3 py-1 border rounded">Save & Fetch</button>
      </div>

      <div className="mb-4 p-3 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Firebase Auth (Debug)</h2>
        {!firebaseUser ? (
          <div className="text-sm text-gray-600">Not logged in (no Firebase user)</div>
        ) : (
          <div className="text-sm">
            <div><strong>UID:</strong> {firebaseUser.uid} <button onClick={()=>navigator.clipboard.writeText(firebaseUser.uid)} className="ml-2 text-xs px-2 py-1 border rounded">Copy</button></div>
            <div><strong>Email:</strong> {firebaseUser.email || "-"}</div>
            <div><strong>Display:</strong> {firebaseUser.firstName || "-"}</div>
            <div><strong>Verified:</strong> {String(firebaseUser.emailVerified)}</div>
            <div><strong>Provider:</strong> {firebaseUser.providerId || "-"}</div>
            <div className="mt-2"><strong>Token Excerpt:</strong> {idToken ? idToken.slice(0,60) + "..." : "(not available)"}</div>
            <div className="mt-2 space-x-2">
              <button onClick={async ()=>{
                try {
                  const fresh = await firebaseUser.getIdToken(true);
                  setIdToken(fresh);
                  alert('Refreshed token');
                } catch(e){ console.error(e); alert('Token refresh failed'); }
              }} className="px-2 py-1 border rounded text-sm">Refresh Token</button>
              <button onClick={async ()=>{ await signOut(auth); alert('Signed out'); }} className="px-2 py-1 border rounded text-sm">Sign Out</button>
              <button onClick={()=>{ if(idToken) navigator.clipboard.writeText(idToken); }} className="px-2 py-1 border rounded text-sm">Copy Token</button>
            </div>
            <div className="mt-2 text-xs text-gray-500">Provider Data: {JSON.stringify(firebaseUser.providerData)}</div>
          </div>
        )}
      </div>

      {loading && <div>Loading...</div>}

      {stats && (
        <div className="mb-6">
          <h2 className="font-semibold">Stats</h2>
          <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}

      {lastFetchStatus && (
        <div className="mb-4 text-sm">
          <strong>Last Fetch:</strong> {lastFetchStatus.ok ? 'OK' : `Failed (${lastFetchStatus.status})`} {lastFetchStatus.message ? `- ${lastFetchStatus.message}` : ''}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Uploads ({uploads.length})</h3>
          <ul className="space-y-2">
            {uploads.map(u => (
              <li key={u.filename} className="flex items-center justify-between border p-2 rounded">
                <div>
                  <a href={u.url} target="_blank" rel="noreferrer" className="underline">{u.filename}</a>
                  <div className="text-sm text-gray-500">{u.modified_at} • {Math.round(u.size/1024)} KB</div>
                </div>
                <div className="space-x-2">
                  <button onClick={()=>deleteFile("uploads", u.filename)} className="px-2 py-1 border rounded">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Results ({results.length})</h3>
          <ul className="space-y-2">
            {results.map(r => (
              <li key={r.filename} className="flex items-center justify-between border p-2 rounded">
                <div>
                  <a href={r.url} target="_blank" rel="noreferrer" className="underline">{r.filename}</a>
                  <div className="text-sm text-gray-500">{r.modified_at} • {Math.round(r.size/1024)} KB</div>
                </div>
                <div className="space-x-2">
                  <button onClick={()=>deleteFile("results", r.filename)} className="px-2 py-1 border rounded">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
