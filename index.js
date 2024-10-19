const Web3 = require('web3');
const express = require('express');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const infura_url = process.env.INFURA_URL || 'http://localhost:8545';
const web3 = new Web3(new Web3.providers.HttpProvider(infura_url));

const RemixAbiContract = 'ABI from Remix'
const contractABI = [RemixAbiContract];
const contractAddress = '0xYourContractAddress';

const contract = new web3.eth.Contract(contractABI, contractAddress);

const userAddress = '0xEthereumAddress';
const privateKey = process.env.PRIVATE_KEY;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/submit', async (req, res) => {
  const memeUrl = req.body.meme_url;

  try {
    const nonce = await web3.eth.getTransactionCount(userAddress);
    const tx = contract.methods.submitMeme(memeUrl);
    const gas = await tx.estimateGas({ from: userAddress });
    const gasPrice = await web3.eth.getGasPrice();

    const txData = {
      from: userAddress,
      to: contractAddress,
      data: tx.encodeABI(),
      gas,
      gasPrice,
      nonce
    };

    const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log('Meme submitted, hash:', receipt.transactionHash);
    res.send('Meme submitted successfully!');
  } catch (err) {
    res.status(500).send('Error submitting meme');
  }
});

app.post('/upvote', async (req, res) => {
  const memeId = req.body.meme_id;

  try {
    const nonce = await web3.eth.getTransactionCount(userAddress);
    const tx = contract.methods.upvoteMeme(memeId);
    const gas = await tx.estimateGas({ from: userAddress });
    const gasPrice = await web3.eth.getGasPrice();

    const txData = {
      from: userAddress,
      to: contractAddress,
      data: tx.encodeABI(),
      gas,
      gasPrice,
      nonce
    };

    const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log('Meme upvoted, hash:', receipt.transactionHash);
    res.send('Meme upvoted successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error upvoting meme');
  }
});

app.get('/random', async (req, res) => {
  try {
    const memeUrl = await contract.methods.randomMeme().call();
    res.send({ memeUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching random meme');
  }
});

app.listen(port, () => {
  console.log(`Server running @ http://localhost:${port}`);
});
