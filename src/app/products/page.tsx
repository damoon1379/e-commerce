// app/products/page.tsx
import { prisma } from '../../../lib/prisma';
import Link from 'next/link';
import AddToCartButton from '../components/AddToCartButton';

export default async function ProductsPage() {
  const products = await prisma.product.findMany();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product:any) => (
          <div key={product.id} className="group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <Link href={`/products/${product.id}`}>
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.images[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            
            <div className="p-4">
              <Link href={`/products/${product.id}`}>
                <h2 className="text-lg font-semibold line-clamp-1 hover:text-blue-600 transition">
                  {product.name}
                </h2>
              </Link>
              <p className="text-gray-600 text-sm line-clamp-2 mt-1">{product.description}</p>
              
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>
              
              <AddToCartButton
                productId={product.id}
                name={product.name}
                price={product.price}
                image={product.images[0] || '/images/placeholder.jpg'}
                stock={product.stock}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}