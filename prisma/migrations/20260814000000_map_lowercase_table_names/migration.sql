-- Fresh case-sensitive MySQL databases created by the baseline use PascalCase
-- table names. Prisma now maps its models to lowercase physical table names.
-- Windows MySQL already stores and resolves table names in lowercase, so this
-- becomes a no-op there.
SET @saltnpepper_lowercase_table_names_sql = IF(@@lower_case_table_names = 0, '
RENAME TABLE
  `SiteSettings` TO `sitesettings`,
  `FulfillmentSettings` TO `fulfillmentsettings`,
  `OpeningWindow` TO `openingwindow`,
  `ServiceException` TO `serviceexception`,
  `FulfillmentSlot` TO `fulfillmentslot`,
  `DeliveryZone` TO `deliveryzone`,
  `DeliveryZonePostalCode` TO `deliveryzonepostalcode`,
  `Category` TO `category`,
  `Product` TO `product`,
  `ProductVariant` TO `productvariant`,
  `OptionGroup` TO `optiongroup`,
  `OptionChoice` TO `optionchoice`,
  `ProductAvailabilityWindow` TO `productavailabilitywindow`,
  `Allergen` TO `allergen`,
  `ProductAllergen` TO `productallergen`,
  `User` TO `user`,
  `Account` TO `account`,
  `Session` TO `session`,
  `PasswordResetToken` TO `passwordresettoken`,
  `StaffInvitation` TO `staffinvitation`,
  `CustomerAddress` TO `customeraddress`,
  `StaffDeviceSession` TO `staffdevicesession`,
  `PromoCode` TO `promocode`,
  `PromoRedemption` TO `promoredemption`,
  `Order` TO `order`,
  `OrderAddress` TO `orderaddress`,
  `OrderItem` TO `orderitem`,
  `OrderItemOption` TO `orderitemoption`,
  `OrderStatusEvent` TO `orderstatusevent`,
  `Payment` TO `payment`,
  `Refund` TO `refund`,
  `StripeWebhookEvent` TO `stripewebhookevent`,
  `NotificationDelivery` TO `notificationdelivery`,
  `AuditLog` TO `auditlog`', 'SELECT 1');
PREPARE saltnpepper_lowercase_table_names_statement FROM @saltnpepper_lowercase_table_names_sql;
EXECUTE saltnpepper_lowercase_table_names_statement;
DEALLOCATE PREPARE saltnpepper_lowercase_table_names_statement;
