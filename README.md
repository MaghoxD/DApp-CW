# Voting DApp – Coursework Project

This is a decentralized voting application built using the Truffle Framework and Ethereum smart contracts. It includes full frontend and backend integration and introduces a custom voting deadline feature.

---

## Features

- Submit and vote on proposals  
- Supports 3 types of votes: Approve, Against, Abstain  
- Smart contract written in Solidity  
- Frontend built with HTML, JavaScript, Web3.js  
## New Features
- Optional deadline for each proposal  
- Displays countdown timer (when deadline is set)  
- Disables voting after deadline passes  
- Real-time vote count  
---

## 🛠Installation & Running Instructions
### Prerequisites
- Node.js 
- Truffle
- 
npm install -g truffle
npm install -g ganache-cli   // for local blockchain

npx ganache-cli --port 7545
truffle compile
truffle migrate --reset

npm run dev

Author - M.Magho
