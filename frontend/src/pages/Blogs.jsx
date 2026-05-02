import React from 'react';
import Navbar from '../components/layout/Navbar';

const blogPosts = [
  {
    id: 1,
    title: 'How YOLO V9 Changes Real-Time Biomechanics',
    excerpt: 'An in-depth look at how edge-deployed pose estimation is outperforming human spotters in commercial gym environments.',
    date: 'OCT 12, 2026',
    category: 'ENGINEERING'
  },
  {
    id: 2,
    title: 'The ROI of Digital Supervision',
    excerpt: 'Case study: How automated form correction reduced liability claims and improved member retention by 3.4x at Equinox.',
    date: 'SEP 28, 2026',
    category: 'BUSINESS'
  },
  {
    id: 3,
    title: 'Optimizing Latency on NVIDIA Jetson',
    excerpt: 'Pushing inference times below 80ms for instant auditory feedback during explosive plyometric movements.',
    date: 'SEP 15, 2026',
    category: 'HARDWARE'
  }
];

const Blogs = () => {
  const blogCards = [];
  
  for (let i = 0; i < blogPosts.length; i++) {
    const post = blogPosts[i];
    blogCards.push(
      <article 
        key={post.id} 
        className="glass p-8 rounded-2xl border border-white/5 hover:border-accent transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[10px] font-extrabold tracking-widest text-accent">{post.category}</span>
          <span className="text-[10px] font-extrabold tracking-widest text-gray-500">{post.date}</span>
        </div>
        <h2 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors">{post.title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed">{post.excerpt}</p>
        <div className="mt-6 text-xs font-bold tracking-wider text-accent flex items-center gap-2">
          READ ARTICLE <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </article>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Include Navbar at the top */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <Navbar />
      </div>
      
      {/* Background Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <header className="mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            FITFIX <span className="text-accent text-glow">INSIGHTS</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Technical deep-dives, hardware benchmarks, and business case studies 
            from the frontier of AI-assisted fitness.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogCards}
        </div>
      </main>
    </div>
  );
};

export default Blogs;
