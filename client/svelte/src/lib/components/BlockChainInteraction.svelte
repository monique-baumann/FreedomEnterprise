<script>
	import { onMount } from 'svelte';
	import { ethers } from 'ethers';
	import SellFreedomCash from '$components/SellFreedomCash.svelte';
	import InvestIntoFreedomCash from '$components/InvestIntoFreedomCash.svelte';
	import { smartContractAddress } from '../../constants.ts';
	import FeedbackToVisitor from './FeedbackToVisitor.svelte';
	export let contract;
	export let publicWalletAddressOfVisitor;
	export let provider;

	let investIntoFreedomCash;
	let sellFreedomCash;
	let balanceInSmartContract;
    let fb = { context: "", message: "" }

	onMount(async () => {
		balanceInSmartContract = ethers.formatEther(
			await contract.balanceOf(smartContractAddress)
		);
	});

</script>

<button class="button" on:click={() => (investIntoFreedomCash = !investIntoFreedomCash)}
	>Buy Freedom Cash</button
>
{#if investIntoFreedomCash}
	<InvestIntoFreedomCash {contract} {publicWalletAddressOfVisitor} {provider}
	></InvestIntoFreedomCash>
{/if}
<p><br /></p>

<button class="button" on:click={() => (sellFreedomCash = !sellFreedomCash)}>Sell Freedom Cash</button>
{#if sellFreedomCash}
	<p><br /><br /></p>
	<SellFreedomCash {contract} {publicWalletAddressOfVisitor}></SellFreedomCash>
	<p><br /><br /></p>
{/if}

<p><br /></p>


<style>

</style>
