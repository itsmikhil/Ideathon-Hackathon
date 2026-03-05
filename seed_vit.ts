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

async function seed() {
    console.log('Connecting to DB...');
    await pool.query(`
    INSERT INTO ai_generated_topics (domain_id, title, description, difficulty, is_vit_available, vit_subject_name, source)
    SELECT d.id, t.title, t.description, t.difficulty, t.is_vit::BOOLEAN, t.vit_name, t.src
    FROM domains d
    JOIN (VALUES
      ('backend-developer','Database Management Systems','Design and manage relational databases using SQL, normalization, transactions and indexing.','intermediate','true','Database Management Systems (DBMS)','vit'),
      ('backend-developer','Operating Systems','Core OS concepts: process management, memory management, file systems and scheduling.','intermediate','true','Operating Systems','vit'),
      ('backend-developer','Computer Networks','Networking fundamentals: TCP/IP, protocols, routing, and network security.','intermediate','true','Computer Networks','vit'),
      ('backend-developer','Web Technologies','Client-server architecture, HTTP, REST APIs and web frameworks.','intermediate','true','Web Technologies','vit'),
      ('backend-developer','Software Engineering','SDLC, agile methodologies, design patterns and software architecture.','intermediate','true','Software Engineering','vit'),
      ('backend-developer','Data Structures and Algorithms','Fundamental data structures and algorithm design for efficient problem solving.','intermediate','true','Data Structures and Algorithms','vit'),
      ('frontend-developer','Web Technologies','HTML5, CSS3, JavaScript and modern browser APIs for building user interfaces.','beginner','true','Web Technologies','vit'),
      ('frontend-developer','Human Computer Interaction','UI/UX principles, user research, wireframing and accessibility standards.','intermediate','true','Human Computer Interaction','vit'),
      ('frontend-developer','Data Structures and Algorithms','Core algorithms needed for performance-sensitive frontend tasks.','intermediate','true','Data Structures and Algorithms','vit'),
      ('frontend-developer','Software Engineering','Agile, design patterns and component-based architecture practices.','intermediate','true','Software Engineering','vit'),
      ('ai-ml-engineer','Machine Learning','Supervised and unsupervised learning, model evaluation and feature engineering.','advanced','true','Machine Learning','vit'),
      ('ai-ml-engineer','Deep Learning','Neural networks, CNNs, RNNs and transformer architectures.','advanced','true','Deep Learning','vit'),
      ('ai-ml-engineer','Natural Language Processing','Text processing, language models, named entity recognition and sentiment analysis.','advanced','true','Natural Language Processing','vit'),
      ('ai-ml-engineer','Computer Vision','Image processing, object detection and visual recognition systems.','advanced','true','Computer Vision','vit'),
      ('ai-ml-engineer','Data Mining','Techniques for discovering patterns in large datasets.','intermediate','true','Data Mining','vit'),
      ('ai-ml-engineer','Probability and Statistics','Statistical foundations for data science and machine learning.','intermediate','true','Probability and Statistics','vit'),
      ('data-analyst','Probability and Statistics','Statistical methods for data analysis, hypothesis testing and inference.','intermediate','true','Probability and Statistics','vit'),
      ('data-analyst','Data Mining','Identifying patterns and insights from structured and unstructured data.','intermediate','true','Data Mining','vit'),
      ('data-analyst','Database Management Systems','SQL and relational databases for data storage and complex querying.','intermediate','true','Database Management Systems (DBMS)','vit'),
      ('data-analyst','Machine Learning','Predictive modeling and data-driven decision making.','advanced','true','Machine Learning','vit'),
      ('data-analyst','Big Data Analytics','Processing and analyzing massive datasets using distributed frameworks.','advanced','true','Big Data Analytics','vit'),
      ('devops-engineer','Cloud Computing','Cloud infrastructure, virtualization, IaaS/PaaS/SaaS deployment models.','intermediate','true','Cloud Computing','vit'),
      ('devops-engineer','Operating Systems','Linux administration, process management, shell scripting and kernel internals.','intermediate','true','Operating Systems','vit'),
      ('devops-engineer','Computer Networks','Network configuration, DNS, load balancing and security groups.','intermediate','true','Computer Networks','vit'),
      ('devops-engineer','Software Engineering','CI/CD pipelines, version control and agile delivery practices.','intermediate','true','Software Engineering','vit'),
      ('cyber-security-analyst','Network Security','Firewalls, intrusion detection, VPNs and securing network infrastructure.','advanced','true','Network Security','vit'),
      ('cyber-security-analyst','Cryptography','Encryption algorithms, public key infrastructure and secure communications.','advanced','true','Cryptography and Network Security','vit'),
      ('cyber-security-analyst','Operating Systems','OS hardening, privilege escalation vulnerabilities and system security.','intermediate','true','Operating Systems','vit'),
      ('cyber-security-analyst','Computer Networks','Network protocols, packet analysis and attack surface identification.','intermediate','true','Computer Networks','vit'),
      ('cyber-security-analyst','Ethical Hacking','Penetration testing methodologies, vulnerability assessment and exploitation.','advanced','false','Ethical Hacking','vit'),
      ('full-stack-developer','Web Technologies','Front-end and back-end web development, frameworks and REST APIs.','intermediate','true','Web Technologies','vit'),
      ('full-stack-developer','Database Management Systems','Relational and NoSQL databases for full-stack data persistence.','intermediate','true','Database Management Systems (DBMS)','vit'),
      ('full-stack-developer','Software Engineering','System design, microservices architecture and development best practices.','intermediate','true','Software Engineering','vit'),
      ('full-stack-developer','Operating Systems','Server-side OS concepts, process management and deployment environments.','beginner','true','Operating Systems','vit'),
      ('full-stack-developer','Computer Networks','HTTP, TCP/IP, WebSockets and API security fundamentals.','intermediate','true','Computer Networks','vit'),
      ('android-developer','Mobile Application Development','Android SDK, activities, fragments, intents and the Android lifecycle.','intermediate','true','Mobile Application Development','vit'),
      ('android-developer','Object Oriented Programming','OOP principles using Java/Kotlin for Android development.','beginner','true','Object Oriented Programming','vit'),
      ('android-developer','Database Management Systems','SQLite and Room database for local Android data storage.','intermediate','true','Database Management Systems (DBMS)','vit'),
      ('android-developer','Software Engineering','MVVM, clean architecture and best practices for scalable Android apps.','intermediate','true','Software Engineering','vit')
    ) AS t(slug, title, description, difficulty, is_vit, vit_name, src)
    ON d.slug = t.slug
    WHERE NOT EXISTS (
      SELECT 1 FROM ai_generated_topics agt
      WHERE agt.domain_id = d.id AND agt.title = t.title AND agt.source = 'vit'
    )
  `);

    const { rows } = await pool.query("SELECT COUNT(*) FROM ai_generated_topics WHERE source='vit'");
    console.log('VIT subjects seeded:', rows[0].count);
    await pool.end();
}

seed().catch(e => { console.error('SEED ERROR:', e.message); process.exit(1); });
