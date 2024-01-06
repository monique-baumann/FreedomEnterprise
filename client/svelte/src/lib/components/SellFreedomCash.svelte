<script>
	import { onMount } from 'svelte';
	import FeedbackToVisitor from './FeedbackToVisitor.svelte';
	// import { ethers } from 'ethers';
	export let contract;
	export let publicWalletAddressOfVisitor;

	let amount = 0;
	let sellPrice = 0;
	let visitorInformed = true;

	onMount(async () => {
		sellPrice = await contract.getSellPrice();
	});
	async function sellFreedomCash() {
		try {
			sellPrice = await contract.getSellPrice(); // to be up to date
			let result = await contract.sellFreedomCash(BigInt(amount.toString()), sellPrice.toString());
			visitorInformed = false;
			console.log(`result: ${result}`);
		} catch (error) {
			alert(error.message);
		}
	}
</script>

<h2 class="text-center">Sell Freedom Cash</h2>
<section class="text-center">
	{#if visitorInformed}
		<br />
		How much would you like to sell?
		<p><br /></p>

		<input
			bind:value={amount}
			class="myInputField"
			type="number"
			placeholder="your investment e.g. 0.000000009 ETH"
		/>
		<p><br /></p>
		<p><br /></p>

		{#if amount > 0}
			<button class="inside" on:click={() => sellFreedomCash()}>Sell Freedom Cash</button>
		{/if}
	{:else}
		<FeedbackToVisitor
			on:clickedOK={() => {
				visitorInformed = true;
			}}
			{publicWalletAddressOfVisitor}
		></FeedbackToVisitor>
	{/if}
</section>

<style>
</style>
