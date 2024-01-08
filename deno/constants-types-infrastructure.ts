import { ethers, Logger } from "../deps.ts"

export const FE = "0xFD664B3F9f23e1b6858b4bdD1Ca487f07dC45Ec3"
export const FC = "0x1E7A208810366D0562c7Ba93F883daEedBf31410"
export const VITALIK = "0xB257CCE82d58Ed21c70B4B0cac6a6089408E5dbE" // temp :)
// export const VITALIK = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
export const baseURLScan = "https://zkevm.polygonscan.com/"

export interface ITask {
    createdBy: string
    timestamp: number
    descriptionInMarkdown: string
    completionLevel: number
}

export interface IFunding {
    from: string
    amount: bigint
    assignedAmount: bigint
    timestamp: number
}
export interface ISolution {
    from: string
    evidence: string
    score: bigint
    claimed: bigint
    timestamp: number
}

export function getProvider(logger: Logger) {
    return new ethers.JsonRpcProvider(getProviderURL(logger))
}
export function getABI(url: string) {
    return JSON.parse(Deno.readTextFileSync(url))
}
export async function getContract(asset: string, provider: any, url: string): Promise<any> {
    const configuration = JSON.parse(Deno.readTextFileSync('./.env.json'))
    return new ethers.Contract(asset, getABI(url), await provider.getSigner())
}
export function getProviderURL(logger: Logger): string {
    let configuration: any = {}
    if (Deno.args[0] !== undefined) { // supplying your provider URL via parameter
        return Deno.args[0]
    } else { // ... or via .env.json
        try {
            configuration = JSON.parse(Deno.readTextFileSync('./.env.json'))
            return configuration.providerURL
        } catch (error) {
            logger.error(error.message)
            logger.error("without a providerURL I cannot connect to the blockchain")
        }
    }
    throw new Error("could not get a providerURL")
}
let loggerInstance
export async function getLogger() {
    if (loggerInstance === undefined) {
        const minLevelForConsole = 'DEBUG'
        const minLevelForFile = 'WARNING'
        const fileName = "./warnings-errors.txt"
        const pureInfo = true // leaving out e.g. the time info
        loggerInstance = await Logger.getInstance(minLevelForConsole, minLevelForFile, fileName, pureInfo)
    }
    return loggerInstance
}

