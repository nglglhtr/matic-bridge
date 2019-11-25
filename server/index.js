const Web3 = require('web3')
const config = rerequire('config')
const BridgeArtifact = require('../build/contracts/Bridge.json')
const IMaticTokenArtifact = require('../build/contracts/IMaticToken.json')

const web3 = new Web3(new HDWalletProvider(process.env.MAIN_CHAIN_MNEMONIC, config.get('networks.mainchain.rpc')))
const childWeb3 = new Web3(new HDWalletProvider(process.env.CHILD_CHAIN_MNEMONIC, config.get('networks.childchain.rpc')))

const bridge = new web3.eth.Contract(BridgeArtifact.abi, config.get('contracts.bridge'))

const rootToChild = {}
config.get('contracts.tokens').forEach(token => {
  const contract = new childWeb3.eth.Contract(IMaticTokenArtifact.abi, token.child)
  rootToChild[token.root] = { contract, isErc721: token.isErc721 }
  // subscribe to burn event (Transfer to address(0)) on child tokens
  // contract.events.Transfer({ filter: { to: '' }, fromBlock: 0, toBlock: 'latest' })
  contract.events.Transfer({ fromBlock: 0, toBlock: 'latest' })
  .on('connected', function(subscriptionId) {
    console.log(`Listening to Transfer(,address(0),) events on child contract`);
  })
  .on('data', event => {
    console.log(event);
    // transfer to user on root chain
  })
})

// Subscribe to deposit events on bridge
bridge.events.Deposit({ fromBlock: 0 })
.on('connected', function(subscriptionId) {
  console.log(`Listening to Deposit events on Bridge contract`);
})
.on('data', event => {
  console.log(event);
  // mint on child contract
})
