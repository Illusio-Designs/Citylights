const { Seo } = require('../models');

function normalizePath(inputPath) {
  if (!inputPath) return '/';
  try {
    let p = decodeURIComponent(inputPath.trim());
    if (!p.startsWith('/')) p = '/' + p;
    // remove trailing slash except root
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p.toLowerCase();
  } catch (_) {
    return '/';
  }
}

exports.resolveByPath = async (req, res) => {
  try {
    const rawPath = req.query.path || '/';
    const path = normalizePath(rawPath);
    const record = await Seo.findOne({ where: { path } });

    if (!record) {
      // Fallback defaults
      return res.json({
        path,
        title: 'Vivera Lighting',
        description: 'Explore Vivera Lighting stores, collections, and products.',
        keywords: 'lighting, vivera, store, products, collections',
        og_title: 'Vivera Lighting',
        og_description: 'Discover premium lighting products and stores.',
        og_image: null,
        noindex: false,
      });
    }

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: 'Failed to resolve SEO', error: err.message });
  }
};

// Compatibility endpoint: GET /api/seo?page_name=home
// Maps common page names to paths and returns meta_* style keys
exports.getByPageName = async (req, res) => {
  try {
    const pageNameRaw = (req.query.page_name || '').toString().trim().toLowerCase();
    if (!pageNameRaw) {
      return res.status(400).json({ message: 'Missing page_name parameter' });
    }

    // Basic mapping of page_name to router paths
    const mapping = {
      home: '/',
      'about-us': '/about',
      about: '/about',
      contact: '/contact',
      products: '/products',
      collection: '/collection',
      stores: '/store',
      store: '/store'
    };
    const path = mapping[pageNameRaw] || ('/' + pageNameRaw.replace(/^\/+/, ''));

    const record = await Seo.findOne({ where: { path } });
    const origin = (req.headers.origin) || (`${req.protocol}://${req.get('host')}`);
    const base = (process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim()) ? process.env.FRONTEND_URL : origin;
    const canonical = `${base.replace(/\/$/, '')}${path}`;
    // Page-specific defaults
    const defaultsByPage = {
      home: {
        meta_description: 'Discover premium lighting for every space. Explore stores, collections, and featured products at Vivera Lighting.',
        meta_keywords: 'lighting, vivera lighting, home lighting, featured products, stores',
      },
      'about-us': {
        meta_description: 'Learn about Vivera Lighting—our story, mission, and commitment to quality illumination.',
        meta_keywords: 'about vivera lighting, mission, brand story, lighting company',
      },
      contact: {
        meta_description: 'Contact Vivera Lighting for support, sales inquiries, or store partnerships.',
        meta_keywords: 'contact vivera lighting, support, sales, partnership',
      },
      products: {
        meta_description: 'Browse all Vivera Lighting products. Find the perfect fixtures and luminaires for your needs.',
        meta_keywords: 'vivera products, lighting products, luminaires, fixtures',
      },
      collection: {
        meta_description: 'Explore curated lighting collections from Vivera Lighting—styles for every interior.',
        meta_keywords: 'lighting collections, curated lights, interior lighting styles',
      },
      store: {
        meta_description: 'Find Vivera Lighting stores and showrooms near you. Discover authorized partners.',
        meta_keywords: 'lighting stores, vivera stores, showrooms, authorized partners',
      }
    };
    const pageDefaults = defaultsByPage[pageNameRaw] || {
      meta_description: 'Explore Vivera Lighting stores, collections, and products.',
      meta_keywords: 'lighting, vivera, store, products, collections',
    };
    const fallback = {
      meta_title: 'Vivera Lighting',
      meta_description: pageDefaults.meta_description,
      meta_keywords: pageDefaults.meta_keywords,
      canonical_url: canonical,
      meta_image: null
    };

    if (!record) {
      return res.json({ success: true, data: fallback });
    }

    return res.json({
      success: true,
      data: {
        meta_title: record.title,
        meta_description: record.description,
        meta_keywords: record.keywords,
        canonical_url: canonical,
        meta_image: record.og_image || null
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resolve SEO by page_name', error: err.message });
  }
};

exports.upsert = async (req, res) => {
  try {
    const { path: rawPath, title, description, keywords, og_title, og_description, og_image, noindex } = req.body;
    const path = normalizePath(rawPath);
    const [record] = await Seo.upsert({ path, title, description, keywords, og_title, og_description, og_image, noindex: !!noindex }, { returning: true });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: 'Failed to upsert SEO', error: err.message });
  }
};

exports.list = async (_req, res) => {
  try {
    const items = await Seo.findAll({ order: [['path', 'ASC']] });
    console.log('SEO list items:', items.map(item => ({ 
      id: item.id, 
      path: item.path, 
      title: item.title, 
      description: item.description?.substring(0, 50) + '...' 
    })));
    res.json(items);
  } catch (err) {
    console.error('Error in SEO list:', err);
    res.status(500).json({ message: 'Failed to list SEO', error: err.message });
  }
};


