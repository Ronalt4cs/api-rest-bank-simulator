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
   const { numero_conta: accountNumber, valor: value } = req.body

   if (!validateRouteParams(accountNumber, value)) {
      return res.status(400).json({ "mensagem": "O número da conta e o valor são obrigatórios!" });
   }

   const indexAccount = findIndexAccount(accountNumber);
   if (indexAccount == -1) {
      return res.status(404).json({ "mensagem": "Número da conta não encontradoo!" });
   }

   if (valor <= 0) {
      return res.status(404).json({ "mensagem": "Não é possível fazer um depósito de valor menor ou igual a ZERO!" });
   }

   db.contas[indexAccount].saldo += valor;

   db.depositos.push({
      data: dateNow(),
      numero_conta: accountNumber,
      valor: value
   })
   return res.status(201).send();
}
const withdrawValue = (req, res) => {
   const { numero_conta: accountNumber, valor: value, senha: password } = req.body

   if (!validateRouteParams(accountNumber, value, password)) {
      return res.status(400).json({ "mensagem": "O número da conta, o valor e senha são obrigatórios!" });
   }

   const indexAccount = findIndexAccount(accountNumber);

   if (indexAccount == -1) {
      return res.status(404).json({ "mensagem": "Número da conta não encontradoo!" });
   }

   const userPassword = db.contas[indexAccount].usuario.senha;

   if (userPassword !== password) {
      return res.status(403).json({ "mensagem": "Senha incorreta!" });
   }

   let userBalance = db.contas[indexAccount].saldo;

   if (userBalance <= 0) {
      return res.status(400).json({ "mensagem": "O valor não pode ser menor que zero!" });
   }

   if ((userBalance - value) < 0) {
      return res.status(400).json({ "mensagem": "O valor do saque não pode ser maior que o saldo!" });
   }

   db.contas[indexAccount].saldo = userBalance - value;
   db.saques.push({
      data: dateNow(),
      numero_conta: accountNumber,
      valor: value
   })

   return res.status(201).send();
}
const transferValue = (req, res) => {
   const {
      numero_conta_origem: originAccountNumber,
      numero_conta_destino: destinationAccountNumber,
      valor: value,
      senha: password
   } = req.body

   if (!validateRouteParams(originAccountNumber, destinationAccountNumber, value, password)) {
      return res.status(400).json({ "mensagem": "preencha todos os campos!" });
   }

   const indexOriginAccount = findIndexAccount(originAccountNumber);

   if (indexOriginAccount == -1) {
      return res.status(404).json({ "mensagem": "A conta de origem não foi encontrada!" });
   }

   const indexDestinyAccount = findIndexAccount(destinationAccountNumber);

   if (indexDestinyAccount == -1) {
      return res.status(404).json({ "mensagem": "A conta de destino não foi encontrada!" });
   }

   const userOriginPassword = db.contas[indexOriginAccount].usuario.senha;

   if (userOriginPassword !== password) {
      return res.status(403).json({ "mensagem": "Senha incorreta!" });
   }

   const userOriginBalance = db.contas[indexOriginAccount].saldo;

   if (userOriginBalance <= 0) {
      return res.status(400).json({ "mensagem": "Saldo insuficiente!" });
   }

   if ((userOriginBalance - value) < 0) {
      return res.status(400).json({ "mensagem": "Saldo insuficiente!" });
   }

   db.contas[indexOriginAccount].saldo = userOriginBalance - value;
   db.contas[indexDestinyAccount].saldo += value;

   db.transferencias.push({
      data: dateNow(),
      numero_conta_origem: originAccountNumber,
      numero_conta_destino: destinationAccountNumber,
      valor: value
   });

   return res.status(201).send();
}

module.exports = {
   depositValue,
   withdrawValue,
   transferValue
}