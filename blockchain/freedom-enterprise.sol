/* SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE Version 3
Solve The Tasks You Like. Delegate The Rest. 
The Freedom Enterprise allows for free peer to peer collaboration. */

pragma solidity 0.8.19;
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.4/contracts/utils/math/Math.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.4/contracts/token/ERC20/IERC20.sol";

interface IFreedomCash {
    function getBuyPrice(uint256 amountToBeBought) external view returns(uint256);
    function getSellPrice() external  view returns(uint256);
    function buyFreedomCash(uint256 fCAmount, uint256 fCBuyPrice) external payable;
    function sellFreedomCash(uint256 amount, uint256 sellPrice) external;
}

contract FreedomEnterprise {
  
  uint256 public taskCounter = 0;
  uint256 public fundingsCounter = 0;
  uint256 public rewardsCounter = 0;
  mapping(uint256 => Task) public tasks;
  struct Task {
    address createdBy;
    uint256 timestamp;
    string descriptionInMarkdown;
    uint256 funding;
    uint24 completionLevel;
  }
  mapping(uint256 => Funding) public fundings;
  struct Funding{
    address to;
    uint256 amount;
    uint256 timestamp;
  }
  mapping(uint256 => Reward) public rewards;
  struct Reward {
    address from;
    address to;
    uint256 amount;
    uint256 timestamp;
    bool claimed;
  }
  mapping(uint256 => uint256) public fundingsToTask;
  mapping(uint256 => uint256) public rewardsToTask;
  address public freedomCashSmartContract = 0x1E7A208810366D0562c7Ba93F883daEedBf31410;
  error TaskIDNotAvailableYet();
  error OnlyTheCreatorOfTheTaskCanDoThat();  
  error YouCannotRewardWithMoreThanFunding();
  error HundredPercentIsEnough();

  function createTask(string memory descriptionInMarkdown, uint256 fundingAmountFC) public payable {
    taskCounter++;
    uint256 fCBuyPrice = IFreedomCash(freedomCashSmartContract).getBuyPrice(10**18);
    IFreedomCash(freedomCashSmartContract).buyFreedomCash{value: msg.value}(fundingAmountFC, fCBuyPrice);
    Task memory task = Task(msg.sender, block.timestamp, descriptionInMarkdown, fundingAmountFC, 0);
    tasks[taskCounter] = task;
  }
  function fundTask(uint256 taskID, uint256 fundingAmountFC) public payable {
    if (taskID > taskCounter) { revert TaskIDNotAvailableYet(); }
    fundingsCounter++;
    uint256 fCBuyPrice = IFreedomCash(freedomCashSmartContract).getBuyPrice(10**18);
    IFreedomCash(freedomCashSmartContract).buyFreedomCash{value: msg.value}(fundingAmountFC, fCBuyPrice);
    Funding memory funding = Funding(msg.sender, fundingAmountFC, block.timestamp);
    fundings[fundingsCounter] = funding;
    fundingsToTask[fundingsCounter] = taskID;
  }
  function rewardSomeone(address receiver, uint256 taskID, uint256 amount) public payable {
    if (tasks[taskID].createdBy != msg.sender) { revert OnlyTheCreatorOfTheTaskCanDoThat(); }
    if (tasks[taskID].funding < amount) { revert YouCannotRewardWithMoreThanFunding(); }
    rewardsCounter++;
    Reward memory reward = Reward(msg.sender, receiver, amount, block.timestamp, false);
    rewards[rewardsCounter] = reward;
    rewardsToTask[rewardsCounter] = taskID;
  }
  function setCompletionLevel(uint256 taskID, uint24 completionLevel) public {
    if (tasks[taskID].createdBy != msg.sender) { revert OnlyTheCreatorOfTheTaskCanDoThat(); }
    if(completionLevel > 100) { revert HundredPercentIsEnough(); }
    tasks[taskID].completionLevel = completionLevel;
  }
  function getClaimableRewards(address receiver) public view returns(uint256) {
    uint256 totalClaimableRewards = 0;
    for (uint256 i = 1; i <= rewardsCounter; i++) {
      if(rewards[rewardsCounter].to == receiver) {
        totalClaimableRewards += rewards[rewardsCounter].amount;
      }
    }
    return totalClaimableRewards;
  }     
  function claimRewards() public payable {
    uint256 totalClaimableRewards = 0;
    for (uint256 i = 1; i <= rewardsCounter; i++) {
      if(rewards[rewardsCounter].to == msg.sender) {
        rewards[rewardsCounter].claimed = true;
        totalClaimableRewards += rewards[rewardsCounter].amount;
      }
    }     
    IERC20(freedomCashSmartContract).transfer(msg.sender, totalClaimableRewards);
  }
}