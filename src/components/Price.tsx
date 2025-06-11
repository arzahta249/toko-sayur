"use client";

import { ProductType } from "@/types/types";
import { useCartStore } from "@/utils/store";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Price = ({ product }: { product: ProductType }) => {
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState(0);
  const [total, setTotal] = useState(Number(product.price) || 0);

  const { addToCart } = useCartStore();

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const basePrice = Number(product.price) || 0;

    if (product.options?.length) {
      const additionalUnitCount =
        Number(product.options[selected]?.additionalPrice) || 0;

      const additionalPrice = additionalUnitCount * 500; // 500 per unit tambahan
      const unitPrice = basePrice + additionalPrice;

      setTotal(unitPrice * quantity);
    } else {
      setTotal(basePrice * quantity);
    }
  }, [quantity, selected, product]);

  const handleCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      img: product.img,
      price: total,
      ...(product.options?.length && {
        optionTitle: product.options[selected].title,
      }),
      quantity,
    });
    toast.success("Produk berhasil dimasukkan ke keranjang!");
  };

  const formatRupiah = (value: number) =>
    "Rp. " +
    new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{formatRupiah(total)}</h2>

      {product.options?.length && (
        <div className="flex gap-4">
          {product.options.map((option, index) => (
            <button
              key={option.title}
              className={`min-w-[6rem] p-2 rounded-md ring-1 ${
                selected === index
                  ? "bg-teal-700 text-white ring-teal-700"
                  : "bg-white text-teal-600 ring-teal-600"
              }`}
              onClick={() => setSelected(index)}
            >
              {option.title}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex justify-between w-full p-3 ring-1 ring-teal-700">
          <span>Jumlah</span>
          <div className="flex gap-4 items-center">
            <button onClick={() => setQuantity((q) => Math.max(q - 1, 1))}>
              {"<"}
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(q + 1, 99))}>
              {">"}
            </button>
          </div>
        </div>

        <button
          className="uppercase w-56 bg-teal-700 text-white p-3 ring-1 ring-teal-700"
          onClick={handleCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Price;
