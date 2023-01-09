const password = require('../constants/password');

const verifyPassword = (req, res, next) => {
   const { senha_banco } = req.query
   if (!senha_banco) {
      return res.status(400).json({ "mensagem": "Informe a senha do banco!" });
   }
   if (senha_banco !== password) {
      res.status(401).json({ "mensagem": "Senha do banco incorreta!" });
      return
   }

   next();
}

module.exports = verifyPassword;