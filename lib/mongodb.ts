/**
 * @deprecated This file has been replaced by lib/mongoose.ts
 *
 * All database operations now use Mongoose ORM instead of the raw MongoDB driver.
 *
 * Migrations:
 * - Database connection: Use lib/mongoose.ts connectDB() function
 * - Data models: Import from @/models (e.g., User, Event, Job, Badge, etc.)
 * - CRUD operations: Use Mongoose model methods (Model.find(), Model.create(), etc.)
 *
 * Example migration:
 * OLD: const db = await getDatabase(); db.collection('alumni').find({})
 * NEW: await connectDB(); await User.find({})
 *
 * See MONGOOSE_INTEGRATION_GUIDE.md for detailed migration examples.
 */

throw new Error(
  'This file is deprecated. Use lib/mongoose.ts and models from @/models instead. ' +
    'See MONGOOSE_INTEGRATION_GUIDE.md for migration details.'
)

