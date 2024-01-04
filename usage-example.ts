import { FreedomEnterprise } from "./deno/freedom-enterprise.ts";

const freedomEnterprise = await FreedomEnterprise.getInstance()

const descriptionInMarkdown = "## Create Hello Free World Example"
const amount = 9
const completionLevel = 100
const receiver = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" 


await freedomEnterprise.createTask(descriptionInMarkdown, amount) 
const taskCounter = await freedomEnterprise.getTaskCounter()
console.log(await freedomEnterprise.getTask(taskCounter))

await freedomEnterprise.fundTask(taskCounter, amount) 
const fundingCounter = await freedomEnterprise.getFundingCounter()
console.log(await freedomEnterprise.getFunding(fundingCounter))

await freedomEnterprise.rewardSomeone(receiver, taskCounter, amount) 
const rewardCounter = await freedomEnterprise.getRewardCounter()
console.log(await freedomEnterprise.getReward(rewardCounter))

// const claimableRewards = await freedomEnterprise.getClaimableRewards(receiver)
// await freedomEnterprise.claimRewards() 

// await freedomEnterprise.setCompletionLevel(taskCounter, completionLevel) 
// console.log(await freedomEnterprise.getTask(taskCounter))

