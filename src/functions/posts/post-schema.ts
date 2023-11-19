export default {
  type: "object",
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    body: { type: 'string' },
  },
  required: ['id']
} as const;
