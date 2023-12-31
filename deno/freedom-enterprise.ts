import { ethers, Logger } from "../deps.ts"
import { ITask, IFunding, getLogger, getProvider, getContract, FE, FC, baseURLScan } from "./constants-types-infrastructure.ts"

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
            return new FreedomEnterprise(logger, contractFreedomEnterprise, contractFreedomCash, provider)
        }
    }

    protected logger: Logger
    protected provider: any
    protected contractFreedomEnterprise: any
    protected contractFreedomCash: any

    protected constructor(logger: Logger, contractFreedomEnterprise: any, contractFreedomCash: any, provider: any) {
        this.logger = logger
        this.provider = provider
        this.contractFreedomEnterprise = contractFreedomEnterprise
        this.contractFreedomCash = contractFreedomCash
    }

    public async createTask(descriptionInMarkdown: string, fundingAmountFC: number): Promise<void> {
        try {
            const parsedAmount = ethers.parseEther(fundingAmountFC.toString())
            const buyPrice = await this.contractFreedomCash.getBuyPrice(BigInt(10 ** 18))
            const cost = buyPrice * BigInt(fundingAmountFC)
            this.logger.debug(`creating task. taskCounter before: ${await this.getTaskCounter()}`)
            const tx = await this.contractFreedomEnterprise.createTask(descriptionInMarkdown, parsedAmount, buyPrice, { value: cost })
            await this.awaitTransaction(tx)
            this.logger.debug(`taskCounter after: ${await this.getTaskCounter()}`)
        } catch (error) {
            this.logger.error(error)
        }
    }

    public async fundTask(taskID: number, fundingAmountFC: bigint): Promise<void> {
        try {
            const parsedAmount = ethers.parseEther(fundingAmountFC.toString())
            const buyPrice = await this.contractFreedomCash.getBuyPrice(BigInt(10 ** 18))
            const cost = buyPrice * BigInt(fundingAmountFC)
            this.logger.info(`funding task ${taskID} with amount: ${parsedAmount} FC at price ${buyPrice} paying in total: ${cost} ETH`)
            await this.awaitTransaction(await this.contractFreedomEnterprise.fundTask(taskID, parsedAmount, buyPrice, { value: cost }))
        } catch (error) {
            this.logger.error(error)
        }
    }

    public async provideSolution(taskID: number, evidence: string): Promise<void> {
        this.logger.info(`providing solution for taskID ${taskID}: ${evidence}`)
        try {
            await this.awaitTransaction(await this.contractFreedomEnterprise.provideSolution(taskID, evidence))
        } catch (error) {
            this.logger.error(error)
        }
    }

    public async appreciateSolution(solutionID: number, amount: number) {
        try {
            const parsedAmount = ethers.parseEther(amount.toString())
            this.logger.info(`appreciating solution ${solutionID} with: ${parsedAmount}`)
            await this.awaitTransaction(await this.contractFreedomEnterprise.appreciateSolution(solutionID, parsedAmount))
        } catch (error) {
            this.logger.error(error)
        }
    }

    public async claimRewards(): Promise<void> {
        this.logger.info(`claimingRewards`)
        this.logger.info(`fc balance in smart contract before: ${await this.contractFreedomCash.balanceOf(FE)}`)
        await this.awaitTransaction(await this.contractFreedomEnterprise.claimRewards())
        this.logger.info(`fc balance in smart contract after : ${await this.contractFreedomCash.balanceOf(FE)}`)
    }

    public async logWhatsUp() {
        this.logger.debug(`task counter: ${await this.getTaskCounter()}`)
        this.logger.debug(`funding counter: ${await this.getFundingCounter()}`)
        this.logger.debug(`solution counter ${await this.getSolutionCounter()}`)
        this.logger.debug(`claimable reward ${await this.getClaimableReward("0xB257CCE82d58Ed21c70B4B0cac6a6089408E5dbE")}`)
        const task1 = await this.getTask(1)
        this.logger.debug(`task 1: ${task1.createdBy} ${task1.timestamp} ${task1.descriptionInMarkdown}`)
        const funding1 = await this.getFunding(1)
        this.logger.debug(`funding 1: ${funding1.from} ${funding1.amount} ${funding1.assignedAmount} ${funding1.timestamp}`)
        const funding2 = await this.getFunding(2)
        this.logger.debug(`funding 2: ${funding2.from} ${funding2.amount} ${funding2.assignedAmount} ${funding2.timestamp}`)
        const solution1 = await this.getSolution(1)
        this.logger.debug(`solution 1: ${solution1.from} ${solution1.evidence} ${solution1.score} ${solution1.claimed} ${solution1.timestamp}`)
    }

    public async getMaxAppreciationPotential(taskID: number, supporter: string) {
        this.logger.info(`getting maximum appreciation potential for task ${taskID} by supporter ${supporter}`)
        return this.contractFreedomEnterprise.getMaxAppreciationPotential(taskID, supporter)
    }

    public async getClaimableReward(receiver: string): Promise<bigint> {
        this.logger.info(`getting claimable rewards for ${receiver}`)
        return this.contractFreedomEnterprise.getClaimableReward(receiver)
    }

    public async getTask(taskID: number): Promise<ITask> {
        this.logger.info(`reading task ${taskID}`)
        const raw = await this.contractFreedomEnterprise.tasks(taskID)

        return {
            createdBy: raw[0],
            timestamp: raw[1],
            descriptionInMarkdown: raw[2]
        }
    }
    public async getFunding(fundingID: number): Promise<IFunding> {
        this.logger.info(`reading funding ${fundingID}`)
        const raw = await this.contractFreedomEnterprise.fundings(fundingID)

        return {
            from: raw[0],
            amount: raw[1],
            assignedAmount: raw[2],
            timestamp: raw[3]
        }
    }    
    public async getSolution(solutionID: number) {
        this.logger.info(`reading solution ${solutionID}`)
        const raw = await this.contractFreedomEnterprise.solutions(solutionID)

        return {
            from: raw[0],
            evidence: raw[1],
            score: raw[2],
            claimed: raw[3],
            timestamp: raw[4]
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
    public async getSolutionCounter(): Promise<number> {
        this.logger.info(`reading solutionCounter`)
        return this.contractFreedomEnterprise.solutionCounter()
    }
    private async awaitTransaction(tx: any): Promise<void> {
        this.logger.info(`transaction ${baseURLScan}tx/${tx.hash}`)
        await tx.wait()
    }
}
