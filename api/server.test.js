const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')
const bcrypt = require('bcryptjs')
const jwtDecode = require('jwt-decode')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
afterAll(async () => {
  await db.destroy()
})

test('sanity', () => {
  expect(true).toBe(true)
})

describe('[POST] /api/auth/register', () => {
  it('creates a new user in the database', async () => {
    await request(server).post('/api/auth/register').send({ username: 'larry', password: 'Ilovetomatoes' })
    const larry = await db('users').where('username', 'larry').first()
    larry.password = ""
    expect(larry).toMatchObject({ id:1, username: 'larry', password: ""})
  }, 750)
  it('responds with error when username is taken', async () => {
    const response = await request(server).post('/api/auth/register').send({ username: 'larry', password: 'Ilovetomatoes' })
    expect(response.body.message).toMatch(/username taken/i)
  }, 750)
})

describe('[POST] /api/auth/login', () => {
  it('responds with the correct message on valid credentials', async () => {
    const res = await request(server).post('/api/auth/login').send({ username: 'larry', password: 'Ilovetomatoes' })
    expect(res.body.message).toMatch(/welcome, larry/i)
  }, 750)
  it('responds with the correct status and message on invalid credentials', async () => {
    let res = await request(server).post('/api/auth/login').send({ username: 'larry', password: 'Ilovecucumbers' })
    expect(res.body.message).toMatch(/invalid credentials/i)
    expect(res.status).toBe(401)
    res = await request(server).post('/api/auth/login').send({ username: 'carry', password: 'Ilovetomatoes' })
    expect(res.body.message).toMatch(/invalid credentials/i)
    expect(res.status).toBe(401)
  }, 750)
})