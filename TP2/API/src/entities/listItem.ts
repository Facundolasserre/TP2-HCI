import { BaseEntity, Column, JoinColumn, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsOptional } from "class-validator";
import { User } from "./user";
import { Product } from "./product";
import { List } from "./list";
import { Purchase } from "./purchase";

@Entity()
export class ListItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn()
  product: Product;

  @Column({ nullable: false, type: 'float' })
  quantity: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ default: false })
  purchased: boolean;

  @Column({ nullable: true })
  lastPurchasedAt: Date;

  @Column({ type: "simple-json", nullable: true })
  @IsOptional()
  metadata: Record<string, any>;

  @ManyToOne(() => User, user => user.listItems)
  owner: User;

  @ManyToOne(() => List, list => list.items)
  list: List;

  @ManyToOne(() => Purchase, purchase => purchase.items)
  purchase: Purchase;

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
      purchased: this.purchased,
      lastPurchasedAt: this.lastPurchasedAt?.toISOString().substring(0, 19).replace('T', ' ') ?? null,
      createdAt: this.createdAt.toISOString().substring(0, 19).replace('T', ' '),
      updatedAt: this.updatedAt.toISOString().substring(0, 19).replace('T', ' '),
      product: this.product?.getFormattedProduct() ?? null,
    };
  }
}