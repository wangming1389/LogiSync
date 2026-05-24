'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@/schemas/sourcing';
import { useProducts } from '@/services/queries/useSourcingQueries';

// Reference implementation of the new Repository Pattern. Future work
// will move the equivalent inline logic out of `SourcingDashboardClient`
// into this component. The hook hides the demo vs. real-API split
// from the UI entirely — this component only renders state.
type SortBy = 'score' | 'price';

export function ProductSearchTab() {
	const [search, setSearch] = useState('');
	const [category, setCategory] = useState<string>('All');
	const [sortBy, setSortBy] = useState<SortBy>('score');

	const { data: products = [], isLoading, error } = useProducts({ limit: 25 });

	const categories = useMemo(() => {
		const set = new Set<string>(['All']);
		for (const product of products) {
			if (product.catalogCategoryName) set.add(product.catalogCategoryName);
		}
		return Array.from(set);
	}, [products]);

	const visible = useMemo(() => {
		return products
			.filter((product) => {
				if (category !== 'All' && product.catalogCategoryName !== category) {
					return false;
				}
				if (!search) return true;
				const haystack =
					`${product.name} ${product.supplierWorkspaceName ?? ''}`.toLowerCase();
				return haystack.includes(search.toLowerCase());
			})
			.sort((a, b) => {
				if (sortBy === 'score') {
					return (b.reputationScore ?? 0) - (a.reputationScore ?? 0);
				}
				return a.unitPrice - b.unitPrice;
			});
	}, [products, category, search, sortBy]);

	return (
		<section className="flex flex-col gap-4">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<input
					type="search"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Search products or suppliers"
					className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
				/>
				<select
					value={category}
					onChange={(event) => setCategory(event.target.value)}
					className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
				>
					{categories.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
				<select
					value={sortBy}
					onChange={(event) => setSortBy(event.target.value as SortBy)}
					className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
				>
					<option value="score">Sort by reputation</option>
					<option value="price">Sort by price</option>
				</select>
			</header>

			{isLoading ? (
				<p className="text-sm text-neutral-500">Loading products…</p>
			) : error ? (
				<p className="text-sm text-red-600">
					Failed to load products. Please try again later.
				</p>
			) : visible.length === 0 ? (
				<p className="text-sm text-neutral-500">
					No products match the filters.
				</p>
			) : (
				<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{visible.map((product) => (
						<ProductCard key={product.id} product={product} />
					))}
				</ul>
			)}
		</section>
	);
}

function ProductCard({ product }: { product: Product }) {
	return (
		<li className="rounded-lg border border-neutral-200 p-4 shadow-sm">
			<p className="text-sm font-semibold">{product.name}</p>
			<p className="text-xs text-neutral-500">
				{product.supplierWorkspaceName ?? 'Unknown supplier'}
			</p>
			<p className="mt-2 text-sm">
				₫{product.unitPrice.toLocaleString('vi-VN')}
			</p>
			{product.minOrderQty ? (
				<p className="text-xs text-neutral-500">
					Min. order: {product.minOrderQty} {product.uomCode ?? ''}
				</p>
			) : null}
		</li>
	);
}
