import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique
} from "typeorm";
import {IsOptional, Length} from "class-validator";
import {User} from "./user";
import {Category} from "./category";
import {Pantry} from "./pantry";

@Entity()
@Unique(['name', 'owner'])
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false})
  @Length(1, 50)
  name: string;

  @Column({ type: "simple-json", nullable: true })
  @IsOptional()
  metadata: Record<string, any>;

  @ManyToOne(() => User, user => user.products)
  owner: User;

  @ManyToOne(() => Category, category => category.products)
  @IsOptional()
  category: Category;

  @ManyToOne(() => Pantry, pantry => pantry.products)
  @IsOptional()
  pantry: Pantry;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  @IsOptional()
  deletedAt: Date;

  getFormattedProduct(): any {
    return {
      id: this.id,
      name: this.name,
      metadata: this.metadata ?? null,
      createdAt: this.createdAt?.toISOString().substring(0, 19).replace('T', ' '),
      updatedAt: this.updatedAt?.toISOString().substring(0, 19).replace('T', ' '),
      category: this.category?.getFormattedCategory() ?? null,
    };
  }
}