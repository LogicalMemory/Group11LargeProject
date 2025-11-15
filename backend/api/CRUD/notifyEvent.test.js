jest.mock('../../createJWT.js', () => ({
  isExpired: jest.fn(),
  getUserFromToken: jest.fn(),
  refresh: jest.fn(),
}));
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

const jwtHelper = require('../../createJWT.js');
const sgMail = require('@sendgrid/mail');
const notifyEvent = require('./notifyEvent.js');

function makeMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makeMockApp() {
  let handler = null;
  return {
    post: (_path, fn) => {
      handler = fn;
    },
    run: async (req, res) => {
      if (!handler) throw new Error('handler not registered');
      return handler(req, res);
    },
  };
}

const buildClient = (options = {}) => {
  const users = {
    findOne: jest.fn().mockResolvedValue(
      Object.prototype.hasOwnProperty.call(options, 'userDoc')
        ? options.userDoc
        : { UserId: 1, Login: 'test@example.com', FirstName: 'Test', LastName: 'User' },
    ),
  };
  const events = {
    findOne: jest.fn().mockResolvedValue(
      Object.prototype.hasOwnProperty.call(options, 'eventDoc')
        ? options.eventDoc
        : { EventId: 1, EventTitle: 'Party', EventTime: new Date().toISOString() },
    ),
  };
  const reminders = options.remindersMock || {
    updateOne: jest.fn().mockResolvedValue({}),
  };

  return {
    db: () => ({
      collection: (name) => {
        if (name === 'Users') return users;
        if (name === 'Events') return events;
        if (name === 'EventReminders') return reminders;
        return {};
      },
    }),
    __collections: { users, events, reminders },
  };
};

describe('notifyEvent handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SENDGRID_API_KEY = 'test-key';
    process.env.SENDGRID_FROM_EMAIL = 'loopu2025@gmail.com';
  });

  test('400 when missing fields', async () => {
    const app = makeMockApp();
    notifyEvent.setApp(app, {}, '/api/notifyEvent');
    const res = makeMockRes();
    await app.run({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
  });

  test('200 with JWT error when token expired', async () => {
    jwtHelper.isExpired.mockReturnValue(true);
    const app = makeMockApp();
    notifyEvent.setApp(app, {}, '/api/notifyEvent');
    const res = makeMockRes();
    await app.run({ body: { token: 'expired', eventId: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ error: 'The JWT is no longer valid', token: '' });
  });

  test('401 when token has no userId', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({});
    const app = makeMockApp();
    notifyEvent.setApp(app, {}, '/api/notifyEvent');
    const res = makeMockRes();
    await app.run({ body: { token: 'no-user', eventId: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  test('400 when user email missing', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 5 });
    const client = buildClient({ userDoc: { UserId: 5, Login: '' } });
    const app = makeMockApp();
    notifyEvent.setApp(app, client, '/api/notifyEvent');
    const res = makeMockRes();
    await app.run({ body: { token: 'tok', eventId: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unable to find an email for this user.' });
  });

  test('404 when event not found', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 5 });
    const client = buildClient({ eventDoc: null });
    const app = makeMockApp();
    notifyEvent.setApp(app, client, '/api/notifyEvent');
    const res = makeMockRes();
    await app.run({ body: { token: 'tok', eventId: 123 } }, res);
    expect(client.__collections.events.findOne).toHaveBeenCalledWith({ EventId: 123 });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Event not found' });
  });

  test('500 when sendgrid not configured', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 5 });
    process.env.SENDGRID_API_KEY = '';
    const client = buildClient();
    const app = makeMockApp();
    notifyEvent.setApp(app, client, '/api/notifyEvent');
    const res = makeMockRes();
    await app.run({ body: { token: 'tok', eventId: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email service is not configured.' });
  });

  test('200 on successful reminder scheduling', async () => {
    jwtHelper.isExpired.mockReturnValue(false);
    jwtHelper.getUserFromToken.mockReturnValue({ userId: 7 });
    jwtHelper.refresh.mockReturnValue('new-token');
    const reminders = { updateOne: jest.fn().mockResolvedValue({}) };
    const client = buildClient({ remindersMock: reminders });
    sgMail.send.mockResolvedValue({});
    const app = makeMockApp();
    notifyEvent.setApp(app, client, '/api/notifyEvent');
    const res = makeMockRes();
    await app.run({ body: { token: 'tok', eventId: 42 } }, res);

    expect(reminders.updateOne).toHaveBeenCalled();
    expect(sgMail.setApiKey).toHaveBeenCalledWith('test-key');
    expect(sgMail.send).toHaveBeenCalled();
    expect(jwtHelper.refresh).toHaveBeenCalledWith('tok');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Check your inbox—we sent a reminder email for this event.',
      token: 'new-token',
    });
  });
});
