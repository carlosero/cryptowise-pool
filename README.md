# cryptowise-pool

This is a smart contract that can be used for raising funds between a pool of investors in order to submit an entire amount, let's say "50 ETH" for an ICO or private deal with a certain company. When the company delivers the tokens to our smart contract, each investor can make one single call to receive it's portion of tokens based on contribution.
Based on truffle framework for Solidity contracts.

## Functionalities

- Set admins that can manage the contract.
- Blacklist of investors.
- Whitelist of investors.
- Minimum/Maximum per-investor contribution.
- Maximum pool contribution.
- Configure wheter admins of the pool pay fees (or not) if they want to contribute.
- Charge (or not) fees for doing the pool.
- Pool fees can be either ETH or in tokens.
- Handles multiple airdrops of tokens (for those deals where you receive multiple bonuses after some time or time-locked tokens).
- As an investor, everything is as simple as sending plain 0 eth transactions to the contract address. It's all up to the pool state about what happens when investors send ETH.

## Setup

Clone this repo

cd into it

```shell
cd cryptowise-pool
```

Make sure everything works
```shell
npm test
```

And then you can just play with it. You can deploy contract to test net or main net if you want. This contract has not been tested on main net and should be heavily tested in test net before using it.

### Contact

- Developer: Carlos Rodríguez [@carlosero](https://github.com/carlosero)
- Email: ecarlos.rodriguez@gmail.com
- Website: [cryptowise.net](https://www.cryptowise.net/)
