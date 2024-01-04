import { ethers, Logger } from "../deps.ts"
import { ITask, getLogger, getProvider, getContract, FE, FC, baseURLScan } from "./constants-types-infrastructure.ts"

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
        const buyPrice = await this.contractFreedomCash.getBuyPrice(BigInt(10**18))
        const cost = buyPrice * BigInt(fundingAmountFC)
        this.logger.debug(`creating task. taskCounter before: ${await this.contractFreedomEnterprise.taskCounter()}`)
        await this.awaitTransaction(await this.contractFreedomEnterprise.createTask(descriptionInMarkdown, parsedAmount, { value: cost }))
        this.logger.debug(`taskCounter after: ${await this.contractFreedomEnterprise.taskCounter()}`)
    }

    public async fundTask(taskID: number, fundingAmountFC: bigint): Promise<void> {
        const parsedAmount = ethers.parseEther(fundingAmountFC.toString())
        this.logger.info(`funding task ${taskID} with amount: ${parsedAmount}`)
        await this.awaitTransaction(await this.contractFreedomEnterprise.fundTask(taskID, { value: parsedAmount }))
    }

    public async setCompletionLevel(taskID: number, completionLevel: number): Promise<void>{
        this.logger.info(`setting completion level for task ${taskID} to: ${completionLevel}`)
        await this.awaitTransaction(await this.contractFreedomEnterprise.setCompletionLevel(taskID, completionLevel))
    }

    public async reward(receiver: string, taskID: number, amount: number): Promise<void> {
        this.logger.info(`assigning ${amount} Freedom Cash as reward for task ${taskID} to receiver: ${receiver}`)
        await this.awaitTransaction(await this.contractFreedomEnterprise.reward(receiver, taskID, amount))
    }

    public async claimRewards(): Promise<void> {
        this.logger.info(`claimingRewards`)
        await this.awaitTransaction(await this.contractFreedomEnterprise.claimRewards())
    }

    public async getTask(taskID: number): Promise<ITask> {
        this.logger.info(`reading task ${taskID}`)
        const raw = await this.contractFreedomEnterprise.tasks(taskID)
        return {
            createdBy: raw[0],
            createdOn: raw[1],
            descriptionInMarkdown: raw[2],
            funding: raw[3],
            completionLevel: raw[4]
        }
    }

    private async awaitTransaction(tx: any): Promise<void> {
        this.logger.info(`transaction ${baseURLScan}tx/${tx.hash}`)
        await tx.wait()
    }
}
