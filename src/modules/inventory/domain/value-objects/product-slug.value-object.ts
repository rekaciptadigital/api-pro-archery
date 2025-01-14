export class ProductSlug {
  private constructor(private readonly value: string) {}

  static create(productName: string): ProductSlug {
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    return new ProductSlug(slug);
  }

  getValue(): string {
    return this.value;
  }
}