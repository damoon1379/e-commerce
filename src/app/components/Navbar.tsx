
'use client'

import Link from 'next/link';
import { useCartStore, useTotalItems } from '../../../lib/store/cartStore';

export default function Navbar() {
  const totalItems = useTotalItems();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Shop
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/products" className="text-gray-700 hover:text-blue-600 transition">
            Products
          </Link>
          <Link href="/cart" className="text-gray-700 hover:text-blue-600 transition relative">
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-4 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}