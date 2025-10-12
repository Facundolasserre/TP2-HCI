import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique
} from "typeorm";
import {IsOptional, Length} from "class-validator";
import {User} from "./user";
import {ListItem} from "./listItem";
import {Purchase} from "./purchase";

@Entity()
@Unique("unique_list_name_per_owner", ["name", "owner"])
export class List extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false})
  @Length(1, 50)
  name: string;

  @Column({nullable: false})
  @Length(1, 200)
  description: string;

  @Column({type: "simple-json", nullable: true})
  @IsOptional()
  metadata: Record<string, any>;

  @Column({nullable: false, default: false})
  recurring: boolean;

  @ManyToOne(() => User, user => user.lists)
  owner: User;

  @OneToMany(() => ListItem, listItem => listItem.list)
  items: ListItem[];

  @ManyToMany(() => User, user => user.sharedLists)
  @JoinTable()
  sharedWith: User[];

  @OneToMany(() => Purchase, purchase => purchase.list)
  @JoinColumn()
  purchaseHistory: Purchase[];

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({type: "date", nullable: true})
  @IsOptional()
  lastPurchasedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  @IsOptional()
  deletedAt: Date;

  formatDate(date: any): string | null {
    if (!date) return null;
    if (date instanceof Date) return date.toISOString();
    if (typeof date === "string") {
      const d = new Date(date);
      if (!isNaN(d.getTime())) return d.toISOString();
      return date;
    }
    return null;
  }

  /**
   * Checks if the list is completed (all items are purchased).
   * A list with no items is considered NOT completed.
   * @returns {boolean} True if all items are purchased, false otherwise
   */
  isCompleted(): boolean {
    if (!this.items || this.items.length === 0) {
      return false;
    }
    // Filter out soft-deleted items
    const activeItems = this.items.filter(item => !item.deletedAt);
    if (activeItems.length === 0) {
      return false;
    }
    return activeItems.every(item => item.purchased === true);
  }

  getFormattedList(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      recurring: this.recurring,
      metadata: this.metadata ?? null,
      owner: this.owner?.getFormattedUser() ?? null,
      sharedWith: this.sharedWith ? this.sharedWith.map(user => (user.getFormattedUser())) : [],
      completed: this.isCompleted(),
      lastPurchasedAt: this.formatDate(this.lastPurchasedAt),
      createdAt: this.formatDate(this.createdAt),
      updatedAt: this.formatDate(this.updatedAt),
    }
  }
}
