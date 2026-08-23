// app/page.tsx
import Link from 'next/link';
import {getImages} from "@tteg/tteg"
import Image from "next/image"


export default async function HomePage() {
  
  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to Our Store
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover amazing products at great prices. Shop our collection now!
        </p>
        <Link
          href="/products"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
        >
          Start Shopping →
        </Link>
      </div>
    </div>
  );
}