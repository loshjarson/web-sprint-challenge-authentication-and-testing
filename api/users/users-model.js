const db = require('../../data/dbConfig')

function findByName(username) {
    return db('users')
      .select('id','username', 'password')
      .where({username})
  }

function findById(user_id) {
    return db("users")
        .select("id","username","password")
        .where("id", user_id)
        .first()
    }

async function add(user) {
    const [id] = await db('users').insert(user);
    return findById(id)
    }

module.exports = {
    findByName,
    findById,
    add,
}