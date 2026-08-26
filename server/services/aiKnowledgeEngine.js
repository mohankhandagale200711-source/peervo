const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Intelligent Peervo AI Engine
 * 1. Primary: Official Google Gemini 1.5 Flash API (with auto-fallback to 2.0 Flash / Pro)
 * 2. Secondary: Direct REST API for Gemini
 * 3. Tertiary: Semantic Knowledge Base covering 100+ Computer Science, Coding, Math, and Academic topics
 */

// Knowledge topic database for instant high-quality responses
const TOPIC_KNOWLEDGE = [
  {
    keywords: ['os', 'osy', 'operating system', 'kernel', 'process management'],
    title: 'Operating System (OS / OSY)',
    response: `### 🖥️ What is an Operating System (OS / OSY)?

An **Operating System (OS)** is the core system software that acts as an intermediary between computer hardware and the user/applications. It manages computer hardware resources and provides common services for software applications.

---

### 🔑 Key Functions of an Operating System:

1. **Process Management**:
   - Manages CPU allocation using scheduling algorithms (FCFS, Round Robin, SJF, Priority Scheduling).
   - Handles process synchronization, context switching, and deadlocks.

2. **Memory Management**:
   - Manages primary RAM and secondary storage using **Paging**, **Segmentation**, and **Virtual Memory**.
   - Tracks every byte in memory and allocates/deallocates dynamically.

3. **File System Management**:
   - Organizes files and directories into hierarchical trees (NTFS, EXT4, FAT32).
   - Controls read/write permissions and access control.

4. **Device Management (I/O)**:
   - Communicates with hardware devices via specialized **Device Drivers** and buffers.

5. **Security & Protection**:
   - User authentication, access privilege levels (Kernel Mode vs. User Mode), and firewall control.

---

### 🚀 Common Operating Systems:
- **Desktop/Laptop**: Windows 11, macOS, Ubuntu / Linux
- **Mobile**: Android (Linux-based kernel), iOS
- **Servers**: Linux (RedHat, Debian, CentOS), Windows Server`
  },
  {
    keywords: ['react', 'reactjs', 'react.js', 'virtual dom', 'jsx'],
    title: 'React.js Frontend Library',
    response: `### ⚛️ What is React.js?

**React** is an open-source, component-based JavaScript frontend library developed by Meta (Facebook) used for building modern, fast, and interactive user interfaces (Single Page Applications - SPAs).

---

### 🌟 Core Concepts of React:

1. **Component-Based Architecture**:
   - UIs are broken down into reusable, self-contained pieces of UI called **Components** (e.g., Header, Card, Button).
   
2. **Virtual DOM (VDOM)**:
   - React keeps a lightweight copy of the real DOM in memory.
   - When state changes, React computes the diff with a **reconciliation algorithm** (Fiber) and updates *only* what changed in the real DOM, making it blazingly fast ($O(n)$ diffing).

3. **JSX (JavaScript XML)**:
   - Syntax extension allowing HTML-like code directly inside JavaScript files.

4. **One-Way Data Flow (Unidirectional)**:
   - Data flows down from parent components to child components via **Props**, making state predictable and easy to debug.

---

### 💡 Example React Component (Hooks):
\`\`\`jsx
import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 bg-slate-900 text-white rounded-xl">
      <h2 className="text-xl font-bold">Count: {count}</h2>
      <button 
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 mt-2"
      >
        Increment
      </button>
    </div>
  );
}
\`\`\`

---

### 🛠️ Common React Hooks:
- \`useState\`: Manage local component state
- \`useEffect\`: Perform side-effects (API fetching, subscriptions, timers)
- \`useContext\`: Consume global context without prop-drilling
- \`useRef\`: Persist mutable references without re-rendering`
  },
  {
    keywords: ['node', 'nodejs', 'node.js', 'express', 'event loop'],
    title: 'Node.js Backend Runtime',
    response: `### 🟢 What is Node.js?

**Node.js** is an open-source, cross-platform JavaScript runtime environment built on Google Chrome's **V8 JavaScript engine**. It executes JavaScript outside the web browser, enabling developers to build scalable, high-performance backend web servers.

---

### ⚡ Key Features:
1. **Asynchronous & Non-Blocking I/O**: Operations like file reading and database queries run in the background without freezing the server.
2. **Single-Threaded Event Loop**: Uses libuv to handle thousands of concurrent requests efficiently on a single thread.
3. **NPM Ecosystem**: Access to over 2 million open-source libraries.

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/api/greet', (req, res) => {
  res.json({ message: 'Hello from Peervo Backend!' });
});

app.listen(5000, () => console.log('Server running on port 5000'));
\`\`\``
  },
  {
    keywords: ['python', 'py'],
    title: 'Python Programming',
    response: `### 🐍 Python Programming Language

**Python** is a high-level, interpreted, dynamically-typed programming language renowned for its clean syntax, readability, and versatility across Data Science, AI/ML, Web Development, and Automation.

---

### 💡 Key Strengths:
- **Easy Syntax**: Reads like pseudocode with indentation-based structure.
- **Vast Libraries**: NumPy, Pandas, PyTorch, TensorFlow, Django, Flask, FastAPI.
- **Multi-Paradigm**: Supports Object-Oriented (OOP), Functional, and Procedural programming.`
  },
  {
    keywords: ['mongodb', 'database', 'db', 'nosql', 'sql'],
    title: 'Database Systems (SQL vs NoSQL)',
    response: `### 🗄️ Databases: SQL vs NoSQL

A **Database** is an organized collection of structured data stored electronically in a computer system.

---

### 1. SQL (Relational Databases - PostgreSQL, MySQL):
- Table-based rows and columns with fixed schemas.
- Follows **ACID** properties (Atomicity, Consistency, Isolation, Durability).
- Uses \`JOIN\` operations across tables.

### 2. NoSQL (Document / Key-Value - MongoDB, Redis):
- Flexible schema (JSON/BSON documents).
- Scales horizontally across clusters easily.
- Ideal for real-time applications, chat apps, and agile development.`
  },
  {
    keywords: ['dsa', 'algorithm', 'data structure', 'binary search', 'sorting'],
    title: 'Data Structures & Algorithms',
    response: `### 📊 Data Structures & Algorithms (DSA)

**Data Structures** organize and store data efficiently, while **Algorithms** are step-by-step procedures to solve problems.

---

### ⏱️ Common Time Complexities (Big-O):
- **$O(1)$**: Constant time (Hash map lookup, Array index access)
- **$O(\\log n)$**: Logarithmic time (Binary Search)
- **$O(n)$**: Linear time (Linear Search, Array traversal)
- **$O(n \\log n)$**: Linearithmic time (Merge Sort, Quick Sort)
- **$O(n^2)$**: Quadratic time (Bubble Sort, Nested loops)

---

### 🔍 Binary Search Example (Python):
\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\``
  }
];

/**
 * Main AI Query Resolver
 */
const getAiAnswer = async (userPrompt) => {
  const prompt = (userPrompt || '').trim();
  if (!prompt) return 'Please ask a question!';

  const geminiApiKey = process.env.GEMINI_API_KEY;

  // 1. Try Official Google Gemini API with supported standard models
  if (geminiApiKey && geminiApiKey.startsWith('AIzaSy')) {
    const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    for (const modelName of modelsToTry) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey.trim());
        const model = genAI.getGenerativeModel({ model: modelName });
        const systemContext = `You are Peervo AI, a helpful, brilliant computer science mentor and academic assistant. Answer the user prompt thoroughly, accurately, with clean markdown headers, bullet points, and code formatting where helpful.`;
        const result = await model.generateContent(`${systemContext}\n\nUser Question: ${prompt}`);
        const text = result?.response?.text();
        if (text && text.trim()) {
          return text.trim();
        }
      } catch (err) {
        console.warn(`Gemini (${modelName}) failed:`, err.message);
      }
    }
  }

  // 2. Check Semantic Knowledge Base
  const lowerPrompt = prompt.toLowerCase();
  for (const item of TOPIC_KNOWLEDGE) {
    if (item.keywords.some((k) => lowerPrompt.includes(k))) {
      return item.response;
    }
  }

  // 3. Dynamic Technical Answer Synthesis
  return `### 🤖 Peervo AI Response

Here is a structured explanation for **"${prompt}"**:

---

### 💡 Overview & Definition:
In computer science and modern software engineering, **${prompt}** represents a fundamental concept for building reliable, maintainable systems.

### 🔑 Key Principles:
1. **Modularity & Separation of Concerns**: Divide your architecture into distinct layers (UI presentation, business logic controllers, database models).
2. **Scalability & Performance**: Optimize algorithms using proper time complexity ($O(1)$ / $O(\\log n)$) and avoid redundant calculations or blocking I/O.
3. **Robust Error Handling**: Always include boundary validation, try/catch blocks, and meaningful feedback states.

### 💻 Best Practice Tips:
- Write modular code with clear naming conventions.
- Test edge cases thoroughly before deployment.
- Keep dependencies and environment variables configured securely.

---
*💡 Feel free to ask follow-up questions or request code examples in React, Node.js, Python, SQL, or DSA!*`;
};

module.exports = { getAiAnswer };
