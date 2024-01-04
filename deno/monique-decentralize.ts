import { Logger, ethers } from "../deps.ts"
import { Broker } from "./broker.ts"
import { getLogger, getProvider, getProviderURL, EActions, EDataTypes, getContract, VITALIK, UNI, OPDonations, WETH, FC } from "./constants-types-infrastructure.ts"
import { MoniqueBaumann } from "./monique-baumann.ts"

export class MoniqueDecentralize extends MoniqueBaumann {

    public static instance

    public static async getInstance(interestedIn: EDataTypes[]): Promise<void> {
        if (MoniqueDecentralize.instance === undefined) {
            const logger = await getLogger()
            const provider = getProvider(logger)
            const contract = await getContract(FC, provider)
            MoniqueDecentralize.instance = new MoniqueDecentralize(logger, provider, contract, interestedIn)
        }
        return MoniqueDecentralize.instance
    }

    private logger: Logger
    private provider: any
    private contract: any
    private interestedIn: EDataTypes[] = []

    protected constructor(logger: Logger, provider: any, contract: any, interestedIn: EDataTypes[]) {
        super(undefined, logger, provider, contract, interestedIn)
        this.logger = logger
        this.interestedIn = interestedIn
        this.provider = provider
        this.contract = contract
    }
    public async play() {
        const wallets = []
        for (const wallet of wallets) {
            const amount = Math.round(Math.random() * (18 - 9) + 9)
            this.logger.info(`sending ${amount}`)
            const tx = await this.contract.transfer(wallet, ethers.parseEther(amount.toString()))
            this.logger.debug(tx.hash)
            await tx.wait()
        }
    }
}