import { UserId } from '@lib/core/value-objects/user-id.vo';
import { File } from '../../file.entity';

describe('File Management Integration Tests', () => {
  let userId1: UserId;
  let userId2: UserId;

  beforeEach(() => {
    userId1 = UserId.create();
    userId2 = UserId.create();
  });

  describe('File Ownership and Visibility', () => {
    it('should handle file ownership transitions', () => {
      const file = new File(
        'document.pdf',
        'Important Document.pdf',
        '/uploads/documents/document.pdf',
        'application/pdf',
        1024000,
        'documents-bucket',
        userId1,
        false,
      );

      // Initially owned by user1 and private
      expect(file.userId).toBe(userId1);
      expect(file.isPublic).toBe(false);

      // Transfer ownership to user2
      file.updateUser(userId2.getValue());
      expect(file.userId!.getValue()).toBe(userId2.getValue());

      // Make file public
      file.makePublic();
      expect(file.isPublic).toBe(true);

      // Remove ownership (make file orphaned but public)
      file.updateUser(null);
      expect(file.userId).toBeNull();
      expect(file.isPublic).toBe(true);
    });

    it('should handle file visibility changes', () => {
      const publicFile = new File(
        'image.jpg',
        'Profile Image.jpg',
        '/uploads/images/image.jpg',
        'image/jpeg',
        512000,
        'images-bucket',
        userId1,
        true,
      );

      const privateFile = new File(
        'secret.txt',
        'Secret Document.txt',
        '/uploads/private/secret.txt',
        'text/plain',
        1024,
        'private-bucket',
        userId1,
        false,
      );

      // Check initial states
      expect(publicFile.isPublic).toBe(true);
      expect(privateFile.isPublic).toBe(false);

      // Toggle visibility
      publicFile.makePrivate();
      privateFile.makePublic();

      expect(publicFile.isPublic).toBe(false);
      expect(privateFile.isPublic).toBe(true);

      // Toggle back
      publicFile.makePublic();
      privateFile.makePrivate();

      expect(publicFile.isPublic).toBe(true);
      expect(privateFile.isPublic).toBe(false);
    });
  });

  describe('File Operations and Metadata', () => {
    it('should handle file rename and move operations', async () => {
      const file = new File(
        'temp-name.doc',
        'Temporary Document.doc',
        '/uploads/temp/temp-name.doc',
        'application/msword',
        2048000,
        'temp-bucket',
        userId1,
      );

      const originalUpdatedAt = file.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 1));

      // Rename the file
      file.rename('Final Document.doc');
      expect(file.originalName).toBe('Final Document.doc');
      expect(file.filename).toBe('temp-name.doc'); // System filename unchanged
      expect(file.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

      // Move to different path
      const afterRenameUpdatedAt = file.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 1));
      file.move('/uploads/final/temp-name.doc');
      expect(file.path).toBe('/uploads/final/temp-name.doc');
      expect(file.bucket).toBe('temp-bucket'); // Bucket unchanged
      expect(file.updatedAt.getTime()).toBeGreaterThan(afterRenameUpdatedAt.getTime());

      // Move to different bucket
      const afterMoveUpdatedAt = file.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 1));

      file.move('/uploads/archive/temp-name.doc', 'archive-bucket');
      expect(file.path).toBe('/uploads/archive/temp-name.doc');
      expect(file.bucket).toBe('archive-bucket');
      expect(file.updatedAt.getTime()).toBeGreaterThan(afterMoveUpdatedAt.getTime());
    });

    it('should maintain file metadata consistency', () => {
      const fileData = {
        id: 'test-file-id',
        filename: 'system-file.jpg',
        originalName: 'User Photo.jpg',
        path: '/uploads/photos/system-file.jpg',
        mimeType: 'image/jpeg',
        size: 1024000,
        bucket: 'photos-bucket',
        userId: userId1,
        isPublic: false,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const file = File.fromData(fileData);

      // Verify all data is preserved
      expect(file.id.getValue()).toBe(fileData.id);
      expect(file.filename).toBe(fileData.filename);
      expect(file.originalName).toBe(fileData.originalName);
      expect(file.path).toBe(fileData.path);
      expect(file.mimeType).toBe(fileData.mimeType);
      expect(file.size).toBe(fileData.size);
      expect(file.bucket).toBe(fileData.bucket);
      expect(file.userId).toBe(fileData.userId);
      expect(file.isPublic).toBe(fileData.isPublic);
      expect(file.createdAt).toBe(fileData.createdAt);
      expect(file.updatedAt).toBe(fileData.updatedAt);

      // Operations should update timestamps
      const originalUpdatedAt = file.updatedAt;
      file.makePublic();
      expect(file.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      expect(file.createdAt).toBe(fileData.createdAt); // CreatedAt never changes
    });
  });

  describe('File Collections and Batch Operations', () => {
    it('should handle multiple files for the same user', () => {
      const files = [
        new File(
          'file1.txt',
          'Document 1.txt',
          '/uploads/file1.txt',
          'text/plain',
          1024,
          'bucket1',
          userId1,
        ),
        new File(
          'file2.txt',
          'Document 2.txt',
          '/uploads/file2.txt',
          'text/plain',
          2048,
          'bucket1',
          userId1,
        ),
        new File(
          'file3.jpg',
          'Image 1.jpg',
          '/uploads/file3.jpg',
          'image/jpeg',
          512000,
          'bucket2',
          userId1,
        ),
      ];

      // All files belong to the same user
      files.forEach((file) => {
        expect(file.userId).toBe(userId1);
      });

      // Make all files public
      files.forEach((file) => file.makePublic());
      files.forEach((file) => {
        expect(file.isPublic).toBe(true);
      });

      // Transfer ownership to another user
      files.forEach((file) => file.updateUser(userId2.getValue()));
      files.forEach((file) => {
        expect(file.userId!.getValue()).toBe(userId2.getValue());
      });

      // Different file types and sizes
      expect(files[0].mimeType).toBe('text/plain');
      expect(files[2].mimeType).toBe('image/jpeg');
      expect(files[0].size).toBeLessThan(files[2].size);
    });

    it('should handle orphaned files (no owner)', () => {
      const orphanedFile = new File(
        'orphaned.pdf',
        'Orphaned Document.pdf',
        '/uploads/orphaned.pdf',
        'application/pdf',
        1024000,
        'orphaned-bucket',
        null, // No owner
        true, // Public for access
      );

      expect(orphanedFile.userId).toBeNull();
      expect(orphanedFile.isPublic).toBe(true);

      // Can assign ownership later
      orphanedFile.updateUser(userId1.getValue());
      expect(orphanedFile.userId!.getValue()).toBe(userId1.getValue());

      // Can remove ownership again
      orphanedFile.updateUser(null);
      expect(orphanedFile.userId).toBeNull();
    });
  });

  describe('File System Integration Scenarios', () => {
    it('should simulate file upload and processing workflow', () => {
      // Step 1: Create temporary file
      const tempId = `temp-${Date.now()}`;
      const uploadedFile = new File(
        `${tempId}.upload`,
        'User Upload.pdf',
        `/uploads/temp/${tempId}.upload`,
        'application/pdf',
        2048000,
        'temp-bucket',
        userId1,
        false,
      );

      expect(uploadedFile.path).toContain('/uploads/temp/');
      expect(uploadedFile.bucket).toBe('temp-bucket');
      expect(uploadedFile.isPublic).toBe(false);

      // Step 2: Process and move to permanent location
      const processedFilename = `processed-${tempId}.pdf`;
      uploadedFile.move(`/uploads/documents/${processedFilename}`, 'documents-bucket');

      expect(uploadedFile.path).toBe(`/uploads/documents/${processedFilename}`);
      expect(uploadedFile.bucket).toBe('documents-bucket');

      // Step 3: Rename with user-friendly name
      uploadedFile.rename('Final Processed Document.pdf');
      expect(uploadedFile.originalName).toBe('Final Processed Document.pdf');

      // Step 4: Make public if needed
      uploadedFile.makePublic();
      expect(uploadedFile.isPublic).toBe(true);
    });

    it('should handle file duplication workflow', () => {
      const originalFile = new File(
        'original.txt',
        'Original Document.txt',
        '/uploads/original.txt',
        'text/plain',
        1024,
        'documents-bucket',
        userId1,
        false,
      );

      // Create a copy with different system name but same content
      const duplicateFile = new File(
        `copy-${originalFile.filename}`,
        `${originalFile.originalName} (Copy)`,
        `/uploads/copy-${originalFile.filename}`,
        originalFile.mimeType,
        originalFile.size,
        originalFile.bucket,
        originalFile.userId,
        originalFile.isPublic,
      );

      // Files should have different IDs and paths
      expect(duplicateFile.id.getValue()).not.toBe(originalFile.id.getValue());
      expect(duplicateFile.path).not.toBe(originalFile.path);
      expect(duplicateFile.filename).not.toBe(originalFile.filename);

      // But same content metadata
      expect(duplicateFile.mimeType).toBe(originalFile.mimeType);
      expect(duplicateFile.size).toBe(originalFile.size);
      expect(duplicateFile.bucket).toBe(originalFile.bucket);
      expect(duplicateFile.userId).toBe(originalFile.userId);
      expect(duplicateFile.originalName).toBe(`${originalFile.originalName} (Copy)`);
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should handle file operations that do not change state', async () => {
      const file = new File(
        'test.txt',
        'Test Document.txt',
        '/uploads/test.txt',
        'text/plain',
        1024,
        'test-bucket',
        userId1,
        true,
      );

      const originalUpdatedAt = file.updatedAt;

      // Operations that should not change state
      file.makePublic(); // Already public
      expect(file.updatedAt).toBe(originalUpdatedAt);
      await new Promise((resolve) => setTimeout(resolve, 1));

      file.makePrivate();
      const afterPrivateUpdatedAt = file.updatedAt;
      expect(afterPrivateUpdatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

      file.makePrivate(); // Already private
      expect(file.updatedAt).toBe(afterPrivateUpdatedAt);
    });

    it('should maintain data integrity during multiple operations', () => {
      const file = new File(
        'integrity-test.doc',
        'Integrity Test.doc',
        '/uploads/integrity-test.doc',
        'application/msword',
        5120000,
        'test-bucket',
        userId1,
        false,
      );

      const originalCreatedAt = file.createdAt;
      const originalId = file.id;
      const originalSize = file.size;
      const originalMimeType = file.mimeType;

      // Perform multiple operations
      file.makePublic();
      file.updateUser(userId2.getValue());
      file.rename('Updated Document.doc');
      file.move('/uploads/updated/integrity-test.doc', 'updated-bucket');
      file.makePrivate();
      file.updateUser(null);
      file.makePublic();

      // Immutable properties should never change
      expect(file.createdAt).toBe(originalCreatedAt);
      expect(file.id).toBe(originalId);
      expect(file.size).toBe(originalSize);
      expect(file.mimeType).toBe(originalMimeType);

      // Final state should reflect last operations
      expect(file.isPublic).toBe(true);
      expect(file.userId).toBeNull();
      expect(file.originalName).toBe('Updated Document.doc');
      expect(file.path).toBe('/uploads/updated/integrity-test.doc');
      expect(file.bucket).toBe('updated-bucket');
    });
  });
});
