import config from '../config'
import chromaClient from '../database/chromaDB'
import geminiClient from '../utils/gemini'
import { GoogleGeminiEmbeddingFunction } from '@chroma-core/google-gemini'

// const embeddingFunction: IEmbeddingFunction = {
//   generate: async (texts: string[]) => {
//     if (!texts || texts.length === 0) return []
//     return embeddings.embedDocuments(texts)
//   }
// }

const embeddingFunction = async (content: any) => {
  return await geminiClient.models.embedContent({
    model: 'gemini-embedding-001',
    contents: content
  })
}

const embedder = new GoogleGeminiEmbeddingFunction({
  apiKey: config.chromadb.apiKey || ''
})

export const findSimilarDocuments = async (
  query: string,
  collectionName: string,
  nResults: number = 1
) => {
  const collection = await chromaClient.getCollection({
    name: collectionName,
    embeddingFunction: embedder
  })
  const results = await collection.query({
    queryTexts: [query],
    nResults: nResults
  })
  return results.documents[0]
}

export const getDataById = async (id: string) => {
  const collection = await chromaClient.getCollection({
    name: 'job_evaluation'
  })
  const result = await collection.get({
    ids: [id]
  })
  return result.documents[0] || ''
}

export const initChroma = async () => {
  return await chromaClient.getOrCreateCollection({
    name: 'job_evaluation',
    embeddingFunction: embedder
  })
}

const jobVacancy = `
    Product Engineer (Backend) 2025
    
    Rakamin is hiring a Product Engineer (Backend) to work on Rakamin. We're looking for dedicated engineers who write code they’re proud of and who are eager to keep scaling and improving complex systems, including those powered by AI.
    About the Job
    You'll be building new product features alongside a frontend engineer and product manager using our Agile methodology, as well as addressing issues to ensure our apps are robust and our codebase is clean. As a Product Engineer, you'll write clean, efficient code to enhance our product's codebase in meaningful ways.

    In addition to classic backend work, this role also touches on building AI-powered systems, where you’ll design and orchestrate how large language models (LLMs) integrate into Rakamin’s product ecosystem.

    Here are some real examples of the work in our team:
    - Collaborating with frontend engineers and 3rd parties to build robust backend solutions that support highly configurable platforms and cross-platform integration.
    - Developing and maintaining server-side logic for central database, ensuring high performance throughput and response time.
    - Designing and fine-tuning AI prompts that align with product requirements and user contexts.
    - Building LLM chaining flows, where the output from one model is reliably passed to and enriched by another.
    - Implementing Retrieval-Augmented Generation (RAG) by embedding and retrieving context from vector databases, then injecting it into AI prompts to improve accuracy and relevance.
    - Handling long-running AI processes gracefully — including job orchestration, async background workers, and retry mechanisms.
    - Designing safeguards for uncontrolled scenarios: managing failure cases from 3rd party APIs and mitigating the randomness/nondeterminism of LLM outputs.
    - Leveraging AI tools and workflows to increase team productivity (e.g., AI-assisted code generation, automated QA, internal bots).
    - Writing reusable, testable, and efficient code to improve the functionality of our existing systems.
    - Strengthening our test coverage with RSpec to build robust and reliable web apps.
    - Conducting full product lifecycles, from idea generation to design, implementation, testing, deployment, and maintenance.
    - Providing input on technical feasibility, timelines, and potential product trade-offs, working with business divisions.
    - Actively engaging with users and stakeholders to understand their needs and translate them into backend and AI-driven improvements.

    About You
    We are looking for candidates with a strong track record of working on backend technologies of web apps, ideally with exposure to AI/LLM development or a strong desire to learn.

    You should have experience with backend languages and frameworks (Node.js, Django, Rails), as well as modern backend tooling and technologies such as:
    - Database management (MySQL, PostgreSQL, MongoDB)
    - RESTful APIs
    - Security compliance
    - Cloud technologies (AWS, Google Cloud, Azure)
    - Server-side languages (Java, Python, Ruby, or JavaScript)
    - Understanding of frontend technologies
    - User authentication and authorization between multiple systems, servers, and environments
    - Scalable application design principles
    - Creating database schemas that represent and support business processes
    - Implementing automated testing platforms and unit tests
    - Familiarity with LLM APIs, embeddings, vector databases and prompt design best practices

    We're not big on credentials, so a Computer Science degree or graduating from a prestigious university isn't something we emphasize. We care about what you can do and how you do it, not how you got here.

    While you'll report to a CTO directly, Rakamin is a company where thrive. We're quick to trust that you can do it, and here to support you. You can expect to be counted on and do your best work and build a career here.

    Managers of One
    This is a remote job. You're free to work where you work best: home office, co-working space, coffee shops. To ensure time zone overlap with our current team and maintain well communication, we're only looking for people based in Indonesia.

    Benefits & Perks
    Our benefits support a life well-lived away from work. Ample time off and all the resources you need to support you in doing the best work of your career:
    - Paid time off: Rakamin offers 17 days of vacation and personal days. You can take a day off without any specific reason, whether you want to hang out, take a vacation, or just lay in bed.
    - Learning benefits with total Rp29 million per year:
        - Rp6 million per year to subscribe to courses, buy books, or any resources you need to boost your skills and knowledge.
        - O'Reilly subscription worth Rp8 million per year — We subscribe to O'Reilly for you so you can read the newest books, videos, conferences, and courses related to technology, data, design, business, and soft skills.
        - Access to all our learning module Bootcamps and Short Courses worth Rp15 million per year, so you can always upskill and reskill for a better life and career.
    - Device ownership: We provide a Rp7 million budget per year so you can purchase any device to support your productivity.
`
const scoring_rubric_cv = `
    CV Match Evaluation (1-5 scale per parameter)
        
    Parameter: Technical Skills Match (Weight: 40%)
    Description: Alignment with job requirements (backend, databases, APIs, cloud, AI/LLM).
    Scoring Guide:
    1 = Irrelevant skills
    2 = Few overlaps
    3 = Partial match
    4 = Strong match
    5 = Excellent match + AI/LLM exposure
        
    Parameter: Experience Level (Weight: 25%)
    Description: Years of experience and project complexity.
    Scoring Guide:
    1 = <1 yr / trivial projects
    2 = 1-2 yrs
    3 = 2-3 yrs with mid-scale projects
    4 = 3-4 yrs solid track record
    5 = 5+ yrs / high-impact projects
        
    Parameter: Relevant Achievements (Weight: 20%)
    Description: Impact of past work (scaling, performance, adoption).
    Scoring Guide:
    1 = No clear achievements
    2 = Minimal improvements
    3 = Some measurable outcomes
    4 = Significant contributions
    5 = Major measurable impact
        
    Parameter: Cultural / Collaboration Fit (Weight: 15%)
    Description: Communication, learning mindset, teamwork/leadership.
    Scoring Guide:
    1 = Not demonstrated
    2 = Minimal
    3 = Average
    4 = Good
    5 = Excellent and well-demonstrated
`
const scoring_rubric_project = `
    Project Deliverable Evaluation (1-5 scale per parameter)
                    
    Parameter: Correctness (Prompt & Chaining) (Weight: 30%)
    Description: Implements prompt design, LLM chaining, RAG context injection.
    Scoring Guide:
    1 = Not implemented
    2 = Minimal attempt
    3 = Works partially
    4 = Works correctly
    5 = Fully correct + thoughtful
                    
    Parameter: Code Quality & Structure (Weight: 25%)
    Description: Clean, modular, reusable, tested.
    Scoring Guide:
    1 = Poor
    2 = Some structure
    3 = Decent modularity
    4 = Good structure + some tests
    5 = Excellent quality + strong tests
                    
    Parameter: Resilience & Error Handling (Weight: 20%)
    Description: Handles long jobs, retries, randomness, API failures.
    Scoring Guide:
    1 = Missing
    2 = Minimal
    3 = Partial handling
    4 = Solid handling
    5 = Robust, production-ready
                    
    Parameter: Documentation & Explanation (Weight: 15%)
    Description: README clarity, setup instructions, trade-off explanations.
    Scoring Guide:
    1 = Missing
    2 = Minimal
    3 = Adequate
    4 = Clear
    5 = Excellent + insightful
                    
    Parameter: Creativity / Bonus (Weight: 10%)
    Description: Extra features beyond requirements.
    Scoring Guide:
    1 = None
    2 = Very basic
    3 = Useful extras
    4 = Strong enhancements
    5 = Outstanding creativity
`
export const insertDocs = async () => {
  const collection = await initChroma()
  await collection.add({
    ids: ['job_description', 'scoring_rubric_cv', 'scoring_rublic_project'],
    documents: [jobVacancy, scoring_rubric_cv, scoring_rubric_project],
    metadatas: [
      { type: 'job' },
      { type: 'scoring_rubric_cv' },
      { type: 'scoring_rublic_project' }
    ]
  })

  console.log('✅ Inserted to Chroma with embeddings')
}
