// see weight of constructor in gas
var Web3 = require('web3');
var web3 = new Web3();
var solc = require('solc');

var contractSource = fs.readFileSync("./contracts/Manager.sol").toString();
var output = solc.compile(contractSource, 1)

var managerContract = output.contracts[':Manager']
var bytecode = managerContract.bytecode
var interface = JSON.parse(managerContract.interface)

constructor = interface.find((a) => a.type == 'constructor')

admins = ['0x627306090abab3a6e1400e9345bc60c78a8bef57','0xf17f52151ebef6c7334fad080c5704d77216b732','0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef','0x821aea9a577a9b44299b9c15c88cf3087f3b5544']
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var ct = new web3.eth.Contract(interface)
var deploy = ct.deploy({
	data: bytecode,
	arguments: [300, 1000000000, 10000000000, 100000000000, admins]
})

deploy.estimateGas().then((e) => {
	var wei = web3.utils.toWei(e.toString(), 'gwei')
	console.log(web3.utils.fromWei(wei.toString()))
})





1313359

ct.methods.setAdmins(admins).encodeABI()
setAdmins = interface.find((a) => a.name == 'setAdmins')
web3.eth.abi.encodeFunctionCall(setAdmins, [admins])
