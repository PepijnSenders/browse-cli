import { describe, expect, test, beforeAll } from 'bun:test';
import { detectThreadIndicators, detectTweetType } from '../src/scrapers/twitter.js';
import { Window } from 'happy-dom';

// Setup DOM environment for tests
let window: Window;
let document: Document;

beforeAll(() => {
  window = new Window();
  document = window.document;
  global.document = document as any;
});

describe('detectThreadIndicators', () => {
  // Helper to create a mock article element
  const createMockArticle = (config: {
    hasShowThreadLink?: boolean;
    hasThreadCard?: boolean;
    hasShowMoreButton?: boolean;
  } = {}): Element => {
    const article = document.createElement('article');

    if (config.hasShowThreadLink) {
      const link = document.createElement('a');
      link.href = '/status/123';
      link.setAttribute('role', 'link');
      link.textContent = 'Show this thread';
      article.appendChild(link);
    }

    if (config.hasThreadCard) {
      const card = document.createElement('div');
      card.setAttribute('data-testid', 'card.layoutLarge.detail');
      article.appendChild(card);
    }

    if (config.hasShowMoreButton) {
      const tweetDiv = document.createElement('div');
      tweetDiv.setAttribute('data-testid', 'tweet');
      const button = document.createElement('button');
      button.setAttribute('role', 'button');
      button.textContent = 'Show more';
      tweetDiv.appendChild(button);
      article.appendChild(tweetDiv);
    }

    return article;
  };

  describe('text pattern detection', () => {
    test('detects numbered thread patterns with slash', () => {
      const article = createMockArticle();
      expect(detectThreadIndicators('1/5 This is the first tweet', article)).toBe(true);
      expect(detectThreadIndicators('2/10 Continuing the thread', article)).toBe(true);
      expect(detectThreadIndicators('15/20 Still going', article)).toBe(true);
    });

    test('detects numbered thread patterns with dot', () => {
      const article = createMockArticle();
      expect(detectThreadIndicators('1.5 This is the first tweet', article)).toBe(true);
      expect(detectThreadIndicators('2.3 Continuing', article)).toBe(true);
    });

    test('detects standalone numbered threads', () => {
      const article = createMockArticle();
      expect(detectThreadIndicators('1/ This is the start', article)).toBe(true);
      expect(detectThreadIndicators('2/ Next tweet', article)).toBe(true);
    });

    test('detects parenthesized thread numbers', () => {
      const article = createMockArticle();
      expect(detectThreadIndicators('(1/5) First tweet', article)).toBe(true);
      expect(detectThreadIndicators('(2.3) Second tweet', article)).toBe(true);
    });

    test('detects thread keyword', () => {
      const article = createMockArticle();
      expect(detectThreadIndicators('Thread: Important announcement', article)).toBe(true);
      expect(detectThreadIndicators('THREAD: Breaking news', article)).toBe(true);
      expect(detectThreadIndicators('thread: lowercase works too', article)).toBe(true);
    });

    test('detects thread emoji', () => {
      const article = createMockArticle();
      expect(detectThreadIndicators('🧵 A thread about something', article)).toBe(true);
      expect(detectThreadIndicators('Important topic 🧵', article)).toBe(true);
    });

    test('does not detect non-thread patterns', () => {
      const article = createMockArticle();
      expect(detectThreadIndicators('Regular tweet without thread indicators', article)).toBe(false);
      expect(detectThreadIndicators('Random numbers 123 456', article)).toBe(false);
      expect(detectThreadIndicators('Just a normal tweet', article)).toBe(false);
    });

    test('trims text before pattern matching', () => {
      const article = createMockArticle();
      expect(detectThreadIndicators('  1/5 Tweet with leading spaces', article)).toBe(true);
      expect(detectThreadIndicators('\n1/5 Tweet with newline', article)).toBe(true);
    });
  });

  describe('DOM element detection', () => {
    test('detects "Show this thread" link', () => {
      const article = createMockArticle({ hasShowThreadLink: true });
      expect(detectThreadIndicators('Regular text', article)).toBe(true);
    });

    test('detects thread card element', () => {
      const article = createMockArticle({ hasThreadCard: true });
      expect(detectThreadIndicators('Regular text', article)).toBe(true);
    });

    test('detects "Show more" button', () => {
      const article = createMockArticle({ hasShowMoreButton: true });
      expect(detectThreadIndicators('Regular text', article)).toBe(true);
    });

    test('detects multiple DOM indicators', () => {
      const article = createMockArticle({
        hasShowThreadLink: true,
        hasThreadCard: true
      });
      expect(detectThreadIndicators('Regular text', article)).toBe(true);
    });

    test('returns false when no indicators present', () => {
      const article = createMockArticle();
      expect(detectThreadIndicators('Regular text', article)).toBe(false);
    });
  });

  describe('combined detection', () => {
    test('detects thread with both text pattern and DOM element', () => {
      const article = createMockArticle({ hasShowThreadLink: true });
      expect(detectThreadIndicators('1/5 First tweet', article)).toBe(true);
    });

    test('prioritizes any positive indicator', () => {
      const article = createMockArticle({ hasThreadCard: true });
      expect(detectThreadIndicators('Not a thread text pattern', article)).toBe(true);
    });
  });
});

describe('detectTweetType', () => {
  // Helper to create a mock article with various configurations
  const createArticleWithContent = (config: {
    hasRetweet?: boolean;
    replyingTo?: string;
    hasThreadIndicators?: boolean;
    tweetText?: string;
  } = {}): Element => {
    const article = document.createElement('article');

    if (config.hasRetweet) {
      const socialContext = document.createElement('div');
      socialContext.setAttribute('data-testid', 'socialContext');
      socialContext.textContent = 'User reposted';
      article.appendChild(socialContext);
    }

    if (config.replyingTo) {
      const tweetContent = document.createElement('div');
      tweetContent.setAttribute('data-testid', 'tweet');
      tweetContent.textContent = `Replying to @${config.replyingTo}`;
      article.appendChild(tweetContent);
    }

    if (config.hasThreadIndicators) {
      const link = document.createElement('a');
      link.href = '/status/123';
      link.setAttribute('role', 'link');
      link.textContent = 'Show this thread';
      article.appendChild(link);
    }

    return article;
  };

  describe('retweet detection', () => {
    test('detects retweets', () => {
      const article = createArticleWithContent({ hasRetweet: true });
      expect(detectTweetType(article, '', '')).toBe('retweet');
    });

    test('prioritizes retweet over other indicators', () => {
      const article = createArticleWithContent({
        hasRetweet: true,
        replyingTo: 'user'
      });
      expect(detectTweetType(article, '', '')).toBe('retweet');
    });
  });

  describe('reply detection', () => {
    test('detects reply to another user', () => {
      const article = createArticleWithContent({ replyingTo: 'someoneelse' });
      expect(detectTweetType(article, '', 'myusername')).toBe('reply');
    });

    test('distinguishes reply from thread (different users)', () => {
      const article = createArticleWithContent({ replyingTo: 'differentuser' });
      expect(detectTweetType(article, '1/5 Thread text', 'myusername')).toBe('reply');
    });
  });

  describe('thread detection', () => {
    test('detects self-reply as thread', () => {
      const article = createArticleWithContent({ replyingTo: 'myusername' });
      expect(detectTweetType(article, '', 'myusername')).toBe('thread');
    });

    test('detects self-reply with thread indicators', () => {
      const article = createArticleWithContent({
        replyingTo: 'myusername',
        hasThreadIndicators: true
      });
      expect(detectTweetType(article, '1/5 Continuing thread', 'myusername')).toBe('thread');
    });

    test('detects original tweet with thread pattern', () => {
      const article = createArticleWithContent({ hasThreadIndicators: true });
      expect(detectTweetType(article, '1/10 Starting a thread', '')).toBe('thread');
    });

    test('detects thread emoji in original tweet', () => {
      const article = document.createElement('article');
      expect(detectTweetType(article, '🧵 Thread about AI', '')).toBe('thread');
    });

    test('detects thread keyword in original tweet', () => {
      const article = document.createElement('article');
      expect(detectTweetType(article, 'Thread: Important updates', '')).toBe('thread');
    });
  });

  describe('original tweet detection', () => {
    test('detects original tweet without indicators', () => {
      const article = document.createElement('article');
      expect(detectTweetType(article, 'Just a regular tweet', '')).toBe('original');
    });

    test('returns original for empty inputs', () => {
      const article = document.createElement('article');
      expect(detectTweetType(article, '', '')).toBe('original');
    });
  });

  describe('edge cases', () => {
    test('handles missing username in reply detection', () => {
      const article = document.createElement('article');
      const tweetContent = document.createElement('div');
      tweetContent.setAttribute('data-testid', 'tweet');
      tweetContent.textContent = 'Replying to';
      article.appendChild(tweetContent);

      expect(detectTweetType(article, '', 'myusername')).toBe('reply');
    });

    test('handles empty author username', () => {
      const article = createArticleWithContent({ replyingTo: 'someone' });
      expect(detectTweetType(article, '', '')).toBe('reply');
    });

    test('handles special characters in username', () => {
      const article = createArticleWithContent({ replyingTo: 'user_name_123' });
      expect(detectTweetType(article, '', 'user_name_123')).toBe('thread');
    });
  });

  describe('type hierarchy', () => {
    test('retweet takes precedence over all', () => {
      const article = createArticleWithContent({
        hasRetweet: true,
        replyingTo: 'myusername',
        hasThreadIndicators: true
      });
      expect(detectTweetType(article, '1/5 Thread', 'myusername')).toBe('retweet');
    });

    test('self-reply (thread) takes precedence over reply', () => {
      const article = createArticleWithContent({ replyingTo: 'myusername' });
      expect(detectTweetType(article, '', 'myusername')).toBe('thread');
    });

    test('thread indicators apply to original tweets', () => {
      const article = document.createElement('article');
      expect(detectTweetType(article, '1/5 Starting thread', 'user')).toBe('thread');
    });
  });
});

describe('thread detection integration', () => {
  test('complete thread scenario with multiple tweets', () => {
    // First tweet in thread (original with thread indicator)
    const tweet1 = document.createElement('article');
    expect(detectTweetType(tweet1, '1/3 Starting a thread about AI', 'alice')).toBe('thread');

    // Second tweet in thread (self-reply)
    const tweet2Article = document.createElement('article');
    const tweet2Content = document.createElement('div');
    tweet2Content.setAttribute('data-testid', 'tweet');
    tweet2Content.textContent = 'Replying to @alice';
    tweet2Article.appendChild(tweet2Content);
    expect(detectTweetType(tweet2Article, '2/3 Continuing...', 'alice')).toBe('thread');

    // Third tweet in thread (self-reply with thread indicator)
    const tweet3Article = document.createElement('article');
    const tweet3Content = document.createElement('div');
    tweet3Content.setAttribute('data-testid', 'tweet');
    tweet3Content.textContent = 'Replying to @alice';
    tweet3Article.appendChild(tweet3Content);
    expect(detectTweetType(tweet3Article, '3/3 Final thought', 'alice')).toBe('thread');

    // Someone else's reply (not a thread)
    const replyArticle = document.createElement('article');
    const replyContent = document.createElement('div');
    replyContent.setAttribute('data-testid', 'tweet');
    replyContent.textContent = 'Replying to @alice';
    replyArticle.appendChild(replyContent);
    expect(detectTweetType(replyArticle, 'Great thread!', 'bob')).toBe('reply');
  });
});
