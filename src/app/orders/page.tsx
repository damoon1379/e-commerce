'use client'

import { useSession } from "next-auth/react"
import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'

interface Order {
    id:string
     total: number
    status: string
    shippingAddress: string
    createdAt: string
    items: {
        id: string
        quantity: number
        price: number
        product: {
            name: string
            images: string[]
        }
    }[]
}

export default function OrderPage(){
    const router = useRouter()
    const {data:session,status} = useSession()
    const [orders,setOrders] = useState<Order[]>([])
    const [error,setError] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        if(status === 'unauthenticated'){
            router.push('/login')
            return
        }

        const fetchOrders = async ()=>{
            try{
                 const response = await fetch("/api/orders")
                 const data = await response.json()

                 if(!response.ok){
                    setError(data.error || "Something went wrong")
                    return
                 }

                 setOrders(data.orders)

            }catch(error){
                setError("Something went wrong")
            }finally{
                setLoading(false)
            }
        }

        if(status === 'authenticated'){
            fetchOrders()
        }
    },[status,router])
    if (status === 'loading' || loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <p className="mt-4 text-gray-600">Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-md mx-auto">
                    <div className="text-red-600 text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold mb-4">Something Went Wrong</h1>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-md mx-auto">
                    <div className="text-6xl mb-4">📦</div>
                    <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
                    <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
                    <Link
                        href="/products"
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>
            
            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Order #{order.id.slice(0, 8)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                                    {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-blue-600">
                                    ${order.total.toFixed(2)}
                                </p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                                    order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                            <div className="space-y-2">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        {item.product.images && item.product.images.length > 0 && (
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium">{item.product.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {item.quantity} × ${item.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="font-semibold">
                                            ${(item.quantity * item.price).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {order.shippingAddress && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm font-medium text-gray-700">Shipping Address:</p>
                                <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}