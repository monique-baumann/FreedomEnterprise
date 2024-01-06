<script>
	import { onMount } from 'svelte';
	import { ethers } from 'ethers';
	import {
		baseURLScan,
		smartContractAddress,
		freedomCashABI,
		targetChainName,
		targetChainId
	} from '../../constants.ts';
	import BlockChainData from './BlockChainData.svelte';
	import BlockChainInteraction from '$components/BlockChainInteraction.svelte';
	import EducateYourself from '$components/EducateYourself.svelte';

	let publicWalletAddressOfVisitor = '';
	let visitorIsConnectedViaBrowserWallet = false;
	let visitorHasBrowserWallet = false;
	let chainId = '';
	let contract;
	let accounts;
	let provider;
	let showDetails = false;

	onMount(() => {
		if (typeof window.ethereum === 'undefined') {
			visitorHasBrowserWallet = false;
		} else {
			visitorHasBrowserWallet = true;
		}
	});

	async function connectToBlockchain() {
		if (visitorHasBrowserWallet) {
			try {
				chainId = await window.ethereum.request({
					method: 'eth_chainId'
				});

				if (chainId !== targetChainId) {
					try {
						await window.ethereum.request({
							method: 'wallet_switchEthereumChain',
							params: [{ chainId: targetChainId }]
						});
					} catch (error) {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{
									chainId: '0x44d',
									chainName: 'Polygon zkEVM',
									rpcUrls: ['https://zkevm-rpc.com'],
									nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
									blockExplorerUrls: ['https://zkevm.polygonscan.com']
								}
							]
						});
					}
				}
				accounts = await window.ethereum.request({
					method: 'eth_requestAccounts'
				});

				provider = new ethers.BrowserProvider(window.ethereum);
				const signer = await provider.getSigner();
				contract = new ethers.Contract(smartContractAddress, freedomCashABI, signer);

				publicWalletAddressOfVisitor = accounts[0];
				window.ethereum.on('chainChanged', handleChainChanged);
				visitorIsConnectedViaBrowserWallet = true;
			} catch (error) {
				alert(error.message);
			}

			visitorIsConnectedViaBrowserWallet = true;
		}
		window.ethereum.on('accountsChanged', function (accounts) {
			alert(`the account has been changed via Metamask. So I reload.`);
			window.location.reload();
		});
	}
	function handleChainChanged(chainId) {
		// await connectToBlockchain()
		alert(`the chain has been changed via Metamask. So I reload.`);
		window.location.reload();
	}
</script>

<section class="text-center">
	<p><br /><br><br></p>

	<button
		class="button"
		on:click={() => {
			showDetails = !showDetails;
		}}
	>
		Show Details On Freedom Cash
	</button>

	{#if showDetails}
    <p><br><br></p>
		The Freedom Enterprise uses
		<a
			href="https://zkevm.polygonscan.com/token/0xa1e7bB978a28A30B34995c57d5ba0B778E90033B"
			target="_blank"
		>
			Freedom Cash
		</a>
		as its decentralized currency.
		<p><br /></p>
		Freedom Cash makes crypto cypherpunk again, while being simple enough for everyone who cares.
		<p><br /><br /></p>
		<div class="center">
			<img class="moniqueImage" src="/monique-baumann.jpeg" alt="" />
		</div>
		<p><br /></p>
		I buy and sell
		<a href="{baseURLScan}token/{smartContractAddress}" target="_blank">Freedom Cash</a>.
		<i>Monique Baumann</i>

		<h4 class="text-center">Total Supply</h4>
		369.369.369
		<a href="{baseURLScan}token/{smartContractAddress}" target="_blank"
			>Freedom Cash (FREEDOMCASH)</a
		>
		<h4 class="text-center">Utility</h4>
		Funding playgrounds for freedom.
		<p><br /></p>
		Freedom Cash supports peer to peer collaboration while preventing pump and dump frauds. Reduce dependency
		from exchanges by adding a buy and sell function within the smart contract itself. This allows to
		define a reasonable pricing algorithm and ensures that people do not need to waste gas-, liquidity
		provider- and exchange fees.

		<h4 class="text-center">Liquidity</h4>
		The total supply of Freedom Cash was minted not to the developer or deployer but to the
		<a href="{baseURLScan}token/{smartContractAddress}" target="_blank"> smart contract</a>
		itself.

		<EducateYourself></EducateYourself>
		<!-- <p><br /></p>
		<div class="center">
			<img class="tokenomicsImage" src="/investment-bets.png" alt="" />
		</div> -->

		<h4>Questions & Answers</h4>

		<p><br /></p>
		<h6>
			Why don't you create liquidity as an ETH/FreedomCash Tradingpair on Uniswap? <br />
		</h6>
		<p><br /></p>
		With our approach we reduce gas fees and avoid pool fees for
		<a href="{baseURLScan}token/{smartContractAddress}" target="_blank">Freedom Cash</a>
		investors.
		<p><br /></p>
		Additionally our pricing approach protects against ponzi like vulnerabilities & drops of the sell
		price.
		<p><br /><br /></p>
		<h6>What happens if anyone creates a liquidity pool for Freedom Cash on Uniswap?</h6>

		<br /> People are free to create liquidity pools e.g. with ETH/FreedomCash liquidity on Uniswap.
		It's just not necessary and not useful.
		<p><br /><br /></p>
		<h6>
			How is it possible that the sell price never drops? <br />
		</h6>
		<p><br /></p>
		The sell price of Freedom Cash expressed in Ether can stay as it is or go up. It can never drop.
		<EducateYourself></EducateYourself>
		<p><br /></p>

		<a href="{baseURLScan}token/{smartContractAddress}" target="_blank">
			<div class="center">
				<img class="tokenomicsImage" src="/price-functions.png" alt="" />
			</div>
		</a>
		<p><br /><br /></p>
		<h6>
			This seems too good to be true. What's the catch? <br />
		</h6>
		<p><br /></p>
		It might take a while until people realize that the sell price is at all times the minimum sell price
		which will never go below the current value expressed in Ether - even in a "bankrun" like situation.
		So if you find any catch other than people just not getting it until everyone wants to get it, please
		raise an issue
		<a href="https://github.com/monique-baumann/freedom-cash/issues/new" target="_blank">here</a>.
		<EducateYourself></EducateYourself>
	{/if}
	<p><br /></p>
	{#if !visitorHasBrowserWallet}
		Please install a browserwallet which you trust like
		<a href="https://metamask.io" target="_blank">metamask.io</a>
		or use the integrated browserwallet in the
		<a href="https://brave.com" target="_blank">brave.com</a> browser and come again.
	{:else if publicWalletAddressOfVisitor == ''}
		<p><br /></p>
		<button
			class="button"
			on:click={() => {
				connectToBlockchain();
			}}
		>
			Connect To {targetChainName}
		</button>
	{:else}
		<h4 class="text-center">State of the Game</h4>
		<BlockChainData {publicWalletAddressOfVisitor} {contract} {provider}></BlockChainData>
		<p><br /><br /><br /></p>
		<BlockChainInteraction {contract} {provider} {publicWalletAddressOfVisitor}
		></BlockChainInteraction>

		<p><br /><br /></p>
	{/if}
</section>

<style>
	.moniqueImage {
		width: 450px;
		border-radius: 9%;
	}
</style>
