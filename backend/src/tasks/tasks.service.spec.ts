import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  
  // Mock du repository TypeORM
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Mock du cache Redis
  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  // Test 1 : Le service doit être défini
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test 2 : Créer une tâche
  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'Test task',
        description: 'Test description',
      };

      const savedTask = {
        id: '1',
        ...createTaskDto,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(savedTask);
      mockRepository.save.mockResolvedValue(savedTask);
      mockCacheManager.del.mockResolvedValue(undefined);

      const result = await service.create(createTaskDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createTaskDto);
      expect(mockRepository.save).toHaveBeenCalledWith(savedTask);
      expect(result).toEqual(savedTask);
    });
  });

  // Test 3 : Récupérer toutes les tâches
  describe('findAll', () => {
    it('should return tasks from cache if available', async () => {
      const cachedData = {
        data: [{ id: '1', title: 'Cached task' }],
        total: 1,
      };

      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.findAll(1, 10);

      expect(mockCacheManager.get).toHaveBeenCalledWith('tasks_list_1_10');
      expect(result).toEqual(cachedData);
    });
  });

  // Test 4 : Récupérer une tâche par ID
  describe('findOne', () => {
    it('should throw NotFoundException if task not found', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});