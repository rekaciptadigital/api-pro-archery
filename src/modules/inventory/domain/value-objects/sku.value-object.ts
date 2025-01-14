export class SKU {
  private constructor(private readonly value: string) {}

  static create(brandCode: string, productTypeCode: string, uniqueCode: string): SKU {
    const sku = `${brandCode}${productTypeCode}${uniqueCode}`.toUpperCase();
    return new SKU(sku);
  }

  getValue(): string {
    return this.value;
  }

  static isValid(sku: string): boolean {
    return /^[A-Z0-9-]+$/.test(sku);
  }
}