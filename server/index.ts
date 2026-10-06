import express, { type NextFunction, type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { readDatabase, writeDatabase } from './store.js';
import type { User, UserRole } from './models.js';

const app = express();
const sessions = new Map<string, string>();
const port = Number(process.env['PORT'] ?? 3000);
app.use(express.json());

function publicUser(user: User): Omit<User, 'password' | 'userId'> { const { password: _password, userId: _userId, ...safe } = user; return safe; }
function waitForRequest(request: Request): Promise<void> {
  const raw = Number(request.query['delay'] ?? 0);
  const delay = Number.isFinite(raw) ? Math.max(0, Math.min(raw, 5000)) : 0;
  return new Promise(resolve => setTimeout(resolve, delay));
}
function auth(request: Request, response: Response, next: NextFunction): void {
  const token = request.header('authorization')?.replace(/^Bearer\s+/i, '');
  const userId = token ? sessions.get(token) : undefined;
  if (!userId) { response.status(401).json({ message: 'Your session has expired. Please sign in again.' }); return; }
  (request as Request & { actorId: string }).actorId = userId;
  next();
}
async function requireAdmin(request: Request, response: Response, next: NextFunction): Promise<void> {
  const db = await readDatabase();
  const actor = db.users.find(user => user.id === (request as Request & { actorId: string }).actorId);
  if (actor?.role !== 'admin') { response.status(403).json({ message: 'Administrator access is required for this action.' }); return; }
  next();
}
function safeUserId(value: unknown): string { return typeof value === 'string' ? value.trim() : ''; }
function safeText(value: unknown): string { return typeof value === 'string' ? value.trim() : ''; }

app.get('/api/health', (_request, response) => response.json({ status: 'ok', service: 'veriflow-api' }));
app.post('/api/auth/login', async (request, response) => {
  await waitForRequest(request);
  const userId = safeUserId(request.body?.userId).toLowerCase();
  const password = safeText(request.body?.password);
  const role = request.body?.role as UserRole;
  const db = await readDatabase();
  const user = db.users.find(item => item.userId.toLowerCase() === userId && item.password === password && item.role === role && item.status === 'active');
  if (!user) { response.status(401).json({ message: 'Those details did not match an active account. Please try again.' }); return; }
  const token = randomUUID(); sessions.set(token, user.id);
  response.json({ token, user: publicUser(user) });
});

app.get('/api/me', auth, async (request, response) => {
  await waitForRequest(request);
  const db = await readDatabase();
  const user = db.users.find(item => item.id === (request as Request & { actorId: string }).actorId);
  if (!user) { response.status(404).json({ message: 'User not found.' }); return; }
  response.json(publicUser(user));
});

app.get('/api/records', auth, async (request, response) => {
  await waitForRequest(request);
  const db = await readDatabase();
  const user = db.users.find(item => item.id === (request as Request & { actorId: string }).actorId);
  if (!user) { response.status(404).json({ message: 'User not found.' }); return; }
  // Admins can review the workspace; general users only see records linked to their account.
  const visible = user.role === 'admin' ? db.records : db.records.filter(record => record.ownerId === user.id);
  response.json(visible.map(({ ownerId: _ownerId, ...record }) => record));
});

app.get('/api/users', auth, requireAdmin, async (request, response) => {
  await waitForRequest(request);
  const db = await readDatabase();
  response.json(db.users.map(publicUser));
});

app.post('/api/users', auth, requireAdmin, async (request, response) => {
  await waitForRequest(request);
  const db = await readDatabase();
  const { name, email, department, title, password } = request.body ?? {};
  const userId = safeUserId(request.body?.userId || String(email ?? '').split('@')[0]);
  const role: UserRole = request.body?.role === 'admin' ? 'admin' : 'user';
  if (!safeText(name) || !safeText(email) || !safeText(department) || !userId || typeof password !== 'string' || password.length < 6) {
    response.status(400).json({ message: 'Name, email, department, user ID, and a password of at least 6 characters are required.' }); return;
  }
  if (db.users.some(user => user.userId.toLowerCase() === userId.toLowerCase() || user.email.toLowerCase() === String(email).toLowerCase())) {
    response.status(409).json({ message: 'A user with this ID or email already exists.' }); return;
  }
  const user: User = { id: randomUUID(), userId, password, name: safeText(name), email: safeText(email), role, title: safeText(title) || (role === 'admin' ? 'Workspace administrator' : 'Team member'), department: safeText(department), status: 'active', joinedAt: new Date().toISOString().slice(0, 10) };
  db.users.push(user); await writeDatabase(db);
  response.status(201).json(publicUser(user));
});

app.patch('/api/users/:id', auth, requireAdmin, async (request, response) => {
  await waitForRequest(request);
  const db = await readDatabase();
  const user = db.users.find(item => item.id === request.params['id']);
  if (!user) { response.status(404).json({ message: 'User not found.' }); return; }
  const { name, email, department, title, role, status, password } = request.body ?? {};
  if (typeof email === 'string' && db.users.some(item => item.id !== user.id && item.email.toLowerCase() === email.trim().toLowerCase())) { response.status(409).json({ message: 'That email address is already in use.' }); return; }
  if (typeof name === 'string' && name.trim()) user.name = name.trim();
  if (typeof email === 'string' && email.trim()) user.email = email.trim();
  if (typeof department === 'string' && department.trim()) user.department = department.trim();
  if (typeof title === 'string' && title.trim()) user.title = title.trim();
  if (role === 'admin' || role === 'user') user.role = role;
  if (status === 'active' || status === 'inactive') user.status = status;
  if (typeof password === 'string' && password.length >= 6) user.password = password;
  await writeDatabase(db);
  response.json(publicUser(user));
});

app.delete('/api/users/:id', auth, requireAdmin, async (request, response) => {
  await waitForRequest(request);
  const db = await readDatabase();
  const actorId = (request as Request & { actorId: string }).actorId;
  if (request.params['id'] === actorId) { response.status(400).json({ message: 'You cannot remove your own account.' }); return; }
  const index = db.users.findIndex(user => user.id === request.params['id']);
  if (index < 0) { response.status(404).json({ message: 'User not found.' }); return; }
  db.users.splice(index, 1);
  await writeDatabase(db);
  response.status(204).end();
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error);
  response.status(500).json({ message: 'Something went wrong while processing this request.' });
});

app.listen(port, () => console.log(`VeriFlow API listening on http://localhost:${port}`));
