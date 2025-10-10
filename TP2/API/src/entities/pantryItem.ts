import { BaseEntity, Column, JoinColumn, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from "typeorm";
import { IsOptional } from "class-validator";
import { User } from "./user";
import { Product } from "./product";
import { Pantry } from "./pantry";

@Entity()
export class PantryItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn()
  product: Product;

  @Column({ nullable: false, type: 'float' })
  quantity: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: "simple-json", nullable: true })
  @IsOptional()
  metadata: Record<string, any>;

  @ManyToOne(() => User, user => user.pantryItems)
  owner: User;

  @ManyToOne(() => Pantry, pantry => pantry.items)
  pantry: Pantry;

  @Column({ nullable: true })
  addedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  @IsOptional()
  deletedAt: Date;

  getFormattedListItem(): any {
    return {
      id: this.id,
      quantity: this.quantity,
      unit: this.unit,
      metadata: this.metadata ?? null,
      product : this.product.getFormattedProduct(),
      createdAt: this.createdAt.toISOString().substring(0, 19).replace('T', ' '),
      updatedAt: this.updatedAt.toISOString().substring(0, 19).replace('T', ' '),
    };
  }
}