import { File } from '../../file.entity';

describe('File Entity unit tests', () => {
  const validData = {
    filename: 'test-file-123.jpg',
    originalName: 'original-image.jpg',
    path: '/uploads/images',
    mimeType: 'image/jpeg',
    size: 1024000,
    bucket: 'main-bucket',
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create file with default values', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );

      expect(file.id).toBeDefined();
      expect(file.id.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(file.filename).toBe(validData.filename);
      expect(file.originalName).toBe(validData.originalName);
      expect(file.path).toBe(validData.path);
      expect(file.mimeType).toBe(validData.mimeType);
      expect(file.size).toBe(validData.size);
      expect(file.bucket).toBe(validData.bucket);
      expect(file.userId).toBeNull();
      expect(file.isPublic).toBe(false);
      expect(file.createdAt).toEqual(new Date('2025-10-01T12:00:00.000Z'));
      expect(file.updatedAt).toEqual(new Date('2025-10-01T12:00:00.000Z'));
    });

    it('should create file with custom userId', () => {
      const userId = 'user-123';
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
        userId,
      );

      expect(file.userId?.getValue()).toBe(userId);
    });

    it('should create file with custom isPublic flag', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
        null,
        true,
      );

      expect(file.isPublic).toBe(true);
    });

    it('should create file with custom id', () => {
      const customId = 'custom-file-id-123';
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
        null,
        false,
        customId,
      );

      expect(file.id.getValue()).toBe(customId);
    });

    it('should create file with all custom parameters', () => {
      const userId = 'user-456';
      const customId = 'custom-file-id-456';
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
        userId,
        true,
        customId,
      );

      expect(file.id.getValue()).toBe(customId);
      expect(file.userId?.getValue()).toBe(userId);
      expect(file.isPublic).toBe(true);
    });
  });

  describe('fromData', () => {
    it('should create file from data object with all properties', () => {
      const data = {
        id: 'existing-file-id',
        filename: 'data-file.pdf',
        originalName: 'document.pdf',
        path: '/documents',
        mimeType: 'application/pdf',
        size: 2048000,
        bucket: 'documents-bucket',
        userId: 'user-789',
        isPublic: true,
        createdAt: new Date('2025-09-15T10:30:00.000Z'),
        updatedAt: new Date('2025-09-20T14:45:00.000Z'),
      };

      const file = File.fromData(data);

      expect(file.id.getValue()).toBe(data.id);
      expect(file.filename).toBe(data.filename);
      expect(file.originalName).toBe(data.originalName);
      expect(file.path).toBe(data.path);
      expect(file.mimeType).toBe(data.mimeType);
      expect(file.size).toBe(data.size);
      expect(file.bucket).toBe(data.bucket);
      expect(file.userId?.getValue()).toBe(data.userId);
      expect(file.isPublic).toBe(data.isPublic);
      expect(file.createdAt).toEqual(data.createdAt);
      expect(file.updatedAt).toEqual(data.updatedAt);
    });

    it('should create file from data object with null userId', () => {
      const data = {
        id: 'existing-file-id',
        filename: 'data-file.pdf',
        originalName: 'document.pdf',
        path: '/documents',
        mimeType: 'application/pdf',
        size: 2048000,
        bucket: 'documents-bucket',
        userId: null,
        isPublic: false,
        createdAt: new Date('2025-09-15T10:30:00.000Z'),
        updatedAt: new Date('2025-09-20T14:45:00.000Z'),
      };

      const file = File.fromData(data);

      expect(file.userId).toBeNull();
      expect(file.isPublic).toBe(false);
    });
  });

  describe('makePublic', () => {
    it('should make private file public and update timestamp', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );

      expect(file.isPublic).toBe(false);

      jest.setSystemTime(new Date('2025-10-01T12:05:00.000Z'));
      file.makePublic();

      expect(file.isPublic).toBe(true);
      expect(file.updatedAt).toEqual(new Date('2025-10-01T12:05:00.000Z'));
    });

    it('should not update timestamp if file is already public', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
        null,
        true,
      );

      const initialUpdatedAt = file.updatedAt;

      jest.setSystemTime(new Date('2025-10-01T12:05:00.000Z'));
      file.makePublic();

      expect(file.isPublic).toBe(true);
      expect(file.updatedAt).toEqual(initialUpdatedAt);
    });
  });

  describe('makePrivate', () => {
    it('should make public file private and update timestamp', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
        null,
        true,
      );

      expect(file.isPublic).toBe(true);

      jest.setSystemTime(new Date('2025-10-01T12:05:00.000Z'));
      file.makePrivate();

      expect(file.isPublic).toBe(false);
      expect(file.updatedAt).toEqual(new Date('2025-10-01T12:05:00.000Z'));
    });

    it('should not update timestamp if file is already private', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );

      const initialUpdatedAt = file.updatedAt;

      jest.setSystemTime(new Date('2025-10-01T12:05:00.000Z'));
      file.makePrivate();

      expect(file.isPublic).toBe(false);
      expect(file.updatedAt).toEqual(initialUpdatedAt);
    });
  });

  describe('updateUser', () => {
    it('should update userId and timestamp', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );

      const newUserId = 'new-user-123';

      jest.setSystemTime(new Date('2025-10-01T12:10:00.000Z'));
      file.updateUser(newUserId);

      expect(file.userId?.getValue()).toBe(newUserId);
      expect(file.updatedAt).toEqual(new Date('2025-10-01T12:10:00.000Z'));
    });

    it('should set userId to null and update timestamp', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
        'existing-user',
      );

      jest.setSystemTime(new Date('2025-10-01T12:10:00.000Z'));
      file.updateUser(null);

      expect(file.userId).toBeNull();
      expect(file.updatedAt).toEqual(new Date('2025-10-01T12:10:00.000Z'));
    });
  });

  describe('rename', () => {
    it('should update originalName and timestamp', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );

      const newOriginalName = 'renamed-document.jpg';

      jest.setSystemTime(new Date('2025-10-01T12:15:00.000Z'));
      file.rename(newOriginalName);

      expect(file.originalName).toBe(newOriginalName);
      expect(file.updatedAt).toEqual(new Date('2025-10-01T12:15:00.000Z'));
    });

    it('should handle empty string as new name', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );

      jest.setSystemTime(new Date('2025-10-01T12:15:00.000Z'));
      file.rename('');

      expect(file.originalName).toBe('');
      expect(file.updatedAt).toEqual(new Date('2025-10-01T12:15:00.000Z'));
    });
  });

  describe('move', () => {
    it('should update path and timestamp without changing bucket', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );

      const newPath = '/uploads/documents';

      jest.setSystemTime(new Date('2025-10-01T12:20:00.000Z'));
      file.move(newPath);

      expect(file.path).toBe(newPath);
      expect(file.bucket).toBe(validData.bucket); // Should remain unchanged
      expect(file.updatedAt).toEqual(new Date('2025-10-01T12:20:00.000Z'));
    });

    it('should update path and bucket when both are provided', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );

      const newPath = '/uploads/archived';
      const newBucket = 'archive-bucket';

      jest.setSystemTime(new Date('2025-10-01T12:20:00.000Z'));
      file.move(newPath, newBucket);

      expect(file.path).toBe(newPath);
      expect(file.bucket).toBe(newBucket);
      expect(file.updatedAt).toEqual(new Date('2025-10-01T12:20:00.000Z'));
    });

    it('should handle empty path', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );

      jest.setSystemTime(new Date('2025-10-01T12:20:00.000Z'));
      file.move('');

      expect(file.path).toBe('');
      expect(file.updatedAt).toEqual(new Date('2025-10-01T12:20:00.000Z'));
    });
  });

  describe('edge cases', () => {
    it('should generate unique ids for multiple instances', () => {
      const file1 = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );
      const file2 = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );
      const file3 = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );

      const ids = [file1.id, file2.id, file3.id];
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      ids.forEach((id) => {
        expect(id.getValue()).toMatch(uuidRegex);
      });
    });

    it('should handle zero file size', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        0,
        validData.bucket,
      );

      expect(file.size).toBe(0);
    });

    it('should handle very large file size', () => {
      const largeSize = Number.MAX_SAFE_INTEGER;
      const file = new File(
        validData.filename,
        validData.originalName,
        validData.path,
        validData.mimeType,
        largeSize,
        validData.bucket,
      );

      expect(file.size).toBe(largeSize);
    });

    it('should handle special characters in filename and originalName', () => {
      const specialFilename = 'file-with-特殊字符-123.txt';
      const specialOriginalName = 'original-文件名-with-émojis-🎉.txt';

      const file = new File(
        specialFilename,
        specialOriginalName,
        validData.path,
        validData.mimeType,
        validData.size,
        validData.bucket,
      );

      expect(file.filename).toBe(specialFilename);
      expect(file.originalName).toBe(specialOriginalName);
    });

    it('should handle empty strings for path and bucket', () => {
      const file = new File(
        validData.filename,
        validData.originalName,
        '',
        validData.mimeType,
        validData.size,
        '',
      );

      expect(file.path).toBe('');
      expect(file.bucket).toBe('');
    });
  });
});
