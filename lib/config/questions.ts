import { QuestionSection, Question } from '@/types';

export const QUICK_SCAN_SECTIONS: QuestionSection[] = [
  {
    id: 'booked_calls',
    title: 'Booked Calls',
    description: 'How many sales calls or appointments were scheduled last month?',
    questions: [
      {
        key: 'booked_calls',
        label: 'Booked calls last month',
        type: 'number',
        required: true,
        help_text: 'Scheduled sales conversations — calls, demos, consultations.',
        min: 0,
        max: 10000,
        unknown_option: true,
      },
    ],
  },
  {
    id: 'show_rate',
    title: 'Show Rate',
    description: 'What percentage of booked calls actually showed up?',
    questions: [
      {
        key: 'show_rate',
        label: 'Show rate',
        type: 'percentage',
        suffix: '%',
        required: true,
        help_text: 'Out of 100 booked calls, how many actually attend?',
        min: 0,
        max: 100,
        unknown_option: true,
      },
    ],
  },
  {
    id: 'close_rate',
    title: 'Close Rate',
    description: 'What percentage of people who showed up became customers?',
    questions: [
      {
        key: 'close_rate',
        label: 'Close rate',
        type: 'percentage',
        suffix: '%',
        required: true,
        help_text: 'Out of 100 calls that showed, how many bought?',
        min: 0,
        max: 100,
        unknown_option: true,
      },
    ],
  },
  {
    id: 'sales_ownership',
    title: 'Sales Ownership',
    description: 'Who handles your sales conversations?',
    questions: [
      {
        key: 'sales_ownership',
        label: 'Who does sales?',
        type: 'select',
        required: true,
        options: [
          { label: 'I do all sales myself', value: 'founder_led' },
          { label: 'One dedicated closer', value: 'one_closer' },
          { label: 'I have a sales team', value: 'sales_team' },
          { label: 'No one consistently', value: 'no_one' },
        ],
        unknown_option: false,
      },
    ],
  },
  {
    id: 'revenue',
    title: 'Monthly Revenue',
    description: 'What is your total monthly revenue right now?',
    questions: [
      {
        key: 'monthly_revenue',
        label: 'Monthly revenue',
        type: 'currency',
        prefix: '$',
        required: true,
        help_text: 'Total revenue from the last 30 days.',
        min: 0,
        max: 10000000,
        unknown_option: true,
      },
    ],
  },
  {
    id: 'aov',
    title: 'Average Order Value',
    description: 'What is the average amount a customer pays?',
    questions: [
      {
        key: 'aov',
        label: 'Average order value',
        type: 'currency',
        prefix: '$',
        required: true,
        help_text: 'Total revenue ÷ number of customers.',
        min: 0,
        max: 1000000,
        unknown_option: true,
      },
    ],
  },
  {
    id: 'target',
    title: 'Revenue Target',
    description: 'What is your monthly revenue target?',
    questions: [
      {
        key: 'revenue_target',
        label: 'Target monthly revenue',
        type: 'currency',
        prefix: '$',
        required: true,
        help_text: 'Where you want to be in the next 3-6 months.',
        min: 0,
        max: 10000000,
        unknown_option: true,
      },
    ],
  },
];

export const DEEP_SCAN_SECTIONS: QuestionSection[] = [
  ...QUICK_SCAN_SECTIONS.slice(0, 1), // booked_calls stays
  {
    id: 'show_count',
    title: 'Shows',
    description: 'How many booked calls actually showed up?',
    questions: [
      {
        key: 'show_count',
        label: 'Calls that showed up',
        type: 'number',
        required: true,
        help_text: 'Of the calls you booked, how many attended?',
        min: 0,
        max: 10000,
        unknown_option: true,
      },
    ],
  },
  {
    id: 'close_count',
    title: 'Closes',
    description: 'How many people who showed up became customers?',
    questions: [
      {
        key: 'close_count',
        label: 'People who became customers',
        type: 'number',
        required: true,
        help_text: 'Of the calls that showed, how many bought?',
        min: 0,
        max: 10000,
        unknown_option: true,
      },
    ],
  },
  ...QUICK_SCAN_SECTIONS.slice(3), // sales_ownership, revenue, aov, target
  {
    id: 'leads',
    title: 'Lead Volume',
    description: 'How many new leads do you get per month?',
    questions: [
      {
        key: 'monthly_leads',
        label: 'Leads per month',
        type: 'number',
        required: true,
        help_text: 'New people entering your pipeline each month.',
        min: 0,
        max: 1000000,
        unknown_option: true,
      },
    ],
  },
  {
    id: 'team_size',
    title: 'Team Size',
    description: 'How many people are on your sales team?',
    questions: [
      {
        key: 'team_size',
        label: 'Sales team members',
        type: 'number',
        required: true,
        help_text: 'Include yourself if you do sales.',
        min: 1,
        max: 1000,
        unknown_option: true,
      },
    ],
  },
  {
    id: 'niche',
    title: 'Industry',
    description: 'What industry or niche are you in?',
    questions: [
      {
        key: 'niche',
        label: 'Your niche',
        type: 'select',
        required: true,
        options: [
          { label: 'Coaching', value: 'coaching' },
          { label: 'Courses / Info Products', value: 'courses' },
          { label: 'Consulting', value: 'consulting' },
          { label: 'Services / Agency', value: 'services' },
          { label: 'SaaS / Software', value: 'saas' },
          { label: 'E-commerce', value: 'ecommerce' },
          { label: 'Other', value: 'other' },
        ],
        unknown_option: true,
      },
    ],
  },
  {
    id: 'years_in_business',
    title: 'Experience',
    description: 'How long have you been in business?',
    questions: [
      {
        key: 'years_in_business',
        label: 'Years in business',
        type: 'number',
        required: true,
        help_text: 'Roughly — under 1 year, 1-3, 3-5, 5+?',
        min: 0,
        max: 50,
        unknown_option: true,
      },
    ],
  },
];
