export type CompanyQuestion = {
  id: string;
  question: string;
  answer: string;
  maxLength?: number | null;
};

// コンポーネント間で受け渡しされるUI表示用の企業データの型
export type CompanyViewData = {
  id: string;
  name: string;
  status: string;
  myPageUrl: string | null;
  deadline: string | null;
  applicationId: string | null;
};
