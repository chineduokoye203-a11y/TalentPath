export interface UdemyOAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  obtained_at: number;
}

export interface UdemyCourse {
  id: number;
  title: string;
  url: string;
  headline: string;
  image_480x270: string;
  visible_instructors: { display_name: string }[];
  content_info: string;
  instructional_level: string;
  primary_category?: { title: string } | null;
  estimated_content_length: number;
}

export interface UdemyLearningPath {
  id: number;
  title: string;
  description: string;
  num_courses: number;
}

export interface UdemyListResponse<T> {
  results: T[];
  count: number;
  page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
}
