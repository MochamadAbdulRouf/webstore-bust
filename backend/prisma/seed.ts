import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const games = [
  {
    title: 'Neon Abyss II',
    slug: 'neon-abyss-ii',
    description: 'Dive into the infinite dungeon in this roguelite action platformer with neon visuals and endless customization.',
    longDesc: 'Neon Abyss II is a roguelite action platformer set in a cyberpunk underworld. Battle through procedurally generated dungeons, collect god items, and unlock endless combinations of abilities. Each run is unique with over 200 items and 50 enemies.',
    price: 19.99,
    imageUrl: '/uploads/images/neon-abyss-ii.jpg',
    bannerUrl: '/uploads/banners/neon-abyss-ii-banner.jpg',
    category: 'Action',
    tags: ['roguelite', 'platformer', 'neon', 'indie'],
    publisher: 'Veewo Games',
    developer: 'Veewo Games',
    featured: true,
    rating: 4.5,
    reviewCount: 0,
  },
  {
    title: 'Cyber Protocol',
    slug: 'cyber-protocol',
    description: 'A fast-paced cyberpunk puzzle game where you hack networks to expose corporate secrets.',
    longDesc: 'Cyber Protocol drops you into a neon-drenched digital world. As a rogue hacker, you infiltrate massive corporate networks by solving intricate network puzzles. 50+ hand-crafted levels with increasing complexity.',
    price: 9.99,
    imageUrl: '/uploads/images/cyber-protocol.jpg',
    category: 'Puzzle',
    tags: ['puzzle', 'hacking', 'cyberpunk'],
    publisher: 'Freaking Games',
    developer: 'Cyber Games Studio',
    featured: true,
    rating: 4.2,
    reviewCount: 0,
  },
  {
    title: 'Stellar Void',
    slug: 'stellar-void',
    description: 'An open-world space exploration game with procedurally generated galaxies and epic space battles.',
    longDesc: 'Explore the infinite cosmos in Stellar Void. Build your fleet, trade with alien civilizations, and engage in massive space battles across 1000+ star systems. Your choices shape the fate of the galaxy.',
    price: 39.99,
    imageUrl: '/uploads/images/stellar-void.jpg',
    category: 'RPG',
    tags: ['space', 'exploration', 'rpg', 'open-world'],
    publisher: 'Cosmic Studios',
    developer: 'Cosmic Studios',
    featured: true,
    rating: 4.8,
    reviewCount: 0,
  },
  {
    title: 'Shadow Protocol',
    slug: 'shadow-protocol',
    description: 'Stealth action game with a gripping narrative about corporate espionage in 2087.',
    longDesc: 'In 2087, corporations rule the world. You are Agent Nova, an elite operative hired to infiltrate MegaCorp\'s headquarters and uncover their darkest secret. Use stealth, hacking, and combat to survive in this tense thriller.',
    price: 29.99,
    imageUrl: '/uploads/images/shadow-protocol.jpg',
    category: 'Action',
    tags: ['stealth', 'action', 'narrative', 'cyberpunk'],
    publisher: 'Dark Matter Interactive',
    developer: 'Dark Matter Interactive',
    featured: false,
    rating: 4.3,
    reviewCount: 0,
  },
  {
    title: 'Pixel Raiders',
    slug: 'pixel-raiders',
    description: 'A retro-style multiplayer action RPG with modern mechanics and endless content.',
    longDesc: 'Pixel Raiders combines nostalgic 16-bit art with modern RPG mechanics. Gather a party of up to 4 players, explore vast dungeons, defeat powerful bosses, and forge legendary equipment in this love letter to classic RPGs.',
    price: 14.99,
    imageUrl: '/uploads/images/pixel-raiders.jpg',
    category: 'RPG',
    tags: ['pixel', 'rpg', 'multiplayer', 'retro'],
    publisher: 'Retro Pulse',
    developer: 'Retro Pulse',
    featured: false,
    rating: 4.0,
    reviewCount: 0,
  },
  {
    title: 'Fractured Realms',
    slug: 'fractured-realms',
    description: 'A dark fantasy ARPG with a brutal combat system and a world torn apart by ancient wars.',
    longDesc: 'The world of Aethon is shattered. Rifts have torn reality apart, unleashing monsters from other dimensions. As the last Rift Walker, you must seal these dimensional tears before all existence collapses. Features over 100 hours of content.',
    price: 49.99,
    imageUrl: '/uploads/images/fractured-realms.jpg',
    category: 'RPG',
    tags: ['dark-fantasy', 'arpg', 'souls-like'],
    publisher: 'Iron Forge Studios',
    developer: 'Iron Forge Studios',
    featured: true,
    rating: 4.7,
    reviewCount: 0,
  },
  {
    title: 'Zero Hour Tactics',
    slug: 'zero-hour-tactics',
    description: 'A turn-based tactical strategy game with deep squad management and brutal permadeath.',
    longDesc: 'Lead an elite special forces unit through dangerous missions across 5 war-torn regions. Manage your squad, upgrade equipment, and make life-or-death decisions. Permadeath adds real weight to every choice.',
    price: 24.99,
    imageUrl: '/uploads/images/zero-hour-tactics.jpg',
    category: 'Strategy',
    tags: ['strategy', 'turn-based', 'tactical', 'permadeath'],
    publisher: 'Tactician Games',
    developer: 'Tactician Games',
    featured: false,
    rating: 4.4,
    reviewCount: 0,
  },
  {
    title: 'Velocity Rush',
    slug: 'velocity-rush',
    description: 'An ultra-fast racing game with anti-gravity vehicles and insane tracks across the galaxy.',
    longDesc: 'Race at supersonic speeds across alien worlds in Velocity Rush. Master 30 unique anti-gravity vehicles, customize their performance, and dominate 50+ tracks. Online multiplayer for up to 16 players.',
    price: 19.99,
    imageUrl: '/uploads/images/velocity-rush.jpg',
    category: 'Racing',
    tags: ['racing', 'sci-fi', 'multiplayer', 'fast-paced'],
    publisher: 'Speed Demon Studios',
    developer: 'Speed Demon Studios',
    featured: false,
    rating: 4.1,
    reviewCount: 0,
  },
  {
    title: 'Haunted Mansion VR',
    slug: 'haunted-mansion-vr',
    description: 'A terrifying horror experience that uses atmospheric sound and lighting to keep you on edge.',
    longDesc: 'Haunted Mansion puts you inside a genuinely terrifying horror experience. Explore a dark, crumbling mansion with only a flashlight and your wits. Dynamic AI enemies adapt to your behavior, ensuring no two playthroughs are the same.',
    price: 16.99,
    imageUrl: '/uploads/images/haunted-mansion.jpg',
    category: 'Horror',
    tags: ['horror', 'atmospheric', 'survival'],
    publisher: 'Fear Factory',
    developer: 'Fear Factory',
    featured: false,
    rating: 3.9,
    reviewCount: 0,
  },
  {
    title: 'Forge & Fury',
    slug: 'forge-and-fury',
    description: 'Build your empire from a humble smithy to a legendary weapons manufacturer in this crafting RPG.',
    longDesc: 'Start as an apprentice blacksmith and grow into a legendary master craftsman. Mine rare ores, discover ancient recipes, and craft weapons of immense power. Trade with merchants, complete quests, and build the ultimate forge empire.',
    price: 22.99,
    imageUrl: '/uploads/images/forge-fury.jpg',
    category: 'Simulation',
    tags: ['crafting', 'simulation', 'rpg', 'management'],
    publisher: 'Anvil Software',
    developer: 'Anvil Software',
    featured: false,
    rating: 4.6,
    reviewCount: 0,
  },
  {
    title: 'Quantum Break: Origins',
    slug: 'quantum-break-origins',
    description: 'A time-manipulation action thriller where your choices bend the fabric of reality.',
    longDesc: 'After a failed time-travel experiment, you gain the ability to manipulate time. Use time-stop, time-rush, and time-dodge abilities to defeat enemies and solve environmental puzzles. The choices you make shape an alternate future.',
    price: 34.99,
    imageUrl: '/uploads/images/quantum-break.jpg',
    category: 'Action',
    tags: ['time-manipulation', 'action', 'sci-fi', 'narrative'],
    publisher: 'Temporal Studios',
    developer: 'Temporal Studios',
    featured: true,
    rating: 4.5,
    reviewCount: 0,
  },
  {
    title: 'Arena Legends',
    slug: 'arena-legends',
    description: 'A competitive 5v5 hero shooter with unique abilities and fast-paced gameplay.',
    longDesc: 'Choose from 40+ legendary heroes, each with unique abilities and playstyles. Form a team of 5 and battle in dynamic arenas across 15 maps. Ranked mode, seasonal rewards, and constant new hero releases keep the game fresh.',
    price: 0,
    imageUrl: '/uploads/images/arena-legends.jpg',
    category: 'Shooter',
    tags: ['hero-shooter', 'multiplayer', 'competitive', 'free-to-play'],
    publisher: 'Nexus Entertainment',
    developer: 'Nexus Entertainment',
    featured: true,
    rating: 4.3,
    reviewCount: 0,
  },
  {
    title: 'Deep Sea Chronicles',
    slug: 'deep-sea-chronicles',
    description: 'Explore the mysteries of the ocean floor in this breathtaking underwater adventure.',
    longDesc: 'Descend into the deepest parts of the Earth\'s oceans. Discover ancient civilizations, encounter terrifying deep-sea creatures, and unravel the mystery of a signal coming from 11,000 meters below. Features stunning bioluminescent environments.',
    price: 27.99,
    imageUrl: '/uploads/images/deep-sea.jpg',
    category: 'Adventure',
    tags: ['exploration', 'underwater', 'mystery', 'adventure'],
    publisher: 'Abyssal Games',
    developer: 'Abyssal Games',
    featured: false,
    rating: 4.2,
    reviewCount: 0,
  },
  {
    title: 'Mechwarrior Uprising',
    slug: 'mechwarrior-uprising',
    description: 'Pilot massive mechs in explosive tactical battles across a war-torn future Earth.',
    longDesc: 'Command a 50-ton war machine in Mechwarrior Uprising. Customize your mech with hundreds of weapons and systems, join a corporation, and fight for control of Earth\'s last resources. Massive 10v10 battles and a rich single-player campaign.',
    price: 44.99,
    imageUrl: '/uploads/images/mechwarrior.jpg',
    category: 'Action',
    tags: ['mech', 'action', 'tactical', 'sci-fi'],
    publisher: 'Iron Giant Studios',
    developer: 'Iron Giant Studios',
    featured: false,
    rating: 4.4,
    reviewCount: 0,
  },
  {
    title: 'Elysian Fields',
    slug: 'elysian-fields',
    description: 'A peaceful farming and life simulation game set in a magical realm with hidden secrets.',
    longDesc: 'Escape to the magical world of Elysian Fields. Farm enchanted crops, befriend mythical creatures, and restore the realm to its former glory. A cozy experience with surprising depth and a heartwarming storyline.',
    price: 15.99,
    imageUrl: '/uploads/images/elysian-fields.jpg',
    category: 'Simulation',
    tags: ['farming', 'cozy', 'simulation', 'magic'],
    publisher: 'Cozy Corner Games',
    developer: 'Cozy Corner Games',
    featured: false,
    rating: 4.9,
    reviewCount: 0,
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.cartItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.library.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@bust.gg',
      username: 'BustAdmin',
      password: adminPassword,
      balance: 9999.99,
      isAdmin: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create demo user
  const userPassword = await bcrypt.hash('User@123', 12);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@bust.gg',
      username: 'GamerPro',
      password: userPassword,
      balance: 150.00,
      isAdmin: false,
    },
  });
  console.log('✅ Demo user created:', demoUser.email);

  // Create games
  for (const game of games) {
    await prisma.game.create({ data: game });
  }
  console.log(`✅ Created ${games.length} games`);

  console.log('');
  console.log('🎮 Bust database seeded successfully!');
  console.log('');
  console.log('Admin credentials:');
  console.log('  Email: admin@bust.gg');
  console.log('  Password: Admin@123');
  console.log('');
  console.log('Demo user credentials:');
  console.log('  Email: demo@bust.gg');
  console.log('  Password: User@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
