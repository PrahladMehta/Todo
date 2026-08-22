import { DateTime } from 'luxon';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { RefreshToken } from '../src/models/RefreshToken.js';
import { Task } from '../src/models/Task.js';
import { User } from '../src/models/User.js';
import { hashPassword } from '../src/utils/password.js';

const CREDENTIALS = [
  { name: 'Ada Admin', email: 'admin@todo.dev', password: 'Admin@1234', role: 'admin' },
  { name: 'Uma User', email: 'user@todo.dev', password: 'User@1234', role: 'user' },
  { name: 'Sam Solo', email: 'solo@todo.dev', password: 'Solo@1234', role: 'user' },
];

const taskBlueprint = (zone) => {
  const thisWeek = DateTime.now().setZone(zone).startOf('week');
  const lastWeek = thisWeek.minus({ weeks: 1 });
  const nextWeek = thisWeek.plus({ weeks: 1 });

  return [
    { title: 'Submit weekly report', description: 'Compile the sprint summary', offset: lastWeek.plus({ days: 1, hours: 10 }), priority: 'high', status: 'completed' },
    { title: 'Review design tokens', description: 'Check spacing scale in Figma', offset: lastWeek.plus({ days: 3, hours: 15 }), priority: 'medium', status: 'completed' },
    { title: 'Plan onboarding flow', description: 'Draft the mobile onboarding screens', offset: thisWeek.plus({ days: 0, hours: 9, minutes: 30 }), priority: 'high', status: 'in_progress' },
    { title: 'Grocery run', description: 'Milk, coffee, oats', offset: thisWeek.plus({ days: 2, hours: 18 }), priority: 'low', status: 'in_progress' },
    { title: 'Retro prep', description: 'Collect feedback themes', offset: thisWeek.plus({ days: 4, hours: 11 }), priority: 'medium', status: 'completed' },
    { title: 'Sunday boundary check', description: 'Due at the very end of the week', offset: thisWeek.plus({ days: 6, hours: 23, minutes: 59 }), priority: 'low', status: 'in_progress' },
    { title: 'Monday boundary check', description: 'Due at the very start of next week', offset: nextWeek.plus({ minutes: 1 }), priority: 'low', status: 'in_progress' },
    { title: 'Dentist appointment', description: 'Annual check-up', offset: nextWeek.plus({ days: 2, hours: 16 }), priority: 'medium', status: 'in_progress' },
  ];
};

const run = async () => {
  if (env.isProduction) {
    console.error('Refusing to seed a production database.');
    process.exit(1);
  }

  await connectDatabase();

  const demoEmails = CREDENTIALS.map((account) => account.email);
  const existing = await User.find({ email: { $in: demoEmails } }, '_id').lean();
  const existingIds = existing.map((user) => user._id);

  await Task.deleteMany({ owner: { $in: existingIds } });
  await RefreshToken.deleteMany({ user: { $in: existingIds } });
  await User.deleteMany({ _id: { $in: existingIds } });

  const accounts = [];
  for (const account of CREDENTIALS) {
    accounts.push(
      await User.create({
        name: account.name,
        email: account.email,
        passwordHash: await hashPassword(account.password),
        role: account.role,
      }),
    );
  }

  const blueprint = taskBlueprint(env.APP_TIMEZONE);
  const owners = accounts.filter((account) => account.role === 'user');

  const documents = owners.flatMap((owner) =>
    blueprint.map((item) => ({
      title: item.title,
      description: item.description,
      dueAt: item.offset.toJSDate(),
      priority: item.priority,
      status: item.status,
      completedAt: item.status === 'completed' ? item.offset.toJSDate() : null,
      owner: owner._id,
    })),
  );

  await Task.insertMany(documents);

  const untouched = await User.countDocuments({ email: { $nin: demoEmails } });

  console.log('Seed complete.');
  console.log(`  tasks:   ${documents.length}`);
  console.log(`  left as they were: ${untouched} non-demo account(s)`);
  console.log('  accounts (password shown once):');
  CREDENTIALS.forEach((account) => {
    console.log(`    ${account.role.padEnd(6)} ${account.email.padEnd(18)} ${account.password}`);
  });

  await disconnectDatabase();
};

run().catch(async (error) => {
  console.error('Seed failed:', error);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
