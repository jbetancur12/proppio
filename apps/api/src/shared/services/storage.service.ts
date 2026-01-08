import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from 'fs';
import { AppError } from "../errors/AppError";

interface UploadFileOptions {
    bucketName: string;
    key: string;
    filePath: string;
    contentType: string;
}

export class StorageService {
    private s3Client: S3Client;
    private readonly region = 'us-east-1';

    constructor() {
        this.s3Client = new S3Client({
            region: this.region,
            endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9002',
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
                secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minioadmin'
            }
        });
    }

    async ensureBucket(bucketName: string): Promise<void> {
        try {
            await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
        } catch (error: any) {
            // Error code 404/NotFound means bucket doesn't exist
            if (error.$metadata?.httpStatusCode === 404 || error.name === 'NotFound') {
                try {
                    await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
                    console.log(`Bucket ${bucketName} created.`);
                } catch (createError) {
                    console.error('Error creating bucket:', createError);
                }
            } else {
                console.error('Error checking bucket:', error);
            }
        }
    }

    async uploadFile({ bucketName, key, filePath, contentType }: UploadFileOptions): Promise<void> {
        try {
            await this.ensureBucket(bucketName);
            const fileStream = fs.createReadStream(filePath);
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: fileStream,
                ContentType: contentType
            });
            await this.s3Client.send(command);
        } catch (error) {
            console.error('Upload error:', error);
            throw new AppError('Error al subir archivo al almacenamiento', 500);
        }
    }

    async uploadBuffer(bucketName: string, key: string, buffer: Buffer, contentType: string): Promise<void> {
        try {
            await this.ensureBucket(bucketName);
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: buffer,
                ContentType: contentType
            });
            await this.s3Client.send(command);
        } catch (error) {
            console.error('Buffer upload error:', error);
            throw new AppError('Error al subir archivo', 500);
        }
    }

    async getPresignedUrl(bucketName: string, key: string, expiresIn = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: key
            });
            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error) {
            console.error('Presign error:', error);
            throw new AppError('Error al generar URL de descarga', 500);
        }
    }

    async deleteFile(bucketName: string, key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: key
            });
            await this.s3Client.send(command);
        } catch (error) {
            console.error('Delete error:', error);
        }
    }
}

export const storageService = new StorageService();
