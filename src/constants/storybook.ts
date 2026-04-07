import type { InputHighlightData } from '@epam/pdf-highlighter-kit';

// Sample highlights
export const sampleHighlights: InputHighlightData[] = [
  {
    id: 'red-zone',
    bboxes: [{ x1: 180, y1: 110, x2: 340, y2: 130, page: 1 }],
    style: { backgroundColor: '#ff6b6b', opacity: 0.4 },
    tooltipText: 'Red highlight zone',
    label: 'Red zone',
    labelStyle: {
      fontSize: '10px',
      color: 'black',
      padding: '1px',
      borderRadius: '2px',
      outline: '1px solid #cc1c1c',
      whiteSpace: 'nowrap',
      backgroundColor: 'white',
      offsetLeft: -4,
    },
    isLabelScalable: true,
  },
  {
    id: 'blue-zone',
    bboxes: [{ x1: 30, y1: 140, x2: 400, y2: 164, page: 1 }],
    style: { backgroundColor: '#4ecdc4', opacity: 0.4 },
    tooltipText: 'Blue highlight zone',
  },
  {
    id: 'yellow-zone',
    bboxes: [{ x1: 105, y1: 200, x2: 345, y2: 220, page: 1 }],
    style: { backgroundColor: '#ffe66d', opacity: 0.4 },
    tooltipText: 'Yellow highlight zone',
  },
  {
    id: 'green-zone',
    bboxes: [
      { x1: 35, y1: 263, x2: 580, y2: 298, page: 2 },
      { x1: 35, y1: 298, x2: 195, y2: 310, page: 2 },
    ],
    style: { backgroundColor: '#03ff0bff', opacity: 0.4 },
    tooltipText: 'Green highlight zone (p2 + p3)',
  },
  {
    id: 'purple-zone',
    bboxes: [{ x1: 125, y1: 700, x2: 320, y2: 715, page: 1 }],
    style: { backgroundColor: '#9d50ff', opacity: 0.4 },
    tooltipText: 'Purple highlight zone',
  },
  {
    id: 'orange-zone',
    bboxes: [{ x1: 35, y1: 400, x2: 205, y2: 410, page: 3 }],
    style: { backgroundColor: '#ff8c00', opacity: 0.4 },
    tooltipText: 'Orange highlight zone (p3)',
  },
];
