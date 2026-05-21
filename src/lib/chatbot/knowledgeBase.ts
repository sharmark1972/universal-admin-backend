// Chatbot Knowledge Base - Trained on IJARCM site context
// This file contains all the knowledge the chatbot uses to answer questions

export interface KnowledgeEntry {
  keywords: string[];
  patterns: RegExp[];
  response: string;
  followUp?: string[];
  category: 'general' | 'submission' | 'review' | 'contact' | 'navigation' | 'publication' | 'faq';
}

export const siteInfo = {
  name: 'IJARCM',
  fullName: 'International Journal of Academic Research in Commerce and Management',
  alternativeName: 'International Journal of Research in Computer Applications and Management',
  issn: {
    print: '2455-0116',
    online: '2395-6410'
  },
  contact: {
    email: 'editor@ijarcm.com',
    phone: '+91 8562985629',
    address: 'Sharma Tower, 24, Dhawan Complex, Street No. 4, Vijay Nagar, Batala Road, Amritsar, Punjab, India - 143001'
  },
  social: {
    facebook: 'https://facebook.com/ijarcm',
    twitter: 'https://twitter.com/ijarcm',
    linkedin: 'https://linkedin.com/company/ijarcm'
  },
  description: 'A premier international journal dedicated to advancing knowledge in commerce and management through rigorous peer-reviewed research and global scholarly discourse.'
};

export const knowledgeBase: KnowledgeEntry[] = [
  // Greetings
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
    patterns: [/^(hi|hello|hey|greetings)/i, /good\s+(morning|afternoon|evening)/i],
    response: `Hello! Welcome to ${siteInfo.name} - ${siteInfo.fullName}. I'm here to help you with any questions about our journal, paper submissions, review process, or general inquiries. How can I assist you today?`,
    followUp: ['submit a paper', 'about the journal', 'contact information', 'submission guidelines'],
    category: 'general'
  },

  // About the Journal
  {
    keywords: ['about', 'what is', 'tell me about', 'ijarcm', 'journal', 'overview'],
    patterns: [/what\s+is\s+ijarcm/i, /tell\s+me\s+about/i, /about\s+(the\s+)?journal/i],
    response: `${siteInfo.name} (${siteInfo.fullName}) is a premier international academic journal. Our mission is to advance knowledge in commerce and management through the publication of high-quality, peer-reviewed research that addresses contemporary challenges and contributes to innovative solutions for business and society.\n\n📚 Our ISSN Numbers:\n• Print: ${siteInfo.issn.print}\n• Online: ${siteInfo.issn.online}\n\nWe feature rigorous double-blind peer review, global reach, and fast publication turnaround.`,
    followUp: ['submission guidelines', 'editorial board', 'impact factor'],
    category: 'general'
  },

  // Submission Process
  {
    keywords: ['submit', 'paper', 'manuscript', 'article', 'submission', 'upload', 'send paper'],
    patterns: [/how\s+(to|do\s+i)\s+submit/i, /submit\s+(a\s+)?(paper|manuscript|article)/i, /submission\s+process/i],
    response: `To submit your paper to ${siteInfo.name}, follow these steps:\n\n1️⃣ **Register/Login**: Create an account or log in to your existing account\n2️⃣ **Prepare Your Manuscript**: Follow our formatting guidelines\n3️⃣ **Submit Online**: Use our online submission portal at /submit\n4️⃣ **Track Status**: Monitor your submission through your dashboard\n\n📝 Quick Link: Visit /submit to start your submission!\n\nWould you like to know about our formatting requirements or review process?`,
    followUp: ['formatting guidelines', 'review process', 'publication timeline'],
    category: 'submission'
  },

  // Submission Guidelines
  {
    keywords: ['guidelines', 'formatting', 'format', 'requirements', 'template', 'rules'],
    patterns: [/submission\s+guidelines/i, /formatting\s+(requirements|guidelines)/i, /paper\s+format/i, /how\s+to\s+format/i],
    response: `Here are the key submission guidelines for ${siteInfo.name}:\n\n📋 **General Requirements:**\n• Original, unpublished research\n• English language\n• Properly formatted references\n• Clear abstract (150-300 words)\n\n📄 **Document Format:**\n• Microsoft Word (.doc/.docx) or PDF\n• A4 page size\n• 12pt Times New Roman font\n• 1.5 line spacing\n• 1-inch margins\n\n📊 **Structure:**\n• Title, Abstract, Keywords\n• Introduction\n• Literature Review\n• Methodology\n• Results & Discussion\n• Conclusion\n• References\n\n🔗 Visit /submission-guidelines for detailed information!`,
    followUp: ['submit paper', 'review process', 'word count limits'],
    category: 'submission'
  },

  // Review Process
  {
    keywords: ['review', 'peer review', 'review process', 'evaluation', 'blind review'],
    patterns: [/peer\s+review/i, /review\s+process/i, /how\s+(is|are)\s+(my\s+)?paper(s)?\s+reviewed/i],
    response: `${siteInfo.name} uses a rigorous **Double-Blind Peer Review** process:\n\n🔍 **Review Stages:**\n1. **Initial Screening**: Editor checks for scope and basic requirements\n2. **Plagiarism Check**: Originality verification\n3. **Peer Review**: 2-3 expert reviewers evaluate your paper\n4. **Decision**: Accept, Revise, or Reject\n5. **Revision** (if needed): Authors address reviewer comments\n6. **Final Decision**: Acceptance for publication\n\n⏱️ **Timeline:**\n• Initial decision: 2-3 weeks\n• Full review: 4-6 weeks\n• Publication after acceptance: 1-2 weeks\n\n🔗 Learn more at /peer-review-process`,
    followUp: ['submission guidelines', 'publication timeline', 'reviewer criteria'],
    category: 'review'
  },

  // Contact Information
  {
    keywords: ['contact', 'email', 'phone', 'address', 'reach', 'get in touch'],
    patterns: [/contact\s+(us|information)/i, /how\s+(to|can\s+i)\s+(contact|reach)/i, /email\s+address/i, /phone\s+number/i],
    response: `You can reach ${siteInfo.name} through:\n\n📧 **Email:** ${siteInfo.contact.email}\n📞 **Phone:** ${siteInfo.contact.phone}\n\n📍 **Address:**\n${siteInfo.contact.address}\n\n🌐 **Social Media:**\n• Facebook: facebook.com/ijarcm\n• Twitter: twitter.com/ijarcm\n• LinkedIn: linkedin.com/company/ijarcm\n\n🔗 Visit /contact for our contact form!`,
    followUp: ['submit paper', 'check submission status', 'general inquiry'],
    category: 'contact'
  },

  // Publication/Publication Fee
  {
    keywords: ['publication', 'fee', 'charge', 'cost', 'price', 'payment', 'publish'],
    patterns: [/publication\s+fee/i, /how\s+much\s+(does\s+it\s+)?cost/i, /payment/i, /charges?/i],
    response: `For information about publication fees at ${siteInfo.name}:\n\n💰 **Publication Process:**\n• Our journal maintains high academic standards\n• Fees may apply for processing and publication\n• Specific fee information is available upon acceptance\n\n📩 For detailed pricing, please:\n1. Check our submission guidelines at /submission-guidelines\n2. Contact us at ${siteInfo.contact.email}\n3. Visit /contact for inquiry\n\nWe're committed to making academic publishing accessible!`,
    followUp: ['submit paper', 'review process', 'contact us'],
    category: 'publication'
  },

  // Archives
  {
    keywords: ['archives', 'past issues', 'previous', 'back issues', 'old papers', 'published'],
    patterns: [/archives?/i, /past\s+issues/i, /previous\s+(issues|papers)/i, /published\s+papers/i],
    response: `Access our complete archive of published research:\n\n📚 **Archives Portal:**\nVisit /archives to browse all published issues and papers\n\n🔍 **What You'll Find:**\n• Complete back issues by volume and year\n• Searchable paper database\n• Download options for published papers\n• Citation information\n\n📖 **Browse by:**\n• Volume/Issue number\n• Year of publication\n• Category/Subject area\n• Author name\n\n🔗 Quick Link: /archives`,
    followUp: ['latest papers', 'search papers', 'download paper'],
    category: 'navigation'
  },

  // Editorial Board
  {
    keywords: ['editorial', 'board', 'editors', 'reviewers', 'team', 'committee'],
    patterns: [/editorial\s+board/i, /who\s+are\s+(the\s+)?editors/i, /review\s+committee/i],
    response: `Our Editorial Board comprises distinguished academics and professionals:\n\n👥 **Editorial Team:**\n• Chief Editor\n• Associate Editors\n• Section Editors\n• International Advisory Board\n\n🎓 **Our editors bring:**\n• Extensive research experience\n• Academic excellence\n• Industry expertise\n• Global perspective\n\n🔗 View our complete editorial board at /editorial-board`,
    followUp: ['about journal', 'review process', 'submit paper'],
    category: 'general'
  },

  // Impact Factor
  {
    keywords: ['impact', 'factor', 'ranking', 'indexing', 'citations'],
    patterns: [/impact\s+factor/i, /journal\s+ranking/i, /indexed\s+in/i, /citations?/i],
    response: `${siteInfo.name} Impact & Indexing Information:\n\n📊 **Impact Factor:**\nVisit /impact-factors for current impact factor information\n\n📑 **Indexing:**\nOur journal is indexed in multiple databases ensuring global visibility for your research\n\n🎯 **Benefits:**\n• Wide research visibility\n• Citation tracking\n• Academic recognition\n• Global accessibility\n\n🔗 View detailed information at /impact-factors`,
    followUp: ['submit paper', 'publication benefits', 'archives'],
    category: 'general'
  },

  // E-Books
  {
    keywords: ['ebook', 'e-book', 'books', 'publications', 'digital'],
    patterns: [/e-?books?/i, /digital\s+(publications?|books?)/i],
    response: `Explore our E-Books collection:\n\n📚 **E-Books Portal:**\nVisit /ebooks to browse our digital publication collection\n\n📖 **Features:**\n• Academic research compilations\n• Subject-specific collections\n• Easy download options\n• Digital format for convenience\n\n🔗 Quick Link: /ebooks`,
    followUp: ['archives', 'published papers', 'submit paper'],
    category: 'navigation'
  },

  // Help/Support
  {
    keywords: ['help', 'support', 'assistance', 'problem', 'issue', 'trouble'],
    patterns: [/help/i, /support/i, /need\s+assistance/i, /having\s+(a\s+)?problem/i],
    response: `We're here to help! Here's how to get support:\n\n🆘 **Help Resources:**\n• Visit /help for FAQs and guides\n• Check /submission-guidelines for submission help\n• Contact our support team\n\n📧 **Direct Support:**\nEmail: ${siteInfo.contact.email}\nPhone: ${siteInfo.contact.phone}\n\n🔗 **Useful Links:**\n• /help - Help Center\n• /contact - Contact Form\n• /submission-guidelines - Submission Help\n\nWhat specific help do you need?`,
    followUp: ['submission help', 'account issues', 'technical support'],
    category: 'faq'
  },

  // Status Check
  {
    keywords: ['status', 'track', 'check', 'my paper', 'submission status', 'where is'],
    patterns: [/check\s+(my\s+)?status/i, /track\s+(my\s+)?(paper|submission)/i, /submission\s+status/i, /where\s+is\s+my\s+(paper|submission)/i],
    response: `To check your submission status:\n\n📊 **Status Check Steps:**\n1. Log in to your account at /auth/signin\n2. Go to your Dashboard\n3. View all your submissions and their current status\n\n📋 **Status Types:**\n• Submitted - Received and being processed\n• Under Review - Being evaluated by reviewers\n• Revision Required - Needs modifications\n• Accepted - Ready for publication\n• Published - Live on our platform\n\n🔗 Quick Links:\n• /dashboard - Your submission dashboard\n• /auth/signin - Log in to your account`,
    followUp: ['review timeline', 'contact editor', 'revise paper'],
    category: 'submission'
  },

  // Register/Sign Up
  {
    keywords: ['register', 'sign up', 'create account', 'new account', 'registration'],
    patterns: [/register/i, /sign\s+up/i, /create\s+(an?\s+)?account/i, /new\s+account/i],
    response: `Create your ${siteInfo.name} account:\n\n📝 **Registration Steps:**\n1. Visit /auth/signup or click "Sign Up"\n2. Enter your details (name, email, institution)\n3. Create a secure password\n4. Verify your email address\n5. Complete your profile\n\n✅ **Account Benefits:**\n• Submit papers online\n• Track submission status\n• Access your publication history\n• Receive notifications\n\n🔗 Register now at /auth/signup`,
    followUp: ['submit paper', 'login help', 'forgot password'],
    category: 'general'
  },

  // Login
  {
    keywords: ['login', 'sign in', 'log in', 'access account'],
    patterns: [/log\s*in/i, /sign\s*in/i, /access\s+(my\s+)?account/i],
    response: `Log in to your ${siteInfo.name} account:\n\n🔐 **Login Steps:**\n1. Visit /auth/signin\n2. Enter your registered email\n3. Enter your password\n4. Click "Sign In"\n\n❓ **Having trouble?**\n• Forgot password? Use the "Forgot Password" link\n• New user? Register at /auth/signup\n• Need help? Contact ${siteInfo.contact.email}\n\n🔗 Login page: /auth/signin`,
    followUp: ['forgot password', 'register', 'dashboard'],
    category: 'general'
  },

  // Privacy/Terms
  {
    keywords: ['privacy', 'terms', 'policy', 'legal', 'copyright'],
    patterns: [/privacy\s+policy/i, /terms\s+(of\s+service|and\s+conditions)/i, /copyright/i, /legal/i],
    response: `Legal Information for ${siteInfo.name}:\n\n📜 **Our Policies:**\n• Privacy Policy: /privacy-policy\n• Terms of Service: /terms-of-service\n• Copyright: /copyright\n\n🔒 **We're Committed To:**\n• Protecting your personal data\n• Transparent practices\n• Academic integrity\n• Copyright protection\n\n🔗 Visit the respective pages for detailed information.`,
    followUp: ['contact us', 'submit paper', 'about journal'],
    category: 'general'
  },

  // Thank You/Bye
  {
    keywords: ['thank', 'thanks', 'bye', 'goodbye', 'see you', 'appreciate'],
    patterns: [/thank(s|\s+you)/i, /bye/i, /goodbye/i, /see\s+you/i],
    response: `You're welcome! Thank you for visiting ${siteInfo.name}. 🙏\n\nIf you have any more questions in the future, feel free to ask. We're always here to help!\n\n📧 Contact: ${siteInfo.contact.email}\n🌐 Website: ijarcm.com\n\nHave a great day! 🌟`,
    category: 'general'
  },

  // Certificate
  {
    keywords: ['certificate', 'publication certificate', 'proof', 'verification'],
    patterns: [/certificate/i, /publication\s+(proof|certificate)/i, /verify\s+(publication|paper)/i],
    response: `Publication Certificates at ${siteInfo.name}:\n\n📜 **Certificate Information:**\n• Authors receive publication certificates upon paper publication\n• Certificates include paper details, DOI, and publication date\n• Digital certificates are available through your dashboard\n\n✅ **Verification:**\nPublished papers can be verified at /verify\n\n🔗 Quick Links:\n• /dashboard - Access your certificates\n• /verify - Verify a publication`,
    followUp: ['submit paper', 'check status', 'download certificate'],
    category: 'publication'
  },

  // Default/Unknown
  {
    keywords: [],
    patterns: [/.*/],
    response: `I'm not sure I understand your question completely. Let me help you with common topics:\n\n📚 **Popular Topics:**\n• Submit a paper - /submit\n• Submission guidelines - /submission-guidelines\n• Check submission status - /dashboard\n• Contact us - /contact\n• Archives - /archives\n\nCould you please rephrase your question, or select one of the topics above?\n\n📧 For specific queries, email us at ${siteInfo.contact.email}`,
    followUp: ['submit paper', 'guidelines', 'contact', 'about'],
    category: 'faq'
  }
];

// Quick responses for common single-word queries
export const quickResponses: Record<string, string> = {
  'submit': 'Visit /submit to submit your paper. Need guidance? Ask me about submission guidelines!',
  'guidelines': 'Check /submission-guidelines for detailed formatting and submission requirements.',
  'contact': `Email: ${siteInfo.contact.email} | Phone: ${siteInfo.contact.phone}`,
  'archives': 'Browse all published papers at /archives',
  'login': 'Sign in at /auth/signin',
  'register': 'Create an account at /auth/signup',
  'help': 'Visit /help or ask me any question - I\'m here to assist!',
  'fee': 'For publication fees, contact us at ' + siteInfo.contact.email,
  'status': 'Track your submission at /dashboard after logging in.',
};

// Suggested questions for users
export const suggestedQuestions = [
  'How do I submit a paper?',
  'What are the submission guidelines?',
  'How does the peer review process work?',
  'How can I contact the journal?',
  'Where can I find published papers?',
  'What is the publication fee?'
];
