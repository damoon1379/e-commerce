'use client'

import { useSession } from "next-auth/react";
import {useState,useEffect} from 'react'
import { useRouter } from "next/navigation";
import Link from 'next/link'


interface Order {
    id:string,
    total:number,
    status:string,
    createdAt:string,
    user:{
        name:string,
        email:string,
    }
}

interface Product {
    id:string,
    name:string,
    description:string,
    stock:number,
    price:number,
    images:string[],
    sku:string,
    category:string
}

export default function AdminPage(){
    const router = useRouter()
    const {data:session,status} = useSession()
    const [loading,setLoading] = useState(true)
    const [orders,setOrders] = useState<Order[]>([])
    const [products,setProducts] = useState<Product[]>([])
    const [activeTab,setActiveTab] = useState('orders')
    const [showAddProduct,setShowAddProduct] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)


    const [formData,setFormData] = useState({
        name:'',
        description:'',
        price:'',
        stock:'',
        category:'',
        sku:'',
        images:[''],
    })

    useEffect(()=>{

        if(status === 'unauthenticated'){
            router.push("/login")
            return
        }

        if(status === 'authenticated' && session?.user?.role !== 'ADMIN'){
            router.push('/')
            return
        }

        const fetchData = async ()=>{
            try{
                const [ordersRes,productsRes] = await Promise.all([
                    fetch("/api/admin/orders"),
                    fetch("/api/admin/products")
                ])

                const ordersData = await ordersRes.json()
                const productsData = await productsRes.json()

                if(ordersRes.ok) setOrders(ordersData.orders)
                if(productsRes.ok) setProducts(productsData.products)    
            }catch(error){
                console.log("Error fetching admin data: ",error)
            }finally{
                setLoading(false)
            }
        }
        if(status === 'authenticated'){
             fetchData()
        }
    },[session,router,status])

    const updateOrderStatus = async(orderId:string,status:string)=>{
        try{
            const response = await fetch('/api/admin/orders',{
                method:"PATCH",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({orderId,status})
            })

            if(response.ok){
                setOrders(orders.map(order=>
                    order.id === orderId ? {...order,status} : order
                ))
            }
        }catch(error){
            console.error("Error updating orders",error)
            alert("Failed to update orders")
        }
    }

    const deleteProduct = async (productId : string)=>{
        if(!confirm('Are you sure you want to delete this product?')) return

        try{const response = await fetch(`/api/admin/products/${productId}`,{
            method:"DELETE"
        })

        if(response.ok){
            setProducts(products.filter(product=>product.id !== productId))
            alert("Product deleted successfully")
        }}catch(error){
            console.error("Error deleting product:", error)
            alert("Failed to delete product")
        }
    }

    const handleProductSubmit = async(e:React.SubmitEvent<HTMLFormElement>)=>{
        e.preventDefault()
        const productData = {
            name:formData.name,
            description:formData.description,
            price:parseFloat(formData.price),
            stock:parseInt(formData.stock),
            images:formData.images.filter(img=>img.trim() !== ""),
            sku:formData.sku,
            category:formData.category,
        }

       try{ 
        const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products"
        const method = editingProduct ? 'PUT' : 'POST'

        const response = await fetch(url,{
            method,
            headers:{"Content-Type" : "application/json"},
            body:JSON.stringify(productData)
        })

        if(response.ok){
            const data = await response.json()
            if(editingProduct){
                setProducts(products.map(p=> p.id === editingProduct.id ? data.product : p))
            }else{
                setProducts([data.product,...products])
            }
            resetForm()
            alert(editingProduct ? "Product updated!" : "Product added!")

        }
    }catch(error){
        console.error("Error saving product: ", error)
        alert("Failed to save product")
    }
    }

    const resetForm = ()=>{
        setFormData({
            name:'',
            price:'',
            description:'',
            sku:'',
            stock:'',
            images:[''],
            category:'',
        })

        setEditingProduct(null)
        setShowAddProduct(false)
    }

    const editProduct = (product : Product)=>{
        setEditingProduct(product)
        setFormData({
            name:product.name,
            description:product.description,
            price:product.price.toString(),
            stock:product.stock.toString(),
            sku:product.sku,
            images:product.images,
            category:product.category
        })

        setShowAddProduct(true)
    }

    if(status === 'loading' || loading){
        return(
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
            </div>
        )
    }

    if(session?.user?.role !== 'ADMIN'){
        return null
    }


    return(
         <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 border-b">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'orders'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Orders ({orders.length})
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'products'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Products ({products.length})
                </button>
            </div>

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div>
                    {orders.length === 0 ? (
                        <p className="text-gray-500">No orders yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Order ID</th>
                                        <th className="px-4 py-2 text-left">Customer</th>
                                        <th className="px-4 py-2 text-left">Total</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-t hover:bg-gray-50">
                                            <td className="px-4 py-2 font-mono">#{order.id.slice(0, 8)}</td>
                                            <td className="px-4 py-2">
                                                <div>{order.user.name}</div>
                                                <div className="text-gray-500 text-xs">{order.user.email}</div>
                                            </td>
                                            <td className="px-4 py-2 font-semibold">${order.total.toFixed(2)}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className="text-sm border rounded px-2 py-1"
                                                >
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="PAID">PAID</option>
                                                    <option value="SHIPPED">SHIPPED</option>
                                                    <option value="DELIVERED">DELIVERED</option>
                                                    <option value="CANCELLED">CANCELLED</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
                <div>
                    {/* Add Product Button */}
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-gray-600">{products.length} products</p>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowAddProduct(true);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            + Add Product
                        </button>
                    </div>

                    {/* Add/Edit Product Form */}
                    {showAddProduct && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-bold mb-4">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <form onSubmit={handleProductSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">SKU *</label>
                                        <input
                                            type="text"
                                            value={formData.sku}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Price *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Stock *</label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Category</label>
                                        <input
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.images[0]}
                                            onChange={(e) => setFormData({ 
                                                ...formData, 
                                                images: [e.target.value] 
                                            })}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        {editingProduct ? 'Update Product' : 'Add Product'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Products Table */}
                    {products.length === 0 ? (
                        <p className="text-gray-500">No products yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Image</th>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Category</th>
                                        <th className="px-4 py-2 text-left">Price</th>
                                        <th className="px-4 py-2 text-left">Stock</th>
                                        <th className="px-4 py-2 text-left">SKU</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-t hover:bg-gray-50">
                                            <td className="px-4 py-2">
                                                {product.images && product.images.length > 0 && (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-2 font-medium">{product.name}</td>
                                            <td className="px-4 py-2">{product.category}</td>
                                            <td className="px-4 py-2 font-semibold">${product.price.toFixed(2)}</td>
                                            <td className="px-4 py-2">
                                                <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-gray-500">{product.sku}</td>
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() => editProduct(product)}
                                                    className="text-blue-600 hover:text-blue-800 text-xs mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteProduct(product.id)}
                                                    className="text-red-600 hover:text-red-800 text-xs"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}