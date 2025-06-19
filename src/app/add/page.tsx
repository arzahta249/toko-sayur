"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";

type Inputs = {
  title: string;
  desc: string;
  price: number;
  catSlug: string;
  stock: number;
};

type Option = {
  title: string;
  additionalPrice: number;
};

const AddPage = () => {
  const { data: session, status } = useSession();
  const [inputs, setInputs] = useState<Inputs>({
    title: "",
    desc: "",
    price: 0,
    catSlug: "",
    stock: 0,
  });

  const [option, setOption] = useState<Option>({
    title: "",
    additionalPrice: 0,
  });

  const [options, setOptions] = useState<Option[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const router = useRouter();

  if (status === "loading") return <p>Loading...</p>;

  if (status === "unauthenticated" || !session?.user.isAdmin) {
    router.push("/");
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const changeOption = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOption((prev) => ({
      ...prev,
      [name]: name === "additionalPrice" ? Number(value) : value,
    }));
  };

  const handleChangeImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.info(`File ${selectedFile.name} siap diupload`);
    }
  };

  const upload = async (): Promise<string> => {
    if (!file) {
      toast.error("Silakan pilih file gambar terlebih dahulu");
      throw new Error("No file selected");
    }

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "restaurant");

    const res = await fetch("https://api.cloudinary.com/v1_1/lamadev/upload", {
      method: "POST",
      body: data,
    });

    const resData = await res.json();

    if (!res.ok) {
      toast.error("Gagal upload gambar: " + (resData.error?.message || ""));
      throw new Error(resData.error?.message || "Upload gagal");
    }

    toast.success("Gambar berhasil diupload!");
    return resData.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !inputs.title ||
      !inputs.desc ||
      !inputs.catSlug ||
      inputs.price <= 0 ||
      inputs.stock < 0 ||
      !file
    ) {
      toast.error("Semua field wajib diisi dengan benar!");
      return;
    }

    try {
      const imgUrl = await upload();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          img: imgUrl,
          ...inputs,
          options,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error("Gagal tambah produk: " + (errorData.message || res.statusText));
        return;
      }

      const data = await res.json();
      toast.success("Produk berhasil ditambahkan!");
      router.push(`/product/${data.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Terjadi kesalahan: " + err.message);
    }
  };

  return (
    <div className="py-24 px-4 lg:px-20 xl:px-40 text-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-6 max-w-4xl mx-auto"
      >
        <h1 className="text-4xl mb-2 text-gray-300 font-bold w-full">
          Add New Product
        </h1>

        {/* Upload Image */}
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="file"
            className="text-sm cursor-pointer flex gap-4 items-center"
          >
            <Image src="/upload.png" alt="" width={30} height={20} />
            <span>Upload Image</span>
          </label>
          <input
            type="file"
            onChange={handleChangeImg}
            id="file"
            className="hidden"
            accept="image/*"
          />
        </div>

        {/* Title */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-sm">Title</label>
          <input
            type="text"
            name="title"
            onChange={handleChange}
            placeholder="Name Product"
            className="ring-1 ring-teal-700 p-4 rounded-sm placeholder:text-teal-500 outline-none"
            required
          />
        </div>

        {/* Description */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-sm">Description</label>
          <textarea
            name="desc"
            rows={3}
            onChange={handleChange}
            placeholder="A timeless favorite..."
            className="ring-1 ring-teal-700 p-4 rounded-sm placeholder:text-teal-500 outline-none"
            required
          />
        </div>

        {/* Price */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-sm">Price</label>
          <input
            type="number"
            name="price"
            onChange={handleChange}
            placeholder="Rp.0"
            className="ring-1 ring-teal-700 p-4 rounded-sm placeholder:text-teal-500 outline-none"
            required
            min={0}
          />
        </div>

        {/* Category */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-sm">Category</label>
          <input
            type="text"
            name="catSlug"
            onChange={handleChange}
            placeholder="sayur"
            className="ring-1 ring-teal-700 p-4 rounded-sm placeholder:text-teal-500 outline-none"
            required
          />
        </div>

        {/* Stock */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-sm">Stock</label>
          <input
            type="number"
            name="stock"
            onChange={handleChange}
            placeholder="Jumlah stok"
            className="ring-1 ring-teal-700 p-4 rounded-sm placeholder:text-teal-500 outline-none"
            required
            min={0}
          />
        </div>

        {/* Options */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-sm">Options</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="title"
              placeholder="Title"
              onChange={changeOption}
              value={option.title}
              className="ring-1 ring-teal-700 p-4 rounded-sm placeholder:text-teal-500 outline-none"
            />
            <input
              type="number"
              name="additionalPrice"
              placeholder="Additional Price"
              onChange={changeOption}
              value={option.additionalPrice}
              className="ring-1 ring-teal-700 p-4 rounded-sm placeholder:text-teal-500 outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (!option.title.trim()) {
                  toast.error("Option title tidak boleh kosong");
                  return;
                }
                setOptions((prev) => [...prev, option]);
                setOption({ title: "", additionalPrice: 0 });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Add Option
            </button>
          </div>

          {/* List of Options */}
          <div className="flex flex-wrap gap-4 mt-2">
            {options.map((opt) => (
              <div
                key={opt.title}
                onClick={() =>
                  setOptions((prev) =>
                    prev.filter((item) => item.title !== opt.title)
                  )
                }
                className="p-2 bg-gray-200 text-gray-700 rounded cursor-pointer"
              >
                <span>{opt.title}</span>
                <span className="text-xs"> (+ Rp {opt.additionalPrice})</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-teal-700 p-4 text-white w-48 rounded-md h-14 flex items-center justify-center"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddPage;
