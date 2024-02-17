import {useState} from "react";
import server from "./server";
import * as secp from 'ethereum-cryptography/secp256k1';
import {toHex, utf8ToBytes} from 'ethereum-cryptography/utils';
import {keccak256} from "ethereum-cryptography/keccak";

function Transfer({address, setBalance, privateKey, transactions, setTransactions}) {
    const [sendAmount, setSendAmount] = useState("");
    const [recipient, setRecipient] = useState("");
    const [signedMessage, setSignedMessage] = useState("");
    const setValue = (setter) => (evt) => setter(evt.target.value);

    async function transfer(evt) {
        evt.preventDefault();

        // check input vlaues
        if ((!address && address.length === 64) || !recipient || (!sendAmount && parseInt(sendAmount) > 0)) {
            // TODO: change this to a nicer widget version as alert
            alert("Please check the input values");
        }

        // get the current transaction count to build the nounce
        const {
            data: {transactionCount},
        } = await server.get(`transactions/${address}`);
        setTransactions(transactionCount);

        // build the data object
        const transferData = {
            sender: address,
            amount: parseInt(sendAmount),
            nounce: transactions,
            recipient,
        }

        // sign the send data
        const signedMessage = await signMessage(JSON.stringify(transferData));
        setSignedMessage(signedMessage);
        // console.log("signedMessage", signedMessage);

        // check the sign message, if the sign function is working - debugging
        // const publicKeyRecovered = await secp.recoverPublicKey(hashMessage(JSON.stringify(transferData)), signedMessage[0], signedMessage[1]);
        // console.log("publicKeyRecovered: " + publicKeyRecovered);

        // check with the verify methode, if the recovery function is working - debugging
        // const isSigned = secp.verify(signedMessage[0], hashMessage(JSON.stringify(transferData)), publicKeyRecovered);
        // console.log("isSigned: " + isSigned);

        try {
            const {
                data: {balance, transaction},
            } = await server.post(`send`, {
                transferJsonData: JSON.stringify(transferData),
                signedMessage: signedMessage[0],
                recoveryBit: signedMessage[1],
            });
            setBalance(balance);
            setTransactions(transaction);
        } catch (ex) {
            console.log(ex);
            alert(ex.response.data.message);
        }
    }

    //TODO: Show the signature when all necessary data was entered
    async function signMessage(msg) {
        const hashedMessage = hashMessage(msg);
        let signedMessage = await secp.sign(hashedMessage, privateKey, {recovered: true});
        return signedMessage;
    }

    function hashMessage(message) {
        const bytes = utf8ToBytes(message);
        return keccak256(bytes);
    }

    async function onLeave(evt) {
        const inputValue = evt.target.value;
        if (inputValue.length !== 130) {
            // TODO: change this to a nicer widget version as alert
            alert("Please check your Input. It is not correct.");
        }

    }

    return (
        <form className="container transfer" onSubmit={transfer}>
            <h1>Send Transaction</h1>

            <label>
                Send Amount
                <input
                    placeholder="1, 2, 3..."
                    value={sendAmount}
                    type='number'
                    required
                    onChange={setValue(setSendAmount)}
                ></input>
            </label>

            <label>
                Recipient
                <input
                    placeholder="Type in the public key of the recipient"
                    value={recipient}
                    required
                    onChange={setValue(setRecipient)}
                    onBlur={onLeave}
                ></input>
            </label>

            <div className="balance">
                Signature: <br/>
                <br/>
                <div style={{color: '',paddingBottom: '25px',inlineSize:'450px',overflowWrap:'break-word',hyphens:'manual' }}>
                    {signedMessage}
                </div>
            </div>

            <div className="balance" style={{ paddingBottom: '25px' }}>
                Transaction ID: {transactions}
            </div>

            <input type="submit" className="button" value="Transfer"/>
        </form>
    );
}

export default Transfer;
