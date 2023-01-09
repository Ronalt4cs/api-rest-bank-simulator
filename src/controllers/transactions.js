const db = require('../data/bancodedados');
const { findIndexAccount, validateRouteParams } = require('./accounts');

const dateNow = () => {
   return new Date().toLocaleDateString("pt-Br", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
   })
}
const depositValue = (req, res) => {
   const { numero_conta, valor } = req.body

   if (!validateRouteParams(numero_conta, valor)) {
      return res.status(400).json({ "mensagem": "O número da conta e o valor são obrigatórios!" });
   }

   const indexAccount = findIndexAccount(numero_conta);
   if (indexAccount == -1) {
      return res.status(404).json({ "mensagem": "Número da conta não encontradoo!" });
   }

   if (valor <= 0) {
      return res.status(404).json({ "mensagem": "Não é possível fazer um depósito de valor menor ou igual a ZERO!" });
   }

   db.contas[indexAccount].saldo += valor;

   db.depositos.push({
      data: dateNow(),
      numero_conta,
      valor
   })
   return res.status(201).send();
}
const withdrawValue = (req, res) => {
   const { numero_conta, valor, senha } = req.body

   if (!validateRouteParams(numero_conta, valor, senha)) {
      return res.status(400).json({ "mensagem": "O número da conta, o valor e senha são obrigatórios!" });
   }

   const indexAccount = findIndexAccount(numero_conta);

   if (indexAccount == -1) {
      return res.status(404).json({ "mensagem": "Número da conta não encontradoo!" });
   }

   const userPassword = db.contas[indexAccount].usuario.senha;

   if (userPassword !== senha) {
      return res.status(403).json({ "mensagem": "Senha incorreta!" });
   }

   let userBalance = db.contas[indexAccount].saldo;

   if (userBalance <= 0) {
      return res.status(400).json({ "mensagem": "O valor não pode ser menor que zero!" });
   }

   if ((userBalance - valor) < 0) {
      return res.status(400).json({ "mensagem": "O valor do saque não pode ser maior que o saldo!" });
   }

   db.contas[indexAccount].saldo = userBalance - valor;
   db.saques.push({
      data: dateNow(),
      numero_conta,
      valor
   })

   return res.status(201).send();
}
const transferValue = (req, res) => {
   const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

   if (!validateRouteParams(numero_conta_origem, numero_conta_destino, valor, senha)) {
      return res.status(400).json({ "mensagem": "preencha todos os campos!" });
   }

   const indexOriginAccount = findIndexAccount(numero_conta_origem);

   if (indexOriginAccount == -1) {
      return res.status(404).json({ "mensagem": "A conta de origem não foi encontrada!" });
   }

   const indexDestinyAccount = findIndexAccount(numero_conta_destino);

   if (indexDestinyAccount == -1) {
      return res.status(404).json({ "mensagem": "A conta de destino não foi encontrada!" });
   }

   const userOriginPassword = db.contas[indexOriginAccount].usuario.senha;

   if (userOriginPassword !== senha) {
      return res.status(403).json({ "mensagem": "Senha incorreta!" });
   }

   const userOriginBalance = db.contas[indexOriginAccount].saldo;

   if (userOriginBalance <= 0) {
      return res.status(400).json({ "mensagem": "Saldo insuficiente!" });
   }

   if ((userOriginBalance - valor) < 0) {
      return res.status(400).json({ "mensagem": "Saldo insuficiente!" });
   }

   db.contas[indexOriginAccount].saldo = userOriginBalance - valor;
   db.contas[indexDestinyAccount].saldo += valor;

   db.transferencias.push({
      data: dateNow(),
      numero_conta_origem,
      numero_conta_destino,
      valor
   });

   return res.status(201).send();
}

module.exports = {
   depositValue,
   withdrawValue,
   transferValue
}