const mongoose = require('mongoose');
const User = require('./models/User');
const BlogPost = require('./models/BlogPost');
require('dotenv').config({ path: './config.env' });

const dummyUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    bio: 'Tech enthusiast and software developer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    socialLinks: {
      twitter: 'https://twitter.com/johndoe',
      github: 'https://github.com/johndoe'
    }
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    password: 'password123',
    bio: 'Travel blogger and adventure seeker',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    socialLinks: {
      instagram: 'https://instagram.com/sarahwilson'
    }
  },
  {
    name: 'Mike Chen',
    email: 'mike@example.com',
    password: 'password123',
    bio: 'Food lover and culinary expert',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  }
];

const dummyPosts = [
  {
    title: 'Getting Started with React in 2024',
    content: `React has evolved significantly over the years, and 2024 brings exciting new features that make development even more enjoyable. In this comprehensive guide, we'll explore the latest React patterns, hooks, and best practices that every developer should know.

## What's New in React 2024?

The React team has been working tirelessly to improve the developer experience. Here are some key highlights:

### 1. Concurrent Features
React's concurrent features are now stable and provide better user experience through:
- Automatic batching
- Transitions
- Suspense for data fetching

### 2. Server Components
Server Components are revolutionizing how we build React applications:
- Better performance
- Reduced bundle size
- Improved SEO

### 3. New Hooks
Several new hooks have been introduced:
- useTransition
- useDeferredValue
- useSyncExternalStore

## Getting Started

To get started with React in 2024, you'll need:
1. Node.js 18+ installed
2. A modern code editor
3. Basic JavaScript knowledge

The development experience has never been better!`,
    excerpt: 'A comprehensive guide to React development in 2024, covering the latest features, patterns, and best practices.',
    category: 'technology',
    tags: ['react', 'javascript', 'web-development', 'frontend'],
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
      alt: 'React development setup'
    }
  },
  {
    title: '10 Must-Visit Destinations for 2024',
    content: `Travel is back in full swing, and 2024 offers incredible opportunities to explore the world. Here are ten destinations that should be on your radar this year.

## 1. Japan - Cherry Blossom Season
Spring in Japan is magical, with cherry blossoms painting the landscape in delicate pink hues. The best time to visit is late March to early May.

## 2. Iceland - Northern Lights
Winter in Iceland offers the spectacular Northern Lights. The best viewing months are September to March.

## 3. Portugal - Coastal Beauty
Portugal's coastline is breathtaking, with dramatic cliffs and pristine beaches. Don't miss the Algarve region.

## 4. New Zealand - Adventure Capital
From hiking to bungee jumping, New Zealand offers endless adventure opportunities.

## 5. Morocco - Cultural Richness
Experience the vibrant culture, stunning architecture, and delicious cuisine of Morocco.

## 6. Canada - Natural Wonders
From the Rocky Mountains to Niagara Falls, Canada's natural beauty is unparalleled.

## 7. Australia - Diverse Landscapes
From the Great Barrier Reef to the Outback, Australia offers diverse experiences.

## 8. Greece - Island Hopping
The Greek islands are perfect for island hopping adventures.

## 9. Thailand - Tropical Paradise
Thailand's beaches, temples, and street food make it a must-visit destination.

## 10. Italy - Art and History
Italy's rich history, art, and cuisine make it a cultural treasure trove.

Each destination offers unique experiences that will create lasting memories.`,
    excerpt: 'Discover the top travel destinations for 2024, from cherry blossoms in Japan to the Northern Lights in Iceland.',
    category: 'travel',
    tags: ['travel', 'destinations', 'adventure', 'culture'],
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop',
      alt: 'Travel destination'
    }
  },
  {
    title: 'Healthy Eating Habits for Busy Professionals',
    content: `Maintaining a healthy diet while juggling a busy professional life can be challenging, but it's not impossible. Here are practical strategies to help you eat well even with a hectic schedule.

## Meal Planning is Key

Planning your meals in advance saves time and ensures you make healthy choices:

### Weekly Planning
- Set aside 30 minutes on Sunday to plan your week
- Create a shopping list based on your meal plan
- Prep ingredients in advance

### Batch Cooking
- Cook large portions and freeze individual servings
- Use slow cookers for easy meal preparation
- Prepare healthy snacks in advance

## Smart Shopping Strategies

### 1. Shop with a List
Always go to the grocery store with a list to avoid impulse purchases.

### 2. Buy in Season
Seasonal produce is fresher, tastier, and more affordable.

### 3. Choose Whole Foods
Opt for whole grains, lean proteins, and fresh vegetables.

## Quick and Healthy Meal Ideas

### Breakfast
- Overnight oats with berries
- Greek yogurt with nuts and honey
- Smoothie bowls

### Lunch
- Quinoa salad with vegetables
- Turkey and avocado wrap
- Lentil soup

### Dinner
- Grilled salmon with roasted vegetables
- Stir-fried chicken with brown rice
- Vegetarian chili

## Tips for Success

1. **Start Small**: Don't try to change everything at once
2. **Be Consistent**: Stick to your meal plan
3. **Stay Hydrated**: Drink plenty of water throughout the day
4. **Listen to Your Body**: Eat when hungry, stop when full

Remember, healthy eating is a journey, not a destination. Small changes add up to big results over time.`,
    excerpt: 'Practical tips and strategies for maintaining a healthy diet while managing a busy professional lifestyle.',
    category: 'health',
    tags: ['health', 'nutrition', 'meal-planning', 'wellness'],
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop',
      alt: 'Healthy food preparation'
    }
  },
  {
    title: 'The Future of Remote Work in 2024',
    content: `Remote work has transformed the way we think about employment, and 2024 brings new trends and challenges to the forefront. Let's explore what the future holds for remote work.

## Current State of Remote Work

The pandemic accelerated the adoption of remote work, and now it's become a permanent fixture in many industries:

### Benefits
- Increased productivity
- Better work-life balance
- Reduced commuting time
- Access to global talent

### Challenges
- Communication barriers
- Work-life boundaries
- Team collaboration
- Mental health concerns

## Emerging Trends

### 1. Hybrid Work Models
Many companies are adopting hybrid models that combine remote and in-office work.

### 2. Digital Nomadism
More professionals are embracing location-independent work styles.

### 3. Virtual Reality Workspaces
VR technology is creating immersive virtual office environments.

### 4. AI-Powered Collaboration
Artificial intelligence is enhancing remote collaboration tools.

## Best Practices for Remote Work

### Communication
- Use video calls for important discussions
- Over-communicate to avoid misunderstandings
- Establish clear communication protocols

### Productivity
- Set up a dedicated workspace
- Use time management techniques
- Take regular breaks

### Team Building
- Schedule virtual team activities
- Create opportunities for casual interaction
- Celebrate achievements together

## Tools and Technology

### Essential Tools
- Video conferencing platforms
- Project management software
- Cloud storage solutions
- Time tracking apps

### Security Considerations
- Use VPNs for secure connections
- Implement two-factor authentication
- Regular security training

## The Road Ahead

Remote work is here to stay, and companies that adapt will thrive. The key is finding the right balance between flexibility and structure.`,
    excerpt: 'Explore the latest trends and best practices in remote work for 2024, including hybrid models and emerging technologies.',
    category: 'business',
    tags: ['remote-work', 'business', 'productivity', 'technology'],
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
      alt: 'Remote work setup'
    }
  },
  {
    title: 'Sustainable Living: Small Changes, Big Impact',
    content: `Living sustainably doesn't require drastic lifestyle changes. Small, consistent actions can make a significant difference for our planet. Here's how you can start your sustainable living journey.

## Why Sustainable Living Matters

Climate change and environmental degradation affect us all. By making conscious choices, we can reduce our environmental footprint and contribute to a healthier planet.

## Easy Ways to Start

### 1. Reduce Single-Use Plastics
- Carry a reusable water bottle
- Use cloth shopping bags
- Choose products with minimal packaging

### 2. Energy Conservation
- Switch to LED light bulbs
- Unplug electronics when not in use
- Use energy-efficient appliances

### 3. Sustainable Transportation
- Walk or bike for short trips
- Use public transportation
- Consider carpooling

### 4. Conscious Consumption
- Buy local and seasonal produce
- Support sustainable brands
- Repair instead of replace

## Home Sustainability

### Kitchen
- Compost food waste
- Use reusable containers
- Choose bulk items

### Bathroom
- Use eco-friendly personal care products
- Install low-flow fixtures
- Choose biodegradable cleaning products

### Living Room
- Use natural cleaning products
- Choose sustainable furniture
- Implement smart home technology

## Sustainable Fashion

### Clothing Choices
- Buy quality over quantity
- Support ethical brands
- Consider second-hand options

### Care and Maintenance
- Wash clothes less frequently
- Use cold water
- Air dry when possible

## Food and Diet

### Plant-Based Options
- Incorporate more plant-based meals
- Reduce meat consumption
- Choose organic when possible

### Food Waste Reduction
- Plan meals carefully
- Store food properly
- Use leftovers creatively

## Community Involvement

### Local Initiatives
- Join community gardens
- Participate in clean-up events
- Support local environmental groups

### Education and Advocacy
- Stay informed about environmental issues
- Share knowledge with others
- Advocate for sustainable policies

## Measuring Your Impact

Track your progress by:
- Calculating your carbon footprint
- Monitoring energy usage
- Keeping a sustainability journal

Remember, every small action counts. Start with what feels manageable and gradually expand your sustainable practices.`,
    excerpt: 'Discover practical ways to live more sustainably through small, manageable changes that make a big environmental impact.',
    category: 'lifestyle',
    tags: ['sustainability', 'environment', 'lifestyle', 'eco-friendly'],
    status: 'published',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
      alt: 'Sustainable living'
    }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.mongodb_Cluster);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await BlogPost.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of dummyUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.name}`);
    }

    // Create posts
    for (let i = 0; i < dummyPosts.length; i++) {
      const postData = {
        ...dummyPosts[i],
        author: createdUsers[i % createdUsers.length]._id,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      };
      
      const post = new BlogPost(postData);
      await post.save();
      
      // Calculate trending score
      await post.calculateTrendingScore();
      
      console.log(`Created post: ${post.title}`);
    }

    // Update user stats
    for (const user of createdUsers) {
      const userPosts = await BlogPost.countDocuments({ author: user._id });
      user.totalPosts = userPosts;
      await user.save();
    }

    console.log('Database seeded successfully!');
    console.log(`Created ${createdUsers.length} users and ${dummyPosts.length} posts`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 