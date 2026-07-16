"use client";

import { useState } from "react";
import { ProductPicker } from "@/components/product-picker";

type Product = {
  id: string;
  name: string;
  default_unit_price: number;
};

export function AddItemForm({
  action,
  products,
}: {
  action: (formData: FormData) => void;
  products: Product[];
}) {
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("0");

  return (
    <form action={action} className="space-y-3">
      {products.length > 0 && (
        <div className="max-w-sm">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Pick from pricing list (optional)
          </label>
          <ProductPicker
            products={products}
            onSelect={(product) => {
              setDescription(product.name);
              setUnitPrice(String(product.default_unit_price ?? 0));
            }}
          />
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <input
            id="description"
            name="description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="w-20">
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-slate-700">
            Qty
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            step="any"
            min="0"
            defaultValue="1"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="w-28">
          <label
            htmlFor="unit_price"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Unit price
          </label>
          <input
            id="unit_price"
            name="unit_price"
            type="number"
            step="0.01"
            min="0"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add item
        </button>
      </div>
    </form>
  );
}
