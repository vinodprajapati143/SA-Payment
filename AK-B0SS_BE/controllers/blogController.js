const db = require("../config/db");
const dotenv = require('dotenv');
const sanitizeHtml = require('sanitize-html');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

dotenv.config();

exports.createBlog = async (req, res) => {
  try {
    const { title, description, subDescription } = req.body;
    const userId = req.user?.id;

    // 🔐 Auth check
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    // 🛑 Validation
    if (!title || !description) {
      return res.status(400).json({
        message: 'Title and description are required'
      });
    }

    // 🧼 Sanitize HTML (XSS protection)
      const cleanDescription = sanitizeHtml(description, {
      allowedTags: [
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'b', 'i', 'em', 'strong',
        'a', 'ul', 'ol', 'li',
        'figure', 'img'
      ],
      allowedAttributes: {
        a: ['href', 'target'],
        img: ['src', 'alt', 'width', 'height', 'style'],
        figure: ['class']
      }
    });
    const cleanSubDescription = subDescription
      ? sanitizeHtml(subDescription)
      : null;

    // 🖼️ Image validation
    if (req.file && !req.file.mimetype.startsWith('image')) {
      return res.status(400).json({
        message: 'Only image files are allowed'
      });
    }

    const image = req.file
      ? `${process.env.BASE_URL}/backend/api/uploads/${req.file.filename}`
      : null;

    // 🔗 Slug generate
    let slug = slugify(title, { lower: true, strict: true });

    // 🔁 Ensure unique slug
    const [existingSlug] = await db.execute(
      'SELECT id FROM blogs WHERE slug = ?',
      [slug]
    );

    if (existingSlug.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    // 🔁 Duplicate title check (optional but good)
    const [existingTitle] = await db.execute(
      'SELECT id FROM blogs WHERE title = ?',
      [title]
    );

    if (existingTitle.length > 0) {
      return res.status(400).json({
        message: 'Blog with this title already exists'
      });
    }

    // 🧾 Insert query
    const query = `
      INSERT INTO blogs (user_id, title, description, subDescription, image, slug)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      userId,
      title,
      cleanDescription,
      cleanSubDescription,
      image,
      slug
    ]);

    return res.status(201).json({
      message: 'Blog created successfully',
      blogId: result.insertId,
      slug
    });

  } catch (error) {
    console.error('Create Blog Error:', error);

    return res.status(500).json({
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    let { page = '1', limit = '10' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    // 📊 Total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM blogs`
    );
    const total = countResult[0].total;

    // 📄 Data
    const query = `
      SELECT id, title, subDescription, image, status, created_at
      FROM blogs
      ORDER BY id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [blogs] = await db.execute(query);

    res.status(200).json({
      message: 'Blogs fetched successfully',
      data: blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Blogs Error:', error);

    res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};

exports.updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 0 or 1
    console.log('status: ', status);

    if (status === undefined) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const query = `
      UPDATE blogs 
      SET status = ? 
      WHERE id = ?
    `;

    const [result] = await db.execute(query, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog status updated successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// 🔹 Helper: extract images from HTML
const extractImagePathsFromHTML = (html) => {
  if (!html) return [];

  const regex = /<img[^>]+src="([^">]+)"/g;
  const imagePaths = [];

  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];

    if (url.includes('/uploads/')) {
      const fileName = url.split('/uploads/')[1];
      if (fileName && !fileName.includes('..')) {
        imagePaths.push(fileName);
      }
    }
  }

  return imagePaths;
};

 exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Step 1: Fetch blog
    const [rows] = await db.execute(
      "SELECT image, description FROM blogs WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    const blog = rows[0];

    let filesToDelete = [];

    // ✅ Step 2: Thumbnail
    if (blog.image?.includes('/uploads/')) {
      const fileName = blog.image.split('/uploads/')[1];
      if (fileName && !fileName.includes('..')) {
        filesToDelete.push(fileName);
      }
    }

    // ✅ Step 3: CKEditor images
    const editorImages = extractImagePathsFromHTML(blog.description);
    filesToDelete.push(...editorImages);

    // ✅ Step 4: Remove duplicates
    filesToDelete = [...new Set(filesToDelete)];

    // ✅ Step 5: Delete DB FIRST (important)
    await db.execute("DELETE FROM blogs WHERE id = ?", [id]);

    // ✅ Step 6: Delete files safely (non-blocking)
    filesToDelete.forEach((file) => {
      const fullPath = path.join(__dirname, '..', 'uploads', file);

      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error("❌ File delete error:", file, err.message);
        } else {
          console.log("✅ Deleted:", file);
        }
      });
    });

    res.status(200).json({
      success: true,
      message: "Blog and all related images permanently deleted"
    });

  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT id, title, subDescription, description, image, status, created_at 
       FROM blogs 
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error("Get Blog By ID Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, subDescription, description } = req.body;

    // ✅ Basic validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }

    title = title.trim();
    subDescription = subDescription?.trim() || '';
    description = description.trim();

    const newImage = req.file?.filename;

    // ✅ Step 1: Old blog fetch
    const [rows] = await db.execute(
      "SELECT image, description FROM blogs WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    const oldBlog = rows[0];

    let filesToDelete = [];

    // ✅ Step 2: Thumbnail handling
    let finalImage = oldBlog.image;

    if (newImage) {
      finalImage = `${process.env.BASE_URL}/backend/api/uploads/${newImage}`;

      if (oldBlog.image?.includes('/uploads/')) {
        const oldFile = oldBlog.image.split('/uploads/')[1];

        if (oldFile && !oldFile.includes('..')) {
          filesToDelete.push(oldFile);
        }
      }
    }

    // ✅ Step 3: CKEditor image compare
    const oldImages = extractImagePathsFromHTML(oldBlog.description);
    const newImages = extractImagePathsFromHTML(description);

    const removedImages = oldImages.filter(img => !newImages.includes(img));
    filesToDelete.push(...removedImages);

    // ✅ Step 4: DB update
    await db.execute(
      `UPDATE blogs 
       SET title=?, subDescription=?, description=?, image=?
       WHERE id=?`,
      [title, subDescription, description, finalImage, id]
    );

    // ✅ Step 5: Send response immediately (FAST 🚀)
    res.status(200).json({
      success: true,
      message: "Blog updated successfully"
    });

    // ✅ Step 6: Background cleanup (non-blocking)
    setImmediate(async () => {
      try {
        const uniqueFiles = [...new Set(filesToDelete)];

        await Promise.all(
          uniqueFiles.map(file => {
            const fullPath = path.join(__dirname, '..', 'uploads', file);
            return fs.promises.unlink(fullPath).catch(() => {});
          })
        );

      } catch (err) {
        console.error("Background delete error:", err.message);
      }
    });

  } catch (error) {
    console.error("Update Blog Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
 