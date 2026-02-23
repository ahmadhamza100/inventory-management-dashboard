"use client";

import { useState, useMemo } from "react";
import { useCustomersQuery } from "@/queries/use-customers-query";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import type { InvoiceSchema } from "@/validations/invoice";

export function UserSelect() {
	const { data: customers } = useCustomersQuery();
	const form = useFormContext<InvoiceSchema>();
	const [customerSearchValue, setCustomerSearchValue] = useState("");

	const customerId = useWatch({ control: form.control, name: "customerId" });

	const customerInputValue = useMemo(() => {
		if (customerId && customers) {
			const selectedCustomer = customers.find((c) => c.id === customerId);
			return selectedCustomer?.name || customerSearchValue;
		}
		return customerSearchValue;
	}, [customerId, customers, customerSearchValue]);

	const isDisabled = form.formState.isSubmitting;

	return (
		<Controller
			control={form.control}
			name="customerId"
			render={({ field, fieldState }) => (
				<Autocomplete
					label="Customer"
					placeholder="Select customer"
					defaultItems={customers || []}
					selectedKey={field.value || null}
					itemHeight={50}
					onSelectionChange={(key) => {
						field.onChange(key ? String(key) : "");
					}}
					inputValue={customerInputValue}
					onInputChange={setCustomerSearchValue}
					allowsCustomValue={false}
					labelPlacement="outside"
					isClearable
					isInvalid={fieldState.invalid}
					errorMessage={fieldState.error?.message}
					isDisabled={isDisabled}
					onClear={() => {
						field.onChange("");
						setCustomerSearchValue("");
					}}
				>
					{(customer) => {
						const searchableText = [
							customer.name,
							customer.email,
							customer.phone,
							customer.address,
						]
							.filter(Boolean)
							.join(" ");

						return (
							<AutocompleteItem key={customer.id} textValue={searchableText}>
								<div className="flex flex-col">
									<span className="text-small">{customer.name}</span>
									{customer.email && (
										<span className="text-tiny text-default-400">
											{customer.email}
										</span>
									)}
								</div>
							</AutocompleteItem>
						);
					}}
				</Autocomplete>
			)}
		/>
	);
}
