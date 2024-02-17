## ECDSA Node

This project is an example of using a client and server to facilitate transfers between different addresses. Since there is just a single server on the back-end handling transfers, this is clearly very centralized. We won't worry about distributed consensus for this project.

However, something that we would like to incoporate is Public Key Cryptography. By using Elliptic Curve Digital Signatures we can make it so the server only allows transfers that have been signed for by the person who owns the associated address.

### Video instructions
For an overview of this project as well as getting started instructions, check out the following video:

https://www.loom.com/share/0d3c74890b8e44a5918c4cacb3f646c4
 
### Client

The client folder contains a [react app](https://reactjs.org/) using [vite](https://vitejs.dev/). To get started, follow these steps:

1. Open up a terminal in the `/client` folder
2. Run `npm install` to install all the depedencies
3. Run `npm run dev` to start the application 
4. Now you should be able to visit the app at http://127.0.0.1:5173/

### Server

The server folder contains a node.js server using [express](https://expressjs.com/). To run the server, follow these steps:

1. Open a terminal within the `/server` folder 
2. Run `npm install` to install all the depedencies 
3. Run `node index` to start the server 

The application should connect to the default server port (3042) automatically! 

_Hint_ - Use [nodemon](https://www.npmjs.com/package/nodemon) instead of `node` to automatically restart the server on any changes.


### How to use

There are these public nad private keys to work with. I use for it the `generate.js` script in the `scripts` folder.   

```
// public : private keys 
const privateKeys = {
  "04a014da4889c6f5cb9f931c94a8ac05086beb6a986d131ec530e2ff95bad314f9e0656873d7ae340227429694f74490916cb7fe6e93942a10079a7793fa30af4e": 
        "17e6131e74596da06b23b4a608033af513785b81f8e1c9ae7decaf5c05418f04",
  "0483fa800ec2775cbe651fcbb90307e1e1ebe1283be57e56a53d4af7cfd36e5d86ae67a19d02df70c3d0e929c5e4a401ef1a2b04cc53e2bbb942c48c5824fc4525": 
        "0787f73bf2c6ef7b08f29b6f6791b84f44414fd549cf61718fd256fef23363e4",
  "041eecc51e93ba3e6df3d4d358da48ec7834f10d85fd4143ebb72e20338d9c944fc18190d03c6f11d703ce441cdf635dc6e313ca1e7cf80ece9f84c1b6aee68014": 
        "31b830fafe8b8147a79dd1ba96de76b839131d9adeab68432ff2574547954c24",
  "04fee953fd5366e39846b233f79ed4bfe704fa252c05752413f190abc6fbf665036bad52786adb9df2e4051924e7b34448d7f77a4607f46243c5d7bb1bb33f8fa3": 
        "298a04ae69c86dafc0e35c812f564bf8a6d9cb05e196cb292ef2d31894dd3ddc",
};
```

1. Take your private key you want to send ether from, e.x. '17e6131e74596da06b23b4a608033af513785b81f8e1c9ae7decaf5c05418f04'. Put it in your wallet and see the balance of 100.
2. Send an amout of 10
3. Take the public key, where you want to send the ether to e.x. '04fee953fd5366e39846b233f79ed4bfe704fa252c05752413f190abc6fbf665036bad52786adb9df2e4051924e7b34448d7f77a4607f46243c5d7bb1bb33f8fa3'
4. See that the balance reduce to 90
5. Enter the private key of the recipent, e.x. '298a04ae69c86dafc0e35c812f564bf8a6d9cb05e196cb292ef2d31894dd3ddc' and check the balance 45
