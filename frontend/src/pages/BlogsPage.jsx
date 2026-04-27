import React from 'react';

const blogPosts = [
  {
    id: 1,
    title: 'AI in Biomechanics',
    excerpt: 'An in-depth look at how edge-deployed pose estimation is outperforming human spotters in commercial gym environments.',
    date: 'OCT 12, 2026',
    category: 'ENGINEERING',
    readTime: '5 MIN READ'
  },
  {
    id: 2,
    title: 'The Future of B2B Fitness',
    excerpt: 'Case study: How automated form correction reduced liability claims and improved member retention by 3.4x at major chains.',
    date: 'SEP 28, 2026',
    category: 'BUSINESS',
    readTime: '8 MIN READ'
  },
  {
    id: 3,
    title: 'YOLOv9 vs. MediaPipe for Real-time Tracking',
    excerpt: 'Pushing inference times below 80ms for instant auditory feedback during explosive plyometric movements.',
    date: 'SEP 15, 2026',
    category: 'HARDWARE',
    readTime: '12 MIN READ'
  }
];

const BlogsPage = () => {
  const blogCards = [];
  
  for (let i = 0; i < blogPosts.length; i++) {
    const post = blogPosts[i];
    blogCards.push(
      <article 
        key={post.id} 
        className="glass p-8 rounded-3xl border border-white/5 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] transition-all duration-300 cursor-pointer group flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-extrabold tracking-widest rounded-full">
            {post.category}
          </span>
          <span className="text-[10px] font-extrabold tracking-widest text-gray-500">
            {post.date}
          </span>
        </div>
        <h2 className="text-3xl font-bold font-sans mb-4 group-hover:text-accent transition-colors">
          {post.title}
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
          <span className="text-xs text-gray-500 font-medium">{post.readTime}</span>
          <button className="px-5 py-2 bg-transparent border border-accent/30 text-accent rounded-full text-xs font-bold tracking-widest group-hover:bg-accent group-hover:text-black transition-all duration-300 flex items-center gap-2">
            READ MORE <span>→</span>
          </button>
        </div>
      </article>
    );
  }

  return (
    <div className="w-full relative">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-accent/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <main className="py-16">
        <header className="mb-20 text-center max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 border border-accent/30 rounded-full text-accent text-xs font-bold tracking-widest mb-6">
            KNOWLEDGE BASE
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 font-sans">
            FITFIX <span className="text-accent text-glow">INSIGHTS</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl">
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

export default BlogsPage;
