import { ProductCard, type ProductListItem } from "./product-card";

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">No products found.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
