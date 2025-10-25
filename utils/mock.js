// utils/mock.js
'use strict';

/**
 * 模拟数据生成工具
 */

/**
 * 生成模拟新闻数据
 * @param {number} count 数量
 * @param {string} category 分类
 * @returns {Array} 模拟新闻数据
 */
export function generateMockNews(count = 10, category = 'all') {
  const categories = ['domestic', 'international', 'technology', 'economy', 'sports', 'entertainment'];
  const sources = ['新华社', '人民日报', '央视新闻', '科技日报', '经济观察报', '体育周报', '娱乐周刊'];
  const authors = ['记者小王', '编辑小李', '通讯员小张', '特约记者小陈', '资深记者小刘'];
  
  const mockNews = [];
  
  for (let i = 0; i < count; i++) {
    const newsCategory = category === 'all' ? categories[Math.floor(Math.random() * categories.length)] : category;
    const source = sources[Math.floor(Math.random() * sources.length)];
    const author = authors[Math.floor(Math.random() * authors.length)];
    
    const news = {
      id: `mock_news_${Date.now()}_${i}`,
      title: generateMockTitle(newsCategory),
      content: generateMockContent(),
      summary: generateMockSummary(),
      image: generateMockImage(newsCategory),
      source: source,
      url: `https://example.com/news/${Date.now()}_${i}`,
      publishTime: generateMockTime(),
      category: newsCategory,
      author: author,
      description: generateMockDescription(),
      viewCount: Math.floor(Math.random() * 10000),
      likeCount: Math.floor(Math.random() * 1000),
      commentCount: Math.floor(Math.random() * 100),
      isHot: Math.random() > 0.8,
      tags: generateMockTags(newsCategory)
    };
    
    mockNews.push(news);
  }
  
  return mockNews;
}

/**
 * 生成模拟标题
 * @param {string} category 分类
 * @returns {string} 标题
 */
function generateMockTitle(category) {
  const titles = {
    domestic: [
      '国内重大政策发布，影响深远',
      '地方政府推出新举措，惠及民生',
      '国内经济发展取得新突破',
      '教育改革政策正式实施',
      '环保措施成效显著'
    ],
    international: [
      '国际局势出现新变化',
      '多国领导人会晤达成共识',
      '全球经济形势分析报告',
      '国际组织发布重要声明',
      '跨国合作项目正式启动'
    ],
    technology: [
      '人工智能技术取得重大突破',
      '5G网络建设加速推进',
      '新能源汽车技术革新',
      '区块链应用场景扩展',
      '量子计算研究新进展'
    ],
    economy: [
      '金融市场表现强劲',
      '企业财报数据亮眼',
      '投资市场迎来新机遇',
      '消费市场持续回暖',
      '就业形势稳中向好'
    ],
    sports: [
      '体育赛事精彩纷呈',
      '运动员表现优异',
      '体育产业蓬勃发展',
      '全民健身活动广泛开展',
      '体育文化交流深入'
    ],
    entertainment: [
      '影视作品获得好评',
      '音乐节活动成功举办',
      '文化创意产业发展',
      '明星公益活动受关注',
      '娱乐产业数字化转型'
    ]
  };
  
  const categoryTitles = titles[category] || titles.domestic;
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
}

/**
 * 生成模拟内容
 * @returns {string} 内容
 */
function generateMockContent() {
  const paragraphs = [
    '据最新报道，相关事件引起了社会各界的广泛关注。专家表示，这一发展具有重要意义，将对未来产生深远影响。',
    '分析人士认为，当前形势下的各种因素相互作用，形成了复杂的发展格局。需要各方共同努力，才能实现预期目标。',
    '从长远来看，这一趋势将持续发展，为相关领域带来新的机遇和挑战。相关部门正在密切关注事态发展。',
    '业内人士指出，随着技术的不断进步和政策的持续完善，相关行业将迎来新的发展机遇。',
    '专家建议，在推进相关工作的过程中，要充分考虑各种因素，确保措施的有效性和可持续性。'
  ];
  
  const content = paragraphs.slice(0, Math.floor(Math.random() * 3) + 2).join(' ');
  return content;
}

/**
 * 生成模拟摘要
 * @returns {string} 摘要
 */
function generateMockSummary() {
  const summaries = [
    '最新报道显示，相关事件发展迅速，各方反应积极。专家分析认为，这一趋势将持续发展。',
    '据权威机构发布的数据，当前形势总体向好，各项指标表现良好。预计未来将有更大发展空间。',
    '分析人士指出，相关政策的实施取得了显著成效，为后续发展奠定了坚实基础。',
    '专家表示，当前发展态势良好，各项措施正在有序推进，预期目标有望实现。',
    '最新数据显示，相关领域发展迅速，各项指标均超预期，未来发展前景广阔。'
  ];
  
  return summaries[Math.floor(Math.random() * summaries.length)];
}

/**
 * 生成模拟图片
 * @param {string} category 分类
 * @returns {string} 图片URL
 */
function generateMockImage(category) {
  const imageColors = {
    domestic: '007bff',
    international: '28a745',
    technology: '17a2b8',
    economy: 'ffc107',
    sports: 'dc3545',
    entertainment: '6f42c1'
  };
  
  const color = imageColors[category] || '007bff';
  const text = category.toUpperCase();
  
  return `https://via.placeholder.com/400x300/${color}/ffffff?text=${text}`;
}

/**
 * 生成模拟时间
 * @returns {string} 时间字符串
 */
function generateMockTime() {
  const now = new Date();
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  const mockTime = new Date(now.getTime() - randomHours * 60 * 60 * 1000 - randomMinutes * 60 * 1000);
  return mockTime.toISOString();
}

/**
 * 生成模拟描述
 * @returns {string} 描述
 */
function generateMockDescription() {
  const descriptions = [
    '详细报道相关事件的最新进展',
    '深入分析当前形势和发展趋势',
    '全面解读相关政策措施',
    '深度报道行业最新动态',
    '专业分析市场变化趋势'
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

/**
 * 生成模拟标签
 * @param {string} category 分类
 * @returns {Array} 标签数组
 */
function generateMockTags(category) {
  const tagMap = {
    domestic: ['国内', '政策', '民生', '发展'],
    international: ['国际', '外交', '合作', '交流'],
    technology: ['科技', '创新', '技术', '研发'],
    economy: ['经济', '金融', '市场', '投资'],
    sports: ['体育', '赛事', '运动', '健康'],
    entertainment: ['娱乐', '文化', '艺术', '创意']
  };
  
  const categoryTags = tagMap[category] || tagMap.domestic;
  const tagCount = Math.floor(Math.random() * 3) + 1;
  
  return categoryTags.slice(0, tagCount);
}

/**
 * 生成模拟用户数据
 * @param {number} count 数量
 * @returns {Array} 用户数据
 */
export function generateMockUsers(count = 5) {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const user = {
      id: `mock_user_${Date.now()}_${i}`,
      openid: `mock_openid_${i}`,
      nickName: `用户${i + 1}`,
      avatarUrl: `https://via.placeholder.com/100x100/007bff/ffffff?text=U${i + 1}`,
      gender: Math.random() > 0.5 ? 1 : 0,
      city: '北京',
      province: '北京',
      country: '中国',
      language: 'zh_CN',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(user);
  }
  
  return users;
}

/**
 * 生成模拟评论数据
 * @param {string} newsId 新闻ID
 * @param {number} count 数量
 * @returns {Array} 评论数据
 */
export function generateMockComments(newsId, count = 5) {
  const comments = [];
  const users = generateMockUsers(count);
  
  for (let i = 0; i < count; i++) {
    const comment = {
      id: `mock_comment_${Date.now()}_${i}`,
      newsId: newsId,
      userId: users[i].id,
      userInfo: {
        nickName: users[i].nickName,
        avatarUrl: users[i].avatarUrl
      },
      content: generateMockCommentContent(),
      likeCount: Math.floor(Math.random() * 50),
      replyCount: Math.floor(Math.random() * 10),
      isLiked: Math.random() > 0.5,
      isDeleted: false,
      createdAt: generateMockTime(),
      updatedAt: generateMockTime()
    };
    
    comments.push(comment);
  }
  
  return comments;
}

/**
 * 生成模拟评论内容
 * @returns {string} 评论内容
 */
function generateMockCommentContent() {
  const contents = [
    '这个新闻很有意思，值得关注！',
    '分析得很到位，学到了很多。',
    '希望相关部门能够重视这个问题。',
    '期待后续的详细报道。',
    '这个观点很有道理，支持！',
    '希望能有更多的相关信息。',
    '这个趋势值得持续关注。',
    '感谢分享，很有价值的内容。',
    '期待看到更多相关报道。',
    '这个分析很专业，受益匪浅。'
  ];
  
  return contents[Math.floor(Math.random() * contents.length)];
}

/**
 * 生成模拟热搜数据
 * @param {number} count 数量
 * @returns {Array} 热搜数据
 */
export function generateMockHotSearch(count = 10) {
  const hotSearch = [];
  
  for (let i = 0; i < count; i++) {
    const item = {
      id: `hot_${i + 1}`,
      keyword: generateMockKeyword(),
      desc: generateMockHotSearchDesc(),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      hot: i < 3,
      searchCount: Math.floor(Math.random() * 100000) + 10000
    };
    
    hotSearch.push(item);
  }
  
  return hotSearch;
}

/**
 * 生成模拟关键词
 * @returns {string} 关键词
 */
function generateMockKeyword() {
  const keywords = [
    '人工智能', '新能源汽车', '疫情防控', '教育改革', '环保政策',
    '经济发展', '科技创新', '体育赛事', '文化传承', '国际合作',
    '数字化转型', '绿色发展', '民生改善', '社会治理', '文化交流'
  ];
  
  return keywords[Math.floor(Math.random() * keywords.length)];
}

/**
 * 生成模拟热搜描述
 * @returns {string} 描述
 */
function generateMockHotSearchDesc() {
  const descs = [
    '相关话题引发广泛讨论',
    '最新进展备受关注',
    '专家分析认为影响深远',
    '社会各界反响热烈',
    '相关措施效果显著'
  ];
  
  return descs[Math.floor(Math.random() * descs.length)];
}

/**
 * 生成模拟专题数据
 * @param {number} count 数量
 * @returns {Array} 专题数据
 */
export function generateMockTopics(count = 6) {
  const topics = [];
  
  for (let i = 0; i < count; i++) {
    const topic = {
      id: `topic_${i + 1}`,
      title: generateMockTopicTitle(),
      description: generateMockTopicDescription(),
      image: `https://via.placeholder.com/400x300/007bff/ffffff?text=Topic${i + 1}`,
      newsCount: Math.floor(Math.random() * 50) + 10,
      viewCount: Math.floor(Math.random() * 10000) + 1000,
      isHot: i < 2,
      createdAt: generateMockTime(),
      updatedAt: generateMockTime()
    };
    
    topics.push(topic);
  }
  
  return topics;
}

/**
 * 生成模拟专题标题
 * @returns {string} 标题
 */
function generateMockTopicTitle() {
  const titles = [
    '科技创新', '经济发展', '教育改革', '环保政策', '体育赛事',
    '文化交流', '国际合作', '民生改善', '社会治理', '数字化转型'
  ];
  
  return titles[Math.floor(Math.random() * titles.length)];
}

/**
 * 生成模拟专题描述
 * @returns {string} 描述
 */
function generateMockTopicDescription() {
  const descriptions = [
    '深度解析相关领域的最新动态',
    '全面报道相关话题的发展趋势',
    '专业分析相关政策的实施效果',
    '深入探讨相关问题的解决方案',
    '详细解读相关措施的重要意义'
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

/**
 * 生成模拟统计数据
 * @returns {Object} 统计数据
 */
export function generateMockStats() {
  return {
    viewedCount: Math.floor(Math.random() * 1000) + 100,
    likedCount: Math.floor(Math.random() * 500) + 50,
    commentedCount: Math.floor(Math.random() * 200) + 20,
    collectedCount: Math.floor(Math.random() * 100) + 10,
    sharedCount: Math.floor(Math.random() * 300) + 30
  };
}
