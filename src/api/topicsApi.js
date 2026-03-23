import { apiFetch } from './index';
import { TOPICS } from '../data/topics'; //일단 로컬 데이터 불러오고 서버값으로 교체

// API 카테고리명 → TOPICS id 매핑
const buildTopicsWithApiData = (categories) => {
  return TOPICS.map((topic) => {
    const apiSubTopics = categories[topic.title];  //벡엔드에서 topic.title 로 변수명이 지정되어있어야 함
    if (!apiSubTopics) return topic;
    return {
      ...topic,
      subTopics: apiSubTopics.map(({ title, description, pro, con, sources }) => ({
        title,
        description,
        pro,
        con,
        sources,
      })),
    };
  });
};

export const fetchTodayTopics = async () => {
  const data = await apiFetch('/api/topics/today');
  return buildTopicsWithApiData(data.categories);
};
