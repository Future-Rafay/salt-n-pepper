-- CreateTable
CREATE TABLE `productsuggestion` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `suggestedVariantId` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductSuggestion_productId_suggestedVariantId_key`(`productId`, `suggestedVariantId`),
    INDEX `ProductSuggestion_productId_sortOrder_idx`(`productId`, `sortOrder`),
    INDEX `ProductSuggestion_suggestedVariantId_idx`(`suggestedVariantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `productsuggestion` ADD CONSTRAINT `ProductSuggestion_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productsuggestion` ADD CONSTRAINT `ProductSuggestion_suggestedVariantId_fkey` FOREIGN KEY (`suggestedVariantId`) REFERENCES `productvariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
