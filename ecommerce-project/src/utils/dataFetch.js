
 function dataFetch(order, products){
        const Product = products.find((product)=>
        order.productId === product.id);
        // console.log(order.productId)
        if(!Product) return null;
         return Product;
      }

      export default dataFetch;
