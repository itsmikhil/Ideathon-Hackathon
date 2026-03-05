import { GoogleGenAI, Type, createPartFromUri, createUserContent } from "@google/genai";
import { query } from "../db.js";
import path from "path";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let cachedCurriculumPdf: any = null;

async function getCurriculumPdf() {
  if (cachedCurriculumPdf) return cachedCurriculumPdf;
  try {
    const pdfPath = path.resolve(process.cwd(), "B.Tech_CSE_2024_2025.pdf");
    if (fs.existsSync(pdfPath)) {
      console.log("Uploading curriculum PDF to Gemini...");
      cachedCurriculumPdf = await ai.files.upload({ file: pdfPath, config: { mimeType: "application/pdf" } });
      console.log("Curriculum PDF uploaded successfully.");
    }
  } catch (error) {
    console.warn("Failed to upload curriculum PDF:", error);
  }
  return cachedCurriculumPdf;
}

const FALLBACK_TOPICS: Record<string, any[]> = {
  "backend-developer": [{ name: "REST APIs", description: "HTTP API design", difficulty: "intermediate" }],
};

export async function generateTopics(domainId: string, domainName: string, domainSlug: string) {
  try {
    const existing = await query('SELECT * FROM ai_generated_topics WHERE domain_id = $1', [domainId]);
    if (existing.rows.length > 0) {
      return existing.rows;
    }

    let topicsData: any[] = [];
    try {
      const pdfFile = await getCurriculumPdf();
      const promptText = `Generate 15-20 important topics for a ${domainName}. If there are matching subjects in the attached VIT CSE 2024-2025 curriculum PDF, align the topics with them. Return ONLY JSON array of objects.`;
      const contents = pdfFile
        ? createUserContent([createPartFromUri(pdfFile.uri, pdfFile.mimeType), promptText])
        : promptText;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                difficulty: { type: Type.STRING, description: "beginner, intermediate, or advanced" },
                is_vit_available: { type: Type.BOOLEAN, description: "true if topic is covered in the VIT curriculum" },
                vit_subject_name: { type: Type.STRING, description: "Name of the VIT subject if available, otherwise 'None'" },
                source: { type: Type.STRING, description: "ai, vit, or both" }
              },
              required: ["name", "description", "difficulty", "is_vit_available", "vit_subject_name", "source"]
            }
          }
        }
      });

      topicsData = JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Gemini API error:", error);
      topicsData = FALLBACK_TOPICS[domainSlug] || [];
    }

    // Insert into DB
    const insertedTopics = [];
    for (const topic of topicsData) {
      const isVit = topic.is_vit_available === true;
      const vitName = isVit && topic.vit_subject_name !== 'None' ? topic.vit_subject_name : null;
      const src = topic.source || (isVit ? 'both' : 'ai');

      const result = await query(
        'INSERT INTO ai_generated_topics (domain_id, title, description, difficulty, is_vit_available, vit_subject_name, source) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [domainId, topic.name, topic.description, topic.difficulty, isVit, vitName, src]
      );
      insertedTopics.push(result.rows[0]);
    }

    await query('UPDATE domains SET topics_generated_at = CURRENT_TIMESTAMP WHERE id = $1', [domainId]);

    return insertedTopics;
  } catch (error) {
    console.error("Error generating topics:", error);
    throw error;
  }
}

// Curated, verified free resource links per VIT subject
const CURATED_RESOURCES: Record<string, Array<{ title: string; url: string; platform: string; description: string }>> = {
  'Data Structures and Algorithms': [
    { title: 'DSA Tutorial', url: 'https://www.geeksforgeeks.org/data-structures/', platform: 'GeeksForGeeks', description: 'Comprehensive guide to all data structures with problems and examples.' },
    { title: 'JS Algorithms & Data Structures', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', platform: 'freeCodeCamp', description: 'Interactive algorithms and data structure certification course.' },
    { title: 'MIT 6.006 Introduction to Algorithms', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/', platform: 'MIT OpenCourseWare', description: 'Full MIT lecture series on algorithms, free to audit.' },
  ],
  'Database Management Systems': [
    { title: 'DBMS Tutorial', url: 'https://www.geeksforgeeks.org/dbms/', platform: 'GeeksForGeeks', description: 'Complete DBMS guide: normalization, transactions, SQL and more.' },
    { title: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/', platform: 'W3Schools', description: 'Interactive SQL tutorial from basics to advanced queries.' },
    { title: 'CMU 15-445 Database Systems', url: 'https://www.youtube.com/playlist?list=PLSE8ODhjZXjbj8BMuIrRcacnQh20hmY9g', platform: 'YouTube', description: 'Carnegie Mellon\'s full database systems course, free on YouTube.' },
  ],
  'Operating Systems': [
    { title: 'Operating Systems Tutorial', url: 'https://www.geeksforgeeks.org/operating-systems/', platform: 'GeeksForGeeks', description: 'Complete OS tutorial: scheduling, memory management, deadlocks and more.' },
    { title: 'OS: Three Easy Pieces (Free Book)', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', platform: 'OSTEP', description: 'Free online textbook used in top universities worldwide.' },
    { title: 'OS Concepts by Neso Academy', url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O', platform: 'YouTube', description: 'Full video series on operating systems with clear explanations.' },
  ],
  'Computer Networks': [
    { title: 'Computer Networks Tutorial', url: 'https://www.geeksforgeeks.org/computer-network-tutorials/', platform: 'GeeksForGeeks', description: 'Covers TCP/IP, protocols, routing and networking layers in depth.' },
    { title: 'Top-Down Approach Lecture Slides', url: 'https://gaia.cs.umass.edu/kurose_ross/online_lectures.htm', platform: 'UMass', description: 'Free slides from the most popular networking textbook (Kurose & Ross).' },
    { title: 'Computer Networks by Neso Academy', url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRgMCUAG0XRw78UA8qnmVjDD', platform: 'YouTube', description: 'Full video course on computer networks from basics to advanced topics.' },
  ],
  'Web Technologies': [
    { title: 'Responsive Web Design Certification', url: 'https://www.freecodecamp.org/learn/responsive-web-design/', platform: 'freeCodeCamp', description: 'Free responsive web design certification covering HTML, CSS and layouts.' },
    { title: 'MDN Learn Web Development', url: 'https://developer.mozilla.org/en-US/docs/Learn', platform: 'MDN', description: 'Official Mozilla web docs — the gold standard for web development learning.' },
    { title: 'Web Technologies Tutorials', url: 'https://www.w3schools.com/', platform: 'W3Schools', description: 'Interactive tutorials on HTML, CSS, JavaScript, PHP and more.' },
  ],
  'Software Engineering': [
    { title: 'Software Engineering Tutorial', url: 'https://www.geeksforgeeks.org/software-engineering/', platform: 'GeeksForGeeks', description: 'SDLC, design patterns, testing, agile, and software metrics explained.' },
    { title: 'Software Engineering Courses', url: 'https://www.edx.org/learn/software-engineering', platform: 'edX', description: 'Software engineering courses — many available free to audit on edX.' },
    { title: 'Clean Code Principles', url: 'https://www.youtube.com/watch?v=7EmboKQH8lM', platform: 'YouTube', description: 'Visual summary of key clean code and software engineering principles.' },
  ],
  'Machine Learning': [
    { title: 'Machine Learning Specialization (free audit)', url: 'https://www.coursera.org/specializations/machine-learning-introduction', platform: 'Coursera', description: 'Andrew Ng\'s world-famous ML course — free to audit on Coursera.' },
    { title: 'Machine Learning Tutorial', url: 'https://www.geeksforgeeks.org/machine-learning/', platform: 'GeeksForGeeks', description: 'Tutorials on regression, classification, clustering, and more.' },
    { title: 'Practical Deep Learning — fast.ai', url: 'https://course.fast.ai/', platform: 'fast.ai', description: 'Completely free practical ML and deep learning course for beginners.' },
  ],
  'Deep Learning': [
    { title: 'Deep Learning Specialization (free audit)', url: 'https://www.coursera.org/specializations/deep-learning', platform: 'Coursera', description: 'Andrew Ng\'s 5-course deep learning specialization, free to audit.' },
    { title: 'Practical Deep Learning — fast.ai', url: 'https://course.fast.ai/', platform: 'fast.ai', description: 'Free hands-on deep learning from scratch with Jupyter notebooks.' },
    { title: 'Neural Networks: Zero to Hero', url: 'https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ', platform: 'YouTube', description: 'Andrej Karpathy builds neural nets from scratch — best DL deep dive.' },
  ],
  'Natural Language Processing': [
    { title: 'NLP Tutorial', url: 'https://www.geeksforgeeks.org/natural-language-processing-nlp-tutorial/', platform: 'GeeksForGeeks', description: 'NLP concepts from tokenization to transformers with code examples.' },
    { title: 'Hugging Face NLP Course', url: 'https://huggingface.co/learn/nlp-course/chapter1/1', platform: 'Hugging Face', description: 'Free NLP course using transformers — covers BERT, GPT and modern models.' },
    { title: 'Stanford CS224N NLP', url: 'https://www.youtube.com/playlist?list=PLoROMvodv4rMFqRtEuo6SGjY4XbRIVx76', platform: 'YouTube', description: 'Stanford\'s full NLP with Deep Learning course, free on YouTube.' },
  ],
  'Computer Vision': [
    { title: 'Stanford CS231n Convolutional Neural Nets', url: 'https://www.youtube.com/playlist?list=PL3FW7Lu3i5JvHM8ljYj-zLfQRF3EO8sYv', platform: 'YouTube', description: 'Stanford\'s iconic CNN for Visual Recognition course, free on YouTube.' },
    { title: 'OpenCV Python Tutorial — freeCodeCamp', url: 'https://www.youtube.com/watch?v=oXlwWbU8l2o', platform: 'YouTube', description: '4-hour free OpenCV and computer vision crash course.' },
    { title: 'PyImageSearch Tutorials (free)', url: 'https://pyimagesearch.com/start-here/', platform: 'PyImageSearch', description: 'Free tutorials on OpenCV, image processing, and deep learning for vision.' },
  ],
  'Data Mining': [
    { title: 'Data Mining Tutorial', url: 'https://www.geeksforgeeks.org/data-mining/', platform: 'GeeksForGeeks', description: 'Association rules, clustering, classification, and pattern mining explained.' },
    { title: 'Data Mining Specialization (free audit)', url: 'https://www.coursera.org/specializations/data-mining', platform: 'Coursera', description: 'UIUC data mining specialization — pattern, text, cluster and graph mining.' },
    { title: 'Data Mining Full Course', url: 'https://www.youtube.com/watch?v=p6oBb0ooNEY', platform: 'YouTube', description: 'Full data mining course covering all major techniques and algorithms.' },
  ],
  'Big Data Analytics': [
    { title: 'Big Data Tutorial', url: 'https://www.geeksforgeeks.org/big-data/', platform: 'GeeksForGeeks', description: 'Covers Hadoop, Spark, MapReduce, HDFS and big data processing concepts.' },
    { title: 'Big Data Specialization (free audit)', url: 'https://www.coursera.org/specializations/big-data', platform: 'Coursera', description: 'UC San Diego big data course covering Spark, SQL and ML pipelines.' },
    { title: 'Apache Spark Tutorial', url: 'https://www.youtube.com/watch?v=_C8kWso4ne4', platform: 'YouTube', description: 'Free Apache Spark course covering RDDs, DataFrames and Spark SQL.' },
  ],
  'Probability and Statistics': [
    { title: 'Statistics & Probability', url: 'https://www.khanacademy.org/math/statistics-probability', platform: 'Khan Academy', description: 'Free comprehensive statistics course with exercises and video explanations.' },
    { title: 'Statistics Tutorial', url: 'https://www.geeksforgeeks.org/statistics/', platform: 'GeeksForGeeks', description: 'Probability distributions, hypothesis testing, and regression basics.' },
    { title: 'Statistics for Data Science', url: 'https://www.youtube.com/watch?v=xxpc-HPKN28', platform: 'YouTube', description: 'Free complete statistics for data science course covering all key concepts.' },
  ],
  'Cloud Computing': [
    { title: 'Cloud Computing Tutorial', url: 'https://www.geeksforgeeks.org/cloud-computing/', platform: 'GeeksForGeeks', description: 'IaaS, PaaS, SaaS, AWS, Azure, GCP fundamentals and deployment models.' },
    { title: 'AWS Cloud Practitioner Essentials (free)', url: 'https://explore.skillbuilder.aws/learn/course/134/aws-cloud-practitioner-essentials', platform: 'AWS Skill Builder', description: 'Amazon\'s official free cloud beginner course with 6 hours of content.' },
    { title: 'Cloud Computing Full Course', url: 'https://www.youtube.com/watch?v=M988_fsOSWo', platform: 'YouTube', description: 'Free cloud computing crash course covering all major platforms.' },
  ],
  'Network Security': [
    { title: 'Network Security Tutorial', url: 'https://www.geeksforgeeks.org/computer-network-security/', platform: 'GeeksForGeeks', description: 'Firewalls, VPNs, IDS/IPS, SSL/TLS, and network attack prevention.' },
    { title: 'Google Cybersecurity Certificate (free audit)', url: 'https://www.coursera.org/professional-certificates/google-cybersecurity', platform: 'Coursera', description: 'Google\'s professional cybersecurity certificate, free to audit.' },
    { title: 'Network Security Full Course', url: 'https://www.youtube.com/watch?v=qiQR5rTSshw', platform: 'YouTube', description: 'Free 2-hour network security crash course covering all key topics.' },
  ],
  'Cryptography and Network Security': [
    { title: 'Cryptography Tutorial', url: 'https://www.geeksforgeeks.org/cryptography-introduction/', platform: 'GeeksForGeeks', description: 'RSA, AES, DES, hashing, PKI, and modern cryptographic protocols.' },
    { title: 'Cryptography I — Stanford (free audit)', url: 'https://www.coursera.org/learn/crypto', platform: 'Coursera', description: 'Dan Boneh\'s world-renowned Stanford cryptography course, free to audit.' },
    { title: 'Cryptography Full Course', url: 'https://www.youtube.com/watch?v=AQDCe585Lnc', platform: 'YouTube', description: 'Complete cryptography course for beginners covering all major algorithms.' },
  ],
  'Ethical Hacking': [
    { title: 'Ethical Hacking Tutorials', url: 'https://www.geeksforgeeks.org/ethical-hacking-tutorials/', platform: 'GeeksForGeeks', description: 'Penetration testing, vulnerability assessment, and ethical hacking techniques.' },
    { title: 'Ethical Hacking Full Course', url: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE', platform: 'YouTube', description: '15-hour free ethical hacking full course by freeCodeCamp.' },
    { title: 'TryHackMe Free Paths', url: 'https://tryhackme.com/paths', platform: 'TryHackMe', description: 'Interactive cybersecurity platform with free rooms and challenges.' },
  ],
  'Human Computer Interaction': [
    { title: 'HCI Tutorial', url: 'https://www.geeksforgeeks.org/human-computer-interaction/', platform: 'GeeksForGeeks', description: 'HCI design principles, usability, accessibility and UI evaluation methods.' },
    { title: 'Human-Computer Interaction (free audit)', url: 'https://www.coursera.org/learn/human-computer-interaction', platform: 'Coursera', description: 'UC San Diego HCI course covering user research, prototyping, and evaluation.' },
    { title: 'Google UX Design Certificate (free audit)', url: 'https://www.coursera.org/professional-certificates/google-ux-design', platform: 'Coursera', description: 'Google\'s full UX design professional certificate, free to audit.' },
  ],
  'Mobile Application Development': [
    { title: 'Android Development Courses (free)', url: 'https://developer.android.com/courses', platform: 'Android Developers', description: 'Official free Android development courses by Google, beginner to advanced.' },
    { title: 'Android Tutorial', url: 'https://www.geeksforgeeks.org/android-tutorial/', platform: 'GeeksForGeeks', description: 'Complete Android development: activities, fragments, Jetpack and more.' },
    { title: 'Kotlin Android Full Course', url: 'https://www.youtube.com/watch?v=fis26HvvDII', platform: 'YouTube', description: 'Kotlin Android development crash course for beginners — completely free.' },
  ],
  'Object Oriented Programming': [
    { title: 'OOP Concepts Tutorial', url: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/', platform: 'GeeksForGeeks', description: 'Classes, objects, inheritance, polymorphism and encapsulation explained.' },
    { title: 'Java OOP Tutorial', url: 'https://www.w3schools.com/java/java_oop.asp', platform: 'W3Schools', description: 'Interactive OOP tutorial using Java with live code examples.' },
    { title: 'OOP in Python — freeCodeCamp', url: 'https://www.youtube.com/watch?v=Ej_02ICOIgs', platform: 'YouTube', description: 'Object oriented programming in Python with real project examples.' },
  ],
};

export function getTopicResources(topicId: string, topicTitle: string, domainName: string) {
  // Try exact match in curated map
  let resources = CURATED_RESOURCES[topicTitle];

  // Try partial match (e.g. "Database Management Systems (DBMS)" → key match)
  if (!resources) {
    const matchKey = Object.keys(CURATED_RESOURCES).find(k =>
      topicTitle.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(topicTitle.toLowerCase())
    );
    if (matchKey) resources = CURATED_RESOURCES[matchKey];
  }

  // Last resort: guaranteed-working search query URLs
  if (!resources) {
    const q = encodeURIComponent(topicTitle);
    resources = [
      { title: `${topicTitle} — GeeksForGeeks`, url: `https://www.geeksforgeeks.org/?s=${q}`, platform: 'GeeksForGeeks', description: `Articles and tutorials on ${topicTitle}.` },
      { title: `${topicTitle} Full Course — YouTube`, url: `https://www.youtube.com/results?search_query=${q}+free+full+course`, platform: 'YouTube', description: `Free full courses on ${topicTitle} on YouTube.` },
      { title: `${topicTitle} — freeCodeCamp`, url: `https://www.freecodecamp.org/news/search/?query=${q}`, platform: 'freeCodeCamp', description: `freeCodeCamp articles and tutorials on ${topicTitle}.` },
    ];
  }

  console.log(`[Resources] Serving ${resources.length} links for "${topicTitle}"`);
  return resources.slice(0, 3).map((r, i) => ({
    id: `curated-${topicId}-${i}`,
    topic_id: topicId,
    title: r.title,
    url: r.url,
    platform: r.platform,
    description: r.description,
    is_free: true,
    quality_score: 0.95,
  }));
}
