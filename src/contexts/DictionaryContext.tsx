import React, { createContext, useState, useContext } from 'react';

interface DictionaryContextType {
  skillCategories: string[];
  setSkillCategories: (cats: string[]) => void;
  scenarios: string[];
  setScenarios: (scens: string[]) => void;
  skillTags: string[];
  setSkillTags: (tags: string[]) => void;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

export const DictionaryProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [skillCategories, setSkillCategories] = useState(['数据接入技能', '核心调度技能', '产线作业技能', '产线质检技能', '自定义']);
  const [scenarios, setScenarios] = useState(['POI产线', 'AOI/楼栋产线', '道路产线', '地址产线', '位置画像产线']);
  const [skillTags, setSkillTags] = useState(['大模型', '空间计算', '数据处理', '自动化', '高频调用', '人工兜底', '核心能力', '质检', '作业']);

  return (
    <DictionaryContext.Provider value={{ skillCategories, setSkillCategories, scenarios, setScenarios, skillTags, setSkillTags }}>
      {children}
    </DictionaryContext.Provider>
  );
};

export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  if (!context) throw new Error('useDictionary must be used within DictionaryProvider');
  return context;
};
