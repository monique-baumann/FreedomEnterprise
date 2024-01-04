import { FreedomEnterprise } from "./deno/freedom-enterprise.ts";

const freedomEnterprise = await FreedomEnterprise.getInstance()

const descriptionInMarkdown = "## Create Hello Free World Example"
const taskID = 1
const amount = 9
const completionLevel = 100
const receiver = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" 


await freedomEnterprise.createTask(descriptionInMarkdown, amount) 
const task = await freedomEnterprise.getTask(1)
console.log(task)
// await freedomEnterprise.fundTask(taskID, amount) 
// await freedomEnterprise.setCompletionLevel(taskID, completionLevel) 
// await freedomEnterprise.reward(receiver, taskID, amount) 
// await freedomEnterprise.claimRewards() 

