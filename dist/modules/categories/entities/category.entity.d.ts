export declare class Category {
    id: string;
    name: string;
    parentId: string;
    parent: Category;
    children: Category[];
    description: string;
    isActive: boolean;
    createdAt: Date;
}
