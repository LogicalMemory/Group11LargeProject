jest.mock('../../createJWT.js', () => ({
  isExpired: jest.fn(),
  refresh: jest.fn(),
  getUserFromToken: jest.fn(),
}));

const jwtHelper = require('../../createJWT.js');

const addCommentModule = require('./addComment.js');
const toggleLikeModule = require('./toggleLike.js');

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

function createMockClient(eventsCollection, usersCollection) {
  const defaultUsers = usersCollection || { findOne: jest.fn().mockResolvedValue({ ProfileImageUrl: null }) };
  return {
    db: () => ({
      collection: (name) => (name === 'Users' ? defaultUsers : eventsCollection),
    }),
  };
}

// Silence expected console output from handlers under test in this file
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
  console.log.mockRestore();
});

describe('addComment handler', () => {
  beforeEach(() => jest.clearAllMocks());

  test('normalizeEventId returns null for undefined or null', () => {
    // directly test the helper to hit the early-return path (line 4)
    expect(addCommentModule.normalizeEventId(undefined)).toBeNull();
    expect(addCommentModule.normalizeEventId(null)).toBeNull();
  });

  test('400 when missing required fields', async () => {
    const app = makeMockApp();
    addCommentModule.setApp(app, {}, '/api/addComment');
    const res = makeMockRes();
    const req = { body: { token: 't', eventId: '1', commentText: ' ' } };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
  });
  

  test('returns 200 with JWT error when token expired', async () => {
    jwtHelper.isExpired.mockReturnValue(true);
    const app = makeMockApp();
    addCommentModule.setApp(app, {}, '/api/addComment');
    const res = makeMockRes();
    const req = { body: { token: 'expired', eventId: '1', commentText: 'hi' } };
    await app.run(req, res);
    expect(jwtHelper.isExpired).toHaveBeenCalledWith('expired');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ error: 'The JWT is no longer valid', token: '' });
  });

  test('401 when token has no user', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({});

    const app = makeMockApp();
    const mockEvents = { findOneAndUpdate: jest.fn() };
    const mockClient = createMockClient(mockEvents);
    addCommentModule.setApp(app, mockClient, '/api/addComment');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1', commentText: 'hey' } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  test('404 when event not found (both findOneAndUpdate and findOne miss)', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 5, firstName: 'A', lastName: 'B' });
    jwtHelper.refresh.mockReturnValue('r');

    const mockEvents = { findOneAndUpdate: jest.fn().mockResolvedValue(null), findOne: jest.fn().mockResolvedValue(null) };
    const mockUsers = { findOne: jest.fn().mockResolvedValue({ ProfileImageUrl: 'img.png' }) };
    const mockClient = createMockClient(mockEvents, mockUsers);
    const app = makeMockApp();
    addCommentModule.setApp(app, mockClient, '/api/addComment');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1', commentText: 'hello' } };
    await app.run(req, res);

    expect(jwtHelper.refresh).toHaveBeenCalledWith('good');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Event not found', token: 'r' });
  });

  test('success when findOneAndUpdate returns value (numeric eventId)', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 10, firstName: 'Jane', lastName: 'Doe' });
    jwtHelper.refresh.mockReturnValue('newtok');

    const returnedEvent = { EventId: 3, Comments: [] };
    let capturedQuery = null;
    let capturedPush = null;
    const mockEvents = {
      findOneAndUpdate: jest.fn().mockImplementation(async (query, update, opts) => { capturedQuery = query; capturedPush = update.$push; return { value: returnedEvent }; })
    };
    const mockUsers = { findOne: jest.fn().mockResolvedValue({ ProfileImageUrl: 'https://img/profile.png' }) };
    const mockClient = createMockClient(mockEvents, mockUsers);

    const app = makeMockApp();
    addCommentModule.setApp(app, mockClient, '/api/addComment');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '3', commentText: '  hi there  ' } };
    await app.run(req, res);

    // queryEventId should be numeric 3
    expect(capturedQuery).toEqual({ EventId: 3 });
    // pushed comment should have trimmed text and author info
    expect(capturedPush.Comments).toBeDefined();
    const comment = Object.values(capturedPush.Comments)[0] || capturedPush.Comments;
    // since we pushed an object under $push, check the returned comment in response
    expect(res.status).toHaveBeenCalledWith(200);
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.token).toBe('newtok');
    expect(jsonArg.comment).toBeDefined();
    expect(jsonArg.comment.AuthorId).toBe(10);
    expect(jsonArg.comment.Text).toBe('hi there');
    expect(jsonArg.eventObject).toBe(returnedEvent);
  });

  test('success when findOneAndUpdate returns null but findOne returns value (string eventId)', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 11 });
    jwtHelper.refresh.mockReturnValue('r2');

    const returnedEvent = { EventId: 'abc', Comments: [] };
    const mockEvents = {
      findOneAndUpdate: jest.fn().mockResolvedValue(null),
      findOne: jest.fn().mockResolvedValue(returnedEvent),
    };
    const mockUsers = { findOne: jest.fn().mockResolvedValue({ ProfileImageUrl: null }) };
    const mockClient = createMockClient(mockEvents, mockUsers);
    const app = makeMockApp();
    addCommentModule.setApp(app, mockClient, '/api/addComment');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: 'abc', commentText: 'ok' } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.token).toBe('r2');
    expect(jsonArg.eventObject).toBe(returnedEvent);
    expect(jsonArg.comment.AuthorId).toBe(11);
    expect(jsonArg.comment.Text).toBe('ok');
  });

  test('500 when DB throws in addComment', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 1 });

    const mockEvents = { findOneAndUpdate: jest.fn().mockRejectedValue(new Error('db oops')) };
    const mockUsers = { findOne: jest.fn().mockResolvedValue(null) };
    const mockClient = createMockClient(mockEvents, mockUsers);
    const app = makeMockApp();
    addCommentModule.setApp(app, mockClient, '/api/addComment');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1', commentText: 'x' } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
  });
});

describe('toggleLike handler', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 when missing required fields', async () => {
    const app = makeMockApp();
    toggleLikeModule.setApp(app, {}, '/api/toggle');
    const res = makeMockRes();
    const req = { body: { token: 't' } };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 200 with JWT error when token expired (toggleLike)', async () => {
    jwtHelper.isExpired.mockReturnValue(true);
    const app = makeMockApp();
    toggleLikeModule.setApp(app, {}, '/api/toggle');
    const res = makeMockRes();
    const req = { body: { token: 'expired', eventId: '1' } };
    await app.run(req, res);
    expect(jwtHelper.isExpired).toHaveBeenCalledWith('expired');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ error: 'The JWT is no longer valid', token: '' });
  });

  test('401 when token has no user (toggleLike)', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({});
    const app = makeMockApp();
    const mockEvents = { findOne: jest.fn() };
    const mockClient = { db: () => ({ collection: () => mockEvents }) };
    toggleLikeModule.setApp(app, mockClient, '/api/toggle');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1' } };
    await app.run(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  test('404 when event not found', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 2 });
    jwtHelper.refresh.mockReturnValue('rt');

    const mockEvents = { findOne: jest.fn().mockResolvedValue(null) };
    const mockClient = { db: () => ({ collection: () => mockEvents }) };
    const app = makeMockApp();
    toggleLikeModule.setApp(app, mockClient, '/api/toggle');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1' } };
    await app.run(req, res);

    expect(jwtHelper.refresh).toHaveBeenCalledWith('good');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Event not found', token: 'rt' });
  });

  test('adds like when user not present and returns updated event', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 4 });
    jwtHelper.refresh.mockReturnValue('t1');

    const targetEvent = { EventId: 7, Likes: 0, LikedBy: [] };
    const updatedValue = { EventId: 7, Likes: 1, LikedBy: [4] };
    const mockEvents = {
      findOne: jest.fn().mockResolvedValue(targetEvent),
      findOneAndUpdate: jest.fn().mockResolvedValue({ value: updatedValue })
    };
    const mockClient = { db: () => ({ collection: () => mockEvents }) };
    const app = makeMockApp();
    toggleLikeModule.setApp(app, mockClient, '/api/toggle');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: 7 } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 't1', liked: true, likes: 1, eventObject: updatedValue });
  });

  test('removes like when user already present and returns updated event', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 4 });
    jwtHelper.refresh.mockReturnValue('t2');

    const targetEvent = { EventId: 8, Likes: 3, LikedBy: [1,4,5] };
    const updatedValue = { EventId: 8, Likes: 2, LikedBy: [1,5] };
    const mockEvents = {
      findOne: jest.fn().mockResolvedValue(targetEvent),
      findOneAndUpdate: jest.fn().mockResolvedValue({ value: updatedValue })
    };
    const mockClient = { db: () => ({ collection: () => mockEvents }) };
    const app = makeMockApp();
    toggleLikeModule.setApp(app, mockClient, '/api/toggle');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '8' } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 't2', liked: false, likes: 2, eventObject: updatedValue });
  });

  test('uses string EventId for non-numeric ids (toggleLike)', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 9 });
    jwtHelper.refresh.mockReturnValue('t3');

    const targetEvent = { EventId: 'abc', Likes: 0, LikedBy: [] };
    const updatedValue = { EventId: 'abc', Likes: 1, LikedBy: [9] };
    let capturedQuery = null;
    const mockEvents = {
      findOne: jest.fn().mockImplementation(async (q) => { capturedQuery = q; return targetEvent; }),
      findOneAndUpdate: jest.fn().mockResolvedValue({ value: updatedValue })
    };
    const mockClient = { db: () => ({ collection: () => mockEvents }) };
    const app = makeMockApp();
    toggleLikeModule.setApp(app, mockClient, '/api/toggle');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: 'abc' } };
    await app.run(req, res);

    expect(capturedQuery).toEqual({ EventId: 'abc' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 't3', liked: true, likes: 1, eventObject: updatedValue });
  });

  test('normalizeEventId returns null for undefined or null (toggleLike)', () => {
    expect(toggleLikeModule.normalizeEventId(undefined)).toBeNull();
    expect(toggleLikeModule.normalizeEventId(null)).toBeNull();
  });

  test('handles missing LikedBy (undefined) by creating empty set and adding like', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 12 });
    jwtHelper.refresh.mockReturnValue('t4');

    const targetEvent = { EventId: 20, Likes: 0 }; // no LikedBy property
    let capturedUpdate = null;
    const updatedValue = { EventId: 20, Likes: 1, LikedBy: [12] };
    const mockEvents = {
      findOne: jest.fn().mockResolvedValue(targetEvent),
      findOneAndUpdate: jest.fn().mockImplementation(async (q, update, opts) => { capturedUpdate = update; return { value: updatedValue }; })
    };
    const mockClient = { db: () => ({ collection: () => mockEvents }) };
    const app = makeMockApp();
    toggleLikeModule.setApp(app, mockClient, '/api/toggle');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: 20 } };
    await app.run(req, res);

    // capturedUpdate should set LikedBy to [12] and Likes to 1
    expect(capturedUpdate).toEqual({ $set: { LikedBy: [12], Likes: 1 } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 't4', liked: true, likes: 1, eventObject: updatedValue });
  });

  test('500 when DB throws in toggleLike', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 1 });

    const mockEvents = { findOne: jest.fn().mockRejectedValue(new Error('fail')) };
    const mockClient = { db: () => ({ collection: () => mockEvents }) };
    const app = makeMockApp();
    toggleLikeModule.setApp(app, mockClient, '/api/toggle');

    const res = makeMockRes();
    const req = { body: { token: 'good', eventId: '1' } };
    await app.run(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
  });
});
