const db = require('../data/bancodedados');
let numAccount = 1;

const validateCpf = (cpf) => {
   if (cpf.length !== 11) {
      return false
   }
   const cpfFound = db.contas.find((user) => {
      return user.usuario.cpf === cpf
   });

   if (cpfFound) {
      return false
   }
   return true
}
const validateEmail = (email) => {

   if (!email.includes('@') || !email.includes('.com')) {
      return false
   }

   const verifyEmail = db.contas.find((user) => {
      return user.usuario.email === email
   });

   if (verifyEmail) {
      return false
   }
   return true
}
const validateRouteParams = (param1, param2, param3, param4, param5, param6) => {
   param3 = param3 || true;
   param4 = param4 || true;
   param5 = param5 || true;
   param6 = param6 || true;
   if (!param1 || !param2 || !param3 || !param4 || !param5 || !param6) {
      return false
   }
   return true
}
const findIndexAccount = (accountNumber) => {

   const indexFound = db.contas.findIndex((account) => {
      return accountNumber == account.numero
   });
   return Number(indexFound);
}
const getExtractByIndexAccount = (indexAccount) => {
   const accountFound = db.contas[indexAccount];
   const withdraws = [];
   const deposits = [];
   const tranfers = [];

   for (const withdraw of db.saques) {
      if (accountFound.numero === withdraw.numero_conta) withdraws.push(withdraw);
   }
   for (const deposit of db.depositos) {
      if (accountFound.numero === deposit.numero_conta) deposits.push(deposit);
   }
   for (const tranfer of db.transferencias) {
      if (accountFound.numero === tranfer.numero_conta_origem) tranfers.push(tranfer);
   }

   const extract = {
      depositos: deposits,
      saques: withdraws,
      transferenciasEnviadas: tranfers
   }

   return extract
}

const listAccounts = (req, res) => {
   res.status(200).json(db.contas);
}
const createAccount = (req, res) => {
   const { nome: name, cpf, data_nascimento: dateOfBirth, telefone: phone, email, senha: password } = req.body

   if (!validateRouteParams(name, cpf, dateOfBirth, phone, email, password)) {
      return res.status(400).json({ "mensagem": "Preencha todos os campos!" });
   }

   const verifyCpf = validateCpf(cpf);
   const verifyEmail = validateEmail(email);

   if (!verifyCpf || !verifyEmail) {
      return res.status(400).json({ "mensagem": "J?? existe uma conta com o cpf ou e-mail informado!" });
   }

   db.contas.push({
      numero: String(numAccount),
      saldo: 0,
      usuario: {
         nome: name,
         cpf,
         data_nascimento: dateOfBirth,
         telefone: phone,
         email,
         senha: password
      }
   });
   numAccount++;
   res.status(201).send();
   return
}
const updateAccounts = (req, res) => {
   const { accountNumber } = req.params
   const {
      nome: name,
      cpf,
      data_nascimento: dateOfBirth,
      telefone: phone,
      email,
      senha: password
   } = req.body

   if (!validateRouteParams(name, cpf, dateOfBirth, phone, email, password)) {
      return res.status(400).json({ "mensagem": "Preencha todos os campos!" });
   }
   const indexAccount = findIndexAccount(accountNumber);

   if (indexAccount == -1) {
      return res.status(400).json({ "mensagem": "O n??mero da conta n??o foi encontrado!" });
   }
   const cpfFound = validateCpf(cpf);
   const emailFound = validateEmail(email);

   if (!cpfFound || !emailFound) {
      return res.status(400).json({ "mensagem": "J?? existe uma conta com o cpf ou e-mail informado!" });
   }

   db.contas[indexAccount].usuario = {
      nome: name,
      cpf,
      data_nascimento: dateOfBirth,
      telefone: phone,
      email,
      senha: password
   }
   return res.status(201).send();

}
const deleteAccount = (req, res) => {
   const { numeroConta: accountNumber } = req.params

   if (!accountNumber) {
      return res.status(400).json({ "mensagem": "O n??mero da conta ?? obrigat??rio!" });
   }
   const indexAccount = findIndexAccount(accountNumber);

   if (indexAccount == -1) {
      return res.status(404).json({ "mensagem": "O n??mero da conta n??o foi encontrado!" });
   }
   const account = db.contas[indexAccount];

   if (account.saldo !== 0) {
      return res.status(401).json({ "mensagem": "A conta s?? pode ser removida se o saldo for zero!" });
   }

   db.contas.splice(indexAccount, 1);
   return res.status(201).send();
}
const getBalance = (req, res) => {
   const { numero_conta: accountNumber, senha: password } = req.query

   if (!validateRouteParams(accountNumber, password)) {
      return res.status(400).json({ "mensagem": "O n??mero da conta e a senha s??o obrigat??rios!" });
   }

   const indexAccount = findIndexAccount(accountFound);

   if (indexAccount === -1) {
      return res.status(404).json({ "mensagem": "Conta banc??ria n??o encontrada!" });
   }

   const accountFound = db.contas[indexAccount];

   if (accountFound.usuario.senha !== password) {
      return res.status(400).json({ "mensagem": "Senha incorreta!" });
   }

   return res.json({ "saldo": accountFound.saldo });

}
const getExtract = (req, res) => {
   const { numero_conta: accountNumber, senha: password } = req.query

   if (!validateRouteParams(accountNumber, password)) {
      return res.status(400).json({ "mensagem": "O n??mero da conta e a senha s??o obrigat??rios!" });
   }

   const indexAccount = findIndexAccount(accountNumber);

   if (indexAccount === -1) {
      return res.status(404).json({ "mensagem": "Conta banc??ria n??o encontrada!" });
   }

   const accountFound = db.contas[indexAccount];

   if (accountFound.usuario.senha !== password) {
      return res.status(400).json({ "mensagem": "Senha incorreta!" });
   }
   const extract = getExtractByIndexAccount(indexAccount);

   return res.json(extract);
}

module.exports = {
   listAccounts,
   createAccount,
   updateAccounts,
   deleteAccount,
   findIndexAccount,
   validateRouteParams,
   getBalance,
   getExtract
}
