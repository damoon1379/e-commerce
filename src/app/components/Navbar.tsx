
'use client'

import Link from 'next/link';
import { useTotalItems } from '../../../lib/store/cartStore';
import {useSession, signOut} from "next-auth/react"

export default function Navbar() {
  const {data:session} = useSession()
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

          { session? (
            <>
             <Link 
                                href="/orders" 
                                className="text-gray-700 hover:text-blue-600 transition"
                            >
                                Orders
                            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Hello, {session.user?.name || 'User'}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-red-600 hover:text-red-800 transition text-sm"
              >
                Sign Out
              </button>
            </div>
            </>
          )
          :(
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
          )}

        </div>
      </div>
    </nav>
  );
}