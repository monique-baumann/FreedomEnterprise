import { Logger, ethers } from "../deps.ts"

export class FreedomEnterprise {

    private static instance
    public async getInstance() {
        if (FreedomEnterprise.instance === undefined) {
            const minLevelForConsole = 'DEBUG'
            const minLevelForFile = 'WARNING'
            const fileName = "./warnings-errors.txt"
            const pureInfo = true // leaving out e.g. the time info
            const logger = await Logger.getInstance(minLevelForConsole, minLevelForFile, fileName, pureInfo)
            return new FreedomEnterprise(logger)
        }
    }

    protected logger: Logger

    protected constructor(logger: Logger) {
        this.logger = logger
    }


    public async createTask(descriptionInMarkdown: string, fundingAmountFC: number) {

    }

    public async fundTask(taskID: number, amount: bigint) {
    }

    public async setCompletionLevel(taskID: number, completionLevel: number) {
    }

    public async reward(receiver: string, taskID: number, amount: number) {
    }

    public async claimRewards() {

    }
}


