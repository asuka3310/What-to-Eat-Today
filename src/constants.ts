export type Category = {
  id: string;
  color: string;
  isCustom?: boolean;
  customName?: string;
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'ramen', color: '#FF6B6B' },
  { id: 'sushi', color: '#4ECDC4' },
  { id: 'healthy', color: '#45B7D1' },
  { id: 'burger', color: '#FDCB6E' },
  { id: 'pasta', color: '#6C5CE7' },
  { id: 'spicy', color: '#FF7675' },
  { id: 'curry', color: '#E17055' },
  { id: 'thai', color: '#00B894' },
  { id: 'potstickers', color: '#FF9F43' },
  { id: 'dryNoodles', color: '#54A0FF' },
  { id: 'instantNoodles', color: '#5F27CD' },
  { id: 'steak', color: '#FF4757' },
  { id: 'friedChicken', color: '#2ED573' },
  { id: 'pizza', color: '#FFA502' },
  { id: 'hotpot', color: '#3742FA' },
  { id: 'dumplings', color: '#FF7F50' },
  { id: 'bento', color: '#2F3542' },
  { id: 'vegetarian', color: '#7BED9F' },
  { id: 'teppanyaki', color: '#ECCC68' },
  { id: 'dessert', color: '#FF6348' },
  { id: 'bbq', color: '#e17055' },
  { id: 'brunch', color: '#fdcb6e' },
  { id: 'korean', color: '#d63031' },
  { id: 'vietnamese', color: '#00cec9' },
  { id: 'braisedPorkRice', color: '#b2bec3' },
  { id: 'beefNoodleSoup', color: '#636e72' },
  { id: 'friedRice', color: '#ffeaa7' },
  { id: 'dimSum', color: '#fab1a0' },
  { id: 'salad', color: '#55efc4' },
  { id: 'sandwich', color: '#81ecec' },
  { id: 'oden', color: '#74b9ff' },
  { id: 'buffet', color: '#a29bfe' },
  { id: 'fastFood', color: '#ff7675' },
  { id: 'seafood', color: '#0984e3' },
  { id: 'iceCream', color: '#fd79a8' },
];
