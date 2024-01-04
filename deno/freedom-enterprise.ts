import { ethers, Logger } from "../deps.ts"
import { ITask, IFunding, IReward, getLogger, getProvider, getContract, FE, FC, baseURLScan } from "./constants-types-infrastructure.ts"

export class FreedomEnterprise {

    private static instance
    public static async getInstance() {
        if (FreedomEnterprise.instance === undefined) {
            const logger = await getLogger()
            const provider = getProvider(logger)
            const contractFreedomEnterprise = await getContract(FE, provider, './blockchain/freedom-enterprise-abi.json')
            const contractFreedomCash = await getContract(FC, provider, './blockchain/freedom-cash-abi.json')
            const currency = await contractFreedomEnterprise.freedomCashSmartContract()
            if (currency !== FC) {
                throw new Error(`check Freedom Cash ${FC} resp. ${currency}`)
            }
            return new FreedomEnterprise(logger, contractFreedomEnterprise, contractFreedomCash)
        }
    }

    protected logger: Logger
    protected contractFreedomEnterprise: any
    protected contractFreedomCash: any

    protected constructor(logger: Logger, contractFreedomEnterprise: any, contractFreedomCash: any) {
        this.logger = logger
        this.contractFreedomEnterprise = contractFreedomEnterprise
        this.contractFreedomCash = contractFreedomCash
    }

    public async createTask(descriptionInMarkdown: string, fundingAmountFC: number): Promise<void> {
        const parsedAmount = ethers.parseEther(fundingAmountFC.toString())
        const buyPrice = await this.contractFreedomCash.getBuyPrice(BigInt(10 ** 18))
        const cost = buyPrice * BigInt(fundingAmountFC)
        this.logger.debug(`creating task. taskCounter before: ${await this.getTaskCounter()}`)
        await this.awaitTransaction(await this.contractFreedomEnterprise.createTask(descriptionInMarkdown, parsedAmount, { value: cost }))
        this.logger.debug(`taskCounter after: ${await this.getTaskCounter()}`)
    }

    public async fundTask(taskID: number, fundingAmountFC: bigint): Promise<void> {
        const taskCounter = await this.getTaskCounter()
        if (taskCounter < taskID) {
            throw new Error(`is the task ${taskID} already available`)
        }
        const parsedAmount = ethers.parseEther(fundingAmountFC.toString())
        const buyPrice = await this.contractFreedomCash.getBuyPrice(BigInt(10 ** 18))
        const cost = buyPrice * BigInt(fundingAmountFC)
        this.logger.info(`funding task ${taskID} with amount: ${parsedAmount} FC at price ${buyPrice} paying in total: ${cost} ETH`)
        await this.awaitTransaction(await this.contractFreedomEnterprise.fundTask(taskID, parsedAmount, { value: cost }))
    }

    public async setCompletionLevel(taskID: number, completionLevel: number): Promise<void> {
        this.logger.info(`setting completion level for task ${taskID} to: ${completionLevel}`)
        await this.awaitTransaction(await this.contractFreedomEnterprise.setCompletionLevel(taskID, completionLevel))
    }

    public async rewardSomeone(receiver: string, taskID: number, amount: number): Promise<void> {
        this.logger.info(`assigning ${amount} Freedom Cash as reward for task ${taskID} to receiver: ${receiver}`)
        const parsedAmount = ethers.parseEther(amount.toString())
        await this.awaitTransaction(await this.contractFreedomEnterprise.rewardSomeone(receiver, taskID, parsedAmount))
    }
    public async getClaimableRewards(receiver: string): Promise<bigint> {
        this.logger.info(`getting claimable rewards for ${receiver}`)
        return this.contractFreedomEnterprise.getClaimableRewards(receiver)
    }

    public async claimRewards(): Promise<void> {
        this.logger.info(`claimingRewards`)
        this.logger.info(`fc balance in smart contract before: ${await this.contractFreedomCash.balanceOf(FE)}`)
        await this.awaitTransaction(await this.contractFreedomEnterprise.claimRewards())
        this.logger.info(`fc balance in smart contract after : ${await this.contractFreedomCash.balanceOf(FE)}`)
    }

    public async getTask(taskID: number): Promise<ITask> {
        this.logger.info(`reading task ${taskID}`)
        const raw = await this.contractFreedomEnterprise.tasks(taskID)
        this.logger.info(`${raw}`)

        return {
            createdBy: raw[0],
            timestamp: raw[1],
            descriptionInMarkdown: raw[2],
            completionLevel: raw[3]
        }
    }
    public async getFunding(fundingID: number): Promise<ITask> {
        this.logger.info(`reading funding ${fundingID}`)
        const raw = await this.contractFreedomEnterprise.fundings(fundingID)
        this.logger.info(`${raw}`)

        return {
            from: raw[0],
            amount: raw[1],
            timestamp: raw[2]
        }
    }
    public async getReward(rewardID: number): Promise<ITask> {
        this.logger.info(`reading reward ${rewardID}`)
        const raw = await this.contractFreedomEnterprise.tasks(rewardID)
        this.logger.info(`${raw}`)

        return {
            to: raw[0],
            amount: raw[1],
            timestamp: raw[2],
            claimed: raw[3]
        }
    }
    public async getTaskCounter(): Promise<number> {
        this.logger.info(`reading taskCounter`)
        return this.contractFreedomEnterprise.taskCounter()
    }
    public async getFundingCounter(): Promise<number> {
        this.logger.info(`reading fundingCounter`)
        return this.contractFreedomEnterprise.fundingCounter()
    }
    public async getRewardCounter(): Promise<number> {
        this.logger.info(`reading rewardCounter`)
        return this.contractFreedomEnterprise.rewardCounter()
    }
    private async awaitTransaction(tx: any): Promise<void> {
        this.logger.info(`transaction ${baseURLScan}tx/${tx.hash}`)
        await tx.wait()
    }
}
