import server from "./server";

import * as secp from 'ethereum-cryptography/secp256k1';
import {toHex, bytesToHex} from 'ethereum-cryptography/utils';

function Wallet({address, setAddress, balance, setBalance, privateKey, setPrivateKey, transactions, setTransactions}) {
    async function onChange(evt) {
        const privateKey = evt.target.value;
        // check if the correct key was insert
        if (privateKey.length === 64) {
            setPrivateKey(privateKey);
            // console.log("privateKey", privateKey);
            // get the publicKey to form an address
            // TODO: this can be change to the ethereum address version
            // with 'keccak256(publicKey.slice(1)).slice(-20);'
            const address = toHex(secp.getPublicKey(privateKey));
            // console.log("address", address);
            setAddress(address);
            if (address) {
                try {
                    const {
                        data: {balance},
                    } = await server.get(`balance/${address}`);
                    const {
                        data: {transactionCount},
                    } = await server.get(`transactions/${address}`);
                    setTransactions(transactionCount);
                    setBalance(balance);
                } catch (ex) {
                    setTransactions(0);
                    setBalance(0);
                    console.log(ex);
                    alert(ex.response.data.message);
                }
            } else {
                setTransactions(0);
                setBalance(0);
            }
        }
    }

    async function onLeave(evt) {
        const privateKey = evt.target.value;
        if (privateKey.length !== 64) {
            // TODO: change this to a nicer widget version as alert
            alert("Please check your private key. It is not correct.");
        }
    }

    return (
        <div className="container wallet">
            <h1>Your Wallet</h1>

            <label>
                Private Key
                <input placeholder="Type in your private key" value={privateKey} onChange={onChange} required
                       onBlur={onLeave}></input>
            </label>

            <div className="balance">
                Address: {address.slice(0, 10)}...
            </div>

            <div className="balance">Balance: {balance}</div>
        </div>
    );
}

export default Wallet;
