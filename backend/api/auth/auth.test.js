jest.mock('../../createJWT.js', () => ({
  createToken: jest.fn(),
}));
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}), { virtual: true });

const jwtHelper = require('../../createJWT.js');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');

const loginModule = require('./login.js');
const registerModule = require('./register.js');

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

describe('auth handlers (login & register)', () => {
  beforeAll(() => {
    // Silence expected console output from handlers under test
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  beforeEach(() => jest.clearAllMocks());

  describe('login', () => {
    test('400 when missing fields', async () => {
      const app = makeMockApp();
      loginModule.setApp(app, {}, '/api/login');
      const res = makeMockRes();
      await app.run({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    test('401 when user not found', async () => {
      const mockUsers = { findOne: jest.fn().mockResolvedValue(null) };
      const mockClient = { db: () => ({ collection: () => mockUsers }) };
      const app = makeMockApp();
      loginModule.setApp(app, mockClient, '/api/login');
      const res = makeMockRes();
      const req = { body: { login: 'a@b.com', password: 'p' } };
      await app.run(req, res);
      expect(mockUsers.findOne).toHaveBeenCalledWith({ Login: 'a@b.com' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Login/Password incorrect' });
    });

    test('401 when password incorrect', async () => {
      const user = { PasswordHash: 'hash', FirstName: 'F', LastName: 'L', UserId: 2 };
      const mockUsers = { findOne: jest.fn().mockResolvedValue(user) };
      const mockClient = { db: () => ({ collection: () => mockUsers }) };
      bcrypt.compare.mockResolvedValue(false);

      const app = makeMockApp();
      loginModule.setApp(app, mockClient, '/api/login');
      const res = makeMockRes();
      await app.run({ body: { login: 'u', password: 'bad' } }, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('bad', 'hash');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Login/Password incorrect' });
    });

    test('200 on success when createToken returns object with token prop', async () => {
      const user = { PasswordHash: 'hash', FirstName: 'F', LastName: 'L', UserId: 3, Login: 'f@example.com' };
      const mockUsers = { findOne: jest.fn().mockResolvedValue(user) };
      const mockClient = { db: () => ({ collection: () => mockUsers }) };
      bcrypt.compare.mockResolvedValue(true);
      jwtHelper.createToken.mockReturnValue({ token: 'tkn_obj' });

      const app = makeMockApp();
      loginModule.setApp(app, mockClient, '/api/login');
      const res = makeMockRes();
      await app.run({ body: { login: 'u', password: 'ok' } }, res);

      expect(jwtHelper.createToken).toHaveBeenCalledWith('F', 'L', 3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: 3,
        firstName: 'F',
        lastName: 'L',
        email: 'f@example.com',
        profileImageUrl: null,
        token: 'tkn_obj',
      });
    });

    test('200 on success when createToken returns string', async () => {
      const user = { PasswordHash: 'hash', FirstName: 'X', LastName: 'Y', UserId: 4, Login: 'x@example.com' };
      const mockUsers = { findOne: jest.fn().mockResolvedValue(user) };
      const mockClient = { db: () => ({ collection: () => mockUsers }) };
      bcrypt.compare.mockResolvedValue(true);
      jwtHelper.createToken.mockReturnValue('tkn_str');

      const app = makeMockApp();
      loginModule.setApp(app, mockClient, '/api/login');
      const res = makeMockRes();
      await app.run({ body: { login: 'u2', password: 'ok2' } }, res);

      expect(jwtHelper.createToken).toHaveBeenCalledWith('X', 'Y', 4);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: 4,
        firstName: 'X',
        lastName: 'Y',
        email: 'x@example.com',
        profileImageUrl: null,
        token: 'tkn_str',
      });
    });

    test('500 when DB findOne throws', async () => {
      const mockUsers = { findOne: jest.fn().mockRejectedValue(new Error('boom')) };
      const mockClient = { db: () => ({ collection: () => mockUsers }) };
      const app = makeMockApp();
      loginModule.setApp(app, mockClient, '/api/login');
      const res = makeMockRes();
      await app.run({ body: { login: 'u', password: 'p' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('register', () => {
    test('400 when missing fields', async () => {
      const app = makeMockApp();
      registerModule.setApp(app, {}, '/api/register');
      const res = makeMockRes();
      await app.run({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    test('409 when login already exists', async () => {
      const mockUsers = { findOne: jest.fn().mockResolvedValue({ Login: 'exists' }) };
      const mockClient = { db: () => ({ collection: () => mockUsers }) };
      const app = makeMockApp();
      registerModule.setApp(app, mockClient, '/api/register');
      const res = makeMockRes();
      const req = { body: { firstName: 'A', lastName: 'B', login: 'exists', password: 'p' } };
      await app.run(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Login already exists' });
    });

    test('201 when success with nextId=1 (no existing users)', async () => {
      bcrypt.hash.mockResolvedValue('phash');
      jwtHelper.createToken.mockReturnValue({ token: 'newtok' });
      sgMail.send.mockResolvedValue();

      const mockUsers = {
        findOne: jest.fn().mockResolvedValue(null),
        find: () => ({ sort: () => ({ limit: () => ({ toArray: async () => [] }) }) }),
        insertOne: jest.fn().mockResolvedValue({ insertedId: 7 })
      };
      const mockClient = { db: () => ({ collection: () => mockUsers }) };
      const app = makeMockApp();
      registerModule.setApp(app, mockClient, '/api/register');

      const res = makeMockRes();
      const req = { body: { firstName: 'F', lastName: 'L', login: 'new@x.com', password: 'p' } };
      await app.run(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('p', 10);
      expect(mockUsers.insertOne).toHaveBeenCalledWith(expect.objectContaining({ UserId: 1, FirstName: 'F', LastName: 'L', Login: 'new@x.com', PasswordHash: 'phash' }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        firstName: 'F',
        lastName: 'L',
        email: 'new@x.com',
        profileImageUrl: null,
        token: 'newtok',
      });
      // sendgrid called asynchronously; ensure setApiKey and send were called
      expect(sgMail.setApiKey).toHaveBeenCalled();
      expect(sgMail.send).toHaveBeenCalled();
    });

    test('201 when success with nextId from last user', async () => {
      bcrypt.hash.mockResolvedValue('phash2');
      jwtHelper.createToken.mockReturnValue('tokstr');
      sgMail.send.mockResolvedValue();

      const mockUsers = {
        findOne: jest.fn().mockResolvedValue(null),
        find: () => ({ sort: () => ({ limit: () => ({ toArray: async () => [{ UserId: 5 }] }) }) }),
        insertOne: jest.fn().mockResolvedValue({ insertedId: 8 })
      };
      const mockClient = { db: () => ({ collection: () => mockUsers }) };
      const app = makeMockApp();
      registerModule.setApp(app, mockClient, '/api/register');

      const res = makeMockRes();
      const req = { body: { firstName: 'G', lastName: 'H', login: 'x@y.com', password: 'pw' } };
      await app.run(req, res);

      expect(mockUsers.insertOne).toHaveBeenCalledWith(expect.objectContaining({ UserId: 6 }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 6,
        firstName: 'G',
        lastName: 'H',
        email: 'x@y.com',
        profileImageUrl: null,
        token: 'tokstr',
      });
    });

    test('sendgrid rejection is handled (catch exercised)', async () => {
      bcrypt.hash.mockResolvedValue('phash3');
      jwtHelper.createToken.mockReturnValue('tok3');
      sgMail.send.mockRejectedValue(new Error('sg fail'));

      const mockUsers = {
        findOne: jest.fn().mockResolvedValue(null),
        find: () => ({ sort: () => ({ limit: () => ({ toArray: async () => [] }) }) }),
        insertOne: jest.fn().mockResolvedValue({ insertedId: 9 })
      };
      const mockClient = { db: () => ({ collection: () => mockUsers }) };
      const app = makeMockApp();
      registerModule.setApp(app, mockClient, '/api/register');

      const res = makeMockRes();
      const req = { body: { firstName: 'S', lastName: 'G', login: 'sg@x.com', password: 'pw' } };
      await app.run(req, res);

      // response should be sent successfully despite sendgrid rejecting
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        firstName: 'S',
        lastName: 'G',
        email: 'sg@x.com',
        profileImageUrl: null,
        token: 'tok3',
      });
      // send called and its rejection should cause console.error in the handler (no throw)
      expect(sgMail.send).toHaveBeenCalled();
    });

    test('500 when insertOne throws', async () => {
      bcrypt.hash.mockResolvedValue('phash');
      const mockUsers = {
        findOne: jest.fn().mockResolvedValue(null),
        find: () => ({ sort: () => ({ limit: () => ({ toArray: async () => [] }) }) }),
        insertOne: jest.fn().mockRejectedValue(new Error('db fail'))
      };
      const mockClient = { db: () => ({ collection: () => mockUsers }) };
      const app = makeMockApp();
      registerModule.setApp(app, mockClient, '/api/register');

      const res = makeMockRes();
      const req = { body: { firstName: 'Z', lastName: 'Q', login: 'bad@x.com', password: 'pw' } };
      await app.run(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
});
