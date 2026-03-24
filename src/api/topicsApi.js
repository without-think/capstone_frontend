import { apiFetch } from './index';
import { TOPICS } from '../data/topics';

// API 카테고리명 → TOPICS id 매핑
const buildTopicsWithApiData = (categories) => {
  return TOPICS.map((topic) => {
    const apiSubTopics = categories[topic.title];
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
  const data = await apiFetch('/api/topics');
  return buildTopicsWithApiData(data.categories);
};
