// SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE Version 3

// Solve The Tasks You Like. Delegate The Rest. 
// The Freedom Enterprise is an enterprise system that's fully peer-to-peer, with no trusted third party.
// The Freedom Enterprise uses Freedom Cash as its decentralized currency
// https://zkevm.polygonscan.com/token/0xa1e7bB978a28A30B34995c57d5ba0B778E90033B

pragma solidity 0.8.19;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.4/contracts/utils/math/Math.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.4/contracts/token/ERC20/IERC20.sol";
import "https://github.com/monique-baumann/freedom-cash/blob/v1.3.0/blockchain/freedom-cash-interface.sol";

contract FreedomEnterprise {

  uint256 public taskCounter = 0;
  uint256 public fundingCounter = 0;
  uint256 public rewardCounter = 0;
  uint256 public solutionCounter = 0;
  mapping(uint256 => Task) public tasks;
  struct Task {
    address createdBy;
    uint256 timestamp;
    string descriptionInMarkdown;
  }
  mapping(uint256 => Funding) public fundings;
  struct Funding{
    address from;    
    uint256 amount;
    uint256 assignedAmount;
    uint256 timestamp;
  }
  mapping(uint256 => Solution) public solutions;
  struct Solution{
    address from;    
    string evidence;
    uint256 score;
    uint256 claimed;
    uint256 timestamp;
  }  
  mapping(uint256 => uint256) public fundingsToTask;
  mapping(uint256 => uint256) public solutionsToTask;  

  address public freedomCashSmartContract = 0x1E7A208810366D0562c7Ba93F883daEedBf31410; // testnet

  error TaskIDNotAvailableYet();
  error OnlyTheCreatorOfTheTaskCanDoThat();  
  error NothingToClaimATM();
  error HundredPercentIsEnough();
  error yourAppreciationAmountCannotBeHigherThanYourFundingsForThisTask();
  error BuyPriceMightHaveRisen(); 

  function createTask(string memory descriptionInMarkdown, uint256 fundingAmountFC, uint256 fCBuyPrice) public payable {
    taskCounter++;
    uint256 fCBuyPriceCheck = IFreedomCash(freedomCashSmartContract).getBuyPrice(10**18);
    if (fCBuyPriceCheck != fCBuyPrice) { revert BuyPriceMightHaveRisen(); }    
    IFreedomCash(freedomCashSmartContract).buyFreedomCash{value: msg.value}(fundingAmountFC, fCBuyPrice);
    Task memory task = Task(msg.sender, block.timestamp, descriptionInMarkdown);
    tasks[taskCounter] = task;
    Funding memory funding = Funding(msg.sender, fundingAmountFC, 0, block.timestamp);
    fundings[fundingCounter] = funding;
    fundingsToTask[fundingCounter] = taskCounter;
  }
  function fundTask(uint256 taskID, uint256 fundingAmountFC, uint256 fCBuyPrice) public payable {
    if (taskID > taskCounter) { revert TaskIDNotAvailableYet(); }
    fundingCounter++;
    uint256 fCBuyPriceCheck = IFreedomCash(freedomCashSmartContract).getBuyPrice(10**18);
    if (fCBuyPriceCheck != fCBuyPrice) { revert BuyPriceMightHaveRisen(); }
    IFreedomCash(freedomCashSmartContract).buyFreedomCash{value: msg.value}(fundingAmountFC, fCBuyPrice);
    Funding memory funding = Funding(msg.sender, fundingAmountFC, 0, block.timestamp);
    fundings[fundingCounter] = funding;
    fundingsToTask[fundingCounter] = taskID;
  }
  function provideSolution(uint256 taskID, string memory evidence) public {
    solutionCounter++;
    Solution memory solution = Solution(msg.sender, evidence, 0, 0, block.timestamp);
    solutions[solutionCounter] = solution;
    solutionsToTask[solutionCounter] = taskID;    
  }
  function getMaxAppreciationPotential(uint256 taskID, address supporter) public view returns(uint256) {
    uint256 maxAppreciationPotential = 0;
      for (uint256 i = 1; i <= fundingCounter; i++) {
        if (fundingsToTask[i] == taskID && fundings[i].from == supporter){
          maxAppreciationPotential += (fundings[i].amount - fundings[i].assignedAmount);
        }
      }

      return maxAppreciationPotential;
  }
  function appreciateSolution(uint256 solutionID, uint256 amount) public payable {
    uint256 taskID = solutionsToTask[solutionID];
    if (amount > getMaxAppreciationPotential(taskID, msg.sender)) {
      revert yourAppreciationAmountCannotBeHigherThanYourFundingsForThisTask();
    }    
    uint256 appreciationPot = 0;
    for (uint256 i = 1; i <= fundingCounter; i++) {
      if (fundingsToTask[i] == taskID && fundings[i].from == msg.sender){
          if (appreciationPot < amount) {
            uint256 diff = amount - appreciationPot;
            uint256 assignable = fundings[i].amount - fundings[i].assignedAmount;
            uint256 toBeAssigned = 0;
            if (diff > assignable){
              toBeAssigned = assignable;
            } else {
              toBeAssigned = diff;
            }
            appreciationPot += toBeAssigned;
            fundings[i].assignedAmount += toBeAssigned;
          } 
      }
    }    
    solutions[solutionID].score += amount;

  }
  function claimRewards() public {
    uint256 claimable = getClaimableReward(msg.sender);
    if (claimable > 0) {
      for (uint256 i = 1; i <= solutionCounter; i++) {
       if (solutions[i].from == msg.sender && solutions[i].score > 0){
        solutions[i].claimed = solutions[i].score;
        }
      }      
      IERC20(freedomCashSmartContract).transfer(msg.sender, claimable);
    } else {
      revert NothingToClaimATM();
    }
  }  
  function getFundingAmountOf(uint256 taskID) public view returns(uint256){
    uint256 total = 0;
    for (uint256 i = 1; i <= fundingCounter; i++) {
      if (fundingsToTask[i] == taskID){
        total += fundings[i].amount;
      }
    }
    return total;
  }
  function getClaimableReward(address receiver) public view returns(uint256){
    uint256 claimable = 0;
    for (uint256 i = 1; i <= solutionCounter; i++) {
      if (solutions[i].from == receiver && solutions[i].score > 0){
        claimable += (solutions[i].score - solutions[i].claimed);
      }
    }
    return claimable;
  }  
}