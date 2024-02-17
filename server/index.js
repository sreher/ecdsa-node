const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { utf8ToBytes } = require("ethereum-cryptography/utils.js");
const secp = require("ethereum-cryptography/secp256k1");
const secp256k1 = require('secp256k1');
const {keccak256} = require("ethereum-cryptography/keccak");
const {toHex} = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "04a014da4889c6f5cb9f931c94a8ac05086beb6a986d131ec530e2ff95bad314f9e0656873d7ae340227429694f74490916cb7fe6e93942a10079a7793fa30af4e": 100,
  "0483fa800ec2775cbe651fcbb90307e1e1ebe1283be57e56a53d4af7cfd36e5d86ae67a19d02df70c3d0e929c5e4a401ef1a2b04cc53e2bbb942c48c5824fc4525": 50,
  "041eecc51e93ba3e6df3d4d358da48ec7834f10d85fd4143ebb72e20338d9c944fc18190d03c6f11d703ce441cdf635dc6e313ca1e7cf80ece9f84c1b6aee68014": 75,
  "04fee953fd5366e39846b233f79ed4bfe704fa252c05752413f190abc6fbf665036bad52786adb9df2e4051924e7b34448d7f77a4607f46243c5d7bb1bb33f8fa3": 35,
};

// get the accounts a transaction number
const transactions = {
  "04a014da4889c6f5cb9f931c94a8ac05086beb6a986d131ec530e2ff95bad314f9e0656873d7ae340227429694f74490916cb7fe6e93942a10079a7793fa30af4e": 1,
  "0483fa800ec2775cbe651fcbb90307e1e1ebe1283be57e56a53d4af7cfd36e5d86ae67a19d02df70c3d0e929c5e4a401ef1a2b04cc53e2bbb942c48c5824fc4525": 2,
  "041eecc51e93ba3e6df3d4d358da48ec7834f10d85fd4143ebb72e20338d9c944fc18190d03c6f11d703ce441cdf635dc6e313ca1e7cf80ece9f84c1b6aee68014": 3,
  "04fee953fd5366e39846b233f79ed4bfe704fa252c05752413f190abc6fbf665036bad52786adb9df2e4051924e7b34448d7f77a4607f46243c5d7bb1bb33f8fa3": 4,
};

/* The private keys are never used in the Server */
const privateKeys = {
  "04a014da4889c6f5cb9f931c94a8ac05086beb6a986d131ec530e2ff95bad314f9e0656873d7ae340227429694f74490916cb7fe6e93942a10079a7793fa30af4e": "17e6131e74596da06b23b4a608033af513785b81f8e1c9ae7decaf5c05418f04",
  "0483fa800ec2775cbe651fcbb90307e1e1ebe1283be57e56a53d4af7cfd36e5d86ae67a19d02df70c3d0e929c5e4a401ef1a2b04cc53e2bbb942c48c5824fc4525": "0787f73bf2c6ef7b08f29b6f6791b84f44414fd549cf61718fd256fef23363e4",
  "041eecc51e93ba3e6df3d4d358da48ec7834f10d85fd4143ebb72e20338d9c944fc18190d03c6f11d703ce441cdf635dc6e313ca1e7cf80ece9f84c1b6aee68014": "31b830fafe8b8147a79dd1ba96de76b839131d9adeab68432ff2574547954c24",
  "04fee953fd5366e39846b233f79ed4bfe704fa252c05752413f190abc6fbf665036bad52786adb9df2e4051924e7b34448d7f77a4607f46243c5d7bb1bb33f8fa3": "298a04ae69c86dafc0e35c812f564bf8a6d9cb05e196cb292ef2d31894dd3ddc",
};
app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  if (!balances[address]) {
    res.status(400).send({ message: "No balance found your the address: " + address.slice(0, 10) });
  } else {
    const balance = balances[address] || 0;
    res.send({ balance });
  }
});

app.get("/transactions/:address", (req, res) => {
  const { address } = req.params;
  if (!transactions[address]) {
    res.status(400).send({ message: "No transaction found for your the address: " + address.slice(0, 10) });
  } else {
    const transactionCount = transactions[address] || 0;
    res.send({ transactionCount });
  }
});


app.post("/send", (req, res) => {
  const { transferJsonData, signedMessage, recoveryBit } = req.body;

  const transferData = JSON.parse(transferJsonData);
  const sender = transferData.sender;
  const amount = transferData.amount;
  const nounce = transferData.nounce;
  const recipient = transferData.recipient;
  const signedMessageUint8 = Uint8Array.from(Object.values(signedMessage));

  // Debug values
  // console.log("transferData", transferData);
  // console.log("sender", sender);
  // console.log("amount", amount);
  // console.log("signedMessage", signedMessage);
  // console.log("Uint8ArraySignedMessage", signedMessageUint8);
  // console.log("recoveryBit", recoveryBit);
  // console.log("recipient", recipient);

  // get the public key from the sign message and the recovery bit
  const publicKeyRecovered = secp.recoverPublicKey(hashMessage(transferJsonData), signedMessageUint8, recoveryBit);
  // console.log(`Public Key: ` + toHex(publicKeyRecovered));

  // check if the sign message wasn't change
  const isSigned = secp.verify(signedMessageUint8, hashMessage(transferJsonData), publicKeyRecovered);
  console.log(`isSigned: ` + isSigned);

  if (isSigned && transactions[sender] !== nounce ) {
    res.status(400).send({ message: "The transactions id is wrong!" });
  }
  else if (isSigned && sender !== toHex(publicKeyRecovered)) {
    res.status(400).send({ message: "The sender address is not verifyed!" });
  }
  else if (isSigned && amount <= 0) {
    res.status(400).send({ message: "The amount should be positive!" });
  }
  else if (isSigned && sender === recipient) {
    res.status(400).send({ message: "The sender and recipient address is the same!" });
  } else {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (isSigned && balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      // increase the transaction counter to prevent this transaction to send twice
      transactions[sender]++;
      //console.log("transactions[sender] after: ", transactions[sender]);
      res.send({ balance: balances[sender], transaction: transactions[sender] });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

async function recoverKey(message, signature, recoveryBit) {
  const hashedMessage = hashMessage(message);
  let uint8Array = await secp.recoverPublicKey(hashMessage(message), signature, recoveryBit);
  return uint8Array;
}

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  return keccak256(bytes);
}
