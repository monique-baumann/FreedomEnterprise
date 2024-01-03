/* SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE Version 3

*/

pragma solidity 0.8.19;
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.4/contracts/token/ERC20/IERC20.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.4/contracts/utils/math/Math.sol";

interface IFreedomCash {
    function getBuyPrice(uint256 amountToBeBought) external view returns(uint256);
    function getSellPrice() external  view returns(uint256);
    function buyFreedomCash(uint256 fCAmount, uint256 fCBuyPrice) external payable;
    function sellFreedomCash(uint256 amount, uint256 sellPrice) external;
  }

contract FreedomEnterprise {
  
  uint256 taskCounter = 0;
  mapping(uint256 => Task) public tasks;
  struct Task {
    address createdBy;
    uint256 createdOn;
    string descriptionInMarkdown;
    uint256 funding;
    uint24 completionLevel;
  }
  mapping(address => mapping(uint256 => uint256) ) claimableRewardsPerTask;
  mapping(address => mapping(uint256 => uint256) ) claimedRewardsPerTask;
  address freedomCashSmartContract = 0xa1e7bB978a28A30B34995c57d5ba0B778E90033B;

  error TaskIDNotAvailableYet();
  error OnlyTheCreatorOfTheTaskCanDoThat();  
  error YouCannotRewardWithMoreThanFunding();
  error HundredPercentIsEnough();

  function createTask(string memory descriptionInMarkdown, uint256 fundingAmountFC) public payable {
    taskCounter++;
    uint256 fCBuyPrice = IFreedomCash(freedomCashSmartContract).getBuyPrice(fundingAmountFC);
    IFreedomCash(freedomCashSmartContract).buyFreedomCash(fundingAmountFC, fCBuyPrice);
    Task memory task = Task(msg.sender, block.timestamp, descriptionInMarkdown, fundingAmountFC, 0);
    tasks[taskCounter] = task;
  }

  function fundTask(uint256 taskID) public payable {
    if (taskID > taskCounter) { revert TaskIDNotAvailableYet(); }
    tasks[taskID].funding += msg.value;
  }

  function setCompletionLevel(uint256 taskID, uint24 completionLevel) public {
    if (tasks[taskID].createdBy != msg.sender) { revert OnlyTheCreatorOfTheTaskCanDoThat(); }
    if(completionLevel > 100) { revert HundredPercentIsEnough(); }
    tasks[taskID].completionLevel = completionLevel;
  }

  function reward(address receiver, uint256 taskID, uint256 amount) public payable {
    if (tasks[taskID].createdBy != msg.sender) { revert OnlyTheCreatorOfTheTaskCanDoThat(); }
    if (tasks[taskID].funding < amount) { revert YouCannotRewardWithMoreThanFunding(); }
    claimableRewardsPerTask[receiver][taskID] +=  amount;
  }
  
  function claimRewards() public payable {
    uint256 totalClaimableRewards = 0;
    for (uint256 i = 1; i <= taskCounter; i++) {
      if(claimableRewardsPerTask[msg.sender][i] > 0) {
        totalClaimableRewards += claimableRewardsPerTask[msg.sender][i];
        claimedRewardsPerTask[msg.sender][i] += claimableRewardsPerTask[msg.sender][i];
        claimableRewardsPerTask[msg.sender][i] = 0;
      }
    }      
    IERC20(freedomCashSmartContract).transfer(msg.sender, totalClaimableRewards);
  }
}