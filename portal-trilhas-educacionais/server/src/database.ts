import { DatabaseSchema } from './types';
import dbData from '../../db.json';

export class Database {
  private static data: DatabaseSchema;

  static initialize(): void {
    // Carregar dados do db.json
    this.data = dbData as DatabaseSchema;
    console.log('✅ Database initialized with', {
      users: this.data.users.length,
      trilhas: this.data.trilhas.length,
      turmas: this.data.turmas.length,
      'turma-inscriptions': this.data['turma-inscriptions'].length,
      certificates: this.data.certificates.length
    });
  }

  static getAll<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    return this.data[collection];
  }

  static getById<K extends keyof DatabaseSchema>(
    collection: K,
    id: string
  ): DatabaseSchema[K][number] | undefined {
    const items = this.data[collection] as any[];
    return items.find((item: any) => item.id === id);
  }

  static query<K extends keyof DatabaseSchema>(
    collection: K,
    predicate: (item: DatabaseSchema[K][number]) => boolean
  ): DatabaseSchema[K] {
    const items = this.data[collection] as any[];
    return items.filter(predicate) as DatabaseSchema[K];
  }

  static create<K extends keyof DatabaseSchema>(
    collection: K,
    item: DatabaseSchema[K][number]
  ): DatabaseSchema[K][number] {
    const items = this.data[collection] as any[];
    items.push(item);
    return item;
  }

  static update<K extends keyof DatabaseSchema>(
    collection: K,
    id: string,
    updates: Partial<DatabaseSchema[K][number]>
  ): DatabaseSchema[K][number] | null {
    const items = this.data[collection] as any[];
    const index = items.findIndex((item: any) => item.id === id);
    
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    return items[index];
  }

  static delete<K extends keyof DatabaseSchema>(
    collection: K,
    id: string
  ): boolean {
    const items = this.data[collection] as any[];
    const index = items.findIndex((item: any) => item.id === id);
    
    if (index === -1) return false;
    
    items.splice(index, 1);
    return true;
  }

  static count<K extends keyof DatabaseSchema>(collection: K): number {
    return this.data[collection].length;
  }
}
