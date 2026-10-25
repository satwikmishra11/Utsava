import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { signSession, verifySession } from '@/services/auth/session';
import { GET as listEvents, POST as createEvent } from '../events/route';
import { GET as getEvent, PUT as updateEvent, DELETE as deleteEvent } from '../events/[id]/route';
import { GET as getSession, POST as postLogin, DELETE as logout } from '../auth/session/route';
import { setEventRepository, DrizzleEventRepository } from '@/services/repositories';

const USER_A = { id: 'usr_alice', email: 'alice@example.com', name: 'Alice Adams' };
const USER_B = { id: 'usr_bob', email: 'bob@example.com', name: 'Bob Baker' };

async function makeAuthHeaders(user: {
  id: string;
  email: string;
  name: string;
}): Promise<Headers> {
  const token = await signSession(user);
  return new Headers({
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    origin: 'http://localhost:3000',
    host: 'localhost:3000',
  });
}

describe('Session Authentication & IDOR Authorization Suite', () => {
  beforeEach(() => {
    setEventRepository(new DrizzleEventRepository());
  });

  it('signs and verifies session tokens, rejecting tampered signatures', async () => {
    const token = await signSession(USER_A);
    const verified = await verifySession(token);
    expect(verified?.id).toBe(USER_A.id);
    expect(verified?.email).toBe(USER_A.email);

    const [payload, sig] = token.split('.');
    const tamperedSig = sig?.slice(0, -4) + 'abcd';
    const tampered = await verifySession(`${payload}.${tamperedSig}`);
    expect(tampered).toBeNull();
  });

  it('rejects expired session tokens', async () => {
    const expiredToken = await signSession(USER_A, -60);
    const verified = await verifySession(expiredToken);
    expect(verified).toBeNull();
  });

  it('handles login, session status, and logout via session API routes', async () => {
    const loginReq = new NextRequest('http://localhost:3000/api/auth/session', {
      method: 'POST',
      body: JSON.stringify(USER_A),
      headers: { 'content-type': 'application/json' },
    });
    const loginRes = await postLogin(loginReq);
    expect(loginRes.status).toBe(200);
    const setCookie = loginRes.headers.get('Set-Cookie');
    expect(setCookie).toContain('utsava_session=');
    expect(setCookie).toContain('HttpOnly');

    const statusReq = new NextRequest('http://localhost:3000/api/auth/session', {
      headers: { cookie: setCookie?.split(';')[0] ?? '' },
    });
    const statusRes = await getSession(statusReq);
    const statusBody = (await statusRes.json()) as { user: { id: string } };
    expect(statusBody.user.id).toBe(USER_A.id);

    const logoutRes = await logout();
    expect(logoutRes.headers.get('Set-Cookie')).toContain('Max-Age=0');
  });

  it('enforces authentication on event endpoints, rejecting unauthenticated requests with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/events');
    const res = await listEvents(req);
    expect(res.status).toBe(401);
  });

  it('proves User A can create and read their own event', async () => {
    const headersA = await makeAuthHeaders(USER_A);
    const createReq = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        id: 'evt_alice_wedding',
        type: 'wedding',
        title: "Alice's Dream Wedding",
        date: '2026-11-20',
        guestCount: 150,
        location: 'Napa Valley, CA',
        totalBudget: 40000,
        currency: 'INR',
      }),
    });
    const createRes = await createEvent(createReq);
    expect(createRes.status).toBe(201);

    const getReq = new NextRequest('http://localhost:3000/api/events/evt_alice_wedding', {
      headers: headersA,
    });
    const getRes = await getEvent(getReq, { params: Promise.resolve({ id: 'evt_alice_wedding' }) });
    expect(getRes.status).toBe(200);
    const body = (await getRes.json()) as { event: { id: string; userId: string } };
    expect(body.event.id).toBe('evt_alice_wedding');
    expect(body.event.userId).toBe(USER_A.id);
  });

  it('proves User B cannot read User A event (IDOR prevention returning 403 Forbidden)', async () => {
    const headersA = await makeAuthHeaders(USER_A);
    await createEvent(
      new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: headersA,
        body: JSON.stringify({
          id: 'evt_alice_secret',
          type: 'wedding',
          title: 'Private Alice Event',
          date: '2026-11-20',
          guestCount: 100,
          location: 'San Francisco, CA',
          totalBudget: 35000,
          currency: 'INR',
        }),
      })
    );

    const headersB = await makeAuthHeaders(USER_B);
    const idorGetReq = new NextRequest('http://localhost:3000/api/events/evt_alice_secret', {
      headers: headersB,
    });
    const idorRes = await getEvent(idorGetReq, {
      params: Promise.resolve({ id: 'evt_alice_secret' }),
    });

    expect(idorRes.status).toBe(403);
    const idorBody = (await idorRes.json()) as { error: string };
    expect(idorBody.error).toContain('Access denied');
  });

  it('proves User B cannot edit or delete User A event (IDOR prevention returning 403)', async () => {
    const headersA = await makeAuthHeaders(USER_A);
    await createEvent(
      new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: headersA,
        body: JSON.stringify({
          id: 'evt_alice_editable',
          type: 'birthday',
          title: 'Alice Milestone Birthday',
          date: '2026-12-10',
          guestCount: 50,
          location: 'Austin, TX',
          totalBudget: 10000,
          currency: 'INR',
        }),
      })
    );

    const headersB = await makeAuthHeaders(USER_B);
    const editReq = new NextRequest('http://localhost:3000/api/events/evt_alice_editable', {
      method: 'PUT',
      headers: headersB,
      body: JSON.stringify({ title: 'Hacked by Bob' }),
    });
    const editRes = await updateEvent(editReq, {
      params: Promise.resolve({ id: 'evt_alice_editable' }),
    });
    expect(editRes.status).toBe(403);

    const deleteReq = new NextRequest('http://localhost:3000/api/events/evt_alice_editable', {
      method: 'DELETE',
      headers: headersB,
    });
    const deleteRes = await deleteEvent(deleteReq, {
      params: Promise.resolve({ id: 'evt_alice_editable' }),
    });
    expect(deleteRes.status).toBe(403);
  });

  it('lists only events owned by the authenticated user', async () => {
    const headersA = await makeAuthHeaders(USER_A);
    const headersB = await makeAuthHeaders(USER_B);

    await createEvent(
      new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: headersA,
        body: JSON.stringify({
          id: 'evt_alice_list_1',
          type: 'wedding',
          title: 'Alice Event 1',
          date: '2026-11-20',
          guestCount: 100,
          location: 'Chicago, IL',
          totalBudget: 25000,
          currency: 'INR',
        }),
      })
    );

    await createEvent(
      new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: headersB,
        body: JSON.stringify({
          id: 'evt_bob_list_1',
          type: 'community',
          title: 'Bob Festival 1',
          date: '2026-11-25',
          guestCount: 500,
          location: 'Seattle, WA',
          totalBudget: 15000,
          currency: 'INR',
        }),
      })
    );

    const listResA = await listEvents(
      new NextRequest('http://localhost:3000/api/events', { headers: headersA })
    );
    const dataA = (await listResA.json()) as { events: { id: string }[] };
    expect(dataA.events.every((e) => e.id.includes('alice'))).toBe(true);
    expect(dataA.events.some((e) => e.id === 'evt_bob_list_1')).toBe(false);

    const listResB = await listEvents(
      new NextRequest('http://localhost:3000/api/events', { headers: headersB })
    );
    const dataB = (await listResB.json()) as { events: { id: string }[] };
    expect(dataB.events.every((e) => e.id.includes('bob'))).toBe(true);
    expect(dataB.events.some((e) => e.id === 'evt_alice_list_1')).toBe(false);
  });

  it('rejects mutations when CSRF origin validation fails', async () => {
    const token = await signSession(USER_A);
    const spoofedReq = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        origin: 'http://malicious-site.attacker.com',
        host: 'localhost:3000',
      },
      body: JSON.stringify({
        type: 'wedding',
        title: 'CSRF Exploit Attempt',
        date: '2026-11-20',
        guestCount: 100,
        location: 'Nowhere',
        totalBudget: 1000,
        currency: 'INR',
      }),
    });

    const res = await createEvent(spoofedReq);
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('CSRF');
  });

  it('validates query strings and path parameters rejecting malformed inputs with 400', async () => {
    const headersA = await makeAuthHeaders(USER_A);
    const badQueryReq = new NextRequest('http://localhost:3000/api/events?limit=invalid_number', {
      headers: headersA,
    });
    const badQueryRes = await listEvents(badQueryReq);
    expect(badQueryRes.status).toBe(400);

    const badParamReq = new NextRequest('http://localhost:3000/api/events/valid_id', {
      headers: headersA,
    });
    const badParamRes = await getEvent(badParamReq, { params: Promise.resolve({ id: '' }) });
    expect(badParamRes.status).toBe(400);
  });
});
