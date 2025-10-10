import { DataSource } from "typeorm";

export const testDataSource = new DataSource({
  type: 'better-sqlite3',
  database: ':memory:',
  synchronize: true,
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts']
});

if (typeof test === 'function') {
  test('db.test placeholder - noop', () => {
    expect(true).toBe(true);
  });
}
