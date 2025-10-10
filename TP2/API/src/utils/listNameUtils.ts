import { List } from '../entities/list';
import { User } from '../entities/user';
import { QueryRunner } from 'typeorm';

/**
 * Generates a unique list name by appending a number suffix if the name already exists
 * @param baseName - The original name to make unique
 * @param owner - The owner of the list
 * @param queryRunner - The query runner to use for database operations
 * @returns Promise<string> - A unique list name
 */
export async function generateUniqueListName(baseName: string, owner: User, queryRunner: QueryRunner): Promise<string> {
  let uniqueName = baseName;
  let counter = 1;

  while (true) {
    const existingList = await queryRunner.manager.findOne(List, {
      where: {
        name: uniqueName,
        owner: { id: owner.id }
      },
      withDeleted: true
    });

    if (!existingList) {
      return uniqueName;
    }

    uniqueName = `${baseName} (${counter})`;
    counter++;
  }
}
