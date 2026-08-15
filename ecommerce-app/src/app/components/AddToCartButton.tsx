'use client'

import {useCartStore} from '../../../lib/store/cartStore'
import {useState} from "react"

interface AddToCartButtonProps {
    productId:string,
    name:string,
    image:string,
    price:number,
    stock:number,
    fullWidth?: boolean    
}

export default function AddToCartButton({
    productId,
    name,
    image,
    price,
    stock,
    fullWidth = false
}:AddToCartButtonProps){
    const [isAdding,setIsAdding] = useState(false)
    const addItem = useCartStore((state:any)=>state.addItem)

    const handleAddToCart =()=>{
        if(stock === 0) return

        setIsAdding(true)
        addItem({
            productId,
            name,
            image,
            price,
            stock,
            quantity:1
        })

        setTimeout(()=> setIsAdding(false),500)
    }

    return(
    <button
      onClick={handleAddToCart}
      disabled={stock === 0 || isAdding}
      className={`
        ${fullWidth ? 'w-full' : 'w-full'}
        bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 
        transition-colors text-sm font-semibold
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
      `}
    >
      {isAdding ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding...
        </>
      ) : (
        stock === 0 ? 'Out of Stock' : 'Add to Cart'
      )}
    </button>
  )
    

}