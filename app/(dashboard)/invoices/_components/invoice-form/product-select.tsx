"use client";

import { useState, useMemo } from "react";
import { useProductsQuery } from "@/queries/use-products-query";
import { formatPrice } from "@/utils/helpers";
import { IconPhoto } from "@tabler/icons-react";
import { Autocomplete, AutocompleteItem, Chip, Image } from "@heroui/react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import type { InvoiceSchema } from "@/validations/invoice";

export function ProductSelect() {
	const { data: products } = useProductsQuery();
	const form = useFormContext<InvoiceSchema>();
	const [productSearchValue, setProductSearchValue] = useState("");

	const items = useWatch({
		control: form.control,
		name: "items",
	});

	const handleAddProduct = (productId: string) => {
		const product = products?.find((p) => p.id === productId);
		if (!product) return;

		form.setValue(
			"items",
			[
				{
					productId: product.id,
					quantity: 1,
					price: Number(product.price),
				},
				...items,
			],
			{
				shouldDirty: true,
				shouldValidate: true,
			},
		);

		setProductSearchValue("");
	};

	const selectedProductIds = useMemo(
		() => new Set(items.map((item) => item.productId)),
		[items],
	);

	const availableProducts = useMemo(() => {
		return (
			products?.filter((product) => !selectedProductIds.has(product.id)) || []
		);
	}, [products, selectedProductIds]);

	const isDisabled = form.formState.isSubmitting;

	return (
		<Controller
			control={form.control}
			name="items"
			render={({ fieldState }) => (
				<Autocomplete
					label="Products"
					placeholder="Select product to add"
					defaultItems={availableProducts}
					selectedKey={null}
					itemHeight={50}
					onSelectionChange={(key) => {
						if (key) {
							handleAddProduct(String(key));
						}
					}}
					inputValue={productSearchValue}
					onInputChange={setProductSearchValue}
					allowsCustomValue={false}
					labelPlacement="outside"
					isDisabled={isDisabled || availableProducts.length === 0}
					isInvalid={fieldState.invalid}
					errorMessage={
						fieldState.error?.message || fieldState.error?.root?.message
					}
					onClear={() => setProductSearchValue("")}
					endContent={
						availableProducts.length === 0 ? (
							<Chip size="sm" variant="flat" color="default">
								All products added
							</Chip>
						) : null
					}
				>
					{(product) => (
						<AutocompleteItem
							key={product.id}
							textValue={`${product.name} ${product.sku}`}
						>
							<div className="flex w-full items-center gap-3">
								<div className="flex relative h-10 w-10 shrink-0 items-center justify-center rounded-md bg-default-100">
									{product.images?.[0] ? (
										<Image
											src={product.images[0]}
											alt={product.name}
											width={40}
											height={40}
											radius="md"
											className="shrink-0 object-cover"
										/>
									) : (
										<IconPhoto className="size-5 text-default-400" />
									)}
								</div>
								<div className="flex flex-1 flex-col">
									<span className="text-small">{product.name}</span>
									<span className="text-tiny text-default-400">
										{formatPrice(product.price)} • Stock: {product.stock} • SKU:{" "}
										{product.sku}
									</span>
								</div>
							</div>
						</AutocompleteItem>
					)}
				</Autocomplete>
			)}
		/>
	);
}
