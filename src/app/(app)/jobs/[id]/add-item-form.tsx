"use client";

import { useState } from "react";
import { ProductPicker } from "@/components/product-picker";

type Product = {
  id: string;
  name: string;
};

export function AddItemForm({
  action,
  products,
  suppliers,
}: {
  action: (formData: FormData) => void;
  products: Product[];
  suppliers: Product[];
}) {
  const [description, setDescription] = useState("");
  const [isOutsourced, setIsOutsourced] = useState(false);
  const [supplier, setSupplier] = useState("");

  return (
    <form action={action} className="space-y-3">
      {products.length > 0 && (
        <div className="max-w-sm">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Pick from pricing list (optional)
          </label>
          <ProductPicker products={products} onSelect={(product) => setDescription(product.name)} />
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
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
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add item
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_outsourced"
          name="is_outsourced"
          type="checkbox"
          checked={isOutsourced}
          onChange={(e) => setIsOutsourced(e.target.checked)}
          className="rounded border-slate-300"
        />
        <label htmlFor="is_outsourced" className="text-sm text-slate-700">
          Outsourced
        </label>
      </div>

      {isOutsourced && (
        <div className="max-w-sm space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3">
          {suppliers.length > 0 && (
            <ProductPicker
              products={suppliers}
              onSelect={(s) => setSupplier(s.name)}
              placeholder="Type to search suppliers..."
            />
          )}
          <input
            name="supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Supplier name"
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
          />
          <input
            name="supplier_reference"
            placeholder="Supplier reference / PO number"
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Expected back
              </label>
              <input
                name="supplier_due_date"
                type="date"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Cost</label>
              <input
                name="supplier_cost"
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
