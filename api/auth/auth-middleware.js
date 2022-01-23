
const checkRequestBody = (req, res, next) => {
    if(!req.body.password || !req.body.username){
        res.status(401).json({message: "username and password required"})
    } else {
        next()
    }
  }

module.exports = {
    checkRequestBody,
}