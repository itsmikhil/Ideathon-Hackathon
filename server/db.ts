import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'edugap',
});

if (!process.env.DB_NAME) {
  console.warn('WARNING: DB_NAME environment variable is not set. Database operations might fail if defaults are not sufficient.');
}

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        registration_number VARCHAR(20) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) CHECK (role IN ('student', 'teacher', 'admin')) NOT NULL,
        selected_domain VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS domains (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        topics_generated_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_generated_topics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
        is_vit_available BOOLEAN DEFAULT false,
        vit_subject_name VARCHAR(150),
        syllabus_url TEXT,
        source VARCHAR(10) CHECK (source IN ('ai', 'vit', 'both')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS topic_demand (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        topic_id UUID REFERENCES ai_generated_topics(id) ON DELETE CASCADE,
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (topic_id, student_id)
      );

      CREATE TABLE IF NOT EXISTS online_resources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        topic_id UUID REFERENCES ai_generated_topics(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        provider VARCHAR(100),
        url TEXT,
        is_free BOOLEAN DEFAULT true,
        quality_score FLOAT DEFAULT 0.9
      );

      CREATE TABLE IF NOT EXISTS blog_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        subject_tag VARCHAR(100),
        difficulty_tag VARCHAR(20) CHECK (difficulty_tag IN ('beginner', 'intermediate', 'advanced')),
        upvotes INTEGER DEFAULT 0,
        status VARCHAR(20) CHECK (status IN ('published', 'flagged', 'removed')) DEFAULT 'published',
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
        author_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS doubt_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        subject_tag VARCHAR(100),
        upvotes INTEGER DEFAULT 0,
        status VARCHAR(20) CHECK (status IN ('active', 'flagged', 'removed')) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS teacher_points (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(50) CHECK (action IN ('blog_post', 'comment_received', 'like_received')),
        points INTEGER NOT NULL,
        reference_id UUID,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS student_domain_selections (
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
        selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (student_id, domain_id)
      );
    `);

    // Seed initial domains
    await pool.query(`
      INSERT INTO domains (name, slug, description, icon)
      VALUES 
        ('Backend Developer', 'backend-developer', 'Build scalable server-side applications and APIs.', 'server'),
        ('Frontend Developer', 'frontend-developer', 'Create engaging user interfaces and web experiences.', 'layout'),
        ('Data Analyst', 'data-analyst', 'Analyze data to help businesses make informed decisions.', 'bar-chart'),
        ('AI / ML Engineer', 'ai-ml-engineer', 'Develop intelligent systems and machine learning models.', 'brain'),
        ('DevOps Engineer', 'devops-engineer', 'Streamline software delivery and manage infrastructure.', 'infinity'),
        ('Cyber Security Analyst', 'cyber-security-analyst', 'Protect systems and networks from digital attacks.', 'shield'),
        ('Full Stack Developer', 'full-stack-developer', 'Master both frontend and backend development.', 'layers'),
        ('Android Developer', 'android-developer', 'Build native applications for the Android platform.', 'smartphone')
      ON CONFLICT (slug) DO NOTHING;
    `);

    // Seed VIT curriculum subjects per domain (hardcoded from B.Tech CSE 2024-2025 curriculum)
    await pool.query(`
      INSERT INTO ai_generated_topics (domain_id, title, description, difficulty, is_vit_available, vit_subject_name, source)
      SELECT d.id, t.title, t.description, t.difficulty::VARCHAR, t.is_vit_available, t.vit_subject_name, t.source
      FROM domains d
      JOIN (VALUES
        -- Backend Developer
        ('backend-developer', 'Database Management Systems', 'Design and manage relational databases using SQL, normalization, transactions and indexing.', 'intermediate', true, 'Database Management Systems (DBMS)', 'vit'),
        ('backend-developer', 'Operating Systems', 'Core OS concepts: process management, memory management, file systems and scheduling.', 'intermediate', true, 'Operating Systems', 'vit'),
        ('backend-developer', 'Computer Networks', 'Networking fundamentals: TCP/IP, protocols, routing, and network security.', 'intermediate', true, 'Computer Networks', 'vit'),
        ('backend-developer', 'Web Technologies', 'Client-server architecture, HTTP, REST APIs and web frameworks.', 'intermediate', true, 'Web Technologies', 'vit'),
        ('backend-developer', 'Software Engineering', 'SDLC, agile methodologies, design patterns and software architecture.', 'intermediate', true, 'Software Engineering', 'vit'),
        ('backend-developer', 'Data Structures and Algorithms', 'Fundamental data structures and algorithm design for efficient problem solving.', 'intermediate', true, 'Data Structures and Algorithms', 'vit'),

        -- Frontend Developer
        ('frontend-developer', 'Web Technologies', 'HTML5, CSS3, JavaScript and modern browser APIs for building user interfaces.', 'beginner', true, 'Web Technologies', 'vit'),
        ('frontend-developer', 'Human Computer Interaction', 'UI/UX principles, user research, wireframing and accessibility standards.', 'intermediate', true, 'Human Computer Interaction', 'vit'),
        ('frontend-developer', 'Data Structures and Algorithms', 'Core algorithms needed for performance-sensitive frontend tasks.', 'intermediate', true, 'Data Structures and Algorithms', 'vit'),
        ('frontend-developer', 'Software Engineering', 'Agile, design patterns and component-based architecture practices.', 'intermediate', true, 'Software Engineering', 'vit'),

        -- AI / ML Engineer
        ('ai-ml-engineer', 'Machine Learning', 'Supervised and unsupervised learning, model evaluation and feature engineering.', 'advanced', true, 'Machine Learning', 'vit'),
        ('ai-ml-engineer', 'Deep Learning', 'Neural networks, CNNs, RNNs and transformer architectures.', 'advanced', true, 'Deep Learning', 'vit'),
        ('ai-ml-engineer', 'Natural Language Processing', 'Text processing, language models, named entity recognition and sentiment analysis.', 'advanced', true, 'Natural Language Processing', 'vit'),
        ('ai-ml-engineer', 'Computer Vision', 'Image processing, object detection and visual recognition systems.', 'advanced', true, 'Computer Vision', 'vit'),
        ('ai-ml-engineer', 'Data Mining', 'Techniques for discovering patterns in large datasets.', 'intermediate', true, 'Data Mining', 'vit'),
        ('ai-ml-engineer', 'Probability and Statistics', 'Statistical foundations for data science and machine learning.', 'intermediate', true, 'Probability and Statistics', 'vit'),

        -- Data Analyst
        ('data-analyst', 'Probability and Statistics', 'Statistical methods for data analysis, hypothesis testing and inference.', 'intermediate', true, 'Probability and Statistics', 'vit'),
        ('data-analyst', 'Data Mining', 'Identifying patterns and insights from structured and unstructured data.', 'intermediate', true, 'Data Mining', 'vit'),
        ('data-analyst', 'Database Management Systems', 'SQL and relational databases for data storage and complex querying.', 'intermediate', true, 'Database Management Systems (DBMS)', 'vit'),
        ('data-analyst', 'Machine Learning', 'Predictive modeling and data-driven decision making.', 'advanced', true, 'Machine Learning', 'vit'),
        ('data-analyst', 'Big Data Analytics', 'Processing and analyzing massive datasets using distributed frameworks.', 'advanced', true, 'Big Data Analytics', 'vit'),

        -- DevOps Engineer
        ('devops-engineer', 'Cloud Computing', 'Cloud infrastructure, virtualization, IaaS/PaaS/SaaS deployment models.', 'intermediate', true, 'Cloud Computing', 'vit'),
        ('devops-engineer', 'Operating Systems', 'Linux administration, process management, shell scripting and kernel internals.', 'intermediate', true, 'Operating Systems', 'vit'),
        ('devops-engineer', 'Computer Networks', 'Network configuration, DNS, load balancing and security groups.', 'intermediate', true, 'Computer Networks', 'vit'),
        ('devops-engineer', 'Software Engineering', 'CI/CD pipelines, version control and agile delivery practices.', 'intermediate', true, 'Software Engineering', 'vit'),

        -- Cyber Security Analyst
        ('cyber-security-analyst', 'Network Security', 'Firewalls, intrusion detection, VPNs and securing network infrastructure.', 'advanced', true, 'Network Security', 'vit'),
        ('cyber-security-analyst', 'Cryptography', 'Encryption algorithms, public key infrastructure and secure communications.', 'advanced', true, 'Cryptography and Network Security', 'vit'),
        ('cyber-security-analyst', 'Operating Systems', 'OS hardening, privilege escalation vulnerabilities and system security.', 'intermediate', true, 'Operating Systems', 'vit'),
        ('cyber-security-analyst', 'Computer Networks', 'Network protocols, packet analysis and attack surface identification.', 'intermediate', true, 'Computer Networks', 'vit'),
        ('cyber-security-analyst', 'Ethical Hacking', 'Penetration testing methodologies, vulnerability assessment and exploitation.', 'advanced', false, 'Ethical Hacking', 'vit'),

        -- Full Stack Developer
        ('full-stack-developer', 'Web Technologies', 'Front-end and back-end web development, frameworks and REST APIs.', 'intermediate', true, 'Web Technologies', 'vit'),
        ('full-stack-developer', 'Database Management Systems', 'Relational and NoSQL databases for full-stack data persistence.', 'intermediate', true, 'Database Management Systems (DBMS)', 'vit'),
        ('full-stack-developer', 'Software Engineering', 'System design, microservices architecture and development best practices.', 'intermediate', true, 'Software Engineering', 'vit'),
        ('full-stack-developer', 'Operating Systems', 'Server-side OS concepts, process management and deployment environments.', 'beginner', true, 'Operating Systems', 'vit'),
        ('full-stack-developer', 'Computer Networks', 'HTTP, TCP/IP, WebSockets and API security fundamentals.', 'intermediate', true, 'Computer Networks', 'vit'),

        -- Android Developer
        ('android-developer', 'Mobile Application Development', 'Android SDK, activities, fragments, intents and the Android lifecycle.', 'intermediate', true, 'Mobile Application Development', 'vit'),
        ('android-developer', 'Object Oriented Programming', 'OOP principles using Java/Kotlin for Android development.', 'beginner', true, 'Object Oriented Programming', 'vit'),
        ('android-developer', 'Database Management Systems', 'SQLite and Room database for local Android data storage.', 'intermediate', true, 'Database Management Systems (DBMS)', 'vit'),
        ('android-developer', 'Software Engineering', 'MVVM, clean architecture and best practices for scalable Android apps.', 'intermediate', true, 'Software Engineering', 'vit')
      ) AS t(slug, title, description, difficulty, is_vit_available, vit_subject_name, source)
      ON d.slug = t.slug
      WHERE NOT EXISTS (
        SELECT 1 FROM ai_generated_topics agt
        WHERE agt.domain_id = d.id AND agt.title = t.title AND agt.source = 'vit'
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};
