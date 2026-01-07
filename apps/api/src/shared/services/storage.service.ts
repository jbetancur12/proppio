import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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
    private readonly region = 'us-east-1'; // Dummy region for MinIO

    constructor() {
        this.s3Client = new S3Client({
            region: this.region,
            endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
            forcePathStyle: true, // Required for MinIO
            credentials: {
                accessKeyId: process.env.STORAGE_ACCESS_KEY || 'admin',
                secretAccessKey: process.env.STORAGE_SECRET_KEY || 'password'
            }
        });
    }

    async ensureBucket(bucketName: string): Promise<void> {
        try {
            // Check if bucket exists implies try to head it or list buckets. 
            // For simplicity in this local setup, we assume it might not exist and creating it is idempotent-ish or we catch error.
            // AWS SDK v3 createBucket is separate.
            // BUT: With MinIO default setup, we can just let it fail if exists or check.
            // Ideally we run a startup script to create buckets. 
            // For now, let's just proceed. If it fails, we handle it.
            // NOTE: In production, buckets are usually provisioned via Terraform/IaC.
        } catch (error) {
            console.error('Error ensuring bucket:', error);
        }
    }

    async uploadFile({ bucketName, key, filePath, contentType }: UploadFileOptions): Promise<void> {
        try {
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
            // We generally don't throw here if it fails to delete, just log it. 
        }
    }
}

export const storageService = new StorageService();
