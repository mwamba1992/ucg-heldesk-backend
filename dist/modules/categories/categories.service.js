"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CategoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./entities/category.entity");
let CategoriesService = CategoriesService_1 = class CategoriesService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
        this.logger = new common_1.Logger(CategoriesService_1.name);
    }
    async seedCategories() {
        const count = await this.categoryRepository.count();
        if (count > 0)
            return;
        const defaultCategories = [
            { name: 'Hardware', description: 'Hardware related issues' },
            { name: 'Software', description: 'Software and application issues' },
            { name: 'Network', description: 'Network and connectivity issues' },
            { name: 'Email', description: 'Email related issues' },
            { name: 'Account Access', description: 'Login and account access issues' },
            { name: 'Printer', description: 'Printer and printing issues' },
            { name: 'Other', description: 'Other IT support requests' },
        ];
        for (const cat of defaultCategories) {
            const category = this.categoryRepository.create(cat);
            await this.categoryRepository.save(category);
        }
        this.logger.log('Default categories seeded successfully');
    }
    async create(createCategoryDto) {
        const existing = await this.categoryRepository.findOne({
            where: { name: createCategoryDto.name },
        });
        if (existing) {
            throw new common_1.ConflictException('Category with this name already exists');
        }
        if (createCategoryDto.parentId) {
            const parent = await this.findOne(createCategoryDto.parentId);
            if (!parent) {
                throw new common_1.NotFoundException('Parent category not found');
            }
        }
        const category = this.categoryRepository.create(createCategoryDto);
        const saved = await this.categoryRepository.save(category);
        this.logger.log(`Category created: ${saved.name}`);
        return saved;
    }
    async findAll(includeInactive = false) {
        const where = {};
        if (!includeInactive) {
            where.isActive = true;
        }
        return this.categoryRepository.find({
            where,
            relations: ['parent', 'children'],
            order: { name: 'ASC' },
        });
    }
    async findRootCategories() {
        return this.categoryRepository.find({
            where: { parentId: (0, typeorm_2.IsNull)(), isActive: true },
            relations: ['children'],
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'children'],
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        const category = await this.findOne(id);
        if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
            const existing = await this.categoryRepository.findOne({
                where: { name: updateCategoryDto.name },
            });
            if (existing) {
                throw new common_1.ConflictException('Category with this name already exists');
            }
        }
        if (updateCategoryDto.parentId) {
            if (updateCategoryDto.parentId === id) {
                throw new common_1.ConflictException('Category cannot be its own parent');
            }
            await this.findOne(updateCategoryDto.parentId);
        }
        Object.assign(category, updateCategoryDto);
        const saved = await this.categoryRepository.save(category);
        this.logger.log(`Category updated: ${saved.name}`);
        return this.findOne(id);
    }
    async remove(id) {
        const category = await this.findOne(id);
        category.isActive = false;
        await this.categoryRepository.save(category);
        this.logger.log(`Category deactivated: ${category.name}`);
        return { message: `Category ${category.name} has been deactivated` };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = CategoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map