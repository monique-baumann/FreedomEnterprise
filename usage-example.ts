import { VITALIK } from "./deno/constants-types-infrastructure.ts";
import { FreedomEnterprise } from "./deno/freedom-enterprise.ts";

const freedomEnterprise = await FreedomEnterprise.getInstance()

const descriptionInMarkdown = "## Hello Free World ### Please provide an enterprise system that's fully peer to peer."
const evidence = "https://github.com/monique-baumann/FreedomEnterprise"
const amount = 9
const receiver = VITALIK

await freedomEnterprise.createTask(descriptionInMarkdown, amount) 
const taskCounter = await freedomEnterprise.getTaskCounter()
console.log(await freedomEnterprise.getTask(taskCounter))

await freedomEnterprise.fundTask(taskCounter, amount) 
const fundingCounter = await freedomEnterprise.getFundingCounter()
console.log(await freedomEnterprise.getFunding(fundingCounter))

await freedomEnterprise.provideSolution(taskCounter, evidence) 
const solutionCounter = await freedomEnterprise.getSolutionCounter()
console.log(await freedomEnterprise.getSolution(solutionCounter))
const max = await freedomEnterprise.getMaxAppreciationPotential(taskCounter, "0xB257CCE82d58Ed21c70B4B0cac6a6089408E5dbE")
console.log(max)
await freedomEnterprise.appreciateSolution(solutionCounter, 8) 
console.log(await freedomEnterprise.getSolution(solutionCounter))

let claimableRewards = await freedomEnterprise.getClaimableReward("0xB257CCE82d58Ed21c70B4B0cac6a6089408E5dbE")
console.log(claimableRewards)
await freedomEnterprise.claimRewards() 

await freedomEnterprise.logWhatsUp()