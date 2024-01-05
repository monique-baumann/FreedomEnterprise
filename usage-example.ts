import { VITALIK } from "./deno/constants-types-infrastructure.ts";
import { FreedomEnterprise } from "./deno/freedom-enterprise.ts";

const freedomEnterprise = await FreedomEnterprise.getInstance()

const descriptionInMarkdown = "## Create Hello Free World Example"
const amount = 9
const completionLevel = 100
const receiver = VITALIK


await freedomEnterprise.createTask(descriptionInMarkdown, amount) 
const taskCounter = await freedomEnterprise.getTaskCounter()
console.log(await freedomEnterprise.getTask(taskCounter))

await freedomEnterprise.fundTask(taskCounter, amount) 
const fundingCounter = await freedomEnterprise.getFundingCounter()
console.log(await freedomEnterprise.getFunding(fundingCounter))

await freedomEnterprise.rewardSomeone(receiver, taskCounter, amount) 
const rewardCounter = await freedomEnterprise.getRewardCounter()
console.log(await freedomEnterprise.getReward(rewardCounter))

let claimableRewards = await freedomEnterprise.getClaimableRewardAmountForReceiver(receiver)
console.log(claimableRewards)
await freedomEnterprise.claimRewards() 
claimableRewards = await freedomEnterprise.getClaimableRewardAmountForReceiver(receiver)
console.log(claimableRewards)

await freedomEnterprise.setCompletionLevel(taskCounter, completionLevel) 
console.log(await freedomEnterprise.getTask(taskCounter))

