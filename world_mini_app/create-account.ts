var Web3 = require("web3");

const func = () => {
  const account = Web3.eth.accounts.create();
  console.log(account);
};

func();
