import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ── DB → App transform ────────────────────────────────────────
function formatPrice(n) {
  return Number(n).toLocaleString('en-US');
}

async function fetchFromSupabase() {
  const [
    { data: buildings, error: bErr },
    { data: rooms,     error: rErr },
    { data: tenants,   error: tErr },
    { data: roommates, error: rmErr },
    { data: messages,  error: mErr },
    { data: payments,  error: pErr },
    { data: issues,    error: iErr },
    { data: staff,     error: sErr },
  ] = await Promise.all([
    supabase.from('buildings').select('*').order('id'),
    supabase.from('rooms').select('*').order('building_id').order('floor').order('room_number'),
    supabase.from('tenants').select('*'),
    supabase.from('roommates').select('*'),
    supabase.from('messages').select('*').eq('resolved', false),
    supabase.from('payments').select('*').order('month', { ascending: false }),
    supabase.from('issues').select('*').eq('resolved', false),
    supabase.from('staff').select('id, name'),
  ]);

  const firstErr = bErr || rErr || tErr || rmErr || mErr || pErr || iErr || sErr;
  if (firstErr) {
    console.error('[Supabase] fetch error:', firstErr.message);
    throw new Error(firstErr.message);
  }

  const staffMap = Object.fromEntries(staff.map(s => [s.id, s.name]));

  return buildings.map(b => {
    const bRooms  = rooms.filter(r => r.building_id === b.id);
    const floorMap = {};

    bRooms.forEach(r => {
      const fl = r.floor;
      if (!floorMap[fl]) floorMap[fl] = [];

      const tenant     = tenants.find(t => t.room_id === r.id);
      const rRoommates = tenant ? roommates.filter(rm => rm.tenant_id === tenant.id) : [];
      const rMessages  = messages.filter(m => m.room_id === r.id);
      const rPayments  = payments.filter(p => p.room_id === r.id);
      const rIssue     = issues.find(i => i.room_id === r.id);

      floorMap[fl].push({
        id:          r.room_number,
        dbId:        r.id,
        type:        r.type,
        area:        r.area_m2 ? `${r.area_m2}m²` : null,
        price:       formatPrice(r.price),
        status:      r.status,
        emptySince:  r.empty_since ?? null,
        residents:   tenant ? 1 + rRoommates.length : 0,
        tenant:      tenant?.name ?? null,
        tenantCccd:  tenant?.cccd ?? null,
        tenantDob:   tenant?.dob ?? null,
        phone:       tenant?.phone ?? null,
        sinceDate:   tenant?.since_date ?? null,
        roommates:   rRoommates.map(rm => ({ id: rm.id, name: rm.name, cccd: rm.cccd })),
        cccdImages:  tenant?.cccd_images ?? [],
        messages:    rMessages.map(m => ({ id: m.id, text: m.text, time: m.sent_at, resolved: m.resolved })),
        paymentHistory: rPayments.map(p => ({
          month: p.month, paid: p.paid,
          amount: p.amount ? formatPrice(p.amount) : null,
          paidAt: p.paid_at ?? null, method: p.method ?? null,
        })),
        currentIssue: rIssue ? { title: rIssue.title, reportedAt: rIssue.reported_at } : null,
      });
    });

    return {
      id:      b.id,
      name:    b.name,
      code:    b.code,
      address: b.address,
      staff:   staffMap[b.staff_id] ?? '',
      floors:  Object.keys(floorMap)
        .sort((a, z) => Number(a) - Number(z))
        .map(f => ({ floor: Number(f), rooms: floorMap[f] })),
    };
  });
}

// ── Context ───────────────────────────────────────────────────
const BuildingsContext = createContext(null);

export function BuildingsProvider({ children }) {
  const [buildings, setBuildings] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const channelRef    = useRef(null);
  const reloadVersion = useRef(0); // prevents stale reload from overwriting fresh data

  const reload = async () => {
    const myVersion = ++reloadVersion.current;
    try {
      const data = await fetchFromSupabase();
      if (myVersion === reloadVersion.current) {
        setBuildings(data);
        setError(null);
      }
    } catch (e) {
      if (myVersion === reloadVersion.current) {
        console.warn('[BuildingsContext] fetchFromSupabase error:', e?.message);
        setError(e?.message ?? 'Không thể kết nối Supabase');
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));

    const channel = supabase
      .channel('buildings-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'buildings' }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' },     reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tenants' },   reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' },  reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' },  reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' },    reload)
      .subscribe();

    channelRef.current = channel;
    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <BuildingsContext.Provider value={{ buildings, setBuildings, loading, error, reload }}>
      {children}
    </BuildingsContext.Provider>
  );
}

export function useBuildings() {
  const ctx = useContext(BuildingsContext);
  if (!ctx) throw new Error('useBuildings must be used within BuildingsProvider');
  return ctx;
}
