import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async seedCategories(): Promise<void> {
    const count = await this.categoryRepository.count();
    if (count > 0) return;

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

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    if (createCategoryDto.parentId) {
      const parent = await this.findOne(createCategoryDto.parentId);
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = this.categoryRepository.create(createCategoryDto);
    const saved = await this.categoryRepository.save(category);

    this.logger.log(`Category created: ${saved.name}`);
    return saved;
  }

  async findAll(includeInactive = false): Promise<Category[]> {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.categoryRepository.find({
      where,
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  async findRootCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentId: IsNull(), isActive: true },
      relations: ['children'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });
      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new ConflictException('Category cannot be its own parent');
      }
      await this.findOne(updateCategoryDto.parentId);
    }

    Object.assign(category, updateCategoryDto);
    const saved = await this.categoryRepository.save(category);

    this.logger.log(`Category updated: ${saved.name}`);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);

    // Soft delete - just deactivate
    category.isActive = false;
    await this.categoryRepository.save(category);

    this.logger.log(`Category deactivated: ${category.name}`);
    return { message: `Category ${category.name} has been deactivated` };
  }
}
