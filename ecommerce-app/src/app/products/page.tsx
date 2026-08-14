import { prisma } from "../../../lib/prisma";
import Link from "next/link"

export default async function ProductsPage(){
    const products = await prisma.product.findMany()
    return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/products/${product.id}`}
            className="group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img
                src={product.images[0] || 'https://via.placeholder.com/400'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="p-4">
              <h2 className="text-lg font-semibold line-clamp-1">{product.name}</h2>
              <p className="text-gray-600 text-sm line-clamp-2 mt-1">{product.description}</p>
              
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              
              <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add to Cart
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}