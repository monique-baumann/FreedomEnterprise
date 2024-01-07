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
  uint256 public solutionsCounter = 0;
  mapping(uint256 => Task) public tasks;
  struct Task {
    address createdBy;
    uint256 timestamp;
    string descriptionInMarkdown;
    uint24 completionLevel;
  }
  mapping(uint256 => Funding) public fundings;
  struct Funding{
    address from;    
    uint256 amount;
    uint256 timestamp;
  }
  mapping(uint256 => Solution) public solutions;
  struct Solution{
    address from;    
    string evidence;
    uint256 score;
    uint256 timestamp;
  }  
  mapping(uint256 => uint256) public fundingsToTask;
  mapping(uint256 => uint256) public solutionsToTask;  

  address public freedomCashSmartContract = 0x1E7A208810366D0562c7Ba93F883daEedBf31410;

  error TaskIDNotAvailableYet();
  error OnlyTheCreatorOfTheTaskCanDoThat();  
  error NothingToClaimATM();
  error HundredPercentIsEnough();
  error yourAppreciationAmountCannotBeHigherThanYourFundingForThisTask();
  error strangeErrorCanProbablyBeDeleted();
  
  function createTask(string memory descriptionInMarkdown, uint256 fundingAmountFC) public payable {
    taskCounter++;
    uint256 fCBuyPrice = IFreedomCash(freedomCashSmartContract).getBuyPrice(10**18);
    IFreedomCash(freedomCashSmartContract).buyFreedomCash{value: msg.value}(fundingAmountFC, fCBuyPrice);
    Task memory task = Task(msg.sender, block.timestamp, descriptionInMarkdown, 0);
    tasks[taskCounter] = task;
    Funding memory funding = Funding(msg.sender, fundingAmountFC, block.timestamp);
    fundings[fundingCounter] = funding;
    fundingsToTask[fundingCounter] = taskCounter;
  }
  function fundTask(uint256 taskID, uint256 fundingAmountFC) public payable {
    if (taskID > taskCounter) { revert TaskIDNotAvailableYet(); }
    fundingCounter++;
    uint256 fCBuyPrice = IFreedomCash(freedomCashSmartContract).getBuyPrice(10**18);
    IFreedomCash(freedomCashSmartContract).buyFreedomCash{value: msg.value}(fundingAmountFC, fCBuyPrice);
    Funding memory funding = Funding(msg.sender, fundingAmountFC, block.timestamp);
    fundings[fundingCounter] = funding;
    fundingsToTask[fundingCounter] = taskID;
  }
  function provideSolution(uint256 taskID, string memory evidence) public {
    solutionsCounter++;
    Solution memory solution = Solution(msg.sender, evidence, 0, block.timestamp);
    solutions[solutionsCounter] = solution;
    solutionsToTask[solutionsCounter] = taskID;    
  }
  function appreciateSolution(uint256 solutionID, uint256 amount) public payable {
    uint256 taskID = solutionsToTask[solutionID];
    uint256 collected = updateFundingsDueToAppreciation(taskID, amount);
    if (amount == collected) {
      solutions[solutionID].score += amount;
    } else if (amount < collected) {
      revert strangeErrorCanProbablyBeDeleted();
    } else {
      revert yourAppreciationAmountCannotBeHigherThanYourFundingForThisTask();
    }
  }
  function updateFundingsDueToAppreciation(uint256 taskID, uint256 amount) internal returns(uint256) {
    uint256 collected = 0;
    for (uint256 i = 1; i <= fundingCounter; i++) {
      if (fundingsToTask[i] == taskID && fundings[i].from == msg.sender){
        uint256 missing = amount - collected;
        if (missing > 0){
          collected += fundings[i].amount;
          if(collected > missing) {
            fundings[i].amount = fundings[i].amount + (collected - missing);
            collected = amount;
          }
        }
      }
    }
    return collected;
  }
  function claimRewards() public {
    uint256 claimable = getClaimableReward(msg.sender);
    if (claimable > 0) {
      IERC20(freedomCashSmartContract).transfer(msg.sender, claimable);
    } else {
      revert NothingToClaimATM();
    }
  }  
  function setCompletionLevel(uint256 taskID, uint24 completionLevel) public {
    if (tasks[taskID].createdBy != msg.sender) { revert OnlyTheCreatorOfTheTaskCanDoThat(); }
    if(completionLevel > 100) { revert HundredPercentIsEnough(); }
    tasks[taskID].completionLevel = completionLevel;
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
    for (uint256 i = 1; i <= solutionsCounter; i++) {
      if (solutions[i].from == receiver && solutions[i].score > 0){
        claimable += solutions[i].score;
      }
    }
    return claimable;
  }  
}