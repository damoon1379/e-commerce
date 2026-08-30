'use client'

import {useState,useEffect} from "react"
import {useSearchParams, useRouter} from "next/navigation"
import { useCartStore } from "../../../../lib/store/cartStore"
import Link from "next/link"

interface OrderDetails {
    id:string,
    total:number,
    status:string,
    createdAt:string
}

export default function PaymentSuccessPage(){
    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const orderId = searchParams.get("order_id")
    const clearCart = useCartStore(state=>state.clearCart)

    const [loading,setLoading] = useState(true)
    const [error,setError] = useState('')
    const [order,setOrder] = useState<OrderDetails | null>(null)

    useEffect(()=>{
        if(!sessionId || !orderId){
            router.push('/')
            return
        }

        const verifyPayment = async ()=>{
            try{
                const response = await fetch(`/api/payment/verify?session_id=${sessionId}&order_id=${orderId}`)
                const data = await response.json()

                if(!response.ok){
                    setError(data.error || "Failed to verify payment")
                    return
                }
                setOrder(data.order)
                clearCart()

            }catch(err){
                setError("Something went wrong")
            }finally{
                setLoading(false)
            }
        }
        verifyPayment()
    },[sessionId,orderId,router])

    if(loading){
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <p className="mt-4 text-gray-600">Verifying your payment...</p>
            </div>
        )
    }

    if(error){
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-md mx-auto">
                    <div className="text-red-600 text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold mb-4">Payment Verification Failed</h1>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <Link
                        href="/"
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
                <div className="text-green-600 text-6xl mb-4">✅</div>
                <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
                <p className="text-gray-600 mb-2">Thank you for your purchase!</p>
                {order && (
                    <div className="bg-gray-50 rounded-lg p-6 mt-6 text-left">
                        <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-lg font-bold mt-2">Total: ${order.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Status: <span className="text-green-600 font-semibold">{order.status}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Date: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                )}
                <Link
                    href="/orders"
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition mt-6"
                >
                    View My Orders
                </Link>
                <Link
                    href="/"
                    className="inline-block text-blue-600 hover:underline ml-4 mt-6"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    )
}