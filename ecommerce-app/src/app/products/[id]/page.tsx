import {prisma} from "../../../../lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import Image from "next/image"
import AddToCartButton from "../../components/AddToCartButton"

interface ProductPageProps {
    params: Promise<{id:string}>
}

export default async function ProductPage({params}:ProductPageProps){
    const {id} = await params
    const product = await prisma.product.findUnique({
        where:{id:id}
    })
    if(!product){
        notFound()
    }

    return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images[0] || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${product.name} - ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-500 text-sm mt-1">SKU: {product.sku}</p>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </span>
            <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          <div>
            <span className="inline-block bg-gray-200 px-3 py-1 rounded-full text-sm">
              {product.category}
            </span>
          </div>

          <div className="border-t pt-6">
            <h2 className="font-semibold text-lg mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

         <AddToCartButton
            productId={product.id}
            name={product.name}
            price={product.price}
            image={product.images[0] || '/images/placeholder.jpg'}
            stock={product.stock}
            fullWidth
          />

        </div>
      </div>
    </div>
  );
}