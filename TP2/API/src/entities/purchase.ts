import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn, RelationId,
  UpdateDateColumn
} from "typeorm";
import { User } from "./user";
import { List } from "./list";
import { ListItem } from "./listItem";

@Entity()
export class Purchase extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => List, list => list.purchaseHistory, { nullable: false })
  list: List;

  @RelationId((purchase: Purchase) => purchase.list)
  listId: number;

  @ManyToOne(() => User, owner => owner.purchases, { nullable: false })
  owner: User;

  @OneToMany(() => ListItem, item => item.purchase, { cascade: true })
  items: ListItem[];

  @Column({ type: "simple-json", nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  getFormattedPurchase(): any {
    return {
      id: this.id,
      metadata: this.metadata ?? null,
      owner: this.owner ? this.owner.getFormattedUser() : null,
      list: this.list ? this.list.getFormattedList() : null,
      items: this.items ? this.items.map(i => i.getFormattedListItem()) : [],
      createdAt: this.createdAt?.toISOString().substring(0, 19).replace('T', ' '),
    };
  }
}
