import { FileId } from '@lib/core/value-objects/file-id.vo';
import { UserId } from '@lib/core/value-objects/user-id.vo';
import { File } from '../../file.entity';

describe('File Entity Unit Tests', () => {
  const mockFileData = {
    filename: 'test-file.jpg',
    originalName: 'original-test-file.jpg',
    path: '/uploads/test-file.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    bucket: 'test-bucket',
  };

  describe('constructor', () => {
    it('should create a new File with default values', () => {
      const file = new File(
        mockFileData.filename,
        mockFileData.originalName,
        mockFileData.path,
        mockFileData.mimeType,
        mockFileData.size,
        mockFileData.bucket,
      );

      expect(file.id).toBeInstanceOf(FileId);
      expect(file.filename).toBe(mockFileData.filename);
      expect(file.originalName).toBe(mockFileData.originalName);
      expect(file.path).toBe(mockFileData.path);
      expect(file.mimeType).toBe(mockFileData.mimeType);
      expect(file.size).toBe(mockFileData.size);
      expect(file.bucket).toBe(mockFileData.bucket);
      expect(file.userId).toBeNull();
      expect(file.isPublic).toBe(false);
      expect(file.createdAt).toBeInstanceOf(Date);
      expect(file.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a new File with custom values', () => {
      const userId = UserId.create();
      const isPublic = true;
      const customId = 'custom-id';

      const file = new File(
        mockFileData.filename,
        mockFileData.originalName,
        mockFileData.path,
        mockFileData.mimeType,
        mockFileData.size,
        mockFileData.bucket,
        userId,
        isPublic,
        customId,
      );

      expect(file.userId).toBe(userId);
      expect(file.isPublic).toBe(isPublic);
      expect(file.id.getValue()).toBe(customId);
    });
  });

  describe('fromData', () => {
    it('should create a File from data object', () => {
      const userId = UserId.create();
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');

      const data = {
        id: 'test-id',
        filename: mockFileData.filename,
        originalName: mockFileData.originalName,
        path: mockFileData.path,
        mimeType: mockFileData.mimeType,
        size: mockFileData.size,
        bucket: mockFileData.bucket,
        userId,
        isPublic: true,
        createdAt,
        updatedAt,
      };

      const file = File.fromData(data);

      expect(file.id.getValue()).toBe(data.id);
      expect(file.filename).toBe(data.filename);
      expect(file.originalName).toBe(data.originalName);
      expect(file.path).toBe(data.path);
      expect(file.mimeType).toBe(data.mimeType);
      expect(file.size).toBe(data.size);
      expect(file.bucket).toBe(data.bucket);
      expect(file.userId).toBe(data.userId);
      expect(file.isPublic).toBe(data.isPublic);
      expect(file.createdAt).toBe(data.createdAt);
      expect(file.updatedAt).toBe(data.updatedAt);
    });
  });

  describe('makePublic', () => {
    it('should make a private file public', async () => {
      const file = new File(
        mockFileData.filename,
        mockFileData.originalName,
        mockFileData.path,
        mockFileData.mimeType,
        mockFileData.size,
        mockFileData.bucket,
      );

      const originalUpdatedAt = file.updatedAt;

      // Add a small delay to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 1));

      file.makePublic();

      expect(file.isPublic).toBe(true);
      expect(file.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not update timestamps if file is already public', () => {
      const file = new File(
        mockFileData.filename,
        mockFileData.originalName,
        mockFileData.path,
        mockFileData.mimeType,
        mockFileData.size,
        mockFileData.bucket,
        null,
        true,
      );

      const originalUpdatedAt = file.updatedAt;

      file.makePublic();

      expect(file.isPublic).toBe(true);
      expect(file.updatedAt).toBe(originalUpdatedAt);
    });
  });

  describe('makePrivate', () => {
    it('should make a public file private', async () => {
      const file = new File(
        mockFileData.filename,
        mockFileData.originalName,
        mockFileData.path,
        mockFileData.mimeType,
        mockFileData.size,
        mockFileData.bucket,
        null,
        true,
      );

      const originalUpdatedAt = file.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 1));

      file.makePrivate();

      expect(file.isPublic).toBe(false);

      expect(file.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not update timestamps if file is already private', () => {
      const file = new File(
        mockFileData.filename,
        mockFileData.originalName,
        mockFileData.path,
        mockFileData.mimeType,
        mockFileData.size,
        mockFileData.bucket,
      );

      const originalUpdatedAt = file.updatedAt;

      file.makePrivate();

      expect(file.isPublic).toBe(false);
      expect(file.updatedAt).toBe(originalUpdatedAt);
    });
  });

  describe('updateUser', () => {
    it('should update the user with a new userId', async () => {
      const file = new File(
        mockFileData.filename,
        mockFileData.originalName,
        mockFileData.path,
        mockFileData.mimeType,
        mockFileData.size,
        mockFileData.bucket,
      );

      const originalUpdatedAt = file.updatedAt;
      const newUserId = 'new-user-id';
      await new Promise((resolve) => setTimeout(resolve, 1));

      file.updateUser(newUserId);

      expect(file.userId).toBeInstanceOf(UserId);
      expect(file.userId!.getValue()).toBe(newUserId);
      expect(file.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should set userId to null when passed null', async () => {
      const userId = UserId.create();
      const file = new File(
        mockFileData.filename,
        mockFileData.originalName,
        mockFileData.path,
        mockFileData.mimeType,
        mockFileData.size,
        mockFileData.bucket,
        userId,
      );

      const originalUpdatedAt = file.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 1));

      file.updateUser(null);

      expect(file.userId).toBeNull();
      expect(file.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('rename', () => {
    it('should rename the file', async () => {
      const file = new File(
        mockFileData.filename,
        mockFileData.originalName,
        mockFileData.path,
        mockFileData.mimeType,
        mockFileData.size,
        mockFileData.bucket,
      );

      const originalUpdatedAt = file.updatedAt;
      const newName = 'new-name.jpg';

      // Add a small delay to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 1));

      file.rename(newName);

      expect(file.originalName).toBe(newName);
      expect(file.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('move', () => {
    it('should move the file to a new path', async () => {
      const file = new File(
        mockFileData.filename,
        mockFileData.originalName,
        mockFileData.path,
        mockFileData.mimeType,
        mockFileData.size,
        mockFileData.bucket,
      );

      const originalUpdatedAt = file.updatedAt;
      const newPath = '/new-uploads/test-file.jpg';

      // Add a small delay to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 1));

      file.move(newPath);

      expect(file.path).toBe(newPath);
      expect(file.bucket).toBe(mockFileData.bucket); // Should remain unchanged
      expect(file.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should move the file to a new path and bucket', async () => {
      const file = new File(
        mockFileData.filename,
        mockFileData.originalName,
        mockFileData.path,
        mockFileData.mimeType,
        mockFileData.size,
        mockFileData.bucket,
      );

      const originalUpdatedAt = file.updatedAt;
      const newPath = '/new-uploads/test-file.jpg';
      const newBucket = 'new-bucket';

      // Add a longer delay to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      file.move(newPath, newBucket);

      expect(file.path).toBe(newPath);
      expect(file.bucket).toBe(newBucket);
      expect(file.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
