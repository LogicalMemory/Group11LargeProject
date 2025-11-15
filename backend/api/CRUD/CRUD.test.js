jest.mock('../../createJWT.js', () => ({
  isExpired: jest.fn(),
  refresh: jest.fn(),
  getUserFromToken: jest.fn(),
}));

const jwtHelper = require('../../createJWT.js');

const createEventModule = require('./createEvent.js');
const readEventModule = require('./readEvent.js');
const updateEventModule = require('./updateEvent.js');
const deleteEventModule = require('./deleteEvent.js');
const searchEventsModule = require('./searchEvents.js');

function makeMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makeMockApp() {
  let handler = null;
  return {
    post: (path, fn) => { handler = fn; },
    run: async (req, res) => { if (!handler) throw new Error('handler not registered'); return handler(req, res); },
    getHandler: () => handler
  };
}

function makeClientMock(eventsCollection, usersCollection) {
  const defaultUsers =
    usersCollection ||
    {
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockReturnValue({ toArray: async () => [] }),
      updateOne: jest.fn(),
      updateMany: jest.fn(),
    };

  return {
    db: () => ({
      collection: (name) => {
        if (name === 'Events') return eventsCollection;
        if (name === 'Users') return defaultUsers;
        return eventsCollection;
      },
    }),
  };
}

// Silence expected console output from handlers during tests for this file
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
  console.log.mockRestore();
});

describe('readEvent handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 400 when token or eventId missing', async () => {
  const app = makeMockApp();
  const mockClient = {};
  readEventModule.setApp(app, mockClient, '/api/readEvent');
    const req = { body: {} };
    const res = makeMockRes();
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
  });

  test('returns 200 with JWT error when token expired', async () => {
    jwtHelper.isExpired.mockReturnValue(true);

  const app = makeMockApp();
  const req = { body: { token: 't', eventId: '1' } };
  const res = makeMockRes();
  const mockClient = {};
  readEventModule.setApp(app, mockClient, '/api/readEvent');
  await app.run(req, res);
    expect(jwtHelper.isExpired).toHaveBeenCalledWith('t');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ error: "The JWT is no longer valid", token: "" });
  });

  test('returns 404 when event not found and still returns refreshed token', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.refresh.mockReturnValue({ accessToken: 'new' });

    const app = makeMockApp();
    const mockEvents = { findOne: jest.fn().mockResolvedValue(null) };
    const mockClient = makeClientMock(mockEvents);

    const req = { body: { token: 'good', eventId: '5' } };
    const res = makeMockRes();

  readEventModule.setApp(app, mockClient, '/api/readEvent');
  await app.run(req, res);

    expect(mockEvents.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Event not found', token: { accessToken: 'new' } });
  });

  test('returns 200 and eventObject when found (string eventId coerced to number)', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.refresh.mockReturnValue('refreshed');

    const eventObj = { EventId: 3, EventTitle: 'Test' };
    const mockEvents = { findOne: jest.fn().mockImplementation(async (q) => {
      // ensure query used numeric EventId
      if (q.EventId === 3) return eventObj;
      return null;
    }) };
    const mockClient = makeClientMock(mockEvents);

    const app = makeMockApp();
    const req = { body: { token: 'good', eventId: '3' } };
    const res = makeMockRes();

    readEventModule.setApp(app, mockClient, '/api/readEvent');
    await app.run(req, res);

    expect(mockEvents.findOne).toHaveBeenCalledWith({ EventId: 3 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ eventObject: eventObj, token: 'refreshed' });
  });

  test('handles non-numeric eventId (uses string EventId in query)', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.refresh.mockReturnValue('rt');

    const eventObj = { EventId: 'abc', EventTitle: 'StringId' };
    const mockEvents = { findOne: jest.fn().mockResolvedValue(eventObj) };
    const mockClient = makeClientMock(mockEvents);

    const app = makeMockApp();
    const req = { body: { token: 'good', eventId: 'abc' } };
    const res = makeMockRes();

    readEventModule.setApp(app, mockClient, '/api/readEvent');
    await app.run(req, res);

    expect(mockEvents.findOne).toHaveBeenCalledWith({ EventId: 'abc' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ eventObject: eventObj, token: 'rt' });
  });
});

describe('createEvent handler', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 when missing required fields', async () => {
    const app = makeMockApp();
    const mockClient = {};
    createEventModule.setApp(app, mockClient, '/api/create');
    const res = makeMockRes();
    const req = { body: { token: 't' } };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('401 when token has no user', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({});

    const app = makeMockApp();
    const mockEvents = { find: () => ({ sort: () => ({ limit: () => ({ toArray: async () => [] }) }) }), insertOne: jest.fn() };
    const mockClient = makeClientMock(mockEvents);
    createEventModule.setApp(app, mockClient, '/api/create');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventTitle: 't', eventDescription: 'd', eventTime: 'now', eventDuration: '1' } };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('200 on successful create', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 7 });
    jwtHelper.refresh.mockReturnValue('newtok');

    const inserted = [];
    const mockEvents = {
      find: () => ({ sort: () => ({ limit: () => ({ toArray: async () => [] }) }) }),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 1 })
    };
    const mockUsers = { findOne: jest.fn().mockResolvedValue({ ProfileImageUrl: 'pic.png' }) };
    const mockClient = makeClientMock(mockEvents, mockUsers);

    const app = makeMockApp();
    createEventModule.setApp(app, mockClient, '/api/create');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventTitle: 't', eventDescription: 'd', eventTime: 'now', eventDuration: '1', eventLocation: 'loc' } };
    await app.run(req, res);

    expect(mockEvents.insertOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'newtok', eventObject: expect.objectContaining({ EventOwnerId: 7, EventTitle: 't' }) }));
  });

  test('returns 200 with JWT error when token expired (createEvent)', async () => {
    jwtHelper.isExpired.mockReturnValue(true);

    const app = makeMockApp();
    const mockClient = {};
    createEventModule.setApp(app, mockClient, '/api/create');

    const res = makeMockRes();
    const req = { body: { token: 'expired', eventTitle: 't', eventDescription: 'd', eventTime: 'now', eventDuration: '1' } };
    await app.run(req, res);

    expect(jwtHelper.isExpired).toHaveBeenCalledWith('expired');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ error: "The JWT is no longer valid", token: "" });
  });

  test('200 on successful create uses nextId from lastEvent', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 9 });
    jwtHelper.refresh.mockReturnValue('ref');

    const mockEvents = {
      find: () => ({ sort: () => ({ limit: () => ({ toArray: async () => [{ EventId: 10 }] }) }) }),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 123 })
    };
    const mockClient = makeClientMock(mockEvents);

    const app = makeMockApp();
    createEventModule.setApp(app, mockClient, '/api/create');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventTitle: 'title', eventDescription: 'desc', eventTime: 'later', eventDuration: '2', eventLocation: 'here' } };
    await app.run(req, res);

    expect(mockEvents.insertOne).toHaveBeenCalledWith(expect.objectContaining({ EventId: 11, EventOwnerId: 9, EventTitle: 'title' }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'ref', eventObject: expect.objectContaining({ EventId: 11, EventOwnerId: 9 }) });
  });
});

describe('updateEvent handler', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 when missing token or eventId', async () => {
    const app = makeMockApp();
    updateEventModule.setApp(app, {}, '/api/update');
    const res = makeMockRes();
    const req = { body: {} };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 200 with JWT error when token expired (updateEvent)', async () => {
    jwtHelper.isExpired.mockReturnValue(true);

    const app = makeMockApp();
    const mockClient = {};
    updateEventModule.setApp(app, mockClient, '/api/update');

    const res = makeMockRes();
    const req = { body: { token: 'expired', eventId: '1', eventTitle: 'x' } };
    await app.run(req, res);

    expect(jwtHelper.isExpired).toHaveBeenCalledWith('expired');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ error: "The JWT is no longer valid", token: "" });
  });

  test('400 when no fields to update', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 2 });
    jwtHelper.refresh.mockReturnValue('r');

    const mockEvents = { updateOne: jest.fn() };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    updateEventModule.setApp(app, mockClient, '/api/update');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1' } };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'No fields to update', token: 'r' });
  });

  test('401 when token has no user (updateEvent)', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({});

    const app = makeMockApp();
    const mockEvents = { updateOne: jest.fn() };
    const mockClient = makeClientMock(mockEvents);
    updateEventModule.setApp(app, mockClient, '/api/update');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1', eventTitle: 'x' } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  test('404 when update matchedCount is 0', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 2 });
    jwtHelper.refresh.mockReturnValue('r');

    const mockEvents = { updateOne: jest.fn().mockResolvedValue({ matchedCount: 0 }) };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    updateEventModule.setApp(app, mockClient, '/api/update');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1', eventTitle: 'x' } };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('200 when update succeeds', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 2 });
    jwtHelper.refresh.mockReturnValue('r');

    const updatedEvent = { EventId: 1, EventTitle: 'x', EventOwnerId: 2 };
    const mockEvents = {
      updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
      findOne: jest.fn().mockResolvedValue(updatedEvent)
    };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    updateEventModule.setApp(app, mockClient, '/api/update');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1', eventTitle: 'x' } };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'r', eventObject: updatedEvent });
  });

  test('update uses string EventId for non-numeric ids and sets multiple fields', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 7 });
    jwtHelper.refresh.mockReturnValue('rtoken');

    let capturedFilter = null;
    let capturedUpdate = null;
    const updatedEvent = { EventId: 'abc', EventOwnerId: 7, EventTitle: 'T', EventDescription: 'D', EventTime: 'now', EventDuration: '30', EventLocation: 'here' };
    const mockEvents = {
      updateOne: jest.fn().mockImplementation(async (filter, update) => { capturedFilter = filter; capturedUpdate = update; return { matchedCount: 1 }; }),
      findOne: jest.fn().mockResolvedValue(updatedEvent)
    };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    updateEventModule.setApp(app, mockClient, '/api/update');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: 'abc', eventTitle: 'T', eventDescription: 'D', eventTime: 'now', eventDuration: '30', eventLocation: 'here' } };
    await app.run(req, res);

    // queryEventId should be the original string 'abc' (non-numeric branch)
    expect(capturedFilter).toEqual({ EventId: 'abc', EventOwnerId: 7 });

    // update object should contain all provided fields under $set
    expect(capturedUpdate).toEqual({ $set: { EventTitle: 'T', EventDescription: 'D', EventTime: 'now', EventDuration: '30', EventLocation: 'here' } });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'rtoken', eventObject: updatedEvent });
  });
});

describe('deleteEvent handler', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 when missing token or eventId', async () => {
    const app = makeMockApp();
    deleteEventModule.setApp(app, {}, '/api/delete');
    const res = makeMockRes();
    const req = { body: {} };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('404 when not found', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 10 });
    jwtHelper.refresh.mockReturnValue('tok');

    const mockEvents = { findOneAndDelete: jest.fn().mockResolvedValue(null) };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    deleteEventModule.setApp(app, mockClient, '/api/delete');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1' } };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 200 with JWT error when token expired (deleteEvent)', async () => {
    jwtHelper.isExpired.mockReturnValue(true);

    const app = makeMockApp();
    const mockClient = {};
    deleteEventModule.setApp(app, mockClient, '/api/delete');

    const res = makeMockRes();
    const req = { body: { token: 'expired', eventId: '1' } };
    await app.run(req, res);

    expect(jwtHelper.isExpired).toHaveBeenCalledWith('expired');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ error: "The JWT is no longer valid", token: "" });
  });

  test('401 when token has no user (deleteEvent)', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({});

    const app = makeMockApp();
    const mockEvents = { findOneAndDelete: jest.fn() };
    const mockClient = makeClientMock(mockEvents);
    deleteEventModule.setApp(app, mockClient, '/api/delete');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1' } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  test('200 when deleted', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 10 });
    jwtHelper.refresh.mockReturnValue('tok');

    const mockEvents = { findOneAndDelete: jest.fn().mockResolvedValue({ value: { EventId: 1 } }) };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    deleteEventModule.setApp(app, mockClient, '/api/delete');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1' } };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'tok', eventObject: { EventId: 1 } });
  });

  test('200 when deleted with non-numeric eventId uses string EventId in filter', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 10 });
    jwtHelper.refresh.mockReturnValue('tok');

    let capturedFilter = null;
    const mockEvents = { findOneAndDelete: jest.fn().mockImplementation(async (filter) => { capturedFilter = filter; return { value: { EventId: 'abc' } }; }) };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    deleteEventModule.setApp(app, mockClient, '/api/delete');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: 'abc' } };
    await app.run(req, res);

    expect(capturedFilter).toEqual({ EventId: 'abc', EventOwnerId: 10 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'tok', eventObject: { EventId: 'abc' } });
  });
});

describe('searchEvents handler', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 when token missing', async () => {
    const app = makeMockApp();
    searchEventsModule.setApp(app, {}, '/api/search');
    const res = makeMockRes();
    const req = { body: {} };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 200 with JWT error when token expired (searchEvents)', async () => {
    jwtHelper.isExpired.mockReturnValue(true);

    const app = makeMockApp();
    const mockClient = {};
    searchEventsModule.setApp(app, mockClient, '/api/search');

    const res = makeMockRes();
    const req = { body: { token: 'expired' } };
    await app.run(req, res);

    expect(jwtHelper.isExpired).toHaveBeenCalledWith('expired');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ error: "The JWT is no longer valid", token: "" });
  });

  test('200 returns events and paging info', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.refresh.mockReturnValue('r');

    const eventsList = [{ EventId: 1 }, { EventId: 2 }];
    const mockCursor = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), toArray: async () => eventsList };
    const mockEvents = { find: () => mockCursor, countDocuments: jest.fn().mockResolvedValue(2) };
    const mockClient = makeClientMock(mockEvents);

    const app = makeMockApp();
    searchEventsModule.setApp(app, mockClient, '/api/search');

    const res = makeMockRes();
    const req = { body: { token: 'good', limit: 10, skip: 0 } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ events: eventsList, totalCount: 2, limit: 10, skip: 0, token: 'r' });
  });

  test('keyword search matches title/description/location (case-insensitive)', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.refresh.mockReturnValue('tokk');

    const eventsList = [{ EventId: 5, EventTitle: 'Meeting' }];
    let capturedQuery = null;
    const mockCursor = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), toArray: async () => eventsList };
    const mockEvents = { find: jest.fn((q) => { capturedQuery = q; return mockCursor; }), countDocuments: jest.fn().mockResolvedValue(1) };
    const mockClient = makeClientMock(mockEvents);

    const app = makeMockApp();
    searchEventsModule.setApp(app, mockClient, '/api/search');

    const res = makeMockRes();
    const req = { body: { token: 'good', searchKeyword: 'meeting', limit: 10, skip: 0 } };
    await app.run(req, res);

    expect(capturedQuery).toBeDefined();
    expect(capturedQuery.$or).toBeDefined();
    // regex should be case-insensitive
    const regex = capturedQuery.$or[0].EventTitle.$regex;
    expect(regex.flags).toContain('i');
    expect(res.json).toHaveBeenCalledWith({ events: eventsList, totalCount: 1, limit: 10, skip: 0, token: 'tokk' });
  });

  test('ownerId filter accepts numeric string and number equivalently', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.refresh.mockReturnValue('tok2');

    let capturedQuery = null;
    const eventsList = [{ EventId: 6 }];
    const mockCursor = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), toArray: async () => eventsList };
    const mockEvents = { find: jest.fn((q) => { capturedQuery = q; return mockCursor; }), countDocuments: jest.fn().mockResolvedValue(1) };
    const mockClient = makeClientMock(mockEvents);

    const app = makeMockApp();
    searchEventsModule.setApp(app, mockClient, '/api/search');

    const res1 = makeMockRes();
    await app.run({ body: { token: 'good', ownerId: '7', limit: 10, skip: 0 } }, res1);
    // owner should be coerced to number 7 in query
    const hasOwnerNumeric = capturedQuery.EventOwnerId === 7 || (capturedQuery.$and && capturedQuery.$and.some(c => c.EventOwnerId === 7));
    expect(hasOwnerNumeric).toBe(true);

    // Now call with numeric ownerId
    capturedQuery = null;
    const res2 = makeMockRes();
    await app.run({ body: { token: 'good', ownerId: 7, limit: 10, skip: 0 } }, res2);
    const hasOwnerNumeric2 = capturedQuery.EventOwnerId === 7 || (capturedQuery.$and && capturedQuery.$and.some(c => c.EventOwnerId === 7));
    expect(hasOwnerNumeric2).toBe(true);
  });

  test('ownerId non-numeric is used as string in query (searchEvents)', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.refresh.mockReturnValue('tok-owner-str');

    let capturedQuery = null;
    const eventsList = [{ EventId: 99 }];
    const mockCursor = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), toArray: async () => eventsList };
    const mockEvents = { find: jest.fn((q) => { capturedQuery = q; return mockCursor; }), countDocuments: jest.fn().mockResolvedValue(1) };
    const mockClient = makeClientMock(mockEvents);

    const app = makeMockApp();
    searchEventsModule.setApp(app, mockClient, '/api/search');

    const res = makeMockRes();
    const req = { body: { token: 'good', ownerId: 'owner-xyz', limit: 10, skip: 0 } };
    await app.run(req, res);

    // owner should appear as the literal string in the query
    const hasOwnerString = capturedQuery.EventOwnerId === 'owner-xyz' || (capturedQuery.$and && capturedQuery.$and.some(c => c.EventOwnerId === 'owner-xyz'));
    expect(hasOwnerString).toBe(true);
    expect(res.json).toHaveBeenCalledWith({ events: eventsList, totalCount: 1, limit: 10, skip: 0, token: 'tok-owner-str' });
  });

  test('invalid page/pageSize values fall back to defaults (searchEvents)', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.refresh.mockReturnValue('tok-page-default');

    const eventsList = [{ EventId: 11 }];
    const mockCursor = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), toArray: async () => eventsList };
    const mockEvents = { find: () => mockCursor, countDocuments: jest.fn().mockResolvedValue(1) };
    const mockClient = makeClientMock(mockEvents);

    const app = makeMockApp();
    searchEventsModule.setApp(app, mockClient, '/api/search');

    const res = makeMockRes();
    // page is 0 and pageSize is -1 => invalid per the check, should fall back to defaults (limit=50, skip=0)
    const req = { body: { token: 'good', page: 0, pageSize: -1 } };
    await app.run(req, res);

    expect(mockCursor.skip).toHaveBeenCalledWith(0);
    expect(mockCursor.limit).toHaveBeenCalledWith(50);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ limit: 50, skip: 0, token: 'tok-page-default' }));
  });

  test('page & pageSize pagination computes skip and limit correctly', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.refresh.mockReturnValue('tok3');

    const eventsList = [{ EventId: 10 }];
    const mockCursor = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), toArray: async () => eventsList };
    const mockEvents = { find: () => mockCursor, countDocuments: jest.fn().mockResolvedValue(1) };
    const mockClient = makeClientMock(mockEvents);

    const app = makeMockApp();
    searchEventsModule.setApp(app, mockClient, '/api/search');

    const res = makeMockRes();
    const req = { body: { token: 'good', page: 2, pageSize: 1 } };
    await app.run(req, res);

    expect(mockCursor.skip).toHaveBeenCalledWith(1);
    expect(mockCursor.limit).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ limit: 1, skip: 1, token: 'tok3' }));
  });

  test('returns empty array and totalCount 0 when no matches', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.refresh.mockReturnValue('tok4');

    const mockCursor = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), toArray: async () => [] };
    const mockEvents = { find: () => mockCursor, countDocuments: jest.fn().mockResolvedValue(0) };
    const mockClient = makeClientMock(mockEvents);

    const app = makeMockApp();
    searchEventsModule.setApp(app, mockClient, '/api/search');

    const res = makeMockRes();
    const req = { body: { token: 'good' } };
    await app.run(req, res);

    expect(res.json).toHaveBeenCalledWith({ events: [], totalCount: 0, limit: 50, skip: 0, token: 'tok4' });
  });
});

describe('error and edge cases to improve coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  test('createEvent returns 500 when DB insert throws', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 1 });

    const mockEvents = {
      find: () => ({ sort: () => ({ limit: () => ({ toArray: async () => [] }) }) }),
      insertOne: jest.fn().mockRejectedValue(new Error('db down'))
    };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    createEventModule.setApp(app, mockClient, '/api/create');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventTitle: 't', eventDescription: 'd', eventTime: 'now', eventDuration: '1', eventLocation: 'l' } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
  });

  test('readEvent returns 500 when DB findOne throws', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    const mockEvents = { findOne: jest.fn().mockRejectedValue(new Error('boom')) };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    readEventModule.setApp(app, mockClient, '/api/readEvent');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1' } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
  });

  test('updateEvent returns 500 when DB updateOne throws', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 2 });

    const mockEvents = { updateOne: jest.fn().mockRejectedValue(new Error('fail')) };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    updateEventModule.setApp(app, mockClient, '/api/update');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1', eventTitle: 'x' } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
  });

  test('deleteEvent returns 500 when DB findOneAndDelete throws', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 3 });

    const mockEvents = { findOneAndDelete: jest.fn().mockRejectedValue(new Error('oh no')) };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    deleteEventModule.setApp(app, mockClient, '/api/delete');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1' } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
  });

  test('searchEvents returns 500 when DB cursor.toArray throws', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.refresh.mockReturnValue('rtok');

    // make cursor.toArray throw
    const mockCursor = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), toArray: async () => { throw new Error('bad cursor'); } };
    const mockEvents = { find: () => mockCursor, countDocuments: jest.fn() };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    searchEventsModule.setApp(app, mockClient, '/api/search');

    const res = makeMockRes();
    const req = { body: { token: 'good', limit: 10, skip: 0 } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
  });

  test('searchEvents escapes regex and applies owner filter and caps limit', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.refresh.mockReturnValue('rtok');

    // spy on the query argument passed to find
    let capturedQuery = null;
    const eventsList = [{ EventId: 1 }];
    const mockCursor = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), toArray: async () => eventsList };
    const mockEvents = {
      find: jest.fn((q) => { capturedQuery = q; return mockCursor; }),
      countDocuments: jest.fn().mockResolvedValue(1)
    };
    const mockClient = makeClientMock(mockEvents);
    const app = makeMockApp();
    searchEventsModule.setApp(app, mockClient, '/api/search');

    const res = makeMockRes();
    // use a keyword with regex-special chars and an ownerId numeric string, and a huge limit
    const req = { body: { token: 'good', searchKeyword: 'a.b*c', ownerId: '42', limit: 1000, skip: 0 } };
    await app.run(req, res);

    // ensure query built contains $or and owner filter
    expect(capturedQuery).not.toBeNull();
    // owner filter should either be EventOwnerId:42 or $and combining both
    const hasOwner = capturedQuery.EventOwnerId === 42 || (capturedQuery.$and && capturedQuery.$and.some(clause => clause.EventOwnerId === 42));
    expect(hasOwner).toBe(true);
    // keyword regex should be escaped: the dot should become literal in the regex source
    const orClause = capturedQuery.$or || (capturedQuery.$and && capturedQuery.$and[0].$or);
    expect(orClause).toBeDefined();
  const regex = orClause[0].EventTitle.$regex;
  // ensure dot and star were escaped in the regex source
  expect(regex.source).toContain('\\.');
  expect(regex.source).toContain('\\*');

    // limit should be capped to 100 in response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ limit: 100, skip: 0, token: 'rtok' }));
  });
});
