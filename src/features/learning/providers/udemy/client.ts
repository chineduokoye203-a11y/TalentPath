import type { UdemyCourse, UdemyLearningPath, UdemyListResponse } from "./types";

const MOCK_COURSES: UdemyCourse[] = [
  {
    id: 101,
    title: "The Complete Web Development Bootcamp",
    url: "https://udemy.com/course/the-complete-web-development-bootcamp",
    headline: "Become a full-stack web developer with just one course. HTML, CSS, JavaScript, Node, React, PostgreSQL, Web3 and DApps",
    image_480x270: "https://placehold.co/480x270/E8E0D8/6B5B4F?text=Web+Dev",
    visible_instructors: [{ display_name: "Dr. Angela Yu" }],
    content_info: "63.5 hours total",
    instructional_level: "All Levels",
    primary_category: { title: "Development" },
    estimated_content_length: 228600,
  },
  {
    id: 102,
    title: "React - The Complete Guide (Incl. Next.js, Redux)",
    url: "https://udemy.com/course/react-the-complete-guide-incl-redux-router-detailed-instruction",
    headline: "Dive in and learn React.js from scratch! Learn Reactjs, Next.js, Redux, React Router, Next.js, and more",
    image_480x270: "https://placehold.co/480x270/D8E8E0/4F6B5B?text=React",
    visible_instructors: [{ display_name: "Maximilian Schwarzmuller" }],
    content_info: "68.5 hours total",
    instructional_level: "All Levels",
    primary_category: { title: "Development" },
    estimated_content_length: 246600,
  },
  {
    id: 103,
    title: "TypeScript for Professionals",
    url: "https://udemy.com/course/typescript-for-professionals",
    headline: "The complete guide to TypeScript. Learn from scratch and build modern applications with TypeScript",
    image_480x270: "https://placehold.co/480x270/D8D8E8/4F4F6B?text=TypeScript",
    visible_instructors: [{ display_name: "Basarat Syed" }],
    content_info: "12 hours total",
    instructional_level: "Intermediate",
    primary_category: { title: "Development" },
    estimated_content_length: 43200,
  },
  {
    id: 104,
    title: "Leadership and Management Skills 2024",
    url: "https://udemy.com/course/1009-leadership-and-management-skills",
    headline: "Learn how to be a successful manager and leader. Master communication, delegation, and performance management",
    image_480x270: "https://placehold.co/480x270/E8D8D8/6B4F4F?text=Leadership",
    visible_instructors: [{ display_name: "Chris Croft" }],
    content_info: "9.5 hours total",
    instructional_level: "Beginner",
    primary_category: { title: "Business" },
    estimated_content_length: 34200,
  },
  {
    id: 105,
    title: "Python for Data Science and Machine Learning",
    url: "https://udemy.com/course/python-for-data-science-and-machine-learning-bootcamp",
    headline: "Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Scikit-Learn, Machine Learning, and more",
    image_480x270: "https://placehold.co/480x270/D8E8D8/4F6B4F?text=Python",
    visible_instructors: [{ display_name: "Jose Portilla" }],
    content_info: "25 hours total",
    instructional_level: "All Levels",
    primary_category: { title: "Data Science" },
    estimated_content_length: 90000,
  },
  {
    id: 106,
    title: "AWS Certified Solutions Architect Associate",
    url: "https://udemy.com/course/aws-certified-solutions-architect-associate-saa-c03",
    headline: "Master AWS Solutions Architect and pass the SAA-C03 certification exam with hands-on labs and real-world scenarios",
    image_480x270: "https://placehold.co/480x270/E8E0D8/5B5B4F?text=AWS",
    visible_instructors: [{ display_name: "Stephane Maarek" }],
    content_info: "27 hours total",
    instructional_level: "Intermediate",
    primary_category: { title: "Cloud Computing" },
    estimated_content_length: 97200,
  },
  {
    id: 107,
    title: "The Complete Communication Skills Masterclass",
    url: "https://udemy.com/course/ultimate-conversation-skills",
    headline: "Build effective communication skills for career success. Master public speaking, negotiation, and conflict resolution",
    image_480x270: "https://placehold.co/480x270/D8E0E8/4F5B6B?text=Communication",
    visible_instructors: [{ display_name: "TJ Walker" }],
    content_info: "18 hours total",
    instructional_level: "All Levels",
    primary_category: { title: "Personal Development" },
    estimated_content_length: 64800,
  },
  {
    id: 108,
    title: "Docker and Kubernetes: The Complete Guide",
    url: "https://udemy.com/course/docker-and-kubernetes-the-complete-guide",
    headline: "Build, test, and deploy Docker applications with Kubernetes while learning production-grade container deployment",
    image_480x270: "https://placehold.co/480x270/E0E8D8/5B6B4F?text=Docker",
    visible_instructors: [{ display_name: "Stephen Grider" }],
    content_info: "23 hours total",
    instructional_level: "All Levels",
    primary_category: { title: "Development" },
    estimated_content_length: 82800,
  },
  {
    id: 109,
    title: "Strategic Thinking and Problem Solving",
    url: "https://udemy.com/course/strategic-thinking-and-problem-solving",
    headline: "Develop critical thinking skills and strategic problem-solving abilities for business leadership",
    image_480x270: "https://placehold.co/480x270/E8D8E0/6B4F5B?text=Strategy",
    visible_instructors: [{ display_name: "Prof. Chris Haroun" }],
    content_info: "8 hours total",
    instructional_level: "Beginner",
    primary_category: { title: "Business" },
    estimated_content_length: 28800,
  },
  {
    id: 110,
    title: "SQL and PostgreSQL: The Complete Developer's Guide",
    url: "https://udemy.com/course/sql-and-postgresql-the-complete-developers-guide",
    headline: "Master SQL and PostgreSQL by building real-world applications. From fundamentals to advanced queries",
    image_480x270: "https://placehold.co/480x270/D8E0D8/4F5B4F?text=SQL",
    visible_instructors: [{ display_name: "Stephen Grider" }],
    content_info: "15 hours total",
    instructional_level: "All Levels",
    primary_category: { title: "Development" },
    estimated_content_length: 54000,
  },
  {
    id: 111,
    title: "Product Management Masterclass",
    url: "https://udemy.com/course/product-management-masterclass",
    headline: "Learn product management from a top PM. Master roadmap planning, user research, and product strategy",
    image_480x270: "https://placehold.co/480x270/E0D8E8/5B4F6B?text=Product+Mgmt",
    visible_instructors: [{ display_name: "Cole Mercer" }],
    content_info: "11 hours total",
    instructional_level: "Beginner",
    primary_category: { title: "Business" },
    estimated_content_length: 39600,
  },
  {
    id: 112,
    title: "Advanced CSS and Sass: Flexbox, Grid, Animations",
    url: "https://udemy.com/course/advanced-css-and-sass",
    headline: "The most advanced and modern CSS course on the internet. Master flexbox, CSS Grid, animations, and more",
    image_480x270: "https://placehold.co/480x270/D8E8E8/4F6B6B?text=CSS+Sass",
    visible_instructors: [{ display_name: "Jonas Schmedtmann" }],
    content_info: "28 hours total",
    instructional_level: "Advanced",
    primary_category: { title: "Development" },
    estimated_content_length: 100800,
  },
];

const MOCK_LEARNING_PATHS: UdemyLearningPath[] = [
  {
    id: 1,
    title: "Full-Stack Web Developer",
    description: "Master modern web development from frontend to backend with HTML, CSS, JavaScript, React, Node.js, and databases",
    num_courses: 12,
  },
  {
    id: 2,
    title: "Data Science and Analytics",
    description: "Build expertise in data analysis, machine learning, and visualization using Python, SQL, and modern tools",
    num_courses: 10,
  },
  {
    id: 3,
    title: "Cloud and DevOps Engineering",
    description: "Learn cloud infrastructure, containerization, CI/CD, and deployment with AWS, Docker, and Kubernetes",
    num_courses: 8,
  },
  {
    id: 4,
    title: "Leadership and Management",
    description: "Develop essential leadership, communication, and management skills for effective team leadership",
    num_courses: 9,
  },
];

interface ClientConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

export class UdemyClient {
  private readonly baseUrl: string;
  private readonly useMock: boolean;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl;
    this.useMock = !config.clientId || config.clientId.startsWith("mock_");
  }

  async searchCourses(params: {
    search?: string;
    page?: string;
    page_size?: string;
    category?: string;
  }): Promise<UdemyListResponse<UdemyCourse>> {
    if (this.useMock) {
      return this.mockSearchCourses(params);
    }
    return this.realSearchCourses(params);
  }

  async getCourse(courseId: number): Promise<UdemyCourse> {
    if (this.useMock) {
      const course = MOCK_COURSES.find((c) => c.id === courseId);
      if (!course) throw new Error(`Course ${courseId} not found`);
      return course;
    }
    return this.realGetCourse(courseId);
  }

  async getLearningPaths(): Promise<UdemyListResponse<UdemyLearningPath>> {
    if (this.useMock) {
      return {
        results: MOCK_LEARNING_PATHS,
        count: MOCK_LEARNING_PATHS.length,
        page: 1,
        page_size: 100,
        next: null,
        previous: null,
      };
    }
    return this.realGetLearningPaths();
  }

  async getLearningPathCourses(pathId: number): Promise<UdemyListResponse<UdemyCourse>> {
    if (this.useMock) {
      const start = (pathId - 1) * 3;
      const courses = MOCK_COURSES.slice(start, start + 3);
      return {
        results: courses,
        count: courses.length,
        page: 1,
        page_size: 100,
        next: null,
        previous: null,
      };
    }
    return this.realGetLearningPathCourses(pathId);
  }

  private async mockSearchCourses(params: {
    search?: string;
    page?: string;
    page_size?: string;
    category?: string;
  }): Promise<UdemyListResponse<UdemyCourse>> {
    let filtered = [...MOCK_COURSES];

    if (params.search) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.headline.toLowerCase().includes(query) ||
          c.primary_category?.title.toLowerCase().includes(query),
      );
    }

    if (params.category) {
      filtered = filtered.filter(
        (c) => c.primary_category?.title.toLowerCase() === params.category!.toLowerCase(),
      );
    }

    const page = Number(params.page ?? 1);
    const pageSize = Number(params.page_size ?? 20);
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return {
      results: paged,
      count: filtered.length,
      page,
      page_size: pageSize,
      next: start + pageSize < filtered.length ? `/courses/?page=${page + 1}` : null,
      previous: page > 1 ? `/courses/?page=${page - 1}` : null,
    };
  }

  private async realSearchCourses(params: {
    search?: string;
    page?: string;
    page_size?: string;
    category?: string;
  }): Promise<UdemyListResponse<UdemyCourse>> {
    const searchParams = new URLSearchParams({
      page_size: params.page_size ?? "20",
      page: params.page ?? "1",
    });
    if (params.search) searchParams.set("search", params.search);
    if (params.category) searchParams.set("category", params.category);

    const response = await fetch(`${this.baseUrl}/courses/?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${process.env.UDEMY_CLIENT_ID}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Udemy API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async realGetCourse(courseId: number): Promise<UdemyCourse> {
    const response = await fetch(`${this.baseUrl}/courses/${courseId}/`, {
      headers: {
        Authorization: `Bearer ${process.env.UDEMY_CLIENT_ID}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Udemy API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async realGetLearningPaths(): Promise<UdemyListResponse<UdemyLearningPath>> {
    const response = await fetch(`${this.baseUrl}/learning-paths/`, {
      headers: {
        Authorization: `Bearer ${process.env.UDEMY_CLIENT_ID}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Udemy API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async realGetLearningPathCourses(pathId: number): Promise<UdemyListResponse<UdemyCourse>> {
    const response = await fetch(`${this.baseUrl}/learning-paths/${pathId}/courses/`, {
      headers: {
        Authorization: `Bearer ${process.env.UDEMY_CLIENT_ID}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Udemy API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export function createUdemyClient(): UdemyClient {
  return new UdemyClient({
    baseUrl: process.env.UDEMY_API_BASE_URL ?? "https://talentpath.udemy.com/api-2.0",
    clientId: process.env.UDEMY_CLIENT_ID ?? "",
    clientSecret: process.env.UDEMY_CLIENT_SECRET ?? "",
  });
}
