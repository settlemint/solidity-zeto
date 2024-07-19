// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    event CounterIncremented(uint256 indexed newValue);

    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        ++number;
        emit CounterIncremented(number);
    }
}
