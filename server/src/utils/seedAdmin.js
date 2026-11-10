import User from '../models/User.js';
import Student from '../models/Student.js';
import IDCard from '../models/IDCard.js';
import Organization from '../models/Organization.js';

/** Migrate legacy single-workspace records and optionally provision an owner from server secrets. */
export const seedDefaultAdmin = async () => {
  try {
    let legacyOrganization = await Organization.findOne({ name: 'CardForge Legacy Workspace' });
    const legacyUsers = await User.exists({ organization: { $exists: false }, role: { $in: ['admin', 'student'] } });
    if (!legacyOrganization && legacyUsers) legacyOrganization = await Organization.create({ name: 'CardForge Legacy Workspace', category: 'Other' });
    if (legacyOrganization) {
      await User.updateMany({ organization: { $exists: false }, role: { $in: ['admin', 'student'] } }, [
        { $set: { organization: legacyOrganization._id, role: { $cond: [{ $eq: ['$role', 'admin'] }, 'main_admin', 'general_user'] } } },
      ]);
      await Student.updateMany({ organization: { $exists: false } }, { $set: { organization: legacyOrganization._id, collegeName: legacyOrganization.name } });
      await IDCard.updateMany({ organization: { $exists: false } }, { $set: { organization: legacyOrganization._id } });
    }

    const ownerEmail = process.env.PLATFORM_OWNER_EMAIL?.trim().toLowerCase();
    const ownerPassword = process.env.PLATFORM_OWNER_PASSWORD;
    if (ownerEmail && ownerPassword && ownerPassword.length >= 12 && !await User.exists({ email: ownerEmail })) {
      await User.create({ name: 'Platform Owner', email: ownerEmail, password: ownerPassword, role: 'platform_owner', isActive: true });
      console.log(`[Seed] Platform owner provisioned for ${ownerEmail}.`);
    }
  } catch (error) {
    console.warn(`[Initialization Note] ${error.message}`);
  }
};
