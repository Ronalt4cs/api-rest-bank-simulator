const router = require('express')();
const verifyPassword = require('./middlewares/verifyPassword');
const { depositValue, withdrawValue, transferValue } = require('./controllers/transactions');
const {
   listAccounts,
   createAccount,
   updateAccounts,
   deleteAccount,
   getBalance,
   getExtract
} = require('./controllers/accounts');

router.post('/contas', createAccount);
router.put('/contas/:numeroConta/usuario', updateAccounts);
router.delete('/contas/:numeroConta', deleteAccount);

router.post('/transacoes/depositar', depositValue);
router.post('/transacoes/sacar', withdrawValue);
router.post('/transacoes/transferir', transferValue);

router.get('/contas/saldo', getBalance);
router.get('/contas/extrato', getExtract);

router.use(verifyPassword);
router.get('/contas', listAccounts);

module.exports = router;
