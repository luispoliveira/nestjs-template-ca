import { FileId } from '../value-objects/file-id.vo';
import { UserId } from '../value-objects/user-id.vo';
export class File {
  id: FileId;
  filename: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  bucket: string;
  userId: UserId | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    filename: string,
    originalName: string,
    path: string,
    mimeType: string,
    size: number,
    bucket: string,
    userId: string | null = null,
    isPublic: boolean = false,
    id?: string,
  ) {
    this.id = FileId.create(id);
    this.filename = filename;
    this.originalName = originalName;
    this.path = path;
    this.mimeType = mimeType;
    this.size = size;
    this.bucket = bucket;
    this.userId = userId ? UserId.create(userId) : null;
    this.isPublic = isPublic;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static fromData(data: {
    id: string;
    filename: string;
    originalName: string;
    path: string;
    mimeType: string;
    size: number;
    bucket: string;
    userId: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): File {
    const file = new File(
      data.filename,
      data.originalName,
      data.path,
      data.mimeType,
      data.size,
      data.bucket,
      data.userId,
      data.isPublic,
      data.id,
    );
    file.createdAt = data.createdAt;
    file.updatedAt = data.updatedAt;
    return file;
  }

  makePublic() {
    if (!this.isPublic) {
      this.isPublic = true;
      this.updatedAt = new Date();
    }
  }

  makePrivate() {
    if (this.isPublic) {
      this.isPublic = false;
      this.updatedAt = new Date();
    }
  }

  updateUser(userId: string | null) {
    this.userId = userId ? UserId.create(userId) : null;
    this.updatedAt = new Date();
  }

  rename(newOriginalName: string) {
    this.originalName = newOriginalName;
    this.updatedAt = new Date();
  }

  move(newPath: string, newBucket?: string) {
    this.path = newPath;
    if (newBucket) {
      this.bucket = newBucket;
    }
    this.updatedAt = new Date();
  }
}
