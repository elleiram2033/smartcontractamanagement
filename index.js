import { ethers } from 'ethers';

const contractSource = `
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address public owner;
    uint256 public balance;

    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);

    constructor(uint256 initBalance) payable {
        owner = msg.sender;
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit() public payable {
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(balance >= _withdrawAmount, "Insufficient balance");
        balance -= _withdrawAmount;
        payable(msg.sender).transfer(_withdrawAmount);
        emit Withdraw(msg.sender, _withdrawAmount);
    }

    function withdrawAll() public {
        uint256 _balance = balance;
        require(_balance > 0, "No balance to withdraw");
        balance = 0;
        payable(msg.sender).transfer(_balance);
        emit Withdraw(msg.sender, _balance);
    }

    function renounceOwnership() public {
        require(msg.sender == owner, "Only the owner can renounce ownership");
        owner = address(0);
    }
}
`;

async function main() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const factory = new ethers.ContractFactory(contractSource, Assessment);
    const contract = await factory.deploy();
    await contract.deployed();
    
    console.log('Deployed contract address:', contract.address);
    
    const balance = await contract.getBalance();
    console.log('Current Balance:', balance.toString());
    
    const depositAmount = ethers.utils.parseEther('1.0'); // 1.0 ETH
    await contract.deposit({ value: depositAmount });

    const withdrawAmount = ethers.utils.parseEther('0.5'); // 0.5 ETH
    await contract.withdraw(withdrawAmount);
}

main().catch(console.error);
