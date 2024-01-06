<script>
	const year = new Date().getFullYear();
</script>

<footer>
	<div class="container">
		<span>
			<a
			class="underline"
			href="https://github.com/monique-baumann/freedom-cash"
			target="_blank"
			rel="noopener">GitHub</a
			>
		</span>
		<span>•</span>
		<span>&copy; {year} Freedom Enterprise</span>
		<span>•</span>
		<span>
			<a
				class="underline"
				href="https://freedomcash.org"
				target="_blank"
				rel="noopener">FreedomCash.org</a
			>
		</span>
	</div>
</footer>

<style>
	footer {
		background-color: var(--accent);
		color: var(--white);
		padding: var(--s-8);
		font-size: var(--font-200);
	}
	.container {
		display: grid;
		gap: var(--s-2);
		justify-items: center;
		justify-content: center;
		text-align: center;
	}
	@media (min-width: 768px) {
		footer {
			padding: var(--s-12);
		}
		.container {
			display: flex;
			gap: var(--s-6);
		}
	}
	@media print {
		footer {
			display: none;
		}
	}
</style>
