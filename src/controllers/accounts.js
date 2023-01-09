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
const validateRouteParams = (info1, info2, info3, info4, info5, info6) => {
   info3 = info3 || true;
   info4 = info4 || true;
   info5 = info5 || true;
   info6 = info6 || true;
   if (!info1 || !info2 || !info3 || !info4 || !info5 || !info6) {
      return false
   }
   return true
}
const findIndexAccount = (num) => {

   const indexFound = db.contas.findIndex((account) => {
      return num == account.numero
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
   const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

   if (!validateRouteParams(nome, cpf, data_nascimento, telefone, email, senha)) {
      return res.status(400).json({ "mensagem": "Preencha todos os campos!" });
   }

   const verifyCpf = validateCpf(cpf);
   const verifyEmail = validateEmail(email);

   if (!verifyCpf || !verifyEmail) {
      return res.status(400).json({ "mensagem": "Já existe uma conta com o cpf ou e-mail informado!" });
   }

   db.contas.push({
      numero: String(numAccount),
      saldo: 0,
      usuario: {
         nome,
         cpf,
         data_nascimento,
         telefone,
         email,
         senha
      }
   });
   numAccount++;
   res.status(201).send();
   return
}
const updateAccounts = (req, res) => {
   const { nome, cpf, data_nascimento, telefone, email, senha } = req.body
   const { numeroConta } = req.params

   if (!validateRouteParams(nome, cpf, data_nascimento, telefone, email, senha)) {
      return res.status(400).json({ "mensagem": "Preencha todos os campos!" });
   }
   const indexAccount = findIndexAccount(numeroConta);

   if (indexAccount == -1) {
      return res.status(400).json({ "mensagem": "O número da conta não foi encontrado!" });
   }
   const cpfFound = validateCpf(cpf);
   const emailFound = validateEmail(email);

   if (!cpfFound || !emailFound) {
      return res.status(400).json({ "mensagem": "Já existe uma conta com o cpf ou e-mail informado!" });
   }

   db.contas[indexAccount].usuario = {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha
   }
   return res.status(201).send();

}
const deleteAccount = (req, res) => {
   const { numeroConta } = req.params

   if (!numeroConta) {
      return res.status(400).json({ "mensagem": "O número da conta é obrigatório!" });
   }
   const indexAccount = findIndexAccount(numeroConta);

   if (indexAccount == -1) {
      return res.status(404).json({ "mensagem": "O número da conta não foi encontrado!" });
   }
   const account = db.contas[indexAccount];

   if (account.saldo !== 0) {
      return res.status(401).json({ "mensagem": "A conta só pode ser removida se o saldo for zero!" });
   }

   db.contas.splice(indexAccount, 1);
   return res.status(201).send();
}
const getBalance = (req, res) => {
   const { numero_conta, senha } = req.query

   if (!validateRouteParams(numero_conta, senha)) {
      return res.status(400).json({ "mensagem": "O número da conta e a senha são obrigatórios!" });
   }

   const indexAccount = findIndexAccount(numero_conta);

   if (indexAccount === -1) {
      return res.status(404).json({ "mensagem": "Conta bancária não encontrada!" });
   }

   const accountFound = db.contas[indexAccount];

   if (accountFound.usuario.senha !== senha) {
      return res.status(400).json({ "mensagem": "Senha incorreta!" });
   }

   return res.json({ "saldo": accountFound.saldo });

}
const getExtract = (req, res) => {
   const { numero_conta, senha } = req.query

   if (!validateRouteParams(numero_conta, senha)) {
      return res.status(400).json({ "mensagem": "O número da conta e a senha são obrigatórios!" });
   }

   const indexAccount = findIndexAccount(numero_conta);

   if (indexAccount === -1) {
      return res.status(404).json({ "mensagem": "Conta bancária não encontrada!" });
   }

   const accountFound = db.contas[indexAccount];

   if (accountFound.usuario.senha !== senha) {
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
