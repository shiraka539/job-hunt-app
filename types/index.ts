export type CompanyQuestion = {
  id: string;
  question: string;
  answer: string;
  maxLength?: number | null;
};

export type InterviewQuestionJson = {
  id: string;
  title: string;
  conclusion: string;
  challenge: string;
  action: string;
  result: string;
  conclusionMaxLength: number | null;
  challengeMaxLength: number | null;
  actionMaxLength: number | null;
  resultMaxLength: number | null;
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
