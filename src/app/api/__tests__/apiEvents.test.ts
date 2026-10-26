import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { signSession } from '@/services/auth/session';
import { POST as createEvent, GET as listEvents } from '../events/route';
import { GET as getEvent, PUT as updateEvent, DELETE as deleteEvent } from '../events/[id]/route';
import { setEventRepository, DrizzleEventRepository } from '@/services/repositories';

const USER_ALICE = {
  id: 'usr_alice_int',
  email: 'alice.int@example.com',
  name: 'Alice Integration',
};
const USER_BOB = { id: 'usr_bob_int', email: 'bob.int@example.com', name: 'Bob Integration' };

async function makeHeaders(user?: { id: string; email: string; name: string }): Promise<Headers> {
  const headers = new Headers({
    'content-type': 'application/json',
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
  });
  if (user) {
    const token = await signSession(user);
    headers.set('authorization', `Bearer ${token}`);
  }
  return headers;
}

describe('API Events Integration Suite', () => {
  beforeEach(() => {
    setEventRepository(new DrizzleEventRepository());
  });

  describe('Authentication & IDOR Enforcement', () => {
    it('returns 401 Unauthorized when attempting to create an event without credentials', async () => {
      const headers = await makeHeaders();
      const req = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'wedding',
          title: 'Unauthorized Wedding',
          date: '2026-11-15',
          guestCount: 100,
          totalBudget: 20000,
        }),
      });
      const res = await createEvent(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('Unauthorized');
    });

    it('returns 401 when token is invalid or tampered', async () => {
      const headers = new Headers({
        'content-type': 'application/json',
        host: 'localhost:3000',
        origin: 'http://localhost:3000',
        authorization: 'Bearer bad.token.signature',
      });
      const req = new NextRequest('http://localhost:3000/api/events', {
        method: 'GET',
        headers,
      });
      const res = await listEvents(req);
      expect(res.status).toBe(401);
    });

    it('returns 403 Forbidden when Alice attempts to access or mutate Bob event (IDOR)', async () => {
      const bobHeaders = await makeHeaders(USER_BOB);
      const createReq = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: bobHeaders,
        body: JSON.stringify({
          type: 'birthday',
          title: "Bob's 40th Birthday",
          date: '2026-09-10',
          location: 'Austin Lounge',
          guestCount: 50,
          totalBudget: 4000,
        }),
      });
      const createRes = await createEvent(createReq);
      expect(createRes.status).toBe(201);
      const created = await createRes.json();
      const bobEventId = created.event.id;

      const aliceHeaders = await makeHeaders(USER_ALICE);
      const getReq = new NextRequest(`http://localhost:3000/api/events/${bobEventId}`, {
        method: 'GET',
        headers: aliceHeaders,
      });
      const getRes = await getEvent(getReq, { params: Promise.resolve({ id: bobEventId }) });
      expect(getRes.status).toBe(403);

      const putReq = new NextRequest(`http://localhost:3000/api/events/${bobEventId}`, {
        method: 'PUT',
        headers: aliceHeaders,
        body: JSON.stringify({ title: 'Hijacked Event Title' }),
      });
      const putRes = await updateEvent(putReq, { params: Promise.resolve({ id: bobEventId }) });
      expect(putRes.status).toBe(403);

      const delReq = new NextRequest(`http://localhost:3000/api/events/${bobEventId}`, {
        method: 'DELETE',
        headers: aliceHeaders,
      });
      const delRes = await deleteEvent(delReq, { params: Promise.resolve({ id: bobEventId }) });
      expect(delRes.status).toBe(403);
    });
  });

  describe('Event Mutation & Lifecycle (PUT & DELETE)', () => {
    it('successfully updates an event via PUT for the verified owner', async () => {
      const aliceHeaders = await makeHeaders(USER_ALICE);
      const createReq = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: aliceHeaders,
        body: JSON.stringify({
          type: 'birthday',
          title: 'Alice Birthday Party',
          date: '2026-10-10',
          location: 'Austin, TX',
          guestCount: 25,
          totalBudget: 2500,
        }),
      });
      const createRes = await createEvent(createReq);
      expect(createRes.status).toBe(201);
      const created = await createRes.json();
      const eventId = created.event.id;

      const putReq = new NextRequest(`http://localhost:3000/api/events/${eventId}`, {
        method: 'PUT',
        headers: aliceHeaders,
        body: JSON.stringify({
          title: 'Alice 30th Gala Birthday',
          totalBudget: 3500,
        }),
      });
      const putRes = await updateEvent(putReq, { params: Promise.resolve({ id: eventId }) });
      expect(putRes.status).toBe(200);
      const updated = await putRes.json();
      expect(updated.event.title).toBe('Alice 30th Gala Birthday');
      expect(updated.event.totalBudget).toBe(3500);
    });

    it('successfully deletes an event via DELETE for the verified owner', async () => {
      const aliceHeaders = await makeHeaders(USER_ALICE);
      const createReq = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: aliceHeaders,
        body: JSON.stringify({
          type: 'community',
          title: 'Neighborhood Clean-up',
          date: '2026-11-01',
          location: 'Seattle, WA',
          guestCount: 60,
          totalBudget: 1200,
        }),
      });
      const createRes = await createEvent(createReq);
      expect(createRes.status).toBe(201);
      const created = await createRes.json();
      const eventId = created.event.id;

      const delReq = new NextRequest(`http://localhost:3000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: aliceHeaders,
      });
      const delRes = await deleteEvent(delReq, { params: Promise.resolve({ id: eventId }) });
      expect(delRes.status).toBe(200);
      const delJson = await delRes.json();
      expect(delJson.success).toBe(true);

      const getReq = new NextRequest(`http://localhost:3000/api/events/${eventId}`, {
        method: 'GET',
        headers: aliceHeaders,
      });
      const getRes = await getEvent(getReq, { params: Promise.resolve({ id: eventId }) });
      expect(getRes.status).toBe(404);
    });
  });
});
