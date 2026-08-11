-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `displayName` VARCHAR(120) NOT NULL DEFAULT 'SaltNPepper',
    `legalName` VARCHAR(160) NULL,
    `slug` VARCHAR(120) NOT NULL DEFAULT 'saltnpepper',
    `email` VARCHAR(320) NULL,
    `phone` VARCHAR(40) NULL,
    `street` VARCHAR(200) NULL,
    `postalCode` VARCHAR(16) NULL,
    `city` VARCHAR(120) NULL,
    `countryCode` CHAR(2) NOT NULL DEFAULT 'CH',
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `timezone` VARCHAR(64) NOT NULL DEFAULT 'Europe/Zurich',
    `currency` CHAR(3) NOT NULL DEFAULT 'CHF',
    `vatRegistered` BOOLEAN NULL,
    `vatNumber` VARCHAR(64) NULL,
    `primaryColor` CHAR(7) NOT NULL DEFAULT '#1C1917',
    `secondaryColor` CHAR(7) NOT NULL DEFAULT '#B43A25',
    `logoKey` VARCHAR(512) NULL,
    `compactLogoKey` VARCHAR(512) NULL,
    `faviconKey` VARCHAR(512) NULL,
    `heroImageKey` VARCHAR(512) NULL,
    `heroTitleDe` VARCHAR(240) NULL,
    `heroTitleEn` VARCHAR(240) NULL,
    `heroSubtitleDe` TEXT NULL,
    `heroSubtitleEn` TEXT NULL,
    `aboutDe` TEXT NULL,
    `aboutEn` TEXT NULL,
    `announcementDe` VARCHAR(500) NULL,
    `announcementEn` VARCHAR(500) NULL,
    `announcementActive` BOOLEAN NOT NULL DEFAULT false,
    `instagramUrl` VARCHAR(512) NULL,
    `facebookUrl` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SiteSettings_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FulfillmentSettings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `deliveryEnabled` BOOLEAN NOT NULL DEFAULT true,
    `pickupEnabled` BOOLEAN NOT NULL DEFAULT true,
    `asapEnabled` BOOLEAN NOT NULL DEFAULT true,
    `scheduledEnabled` BOOLEAN NOT NULL DEFAULT true,
    `deliveryPrepMinutes` INTEGER NOT NULL DEFAULT 45,
    `pickupPrepMinutes` INTEGER NOT NULL DEFAULT 30,
    `minimumLeadMinutes` INTEGER NOT NULL DEFAULT 30,
    `maximumAdvanceDays` INTEGER NOT NULL DEFAULT 14,
    `slotIntervalMinutes` INTEGER NOT NULL DEFAULT 15,
    `defaultSlotCapacity` INTEGER NOT NULL DEFAULT 10,
    `pickupInstructionsDe` TEXT NULL,
    `pickupInstructionsEn` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpeningWindow` (
    `id` VARCHAR(191) NOT NULL,
    `fulfillmentType` ENUM('DELIVERY', 'PICKUP') NOT NULL,
    `weekday` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `startMinute` INTEGER NOT NULL,
    `endMinute` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpeningWindow_fulfillmentType_weekday_active_sortOrder_idx`(`fulfillmentType`, `weekday`, `active`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceException` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `fulfillmentType` ENUM('DELIVERY', 'PICKUP') NOT NULL,
    `closed` BOOLEAN NOT NULL DEFAULT true,
    `startMinute` INTEGER NULL,
    `endMinute` INTEGER NULL,
    `note` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ServiceException_date_fulfillmentType_idx`(`date`, `fulfillmentType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FulfillmentSlot` (
    `id` VARCHAR(191) NOT NULL,
    `fulfillmentType` ENUM('DELIVERY', 'PICKUP') NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `bookedCount` INTEGER NOT NULL DEFAULT 0,
    `closed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FulfillmentSlot_startsAt_closed_idx`(`startsAt`, `closed`),
    UNIQUE INDEX `FulfillmentSlot_fulfillmentType_startsAt_key`(`fulfillmentType`, `startsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryZone` (
    `id` VARCHAR(191) NOT NULL,
    `nameDe` VARCHAR(120) NOT NULL,
    `nameEn` VARCHAR(120) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `feeRappen` INTEGER NOT NULL,
    `minimumSubtotalRappen` INTEGER NOT NULL DEFAULT 0,
    `freeDeliveryThresholdRappen` INTEGER NULL,
    `estimatedMinutes` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DeliveryZone_active_sortOrder_idx`(`active`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryZonePostalCode` (
    `id` VARCHAR(191) NOT NULL,
    `deliveryZoneId` VARCHAR(191) NOT NULL,
    `postalCode` CHAR(4) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DeliveryZonePostalCode_postalCode_key`(`postalCode`),
    INDEX `DeliveryZonePostalCode_deliveryZoneId_idx`(`deliveryZoneId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(160) NOT NULL,
    `nameDe` VARCHAR(160) NOT NULL,
    `nameEn` VARCHAR(160) NOT NULL,
    `descriptionDe` TEXT NULL,
    `descriptionEn` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_deletedAt_active_sortOrder_idx`(`deletedAt`, `active`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `nameDe` VARCHAR(180) NOT NULL,
    `nameEn` VARCHAR(180) NOT NULL,
    `descriptionDe` TEXT NULL,
    `descriptionEn` TEXT NULL,
    `imageKey` VARCHAR(512) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `available` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isHalal` BOOLEAN NOT NULL DEFAULT false,
    `isVegetarian` BOOLEAN NOT NULL DEFAULT false,
    `isVegan` BOOLEAN NOT NULL DEFAULT false,
    `spiceLevel` ENUM('MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT') NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    INDEX `Product_categoryId_deletedAt_active_sortOrder_idx`(`categoryId`, `deletedAt`, `active`, `sortOrder`),
    INDEX `Product_deletedAt_available_idx`(`deletedAt`, `available`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariant` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `nameDe` VARCHAR(160) NOT NULL,
    `nameEn` VARCHAR(160) NOT NULL,
    `sku` VARCHAR(100) NULL,
    `priceRappen` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductVariant_sku_key`(`sku`),
    INDEX `ProductVariant_productId_deletedAt_active_sortOrder_idx`(`productId`, `deletedAt`, `active`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OptionGroup` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `nameDe` VARCHAR(160) NOT NULL,
    `nameEn` VARCHAR(160) NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT false,
    `minimumSelections` INTEGER NOT NULL DEFAULT 0,
    `maximumSelections` INTEGER NOT NULL DEFAULT 1,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OptionGroup_productId_deletedAt_active_sortOrder_idx`(`productId`, `deletedAt`, `active`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OptionChoice` (
    `id` VARCHAR(191) NOT NULL,
    `optionGroupId` VARCHAR(191) NOT NULL,
    `nameDe` VARCHAR(160) NOT NULL,
    `nameEn` VARCHAR(160) NOT NULL,
    `priceDeltaRappen` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OptionChoice_optionGroupId_deletedAt_active_sortOrder_idx`(`optionGroupId`, `deletedAt`, `active`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductAvailabilityWindow` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `weekday` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `startMinute` INTEGER NOT NULL,
    `endMinute` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductAvailabilityWindow_productId_weekday_idx`(`productId`, `weekday`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Allergen` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `nameDe` VARCHAR(120) NOT NULL,
    `nameEn` VARCHAR(120) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Allergen_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductAllergen` (
    `productId` VARCHAR(191) NOT NULL,
    `allergenId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductAllergen_allergenId_idx`(`allergenId`),
    PRIMARY KEY (`productId`, `allergenId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(320) NOT NULL,
    `passwordHash` VARCHAR(255) NULL,
    `name` VARCHAR(160) NULL,
    `phone` VARCHAR(40) NULL,
    `image` VARCHAR(512) NULL,
    `emailVerified` DATETIME(3) NULL,
    `role` ENUM('CUSTOMER', 'OWNER', 'STAFF') NOT NULL DEFAULT 'CUSTOMER',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_role_active_idx`(`role`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(64) NOT NULL,
    `provider` VARCHAR(120) NOT NULL,
    `providerAccountId` VARCHAR(255) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(64) NULL,
    `scope` TEXT NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(255) NULL,

    INDEX `Account_userId_idx`(`userId`),
    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(255) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    INDEX `Session_userId_idx`(`userId`),
    INDEX `Session_expires_idx`(`expires`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordResetToken_userId_expiresAt_idx`(`userId`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StaffInvitation` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(320) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `invitedByUserId` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `acceptedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StaffInvitation_tokenHash_key`(`tokenHash`),
    INDEX `StaffInvitation_email_acceptedAt_idx`(`email`, `acceptedAt`),
    INDEX `StaffInvitation_invitedByUserId_idx`(`invitedByUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerAddress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `recipientName` VARCHAR(160) NOT NULL,
    `phone` VARCHAR(40) NOT NULL,
    `street` VARCHAR(200) NOT NULL,
    `streetExtra` VARCHAR(200) NULL,
    `postalCode` VARCHAR(16) NOT NULL,
    `city` VARCHAR(120) NOT NULL,
    `countryCode` CHAR(2) NOT NULL DEFAULT 'CH',
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CustomerAddress_userId_isDefault_idx`(`userId`, `isDefault`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StaffDeviceSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `deviceName` VARCHAR(160) NOT NULL,
    `platform` VARCHAR(40) NOT NULL DEFAULT 'android',
    `refreshTokenHash` CHAR(64) NOT NULL,
    `pushToken` VARCHAR(512) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `lastSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StaffDeviceSession_refreshTokenHash_key`(`refreshTokenHash`),
    UNIQUE INDEX `StaffDeviceSession_pushToken_key`(`pushToken`),
    INDEX `StaffDeviceSession_userId_revokedAt_expiresAt_idx`(`userId`, `revokedAt`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromoCode` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `type` ENUM('FIXED', 'PERCENT') NOT NULL,
    `value` INTEGER NOT NULL,
    `minimumSubtotalRappen` INTEGER NOT NULL DEFAULT 0,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `totalUsageLimit` INTEGER NULL,
    `perCustomerLimit` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PromoCode_code_key`(`code`),
    INDEX `PromoCode_active_startsAt_endsAt_idx`(`active`, `startsAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromoRedemption` (
    `id` VARCHAR(191) NOT NULL,
    `promoCodeId` VARCHAR(191) NOT NULL,
    `orderId` BIGINT NOT NULL,
    `userId` VARCHAR(191) NULL,
    `customerEmail` VARCHAR(320) NOT NULL,
    `discountRappen` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PromoRedemption_orderId_key`(`orderId`),
    INDEX `PromoRedemption_promoCodeId_createdAt_idx`(`promoCodeId`, `createdAt`),
    INDEX `PromoRedemption_promoCodeId_customerEmail_idx`(`promoCodeId`, `customerEmail`),
    INDEX `PromoRedemption_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `checkoutKeyHash` CHAR(64) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `guestTrackingTokenHash` CHAR(64) NULL,
    `locale` ENUM('DE', 'EN') NOT NULL DEFAULT 'DE',
    `customerName` VARCHAR(160) NOT NULL,
    `customerEmail` VARCHAR(320) NOT NULL,
    `customerPhone` VARCHAR(40) NOT NULL,
    `fulfillmentType` ENUM('DELIVERY', 'PICKUP') NOT NULL,
    `status` ENUM('PAYMENT_PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PAYMENT_PENDING',
    `paymentMethod` ENUM('STRIPE', 'CASH_ON_DELIVERY', 'PAY_AT_PICKUP') NOT NULL,
    `slotId` VARCHAR(191) NULL,
    `scheduledFor` DATETIME(3) NULL,
    `estimatedReadyAt` DATETIME(3) NULL,
    `note` TEXT NULL,
    `subtotalRappen` INTEGER NOT NULL,
    `discountRappen` INTEGER NOT NULL DEFAULT 0,
    `deliveryFeeRappen` INTEGER NOT NULL DEFAULT 0,
    `taxRateBps` INTEGER NULL,
    `taxAmountRappen` INTEGER NOT NULL DEFAULT 0,
    `totalRappen` INTEGER NOT NULL,
    `promoCodeId` VARCHAR(191) NULL,
    `deliveryZoneId` VARCHAR(191) NULL,
    `deliveryZoneNameDeSnapshot` VARCHAR(120) NULL,
    `deliveryZoneNameEnSnapshot` VARCHAR(120) NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `completedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `cancellationReason` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_checkoutKeyHash_key`(`checkoutKeyHash`),
    UNIQUE INDEX `Order_guestTrackingTokenHash_key`(`guestTrackingTokenHash`),
    INDEX `Order_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `Order_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Order_scheduledFor_status_idx`(`scheduledFor`, `status`),
    INDEX `Order_slotId_status_idx`(`slotId`, `status`),
    INDEX `Order_paymentMethod_status_idx`(`paymentMethod`, `status`),
    INDEX `Order_promoCodeId_idx`(`promoCodeId`),
    INDEX `Order_deliveryZoneId_idx`(`deliveryZoneId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderAddress` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` BIGINT NOT NULL,
    `recipientName` VARCHAR(160) NOT NULL,
    `phone` VARCHAR(40) NOT NULL,
    `street` VARCHAR(200) NOT NULL,
    `streetExtra` VARCHAR(200) NULL,
    `postalCode` VARCHAR(16) NOT NULL,
    `city` VARCHAR(120) NOT NULL,
    `countryCode` CHAR(2) NOT NULL DEFAULT 'CH',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OrderAddress_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` BIGINT NOT NULL,
    `productId` VARCHAR(191) NULL,
    `variantId` VARCHAR(191) NULL,
    `productNameDeSnapshot` VARCHAR(180) NOT NULL,
    `productNameEnSnapshot` VARCHAR(180) NOT NULL,
    `variantNameDeSnapshot` VARCHAR(160) NULL,
    `variantNameEnSnapshot` VARCHAR(160) NULL,
    `unitPriceRappen` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `lineSubtotalRappen` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OrderItem_orderId_idx`(`orderId`),
    INDEX `OrderItem_productId_idx`(`productId`),
    INDEX `OrderItem_variantId_idx`(`variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItemOption` (
    `id` VARCHAR(191) NOT NULL,
    `orderItemId` VARCHAR(191) NOT NULL,
    `optionChoiceId` VARCHAR(191) NULL,
    `nameDeSnapshot` VARCHAR(160) NOT NULL,
    `nameEnSnapshot` VARCHAR(160) NOT NULL,
    `priceDeltaRappen` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OrderItemOption_orderItemId_idx`(`orderItemId`),
    INDEX `OrderItemOption_optionChoiceId_idx`(`optionChoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderStatusEvent` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` BIGINT NOT NULL,
    `actorUserId` VARCHAR(191) NULL,
    `fromStatus` ENUM('PAYMENT_PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED') NULL,
    `toStatus` ENUM('PAYMENT_PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED') NOT NULL,
    `reason` VARCHAR(300) NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderStatusEvent_orderId_createdAt_idx`(`orderId`, `createdAt`),
    INDEX `OrderStatusEvent_actorUserId_idx`(`actorUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` BIGINT NOT NULL,
    `provider` ENUM('STRIPE', 'CASH') NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'PARTIALLY_REFUNDED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `stripeCheckoutSessionId` VARCHAR(255) NULL,
    `stripePaymentIntentId` VARCHAR(255) NULL,
    `amountRappen` INTEGER NOT NULL,
    `refundedRappen` INTEGER NOT NULL DEFAULT 0,
    `paidAt` DATETIME(3) NULL,
    `failedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_orderId_key`(`orderId`),
    UNIQUE INDEX `Payment_stripeCheckoutSessionId_key`(`stripeCheckoutSessionId`),
    UNIQUE INDEX `Payment_stripePaymentIntentId_key`(`stripePaymentIntentId`),
    INDEX `Payment_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Refund` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `requestedByUserId` VARCHAR(191) NULL,
    `stripeRefundId` VARCHAR(255) NOT NULL,
    `amountRappen` INTEGER NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `status` ENUM('PENDING', 'SUCCEEDED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `failureMessage` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Refund_stripeRefundId_key`(`stripeRefundId`),
    INDEX `Refund_paymentId_createdAt_idx`(`paymentId`, `createdAt`),
    INDEX `Refund_requestedByUserId_idx`(`requestedByUserId`),
    INDEX `Refund_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StripeWebhookEvent` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(255) NOT NULL,
    `type` VARCHAR(160) NOT NULL,
    `status` ENUM('PROCESSING', 'PROCESSED', 'FAILED') NOT NULL DEFAULT 'PROCESSING',
    `error` TEXT NULL,
    `processedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StripeWebhookEvent_eventId_key`(`eventId`),
    INDEX `StripeWebhookEvent_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationDelivery` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` BIGINT NULL,
    `channel` ENUM('EMAIL', 'PUSH') NOT NULL,
    `kind` VARCHAR(120) NOT NULL,
    `recipient` VARCHAR(512) NOT NULL,
    `deduplicationKey` VARCHAR(255) NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `attemptCount` INTEGER NOT NULL DEFAULT 0,
    `providerId` VARCHAR(255) NULL,
    `lastError` TEXT NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NotificationDelivery_deduplicationKey_key`(`deduplicationKey`),
    INDEX `NotificationDelivery_orderId_createdAt_idx`(`orderId`, `createdAt`),
    INDEX `NotificationDelivery_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `actorUserId` VARCHAR(191) NULL,
    `action` VARCHAR(160) NOT NULL,
    `entityType` VARCHAR(120) NOT NULL,
    `entityId` VARCHAR(255) NOT NULL,
    `metadata` JSON NULL,
    `requestCorrelationId` VARCHAR(120) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_actorUserId_createdAt_idx`(`actorUserId`, `createdAt`),
    INDEX `AuditLog_entityType_entityId_createdAt_idx`(`entityType`, `entityId`, `createdAt`),
    INDEX `AuditLog_requestCorrelationId_idx`(`requestCorrelationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DeliveryZonePostalCode` ADD CONSTRAINT `DeliveryZonePostalCode_deliveryZoneId_fkey` FOREIGN KEY (`deliveryZoneId`) REFERENCES `DeliveryZone`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OptionGroup` ADD CONSTRAINT `OptionGroup_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OptionChoice` ADD CONSTRAINT `OptionChoice_optionGroupId_fkey` FOREIGN KEY (`optionGroupId`) REFERENCES `OptionGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductAvailabilityWindow` ADD CONSTRAINT `ProductAvailabilityWindow_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductAllergen` ADD CONSTRAINT `ProductAllergen_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductAllergen` ADD CONSTRAINT `ProductAllergen_allergenId_fkey` FOREIGN KEY (`allergenId`) REFERENCES `Allergen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StaffInvitation` ADD CONSTRAINT `StaffInvitation_invitedByUserId_fkey` FOREIGN KEY (`invitedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerAddress` ADD CONSTRAINT `CustomerAddress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StaffDeviceSession` ADD CONSTRAINT `StaffDeviceSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromoRedemption` ADD CONSTRAINT `PromoRedemption_promoCodeId_fkey` FOREIGN KEY (`promoCodeId`) REFERENCES `PromoCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromoRedemption` ADD CONSTRAINT `PromoRedemption_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromoRedemption` ADD CONSTRAINT `PromoRedemption_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `FulfillmentSlot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_promoCodeId_fkey` FOREIGN KEY (`promoCodeId`) REFERENCES `PromoCode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_deliveryZoneId_fkey` FOREIGN KEY (`deliveryZoneId`) REFERENCES `DeliveryZone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderAddress` ADD CONSTRAINT `OrderAddress_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItemOption` ADD CONSTRAINT `OrderItemOption_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItemOption` ADD CONSTRAINT `OrderItemOption_optionChoiceId_fkey` FOREIGN KEY (`optionChoiceId`) REFERENCES `OptionChoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusEvent` ADD CONSTRAINT `OrderStatusEvent_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusEvent` ADD CONSTRAINT `OrderStatusEvent_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_requestedByUserId_fkey` FOREIGN KEY (`requestedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationDelivery` ADD CONSTRAINT `NotificationDelivery_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
