export interface Seeder {
  createMany(): Promise<void>;
}
