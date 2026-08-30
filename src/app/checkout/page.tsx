'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCartStore,useTotalItems,useTotalPrice } from "../../../lib/store/cartStore"
import { useSession } from "next-auth/react"

export default function CheckoutPage(){

    const router = useRouter()
    const [error,setError] = useState("")
    const [loading,setLoading] = useState(false)
    const {items,clearCart} = useCartStore()
    const {data:session} = useSession()
    
    const [shippingInfo, setShippingInfo] = useState({
        fullName: session?.user?.name || "",
        address:'',
        city:'',
        state:'',
        zipCode:'',
        country:'',
    })

    const total = useTotalPrice()

     if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
        <Link
          href="/products"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

    if (!session) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
        <p className="text-gray-600 mb-8">You need to be logged in to checkout.</p>
        <Link
          href="/login"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleCheckout = async()=>{
    
    setLoading(true)
    setError("")

    try{
        const response = await fetch("/api/checkout",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                items,
                total,
                //shippingInfo
            })
        })

        const data = await response.json()

        if(!response.ok){
            throw new Error(data.error || "Something went wrong")
        }

        if(data.url){
            window.location.href = data.url
        }
    }catch(error:any){
        setError(error.message)
        setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      
      <div>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
      </div>
              <div>
      

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition mt-4 font-semibold disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

}