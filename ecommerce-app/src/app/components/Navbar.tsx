// app/components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
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
          <Link href="/cart" className="text-gray-700 hover:text-blue-600 transition">
            Cart (0)
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